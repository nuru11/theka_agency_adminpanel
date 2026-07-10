const { sequelize, SalaryPayment, Expense, User } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function list() {
  return SalaryPayment.findAll({
    include: [
      { model: User, as: 'employee', attributes: ['id', 'name', 'monthly_salary'] },
      { model: User, as: 'payer', attributes: ['id', 'name'] },
      { model: Expense, as: 'expense' },
    ],
    order: [['paid_at', 'DESC']],
  });
}

async function create(data, payerId) {
  const employee = await User.findByPk(data.employee_id);
  if (!employee || employee.role !== 'employee') {
    throw new AppError('NOT_AN_EMPLOYEE', ERROR_CODES.NOT_AN_EMPLOYEE, 400);
  }
  if (!employee.monthly_salary) {
    throw new AppError('SALARY_NOT_SET', ERROR_CODES.SALARY_NOT_SET, 400);
  }

  const existing = await SalaryPayment.findOne({
    where: { employee_id: data.employee_id, pay_period: data.pay_period },
  });
  if (existing) {
    throw new AppError('SALARY_ALREADY_PAID', ERROR_CODES.SALARY_ALREADY_PAID, 409);
  }

  const amount = data.amount || employee.monthly_salary;

  return sequelize.transaction(async (t) => {
    const expense = await Expense.create(
      {
        category: 'salaries',
        amount,
        description: `Salary for ${employee.name} - ${data.pay_period}`,
        expense_date: data.expense_date || new Date().toISOString().slice(0, 10),
        created_by: payerId,
      },
      { transaction: t }
    );

    const payment = await SalaryPayment.create(
      {
        employee_id: data.employee_id,
        amount,
        pay_period: data.pay_period,
        expense_id: expense.id,
        paid_by: payerId,
        paid_at: new Date(),
      },
      { transaction: t }
    );

    return SalaryPayment.findByPk(payment.id, {
      include: [
        { model: User, as: 'employee', attributes: ['id', 'name'] },
        { model: User, as: 'payer', attributes: ['id', 'name'] },
        { model: Expense, as: 'expense' },
      ],
      transaction: t,
    });
  });
}

module.exports = { list, create };
