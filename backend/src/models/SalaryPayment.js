const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'SalaryPayment',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      employee_id: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      pay_period: { type: DataTypes.STRING(7), allowNull: false },
      expense_id: { type: DataTypes.INTEGER, allowNull: true },
      paid_by: { type: DataTypes.INTEGER, allowNull: false },
      paid_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'salary_payments', underscored: true }
  );
};
