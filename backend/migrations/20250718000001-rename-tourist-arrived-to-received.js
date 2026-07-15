'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // MySQL: expand ENUM first, migrate values, then shrink
    await queryInterface.changeColumn('tourists', 'status', {
      type: Sequelize.ENUM('expected', 'arrived', 'received', 'departed', 'cancelled'),
      allowNull: false,
      defaultValue: 'expected',
    });

    await queryInterface.sequelize.query(
      "UPDATE tourists SET status = 'received' WHERE status = 'arrived'"
    );

    await queryInterface.changeColumn('tourists', 'status', {
      type: Sequelize.ENUM('expected', 'received', 'departed', 'cancelled'),
      allowNull: false,
      defaultValue: 'expected',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('tourists', 'status', {
      type: Sequelize.ENUM('expected', 'arrived', 'received', 'departed', 'cancelled'),
      allowNull: false,
      defaultValue: 'expected',
    });

    await queryInterface.sequelize.query(
      "UPDATE tourists SET status = 'arrived' WHERE status = 'received'"
    );

    await queryInterface.changeColumn('tourists', 'status', {
      type: Sequelize.ENUM('expected', 'arrived', 'departed', 'cancelled'),
      allowNull: false,
      defaultValue: 'expected',
    });
  },
};
