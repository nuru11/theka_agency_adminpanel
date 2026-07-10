const { PackageSpending, TourPackage, Tourist, Handoff, User } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

const includes = [
  { model: TourPackage, as: 'package', include: [{ model: Tourist, as: 'tourist' }] },
  { model: Handoff, as: 'handoff' },
  { model: User, as: 'recorder', attributes: ['id', 'name'] },
];

async function list() {
  return PackageSpending.findAll({ include: includes, order: [['created_at', 'DESC']] });
}

async function getById(id) {
  const spending = await PackageSpending.findByPk(id, { include: includes });
  if (!spending) throw new AppError('PACKAGE_SPENDING_NOT_FOUND', ERROR_CODES.PACKAGE_SPENDING_NOT_FOUND, 404);
  return spending;
}

async function create(data, userId) {
  const spending = await PackageSpending.create({ ...data, recorded_by: userId });
  const pkg = await TourPackage.findByPk(data.package_id);
  if (pkg) await pkg.update({ status: 'settled' });
  return getById(spending.id);
}

async function update(id, data) {
  const spending = await PackageSpending.findByPk(id);
  if (!spending) throw new AppError('PACKAGE_SPENDING_NOT_FOUND', ERROR_CODES.PACKAGE_SPENDING_NOT_FOUND, 404);
  await spending.update(data);
  return getById(id);
}

async function remove(id) {
  const spending = await PackageSpending.findByPk(id);
  if (!spending) throw new AppError('PACKAGE_SPENDING_NOT_FOUND', ERROR_CODES.PACKAGE_SPENDING_NOT_FOUND, 404);
  await spending.destroy();
}

module.exports = { list, getById, create, update, remove };
