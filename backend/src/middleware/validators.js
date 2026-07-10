const { body, param } = require('express-validator');
const { USER_ROLES, PROPERTY_TYPES, VEHICLE_TYPES, EXPENSE_CATEGORIES } = require('../constants');
const validate = require('./validate');

const loginValidation = [
  body('username').notEmpty().withMessage('VALIDATION_USERNAME_REQUIRED'),
  body('password').notEmpty().withMessage('VALIDATION_PASSWORD_REQUIRED'),
  validate,
];

const createUserValidation = [
  body('name').notEmpty().withMessage('VALIDATION_NAME_REQUIRED'),
  body('username').notEmpty().withMessage('VALIDATION_USERNAME_REQUIRED'),
  body('password').isLength({ min: 6 }).withMessage('VALIDATION_PASSWORD_MIN'),
  body('role').isIn(USER_ROLES).withMessage('VALIDATION_INVALID_ROLE'),
  validate,
];

const updateUserValidation = [
  param('id').isInt(),
  body('role').optional().isIn(USER_ROLES).withMessage('VALIDATION_INVALID_ROLE'),
  validate,
];

const propertyValidation = [
  body('name').notEmpty().withMessage('VALIDATION_NAME_REQUIRED'),
  body('type').isIn(PROPERTY_TYPES).withMessage('VALIDATION_FAILED'),
  body('price_per_night').isFloat({ min: 0 }),
  validate,
];

const touristValidation = [
  body('name').notEmpty().withMessage('VALIDATION_NAME_REQUIRED'),
  body('group_size').optional().isInt({ min: 1 }),
  validate,
];

const packageValidation = [
  body('tourist_id').isInt(),
  body('package_price').isFloat({ min: 0 }),
  body('people_count').isInt({ min: 1 }),
  validate,
];

const handoffValidation = [
  body('package_id').isInt(),
  validate,
];

const expenseValidation = [
  body('category').isIn(EXPENSE_CATEGORIES).withMessage('VALIDATION_FAILED'),
  body('amount').isFloat({ min: 0 }),
  body('expense_date').notEmpty(),
  validate,
];

const salaryPaymentValidation = [
  body('employee_id').isInt(),
  body('pay_period').matches(/^\d{4}-\d{2}$/).withMessage('INVALID_PAY_PERIOD'),
  validate,
];

const packageLogValidation = [
  body('people_count').isInt({ min: 1 }),
  body('money_received').isFloat({ min: 0 }),
  validate,
];

const vehicleTypeValidation = body('vehicle_types')
  .optional()
  .custom((val) => {
    if (!val) return true;
    const types = Array.isArray(val) ? val : JSON.parse(val);
    return types.every((t) => VEHICLE_TYPES.includes(t));
  })
  .withMessage('VALIDATION_FAILED');

module.exports = {
  loginValidation,
  createUserValidation,
  updateUserValidation,
  propertyValidation,
  touristValidation,
  packageValidation,
  handoffValidation,
  expenseValidation,
  salaryPaymentValidation,
  packageLogValidation,
  vehicleTypeValidation,
};
