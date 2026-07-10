'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const User = require('./User')(sequelize);
const Property = require('./Property')(sequelize);
const Park = require('./Park')(sequelize);
const Activity = require('./Activity')(sequelize);
const Tourist = require('./Tourist')(sequelize);
const TourPackage = require('./TourPackage')(sequelize);
const PackageItem = require('./PackageItem')(sequelize);
const Payment = require('./Payment')(sequelize);
const PackageLog = require('./PackageLog')(sequelize);
const Handoff = require('./Handoff')(sequelize);
const PackageSpending = require('./PackageSpending')(sequelize);
const Expense = require('./Expense')(sequelize);
const SalaryPayment = require('./SalaryPayment')(sequelize);

User.hasMany(Tourist, { foreignKey: 'created_by', as: 'touristsCreated' });
Tourist.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Tourist.hasMany(TourPackage, { foreignKey: 'tourist_id', as: 'packages' });
TourPackage.belongsTo(Tourist, { foreignKey: 'tourist_id', as: 'tourist' });

User.hasMany(TourPackage, { foreignKey: 'assigned_employee_id', as: 'assignedPackages' });
TourPackage.belongsTo(User, { foreignKey: 'assigned_employee_id', as: 'assignedEmployee' });

User.hasMany(TourPackage, { foreignKey: 'created_by', as: 'packagesCreated' });
TourPackage.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

TourPackage.hasMany(PackageItem, { foreignKey: 'package_id', as: 'items' });
PackageItem.belongsTo(TourPackage, { foreignKey: 'package_id', as: 'package' });
PackageItem.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
PackageItem.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });
PackageItem.belongsTo(Park, { foreignKey: 'park_id', as: 'park' });
PackageItem.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

TourPackage.hasMany(Payment, { foreignKey: 'package_id', as: 'payments' });
Payment.belongsTo(TourPackage, { foreignKey: 'package_id', as: 'package' });
Payment.belongsTo(User, { foreignKey: 'received_by', as: 'receiver' });

TourPackage.hasMany(PackageLog, { foreignKey: 'package_id', as: 'logs' });
PackageLog.belongsTo(TourPackage, { foreignKey: 'package_id', as: 'package' });
PackageLog.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
PackageLog.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
PackageLog.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

TourPackage.hasMany(Handoff, { foreignKey: 'package_id', as: 'handoffs' });
Handoff.belongsTo(TourPackage, { foreignKey: 'package_id', as: 'package' });
Handoff.belongsTo(User, { foreignKey: 'office_admin_id', as: 'officeAdmin' });
Handoff.belongsTo(User, { foreignKey: 'accountant_id', as: 'accountant' });

TourPackage.hasMany(PackageSpending, { foreignKey: 'package_id', as: 'spendings' });
PackageSpending.belongsTo(TourPackage, { foreignKey: 'package_id', as: 'package' });
PackageSpending.belongsTo(Handoff, { foreignKey: 'handoff_id', as: 'handoff' });
PackageSpending.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

User.hasMany(Expense, { foreignKey: 'created_by', as: 'expensesCreated' });
Expense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(SalaryPayment, { foreignKey: 'employee_id', as: 'salaryPayments' });
SalaryPayment.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
SalaryPayment.belongsTo(User, { foreignKey: 'paid_by', as: 'payer' });
Expense.hasOne(SalaryPayment, { foreignKey: 'expense_id', as: 'salaryPayment' });
SalaryPayment.belongsTo(Expense, { foreignKey: 'expense_id', as: 'expense' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Property,
  Park,
  Activity,
  Tourist,
  TourPackage,
  PackageItem,
  Payment,
  PackageLog,
  Handoff,
  PackageSpending,
  Expense,
  SalaryPayment,
};
