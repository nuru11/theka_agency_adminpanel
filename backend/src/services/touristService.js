const { Tourist, User } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function list() {
  return Tourist.findAll({
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
  });
}

async function getById(id) {
  const tourist = await Tourist.findByPk(id, {
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
  });
  if (!tourist) throw new AppError('TOURIST_NOT_FOUND', ERROR_CODES.TOURIST_NOT_FOUND, 404);
  return tourist;
}

async function create(data, userId) {
  return Tourist.create({ ...data, created_by: userId });
}

async function update(id, data) {
  const tourist = await Tourist.findByPk(id);
  if (!tourist) throw new AppError('TOURIST_NOT_FOUND', ERROR_CODES.TOURIST_NOT_FOUND, 404);
  await tourist.update(data);
  return tourist;
}

async function remove(id) {
  const tourist = await Tourist.findByPk(id);
  if (!tourist) throw new AppError('TOURIST_NOT_FOUND', ERROR_CODES.TOURIST_NOT_FOUND, 404);
  await tourist.destroy();
}

module.exports = { list, getById, create, update, remove };
