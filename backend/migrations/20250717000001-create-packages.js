'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tour_packages', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tourist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tourists', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      people_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      days_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'properties', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      accommodation_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      driver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      vehicle_type: {
        type: Sequelize.ENUM('van', 'bus', 'vip'),
        allowNull: false,
      },
      expected_cost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM(
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
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('package_days', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tour_packages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      day_number: { type: Sequelize.INTEGER, allowNull: false },
      park_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'parks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      park_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      driver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('package_days');
    await queryInterface.dropTable('tour_packages');
  },
};
