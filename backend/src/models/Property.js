const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Property',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      type: {
        type: DataTypes.ENUM('hotel', 'apartment', 'villa'),
        allowNull: false,
      },
      location: { type: DataTypes.STRING(200), allowNull: true },
      city: { type: DataTypes.STRING(100), allowNull: false },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      commission: {
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
    { tableName: 'properties', underscored: true }
  );
};
