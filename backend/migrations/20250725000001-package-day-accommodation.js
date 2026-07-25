'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('package_days', 'property_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'properties', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addColumn('package_days', 'accommodation_price', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });

    // Copy package property to every day; put full accommodation price on day 1 only
    await queryInterface.sequelize.query(`
      UPDATE package_days AS pd
      JOIN tour_packages AS tp ON pd.package_id = tp.id
      SET
        pd.property_id = tp.property_id,
        pd.accommodation_price = CASE
          WHEN pd.day_number = 1 THEN tp.accommodation_price
          ELSE 0
        END
    `);

    await queryInterface.changeColumn('package_days', 'property_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('package_days', 'accommodation_price');
    await queryInterface.removeColumn('package_days', 'property_id');
  },
};
