const { Activity } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function list(activeOnly = false) {
  const where = activeOnly ? { status: 'active' } : {};
  return Activity.findAll({ where, order: [['name', 'ASC']] });
}

async function getById(id) {
  const activity = await Activity.findByPk(id);
  if (!activity) throw new AppError('ACTIVITY_NOT_FOUND', ERROR_CODES.ACTIVITY_NOT_FOUND, 404);
  return activity;
}

async function create(data) {
  return Activity.create(data);
}

async function update(id, data) {
  const activity = await getById(id);
  await activity.update(data);
  return activity;
}

async function remove(id) {
  const activity = await getById(id);
  await activity.destroy();
}

module.exports = { list, getById, create, update, remove };
