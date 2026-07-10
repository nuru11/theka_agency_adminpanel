const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PackageItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      item_type: {
        type: DataTypes.ENUM('accommodation', 'transport', 'activity', 'sim'),
        allowNull: false,
      },
      property_id: { type: DataTypes.INTEGER, allowNull: true },
      activity_id: { type: DataTypes.INTEGER, allowNull: true },
      park_id: { type: DataTypes.INTEGER, allowNull: true },
      driver_id: { type: DataTypes.INTEGER, allowNull: true },
      vehicle_type: {
        type: DataTypes.ENUM('van', 'bus', 'vip'),
        allowNull: true,
      },
      sim_included: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      sim_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      notes: { type: DataTypes.STRING(255), allowNull: true },
    },
    { tableName: 'package_items', underscored: true }
  );
};
