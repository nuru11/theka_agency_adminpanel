'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('package_expenses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tour_packages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      expense_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'expenses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('package_expenses', ['package_id', 'expense_id'], {
      unique: true,
      name: 'package_expenses_package_id_expense_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('package_expenses');
    await queryInterface.dropTable('expenses');
  },
};
