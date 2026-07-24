const express = require('express');
const exchangeRateController = require('../controllers/exchangeRateController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { exchangeRateValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  requireRole('superAdmin', 'officeAdmin', 'accountant'),
  exchangeRateController.getCurrent
);
router.post(
  '/',
  requireRole('superAdmin'),
  exchangeRateValidation,
  exchangeRateController.setRate
);

module.exports = router;
