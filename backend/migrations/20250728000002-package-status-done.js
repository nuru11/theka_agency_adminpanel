'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('tour_packages', 'status', {
      type: Sequelize.ENUM(
        'draft',
        'active',
        'ready_for_handoff',
        'sent_to_accountant',
        'accountant_received',
        'settled',
        'done'
      ),
      allowNull: false,
      defaultValue: 'active',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE tour_packages SET status = 'settled' WHERE status = 'done'"
    );
    await queryInterface.changeColumn('tour_packages', 'status', {
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
    });
  },
};
