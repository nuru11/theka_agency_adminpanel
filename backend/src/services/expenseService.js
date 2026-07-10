const { Expense, User } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function list(filters = {}) {
  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.from && filters.to) {
    where.expense_date = { [require('sequelize').Op.between]: [filters.from, filters.to] };
  }
  return Expense.findAll({
    where,
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    order: [['expense_date', 'DESC']],
  });
}

async function getById(id) {
  const expense = await Expense.findByPk(id, {
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
  });
  if (!expense) throw new AppError('EXPENSE_NOT_FOUND', ERROR_CODES.EXPENSE_NOT_FOUND, 404);
  return expense;
}

async function create(data, userId) {
  return Expense.create({ ...data, created_by: userId });
}

async function update(id, data) {
  const expense = await Expense.findByPk(id);
  if (!expense) throw new AppError('EXPENSE_NOT_FOUND', ERROR_CODES.EXPENSE_NOT_FOUND, 404);
  await expense.update(data);
  return expense;
}

async function remove(id) {
  const expense = await Expense.findByPk(id);
  if (!expense) throw new AppError('EXPENSE_NOT_FOUND', ERROR_CODES.EXPENSE_NOT_FOUND, 404);
  await expense.destroy();
}

module.exports = { list, getById, create, update, remove };
