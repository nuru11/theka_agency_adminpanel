const express = require('express');
const salaryController = require('../controllers/salaryController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { salaryPaymentValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'accountant'), salaryController.list);
router.post('/', requireRole('accountant'), salaryPaymentValidation, salaryController.create);

module.exports = router;
