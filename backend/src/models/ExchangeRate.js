const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'ExchangeRate',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      usd_to_etb: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: false,
      },
      set_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'exchange_rates', underscored: true }
  );
};
