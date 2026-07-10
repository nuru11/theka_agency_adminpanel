const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'TourPackage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tourist_id: { type: DataTypes.INTEGER, allowNull: false },
      assigned_employee_id: { type: DataTypes.INTEGER, allowNull: true },
      package_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      people_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      status: {
        type: DataTypes.ENUM(
          'draft',
          'active',
          'ready_for_handoff',
          'sent_to_accountant',
          'accountant_received',
          'settled'
        ),
        allowNull: false,
        defaultValue: 'draft',
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'tour_packages', underscored: true }
  );
};
