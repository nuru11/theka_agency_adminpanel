const express = require('express');
const reportController = require('../controllers/reportController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), reportController.dashboard);
router.get('/office-admin', requireRole('superAdmin', 'officeAdmin'), reportController.officeAdmin);
router.get('/accountant', requireRole('superAdmin', 'accountant'), reportController.accountant);

module.exports = router;
