const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'FundReturn',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      accountant_id: { type: DataTypes.INTEGER, allowNull: false },
      package_id: { type: DataTypes.INTEGER, allowNull: true },
      amount_usd: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      amount_etb: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      exchange_rate: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'received'),
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      sent_at: { type: DataTypes.DATE, allowNull: false },
      received_at: { type: DataTypes.DATE, allowNull: true },
      received_by: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: 'fund_returns', underscored: true }
  );
};
