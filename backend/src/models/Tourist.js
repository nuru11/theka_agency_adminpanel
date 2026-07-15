const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Tourist',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      phone: { type: DataTypes.STRING(30), allowNull: true },
      nationality: { type: DataTypes.STRING(80), allowNull: true },
      come_date: { type: DataTypes.DATE, allowNull: true },
      leave_date: { type: DataTypes.DATE, allowNull: true },
      status: {
        type: DataTypes.ENUM('expected', 'received', 'departed', 'cancelled'),
        allowNull: false,
        defaultValue: 'expected',
      },
      amount_received: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'tourists', underscored: true }
  );
};
