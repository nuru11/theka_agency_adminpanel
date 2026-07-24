const { body } = require('express-validator');
const validate = require('./validate');
const {
  TOURIST_STATUSES,
  PROPERTY_TYPES,
  MASTER_STATUSES,
  VEHICLE_TYPES,
} = require('../constants');

const loginValidation = [
  body('username').notEmpty().withMessage('VALIDATION_USERNAME_REQUIRED'),
  body('password').notEmpty().withMessage('VALIDATION_PASSWORD_REQUIRED'),
  validate,
];

const touristValidation = [
  body('name').notEmpty().withMessage('VALIDATION_NAME_REQUIRED'),
  body('phone').optional({ values: 'falsy' }).isString(),
  body('nationality').optional({ values: 'falsy' }).isString(),
  body('come_date').optional({ values: 'falsy' }).isISO8601().withMessage('VALIDATION_FAILED'),
  body('leave_date').optional({ values: 'falsy' }).isISO8601().withMessage('VALIDATION_FAILED'),
  body('status').optional().isIn(TOURIST_STATUSES).withMessage('VALIDATION_FAILED'),
  body('amount_received').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('VALIDATION_FAILED'),
  validate,
];

const propertyValidation = [
  body('name').notEmpty().withMessage('VALIDATION_NAME_REQUIRED'),
  body('type').isIn(PROPERTY_TYPES).withMessage('VALIDATION_FAILED'),
  body('location').optional({ values: 'falsy' }).isString(),
  body('city').notEmpty().withMessage('VALIDATION_FAILED'),
  body('price').isFloat({ min: 0 }).withMessage('VALIDATION_FAILED'),
  body('commission').isFloat({ min: 0 }).withMessage('VALIDATION_FAILED'),
  body('status').optional().isIn(MASTER_STATUSES).withMessage('VALIDATION_FAILED'),
  validate,
];

const parkValidation = [
  body('name').notEmpty().withMessage('VALIDATION_NAME_REQUIRED'),
  body('city').notEmpty().withMessage('VALIDATION_FAILED'),
  body('price').isFloat({ min: 0 }).withMessage('VALIDATION_FAILED'),
  body('status').optional().isIn(MASTER_STATUSES).withMessage('VALIDATION_FAILED'),
  validate,
];

const packageValidation = [
  body('tourist_id').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('people_count').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('days_count').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('property_id').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('accommodation_price').isFloat({ min: 0 }).withMessage('VALIDATION_FAILED'),
  body('driver_id').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('vehicle_type').isIn(VEHICLE_TYPES).withMessage('VALIDATION_FAILED'),
  body('days').isArray({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('days.*.day_number').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('days.*.park_id').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('days.*.park_price').isFloat({ min: 0 }).withMessage('VALIDATION_FAILED'),
  body('days.*.driver_id').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  validate,
];

const handoffValidation = [
  body('package_id').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('amount').isFloat({ min: 0.01 }).withMessage('VALIDATION_FAILED'),
  body('accountant_id').isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('notes').optional({ values: 'falsy' }).isString(),
  validate,
];

const exchangeRateValidation = [
  body('usd_to_etb').isFloat({ min: 0.0001 }).withMessage('VALIDATION_FAILED'),
  validate,
];

const fundReturnValidation = [
  body('amount_etb').isFloat({ min: 0.01 }).withMessage('VALIDATION_FAILED'),
  body('package_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('VALIDATION_FAILED'),
  body('notes').optional({ values: 'falsy' }).isString(),
  validate,
];

const settlePackageValidation = [
  body('action').isIn(['keep', 'return']).withMessage('INVALID_SETTLE_ACTION'),
  body('notes').optional({ values: 'falsy' }).isString(),
  validate,
];

module.exports = {
  loginValidation,
  touristValidation,
  propertyValidation,
  parkValidation,
  packageValidation,
  handoffValidation,
  exchangeRateValidation,
  fundReturnValidation,
  settlePackageValidation,
};
