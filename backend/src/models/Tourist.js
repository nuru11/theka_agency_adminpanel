const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Tourist',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      phone: { type: DataTypes.STRING(30), allowNull: true },
      email: { type: DataTypes.STRING(100), allowNull: true },
      nationality: { type: DataTypes.STRING(80), allowNull: true },
      group_size: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      arrival_date: { type: DataTypes.DATEONLY, allowNull: true },
      departure_date: { type: DataTypes.DATEONLY, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'tourists', underscored: true }
  );
};
