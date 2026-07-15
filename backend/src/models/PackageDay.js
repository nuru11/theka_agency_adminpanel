const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PackageDay',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      day_number: { type: DataTypes.INTEGER, allowNull: false },
      park_id: { type: DataTypes.INTEGER, allowNull: false },
      park_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      driver_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'package_days', underscored: true }
  );
};
