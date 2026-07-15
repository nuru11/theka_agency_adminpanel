const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/drivers', requireRole('superAdmin', 'officeAdmin'), userController.listDrivers);
router.get(
  '/accountants',
  requireRole('superAdmin', 'officeAdmin'),
  userController.listAccountants
);

module.exports = router;
