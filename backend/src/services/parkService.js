const { Park } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function list() {
  return Park.findAll({ order: [['created_at', 'DESC']] });
}

async function getById(id) {
  const park = await Park.findByPk(id);
  if (!park) throw new AppError('PARK_NOT_FOUND', ERROR_CODES.PARK_NOT_FOUND, 404);
  return park;
}

async function create(data) {
  return Park.create(data);
}

async function update(id, data) {
  const park = await Park.findByPk(id);
  if (!park) throw new AppError('PARK_NOT_FOUND', ERROR_CODES.PARK_NOT_FOUND, 404);
  await park.update(data);
  return park;
}

async function remove(id) {
  const park = await Park.findByPk(id);
  if (!park) throw new AppError('PARK_NOT_FOUND', ERROR_CODES.PARK_NOT_FOUND, 404);
  await park.destroy();
}

module.exports = { list, getById, create, update, remove };
