const {
  TourPackage,
  PackageDay,
  Tourist,
  Property,
  Park,
  User,
  PackageSpending,
  sequelize,
} = require('../models');
const { QueryTypes } = require('sequelize');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');
const fundReturnService = require('./fundReturnService');

function computeExpectedCost(days) {
  return (days || []).reduce(
    (sum, d) => sum + Number(d.accommodation_price || 0) + Number(d.park_price || 0),
    0
  );
}

function validateDays(daysCount, days) {
  if (!Array.isArray(days) || days.length !== Number(daysCount)) {
    throw new AppError('INVALID_PACKAGE_DAYS', ERROR_CODES.INVALID_PACKAGE_DAYS, 400);
  }
  const numbers = days.map((d) => Number(d.day_number)).sort((a, b) => a - b);
  for (let i = 0; i < daysCount; i += 1) {
    if (numbers[i] !== i + 1) {
      throw new AppError('INVALID_PACKAGE_DAYS', ERROR_CODES.INVALID_PACKAGE_DAYS, 400);
    }
  }
}

async function assertTourist(id) {
  const tourist = await Tourist.findByPk(id);
  if (!tourist) throw new AppError('TOURIST_NOT_FOUND', ERROR_CODES.TOURIST_NOT_FOUND, 404);
  return tourist;
}

async function assertProperty(id) {
  const property = await Property.findByPk(id);
  if (!property) throw new AppError('PROPERTY_NOT_FOUND', ERROR_CODES.PROPERTY_NOT_FOUND, 404);
  if (property.status === 'inactive') {
    throw new AppError('PROPERTY_INACTIVE', ERROR_CODES.PROPERTY_INACTIVE, 400);
  }
  return property;
}

async function assertPark(id) {
  const park = await Park.findByPk(id);
  if (!park) throw new AppError('PARK_NOT_FOUND', ERROR_CODES.PARK_NOT_FOUND, 404);
  if (park.status === 'inactive') {
    throw new AppError('PARK_INACTIVE', ERROR_CODES.PARK_INACTIVE, 400);
  }
  return park;
}

async function assertDriver(id) {
  const driver = await User.findOne({
    where: { id, role: 'employee', is_driver: true, status: 'active' },
  });
  if (!driver) throw new AppError('DRIVER_NOT_FOUND', ERROR_CODES.DRIVER_NOT_FOUND, 404);
  return driver;
}

async function getSpendMap() {
  const rows = await sequelize.query(
    `
    SELECT package_id, COALESCE(SUM(amount), 0) AS actual_spend
    FROM package_spendings
    GROUP BY package_id
    `,
    { type: QueryTypes.SELECT }
  );
  const map = {};
  for (const row of rows) {
    map[row.package_id] = Number(row.actual_spend || 0);
  }
  return map;
}

function withSpendSummary(pkg, spendMap) {
  const plain = pkg.toJSON ? pkg.toJSON() : { ...pkg };
  const expected = Number(plain.expected_cost || 0);
  const actual_spend = spendMap[plain.id] ?? 0;
  return {
    ...plain,
    actual_spend,
    variance: Math.round((actual_spend - expected) * 100) / 100,
  };
}

async function list() {
  const packages = await TourPackage.findAll({
    include: [
      { model: Tourist, as: 'tourist', attributes: ['id', 'name'] },
      { model: Property, as: 'property', attributes: ['id', 'name'] },
      { model: User, as: 'driver', attributes: ['id', 'name'] },
      { model: User, as: 'creator', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  });
  const spendMap = await getSpendMap();
  const summaries = packages.map((pkg) => withSpendSummary(pkg, spendMap));

  await Promise.all(
    summaries.map(async (pkg) => {
      if (pkg.status === 'accountant_received') {
        pkg.remaining_usd = await fundReturnService.getPackageRemainingUsd(pkg.id);
      } else {
        pkg.remaining_usd = 0;
      }
    })
  );

  return summaries;
}

async function getById(id) {
  const pkg = await TourPackage.findByPk(id, {
    include: [
      { model: Tourist, as: 'tourist', attributes: ['id', 'name'] },
      { model: Property, as: 'property', attributes: ['id', 'name', 'price'] },
      { model: User, as: 'driver', attributes: ['id', 'name'] },
      { model: User, as: 'creator', attributes: ['id', 'name'] },
      {
        model: PackageDay,
        as: 'days',
        include: [
          { model: Park, as: 'park', attributes: ['id', 'name', 'price'] },
          { model: Property, as: 'property', attributes: ['id', 'name', 'price'] },
          { model: User, as: 'driver', attributes: ['id', 'name'] },
        ],
      },
      {
        model: PackageSpending,
        as: 'spendings',
        attributes: ['id', 'amount', 'reason', 'created_at'],
      },
    ],
    order: [[{ model: PackageDay, as: 'days' }, 'day_number', 'ASC']],
  });
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  const spendMap = await getSpendMap();
  return withSpendSummary(pkg, spendMap);
}

async function create(data, userId) {
  const {
    tourist_id,
    people_count,
    days_count,
    driver_id,
    vehicle_type,
    days,
  } = data;

  validateDays(days_count, days);

  await assertTourist(tourist_id);
  await assertDriver(driver_id);

  for (const day of days) {
    await assertProperty(day.property_id);
    await assertPark(day.park_id);
    await assertDriver(day.driver_id);
  }

  const sortedDays = [...days].sort((a, b) => Number(a.day_number) - Number(b.day_number));
  const property_id = sortedDays[0].property_id;
  const accommodation_price = sortedDays.reduce(
    (sum, d) => sum + Number(d.accommodation_price || 0),
    0
  );
  const expected_cost = computeExpectedCost(sortedDays);

  const pkgId = await sequelize.transaction(async (transaction) => {
    const pkg = await TourPackage.create(
      {
        tourist_id,
        people_count,
        days_count,
        property_id,
        accommodation_price,
        driver_id,
        vehicle_type,
        expected_cost,
        status: 'active',
        created_by: userId,
      },
      { transaction }
    );

    await PackageDay.bulkCreate(
      sortedDays.map((d) => ({
        package_id: pkg.id,
        day_number: d.day_number,
        park_id: d.park_id,
        park_price: d.park_price,
        property_id: d.property_id,
        accommodation_price: d.accommodation_price,
        driver_id: d.driver_id,
      })),
      { transaction }
    );

    return pkg.id;
  });

  return getById(pkgId);
}

async function settle(id, data, accountantUser) {
  const action = data.action;
  const notes = data.notes || null;

  if (!['keep', 'return'].includes(action)) {
    throw new AppError('INVALID_SETTLE_ACTION', ERROR_CODES.INVALID_SETTLE_ACTION, 400);
  }

  const pkg = await TourPackage.findByPk(id);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);

  if (pkg.status === 'settled') {
    throw new AppError('PACKAGE_ALREADY_SETTLED', ERROR_CODES.PACKAGE_ALREADY_SETTLED, 400);
  }

  let fundReturn = null;
  const remaining =
    action === 'return' ? await fundReturnService.getPackageRemainingUsd(id) : 0;

  if (action === 'return' && remaining <= 0) {
    throw new AppError('NOTHING_TO_RETURN', ERROR_CODES.NOTHING_TO_RETURN, 400);
  }

  if (action === 'return') {
    fundReturn = await fundReturnService.create(
      { amount_usd: remaining, package_id: id, notes },
      accountantUser
    );
  }

  await pkg.update({ status: 'settled' });

  const updated = await getById(id);
  return { package: updated, fund_return: fundReturn };
}

module.exports = { list, getById, create, settle, computeExpectedCost };
