const { Expense, PackageExpense } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function list() {
  return Expense.findAll({ order: [['created_at', 'DESC']] });
}

async function getById(id) {
  const expense = await Expense.findByPk(id);
  if (!expense) throw new AppError('EXPENSE_NOT_FOUND', ERROR_CODES.EXPENSE_NOT_FOUND, 404);
  return expense;
}

async function create(data) {
  return Expense.create(data);
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

  const inUse = await PackageExpense.count({ where: { expense_id: id } });
  if (inUse > 0) {
    throw new AppError('EXPENSE_IN_USE', ERROR_CODES.EXPENSE_IN_USE, 400);
  }

  await expense.destroy();
}

module.exports = { list, getById, create, update, remove };
