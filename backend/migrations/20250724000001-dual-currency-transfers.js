'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exchange_rates', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      usd_to_etb: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
      },
      set_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addColumn('handoffs', 'exchange_rate', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: true,
    });
    await queryInterface.addColumn('handoffs', 'amount_etb', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });

    await queryInterface.addColumn('wallet_transactions', 'amount_usd', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('wallet_transactions', 'amount_etb', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('wallet_transactions', 'exchange_rate', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: true,
    });
    await queryInterface.addColumn('wallet_transactions', 'fund_return_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Backfill: treat existing amount as USD; ETB unknown → 0
    await queryInterface.sequelize.query(`
      UPDATE wallet_transactions
      SET amount_usd = amount, amount_etb = 0
      WHERE amount_usd IS NULL
    `);

    await queryInterface.createTable('fund_returns', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      accountant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tour_packages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      amount_usd: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      amount_etb: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      exchange_rate: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'received'),
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      sent_at: { type: Sequelize.DATE, allowNull: false },
      received_at: { type: Sequelize.DATE, allowNull: true },
      received_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('wallet_transactions', {
      fields: ['fund_return_id'],
      type: 'foreign key',
      name: 'wallet_transactions_fund_return_id_fkey',
      references: { table: 'fund_returns', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'wallet_transactions',
      'wallet_transactions_fund_return_id_fkey'
    );
    await queryInterface.removeColumn('wallet_transactions', 'fund_return_id');
    await queryInterface.dropTable('fund_returns');
    await queryInterface.removeColumn('wallet_transactions', 'exchange_rate');
    await queryInterface.removeColumn('wallet_transactions', 'amount_etb');
    await queryInterface.removeColumn('wallet_transactions', 'amount_usd');
    await queryInterface.removeColumn('handoffs', 'amount_etb');
    await queryInterface.removeColumn('handoffs', 'exchange_rate');
    await queryInterface.dropTable('exchange_rates');
  },
};
