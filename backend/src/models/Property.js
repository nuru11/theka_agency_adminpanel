const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Property',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      type: {
        type: DataTypes.ENUM('hotel', 'apartment', 'villa', 'house'),
        allowNull: false,
      },
      price_per_night: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      location: { type: DataTypes.STRING(200), allowNull: true },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    { tableName: 'properties', underscored: true }
  );
};
