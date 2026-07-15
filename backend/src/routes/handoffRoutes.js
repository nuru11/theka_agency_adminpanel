const express = require('express');
const handoffController = require('../controllers/handoffController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { handoffValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  requireRole('superAdmin', 'officeAdmin', 'accountant'),
  handoffController.list
);
router.get(
  '/:id',
  requireRole('superAdmin', 'officeAdmin', 'accountant'),
  handoffController.get
);
router.post(
  '/',
  requireRole('superAdmin', 'officeAdmin'),
  handoffValidation,
  handoffController.create
);
router.patch(
  '/:id/receive',
  requireRole('accountant'),
  handoffController.receive
);

module.exports = router;
