const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PackageSpending',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      handoff_id: { type: DataTypes.INTEGER, allowNull: true },
      accommodation_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      transport_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      activities_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      sim_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      park_commission: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      other_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT, allowNull: true },
      recorded_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'package_spendings', underscored: true }
  );
};
