const { Op } = require('sequelize');
const { User } = require('../models');
const { hashPassword } = require('../utils/password');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');
const { STAFF_ROLES } = require('../constants');

function assertManageableRole(role) {
  if (!STAFF_ROLES.includes(role)) {
    throw new AppError('VALIDATION_INVALID_ROLE', ERROR_CODES.VALIDATION_INVALID_ROLE, 400);
  }
}

async function findStaffOrFail(id) {
  const user = await User.findByPk(id);
  if (!user || user.role === 'superAdmin') {
    throw new AppError('USER_NOT_FOUND', ERROR_CODES.USER_NOT_FOUND, 404);
  }
  return user;
}

function normalizeEmployeeFields(role, data) {
  if (role !== 'employee') {
    return {
      monthly_salary: null,
      is_driver: false,
      vehicle_types: null,
    };
  }
  return {
    monthly_salary:
      data.monthly_salary === undefined || data.monthly_salary === null || data.monthly_salary === ''
        ? null
        : data.monthly_salary,
    is_driver: Boolean(data.is_driver),
    vehicle_types: data.is_driver
      ? Array.isArray(data.vehicle_types)
        ? data.vehicle_types
        : null
      : null,
  };
}

async function ensureUsernameAvailable(username, excludeId = null) {
  const where = { username };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  const existing = await User.findOne({ where });
  if (existing) {
    throw new AppError('USERNAME_EXISTS', ERROR_CODES.USERNAME_EXISTS, 409);
  }
}

async function listStaff() {
  return User.findAll({
    where: { role: { [Op.in]: STAFF_ROLES } },
    order: [
      ['name', 'ASC'],
      ['id', 'ASC'],
    ],
  });
}

async function createStaff(data) {
  assertManageableRole(data.role);
  await ensureUsernameAvailable(data.username);

  const employeeFields = normalizeEmployeeFields(data.role, data);
  const password_hash = await hashPassword(data.password);

  return User.create({
    name: data.name,
    username: data.username,
    password_hash,
    phone: data.phone || null,
    role: data.role,
    status: data.status || 'active',
    ...employeeFields,
  });
}

async function updateStaff(id, data, actorId) {
  const user = await findStaffOrFail(id);

  if (data.role !== undefined) {
    assertManageableRole(data.role);
  }

  if (data.username !== undefined && data.username !== user.username) {
    await ensureUsernameAvailable(data.username, user.id);
  }

  const nextStatus = data.status !== undefined ? data.status : user.status;
  if (Number(actorId) === Number(user.id) && nextStatus === 'inactive') {
    throw new AppError('CANNOT_DEACTIVATE_SELF', ERROR_CODES.CANNOT_DEACTIVATE_SELF, 400);
  }

  const nextRole = data.role !== undefined ? data.role : user.role;
  const employeeSource = {
    monthly_salary: data.monthly_salary !== undefined ? data.monthly_salary : user.monthly_salary,
    is_driver: data.is_driver !== undefined ? data.is_driver : user.is_driver,
    vehicle_types: data.vehicle_types !== undefined ? data.vehicle_types : user.vehicle_types,
  };
  const employeeFields = normalizeEmployeeFields(nextRole, employeeSource);

  const updates = {
    ...employeeFields,
  };

  if (data.name !== undefined) updates.name = data.name;
  if (data.username !== undefined) updates.username = data.username;
  if (data.phone !== undefined) updates.phone = data.phone || null;
  if (data.role !== undefined) updates.role = data.role;
  if (data.status !== undefined) updates.status = data.status;

  if (data.password) {
    updates.password_hash = await hashPassword(data.password);
  }

  await user.update(updates);
  return user;
}

async function removeStaff(id, actorId) {
  const user = await findStaffOrFail(id);

  if (Number(actorId) === Number(user.id)) {
    throw new AppError('CANNOT_DELETE_SELF', ERROR_CODES.CANNOT_DELETE_SELF, 400);
  }

  try {
    await user.destroy();
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError('USER_IN_USE', ERROR_CODES.USER_IN_USE, 409);
    }
    throw err;
  }
}

module.exports = {
  listStaff,
  createStaff,
  updateStaff,
  removeStaff,
};
