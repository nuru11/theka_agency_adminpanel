const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'TourPackage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tourist_id: { type: DataTypes.INTEGER, allowNull: false },
      people_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      days_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      property_id: { type: DataTypes.INTEGER, allowNull: false },
      accommodation_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      driver_id: { type: DataTypes.INTEGER, allowNull: false },
      vehicle_type: {
        type: DataTypes.ENUM('van', 'bus', 'vip'),
        allowNull: false,
      },
      expected_cost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
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
        defaultValue: 'active',
      },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'tour_packages', underscored: true }
  );
};
