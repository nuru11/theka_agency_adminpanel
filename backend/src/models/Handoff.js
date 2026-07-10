const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Handoff',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      office_admin_id: { type: DataTypes.INTEGER, allowNull: false },
      accountant_id: { type: DataTypes.INTEGER, allowNull: true },
      amount_collected: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM('pending', 'received'),
        allowNull: false,
        defaultValue: 'pending',
      },
      sent_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      received_at: { type: DataTypes.DATE, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: 'handoffs', underscored: true }
  );
};
