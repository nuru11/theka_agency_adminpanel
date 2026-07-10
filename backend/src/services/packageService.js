const { Op } = require('sequelize');
const {
  sequelize,
  TourPackage,
  PackageItem,
  Payment,
  Tourist,
  User,
  Property,
  Activity,
  Park,
  PackageLog,
} = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function normalizePackageItems(items) {
  if (!items?.length) return items;

  const accommodationIds = items
    .filter((item) => item.item_type === 'accommodation')
    .map((item) => Number(item.property_id));

  const activityIds = items
    .filter((item) => item.item_type === 'activity')
    .map((item) => Number(item.activity_id));

  const seenAccommodations = new Set();
  for (const id of accommodationIds) {
    if (!id) {
      throw new AppError('PROPERTY_ID_REQUIRED', ERROR_CODES.PROPERTY_ID_REQUIRED, 400);
    }
    if (seenAccommodations.has(id)) {
      throw new AppError('DUPLICATE_ACCOMMODATION', ERROR_CODES.DUPLICATE_ACCOMMODATION, 400);
    }
    seenAccommodations.add(id);
  }

  const seenActivities = new Set();
  for (const id of activityIds) {
    if (!id) {
      throw new AppError('ACTIVITY_ID_REQUIRED', ERROR_CODES.ACTIVITY_ID_REQUIRED, 400);
    }
    if (seenActivities.has(id)) {
      throw new AppError('DUPLICATE_ACTIVITY', ERROR_CODES.DUPLICATE_ACTIVITY, 400);
    }
    seenActivities.add(id);
  }

  const properties =
    accommodationIds.length > 0
      ? await Property.findAll({ where: { id: accommodationIds } })
      : [];
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  const activities =
    activityIds.length > 0
      ? await Activity.findAll({ where: { id: activityIds } })
      : [];
  const activityMap = new Map(activities.map((a) => [a.id, a]));

  return items.map((item) => {
    if (item.item_type === 'accommodation') {
      const property = propertyMap.get(Number(item.property_id));
      if (!property) {
        throw new AppError('PROPERTY_NOT_FOUND', ERROR_CODES.PROPERTY_NOT_FOUND, 404);
      }
      if (property.status !== 'active') {
        throw new AppError('PROPERTY_INACTIVE', ERROR_CODES.PROPERTY_INACTIVE, 400);
      }
      return {
        ...item,
        price: item.price != null ? item.price : property.price_per_night,
      };
    }

    if (item.item_type === 'activity') {
      const activity = activityMap.get(Number(item.activity_id));
      if (!activity) {
        throw new AppError('ACTIVITY_NOT_FOUND', ERROR_CODES.ACTIVITY_NOT_FOUND, 404);
      }
      if (activity.status !== 'active') {
        throw new AppError('ACTIVITY_INACTIVE', ERROR_CODES.ACTIVITY_INACTIVE, 400);
      }
      return {
        ...item,
        price: item.price != null ? item.price : activity.default_price,
      };
    }

    const { price, ...rest } = item;
    return rest;
  });
}

const packageIncludes = [
  { model: Tourist, as: 'tourist' },
  { model: User, as: 'assignedEmployee', attributes: ['id', 'name', 'is_driver'] },
  { model: User, as: 'creator', attributes: ['id', 'name'] },
  {
    model: PackageItem,
    as: 'items',
    include: [
      { model: Property, as: 'property' },
      { model: Activity, as: 'activity' },
      { model: Park, as: 'park' },
      { model: User, as: 'driver', attributes: ['id', 'name'] },
    ],
  },
  { model: Payment, as: 'payments' },
  { model: PackageLog, as: 'logs', include: [{ model: User, as: 'employee', attributes: ['id', 'name'] }] },
];

async function list(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.employeeId) where.assigned_employee_id = filters.employeeId;
  return TourPackage.findAll({ where, include: packageIncludes, order: [['created_at', 'DESC']] });
}

async function getById(id, transaction) {
  const pkg = await TourPackage.findByPk(id, { include: packageIncludes, transaction });
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  return pkg;
}

async function create(data, userId) {
  return sequelize.transaction(async (t) => {
    const pkg = await TourPackage.create(
      {
        tourist_id: data.tourist_id,
        assigned_employee_id: data.assigned_employee_id || null,
        package_price: data.package_price,
        people_count: data.people_count,
        status: data.status || 'draft',
        notes: data.notes || null,
        created_by: userId,
      },
      { transaction: t }
    );

    if (data.items?.length) {
      const normalizedItems = await normalizePackageItems(data.items);
      await PackageItem.bulkCreate(
        normalizedItems.map((item) => ({ ...item, package_id: pkg.id })),
        { transaction: t }
      );
    }

    if (data.payments?.length) {
      await Payment.bulkCreate(
        data.payments.map((p) => ({
          ...p,
          package_id: pkg.id,
          received_by: userId,
        })),
        { transaction: t }
      );
    }

    return getById(pkg.id, t);
  });
}

async function update(id, data) {
  const pkg = await TourPackage.findByPk(id);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);

  return sequelize.transaction(async (t) => {
    await pkg.update(
      {
        tourist_id: data.tourist_id ?? pkg.tourist_id,
        assigned_employee_id: data.assigned_employee_id ?? pkg.assigned_employee_id,
        package_price: data.package_price ?? pkg.package_price,
        people_count: data.people_count ?? pkg.people_count,
        status: data.status ?? pkg.status,
        notes: data.notes ?? pkg.notes,
      },
      { transaction: t }
    );

    if (data.items) {
      await PackageItem.destroy({ where: { package_id: id }, transaction: t });
      if (data.items.length) {
        const normalizedItems = await normalizePackageItems(data.items);
        await PackageItem.bulkCreate(
          normalizedItems.map((item) => ({ ...item, package_id: id })),
          { transaction: t }
        );
      }
    }

    if (data.payments) {
      await Payment.destroy({ where: { package_id: id }, transaction: t });
      if (data.payments.length) {
        await Payment.bulkCreate(
          data.payments.map((p) => ({
            ...p,
            package_id: id,
            received_by: p.received_by || pkg.created_by,
          })),
          { transaction: t }
        );
      }
    }

    return getById(id, t);
  });
}

async function updateStatus(id, status) {
  const pkg = await TourPackage.findByPk(id);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  await pkg.update({ status });
  return getById(id);
}

async function addLog(packageId, data, employeeId) {
  const pkg = await TourPackage.findByPk(packageId);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  if (pkg.assigned_employee_id !== employeeId) {
    throw new AppError('FORBIDDEN', ERROR_CODES.FORBIDDEN, 403);
  }

  const log = await PackageLog.create({ ...data, package_id: packageId, employee_id: employeeId });
  if (pkg.status === 'draft' || pkg.status === 'active') {
    await pkg.update({ status: 'active' });
  }
  return log;
}

async function listLogs(employeeId) {
  return PackageLog.findAll({
    where: { employee_id: employeeId },
    include: [{ model: TourPackage, as: 'package', include: [{ model: Tourist, as: 'tourist' }] }],
    order: [['created_at', 'DESC']],
  });
}

async function remove(id) {
  const pkg = await TourPackage.findByPk(id);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  await pkg.destroy();
}

module.exports = {
  list,
  getById,
  create,
  update,
  updateStatus,
  addLog,
  listLogs,
  remove,
};
