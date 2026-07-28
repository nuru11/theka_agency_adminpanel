const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Expense',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    { tableName: 'expenses', underscored: true }
  );
};
