const express = require('express');
const fundReturnController = require('../controllers/fundReturnController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { fundReturnValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  requireRole('superAdmin', 'accountant'),
  fundReturnController.list
);
router.get(
  '/:id',
  requireRole('superAdmin', 'accountant'),
  fundReturnController.get
);
router.post(
  '/',
  requireRole('accountant'),
  fundReturnValidation,
  fundReturnController.create
);
router.patch(
  '/:id/receive',
  requireRole('superAdmin'),
  fundReturnController.receive
);

module.exports = router;
