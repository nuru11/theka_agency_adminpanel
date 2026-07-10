'use strict';

const { hashPassword } = require('../src/utils/password');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await hashPassword('admin123');
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        name: 'Super Admin',
        username: 'superadmin',
        password_hash: passwordHash,
        phone: null,
        role: 'superAdmin',
        status: 'active',
        monthly_salary: null,
        is_driver: false,
        vehicle_types: null,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Abdul Rahman',
        username: 'officeadmin',
        password_hash: passwordHash,
        phone: null,
        role: 'officeAdmin',
        status: 'active',
        monthly_salary: null,
        is_driver: false,
        vehicle_types: null,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Salah',
        username: 'accountant',
        password_hash: passwordHash,
        phone: null,
        role: 'accountant',
        status: 'active',
        monthly_salary: null,
        is_driver: false,
        vehicle_types: null,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Field Employee',
        username: 'employee',
        password_hash: passwordHash,
        phone: null,
        role: 'employee',
        status: 'active',
        monthly_salary: 5000,
        is_driver: true,
        vehicle_types: JSON.stringify(['van', 'vip']),
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      username: ['superadmin', 'officeadmin', 'accountant', 'employee'],
    });
  },
};
