const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Payment',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      payment_date: { type: DataTypes.DATEONLY, allowNull: false },
      notes: { type: DataTypes.STRING(255), allowNull: true },
      received_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'payments', underscored: true }
  );
};
