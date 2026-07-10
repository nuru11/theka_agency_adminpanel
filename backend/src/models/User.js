const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      role: {
        type: DataTypes.ENUM('superAdmin', 'officeAdmin', 'accountant', 'employee'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      monthly_salary: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      is_driver: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      vehicle_types: { type: DataTypes.JSON, allowNull: true },
    },
    { tableName: 'users', underscored: true }
  );

  User.prototype.toJSON = function toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  return User;
};
