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
const Tourist = require('./Tourist')(sequelize);
const Property = require('./Property')(sequelize);
const Park = require('./Park')(sequelize);
const TourPackage = require('./TourPackage')(sequelize);
const PackageDay = require('./PackageDay')(sequelize);
const Handoff = require('./Handoff')(sequelize);
const WalletTransaction = require('./WalletTransaction')(sequelize);
const PackageSpending = require('./PackageSpending')(sequelize);

Tourist.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
User.hasMany(Tourist, { as: 'tourists', foreignKey: 'created_by' });

TourPackage.belongsTo(Tourist, { as: 'tourist', foreignKey: 'tourist_id' });
Tourist.hasMany(TourPackage, { as: 'packages', foreignKey: 'tourist_id' });

TourPackage.belongsTo(Property, { as: 'property', foreignKey: 'property_id' });
Property.hasMany(TourPackage, { as: 'packages', foreignKey: 'property_id' });

TourPackage.belongsTo(User, { as: 'driver', foreignKey: 'driver_id' });
TourPackage.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

TourPackage.hasMany(PackageDay, { as: 'days', foreignKey: 'package_id' });
PackageDay.belongsTo(TourPackage, { as: 'package', foreignKey: 'package_id' });

PackageDay.belongsTo(Park, { as: 'park', foreignKey: 'park_id' });
PackageDay.belongsTo(User, { as: 'driver', foreignKey: 'driver_id' });

Handoff.belongsTo(TourPackage, { as: 'package', foreignKey: 'package_id' });
TourPackage.hasMany(Handoff, { as: 'handoffs', foreignKey: 'package_id' });

Handoff.belongsTo(User, { as: 'officeAdmin', foreignKey: 'office_admin_id' });
Handoff.belongsTo(User, { as: 'accountant', foreignKey: 'accountant_id' });

WalletTransaction.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(WalletTransaction, { as: 'walletTransactions', foreignKey: 'user_id' });

WalletTransaction.belongsTo(Handoff, { as: 'handoff', foreignKey: 'handoff_id' });
Handoff.hasMany(WalletTransaction, { as: 'walletTransactions', foreignKey: 'handoff_id' });

PackageSpending.belongsTo(TourPackage, { as: 'package', foreignKey: 'package_id' });
TourPackage.hasMany(PackageSpending, { as: 'spendings', foreignKey: 'package_id' });

PackageSpending.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

WalletTransaction.belongsTo(PackageSpending, {
  as: 'packageSpending',
  foreignKey: 'package_spending_id',
});
PackageSpending.hasMany(WalletTransaction, {
  as: 'walletTransactions',
  foreignKey: 'package_spending_id',
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  Tourist,
  Property,
  Park,
  TourPackage,
  PackageDay,
  Handoff,
  WalletTransaction,
  PackageSpending,
};
