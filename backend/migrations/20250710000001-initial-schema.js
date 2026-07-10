'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      role: {
        type: Sequelize.ENUM('superAdmin', 'officeAdmin', 'accountant', 'employee'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      monthly_salary: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      is_driver: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      vehicle_types: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('properties', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      type: {
        type: Sequelize.ENUM('hotel', 'apartment', 'villa', 'house'),
        allowNull: false,
      },
      price_per_night: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      location: { type: Sequelize.STRING(200), allowNull: true },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('parks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      commission_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      commission_rate: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      location: { type: Sequelize.STRING(200), allowNull: true },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('activities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      default_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('tourists', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      phone: { type: Sequelize.STRING(30), allowNull: true },
      email: { type: Sequelize.STRING(100), allowNull: true },
      nationality: { type: Sequelize.STRING(80), allowNull: true },
      group_size: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      arrival_date: { type: Sequelize.DATEONLY, allowNull: true },
      departure_date: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('tour_packages', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tourist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tourists', key: 'id' },
      },
      assigned_employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      package_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      people_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
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
        defaultValue: 'draft',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('package_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tour_packages', key: 'id' },
        onDelete: 'CASCADE',
      },
      item_type: {
        type: Sequelize.ENUM('accommodation', 'transport', 'activity', 'sim'),
        allowNull: false,
      },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'properties', key: 'id' },
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'activities', key: 'id' },
      },
      park_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'parks', key: 'id' },
      },
      driver_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      vehicle_type: {
        type: Sequelize.ENUM('van', 'bus', 'vip'),
        allowNull: true,
      },
      sim_included: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      sim_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      notes: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tour_packages', key: 'id' },
        onDelete: 'CASCADE',
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      payment_date: { type: Sequelize.DATEONLY, allowNull: false },
      notes: { type: Sequelize.STRING(255), allowNull: true },
      received_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('package_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tour_packages', key: 'id' },
        onDelete: 'CASCADE',
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      accommodation_type: {
        type: Sequelize.ENUM('hotel', 'apartment', 'villa', 'house'),
        allowNull: true,
      },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'properties', key: 'id' },
      },
      transport_type: {
        type: Sequelize.ENUM('van', 'bus', 'vip'),
        allowNull: true,
      },
      driver_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      activity_ids: { type: Sequelize.JSON, allowNull: true },
      sim_included: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      sim_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      people_count: { type: Sequelize.INTEGER, allowNull: false },
      money_received: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('handoffs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tour_packages', key: 'id' },
      },
      office_admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      accountant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      amount_collected: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      status: {
        type: Sequelize.ENUM('pending', 'received'),
        allowNull: false,
        defaultValue: 'pending',
      },
      sent_at: { type: Sequelize.DATE, allowNull: false },
      received_at: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('package_spendings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tour_packages', key: 'id' },
      },
      handoff_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'handoffs', key: 'id' },
      },
      accommodation_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      transport_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      activities_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      sim_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      park_commission: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      other_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      recorded_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('expenses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      category: {
        type: Sequelize.ENUM('rent', 'salaries', 'other'),
        allowNull: false,
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: true },
      expense_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('salary_payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      pay_period: { type: Sequelize.STRING(7), allowNull: false },
      expense_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'expenses', key: 'id' },
      },
      paid_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      paid_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('salary_payments');
    await queryInterface.dropTable('expenses');
    await queryInterface.dropTable('package_spendings');
    await queryInterface.dropTable('handoffs');
    await queryInterface.dropTable('package_logs');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('package_items');
    await queryInterface.dropTable('tour_packages');
    await queryInterface.dropTable('tourists');
    await queryInterface.dropTable('activities');
    await queryInterface.dropTable('parks');
    await queryInterface.dropTable('properties');
    await queryInterface.dropTable('users');
  },
};
