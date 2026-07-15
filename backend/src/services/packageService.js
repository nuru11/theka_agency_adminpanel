const {
  TourPackage,
  PackageDay,
  Tourist,
  Property,
  Park,
  User,
  sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

function computeExpectedCost(accommodationPrice, days) {
  const parksTotal = (days || []).reduce((sum, d) => sum + Number(d.park_price || 0), 0);
  return Number(accommodationPrice || 0) + parksTotal;
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

async function list() {
  return TourPackage.findAll({
    include: [
      { model: Tourist, as: 'tourist', attributes: ['id', 'name'] },
      { model: Property, as: 'property', attributes: ['id', 'name'] },
      { model: User, as: 'driver', attributes: ['id', 'name'] },
      { model: User, as: 'creator', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  });
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
          { model: User, as: 'driver', attributes: ['id', 'name'] },
        ],
      },
    ],
    order: [[{ model: PackageDay, as: 'days' }, 'day_number', 'ASC']],
  });
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  return pkg;
}

async function create(data, userId) {
  const {
    tourist_id,
    people_count,
    days_count,
    property_id,
    accommodation_price,
    driver_id,
    vehicle_type,
    days,
  } = data;

  validateDays(days_count, days);

  await assertTourist(tourist_id);
  await assertProperty(property_id);
  await assertDriver(driver_id);

  for (const day of days) {
    await assertPark(day.park_id);
    await assertDriver(day.driver_id);
  }

  const expected_cost = computeExpectedCost(accommodation_price, days);

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
      days.map((d) => ({
        package_id: pkg.id,
        day_number: d.day_number,
        park_id: d.park_id,
        park_price: d.park_price,
        driver_id: d.driver_id,
      })),
      { transaction }
    );

    return pkg.id;
  });

  return getById(pkgId);
}

module.exports = { list, getById, create, computeExpectedCost };
