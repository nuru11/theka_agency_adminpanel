const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');
const { comparePassword } = require('../utils/password');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
}

async function login(username, password) {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', ERROR_CODES.INVALID_CREDENTIALS, 401);
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new AppError('INVALID_CREDENTIALS', ERROR_CODES.INVALID_CREDENTIALS, 401);
  }

  if (user.status !== 'active') {
    throw new AppError('ACCOUNT_INACTIVE', ERROR_CODES.ACCOUNT_INACTIVE, 403);
  }

  const token = signToken(user);
  return { token, user: user.toJSON() };
}

async function getMe(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', ERROR_CODES.USER_NOT_FOUND, 404);
  }
  return user.toJSON();
}

module.exports = { login, getMe, signToken };
