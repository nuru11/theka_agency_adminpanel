const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PackageExpense',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      expense_id: { type: DataTypes.INTEGER, allowNull: false },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    { tableName: 'package_expenses', underscored: true }
  );
};
