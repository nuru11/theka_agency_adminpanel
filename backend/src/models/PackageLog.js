const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PackageLog',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      employee_id: { type: DataTypes.INTEGER, allowNull: false },
      accommodation_type: {
        type: DataTypes.ENUM('hotel', 'apartment', 'villa', 'house'),
        allowNull: true,
      },
      property_id: { type: DataTypes.INTEGER, allowNull: true },
      transport_type: {
        type: DataTypes.ENUM('van', 'bus', 'vip'),
        allowNull: true,
      },
      driver_id: { type: DataTypes.INTEGER, allowNull: true },
      activity_ids: { type: DataTypes.JSON, allowNull: true },
      sim_included: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      sim_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      people_count: { type: DataTypes.INTEGER, allowNull: false },
      money_received: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: 'package_logs', underscored: true }
  );
};
