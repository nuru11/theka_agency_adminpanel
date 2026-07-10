const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Expense',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      category: {
        type: DataTypes.ENUM('rent', 'salaries', 'other'),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      description: { type: DataTypes.STRING(255), allowNull: true },
      expense_date: { type: DataTypes.DATEONLY, allowNull: false },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'expenses', underscored: true }
  );
};
