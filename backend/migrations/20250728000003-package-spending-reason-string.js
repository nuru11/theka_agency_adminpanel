'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('package_spendings', 'reason', {
      type: Sequelize.STRING(150),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('package_spendings', 'reason', {
      type: Sequelize.ENUM('accommodation', 'park', 'food', 'other'),
      allowNull: false,
    });
  },
};
