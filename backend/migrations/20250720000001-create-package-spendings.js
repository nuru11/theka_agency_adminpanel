'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('package_spendings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tour_packages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      reason: {
        type: Sequelize.ENUM('accommodation', 'park', 'food', 'other'),
        allowNull: false,
      },
      screenshot_path: { type: Sequelize.STRING(500), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
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

    await queryInterface.addColumn('wallet_transactions', 'package_spending_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'package_spendings', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('wallet_transactions', 'package_spending_id');
    await queryInterface.dropTable('package_spendings');
  },
};
