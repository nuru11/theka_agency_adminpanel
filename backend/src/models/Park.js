const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Park',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      commission_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      commission_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      location: { type: DataTypes.STRING(200), allowNull: true },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    { tableName: 'parks', underscored: true }
  );
};
