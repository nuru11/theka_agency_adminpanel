const { Op } = require('sequelize');
const { User } = require('../models');
const { hashPassword } = require('../utils/password');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function listUsers(filters = {}) {
  const where = {};
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  return User.findAll({ where, order: [['name', 'ASC']] });
}

async function listEmployees() {
  return User.findAll({
    where: { role: 'employee', status: 'active' },
    order: [['name', 'ASC']],
  });
}

async function listDrivers() {
  return User.findAll({
    where: { role: 'employee', status: 'active', is_driver: true },
    order: [['name', 'ASC']],
  });
}

async function getUser(id) {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('USER_NOT_FOUND', ERROR_CODES.USER_NOT_FOUND, 404);
  return user.toJSON();
}

async function createUser(data) {
  const existing = await User.findOne({ where: { username: data.username } });
  if (existing) {
    throw new AppError('USERNAME_EXISTS', ERROR_CODES.USERNAME_EXISTS, 409);
  }

  const passwordHash = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    username: data.username,
    password_hash: passwordHash,
    phone: data.phone || null,
    role: data.role,
    status: 'active',
    monthly_salary: data.monthly_salary || null,
    is_driver: data.is_driver || false,
    vehicle_types: data.vehicle_types || null,
  });
  return user.toJSON();
}

async function updateUser(id, data, currentUserId) {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('USER_NOT_FOUND', ERROR_CODES.USER_NOT_FOUND, 404);

  if (data.status === 'inactive' && id === currentUserId) {
    throw new AppError('CANNOT_DEACTIVATE_SELF', ERROR_CODES.CANNOT_DEACTIVATE_SELF, 400);
  }

  if (data.password) {
    data.password_hash = await hashPassword(data.password);
    delete data.password;
  }

  await user.update(data);
  return user.toJSON();
}

async function deleteUser(id, currentUserId) {
  if (id === currentUserId) {
    throw new AppError('CANNOT_DELETE_SELF', ERROR_CODES.CANNOT_DELETE_SELF, 400);
  }
  const user = await User.findByPk(id);
  if (!user) throw new AppError('USER_NOT_FOUND', ERROR_CODES.USER_NOT_FOUND, 404);
  await user.destroy();
}

module.exports = {
  listUsers,
  listEmployees,
  listDrivers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
