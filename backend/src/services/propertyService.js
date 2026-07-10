const { Property } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function list(activeOnly = false) {
  const where = activeOnly ? { status: 'active' } : {};
  return Property.findAll({ where, order: [['name', 'ASC']] });
}

async function getById(id) {
  const property = await Property.findByPk(id);
  if (!property) throw new AppError('PROPERTY_NOT_FOUND', ERROR_CODES.PROPERTY_NOT_FOUND, 404);
  return property;
}

async function create(data) {
  return Property.create(data);
}

async function update(id, data) {
  const property = await getById(id);
  await property.update(data);
  return property;
}

async function remove(id) {
  const property = await getById(id);
  await property.destroy();
}

module.exports = { list, getById, create, update, remove };
