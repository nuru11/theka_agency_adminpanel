const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PackageSpending',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      reason: {
        type: DataTypes.ENUM('accommodation', 'park', 'food', 'other'),
        allowNull: false,
      },
      screenshot_path: { type: DataTypes.STRING(500), allowNull: false },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'package_spendings', underscored: true }
  );
};
