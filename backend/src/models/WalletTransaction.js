const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'WalletTransaction',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      type: {
        type: DataTypes.ENUM('credit', 'debit'),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      amount_usd: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      amount_etb: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      exchange_rate: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: true,
      },
      handoff_id: { type: DataTypes.INTEGER, allowNull: true },
      package_spending_id: { type: DataTypes.INTEGER, allowNull: true },
      fund_return_id: { type: DataTypes.INTEGER, allowNull: true },
      note: { type: DataTypes.STRING(255), allowNull: true },
    },
    { tableName: 'wallet_transactions', underscored: true, updatedAt: false }
  );
};
