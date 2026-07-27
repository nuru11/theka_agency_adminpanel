const express = require('express');
const packageController = require('../controllers/packageController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { packageValidation, settlePackageValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), packageController.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), packageController.get);
router.post('/', requireRole('superAdmin', 'officeAdmin', 'employee'), packageValidation, packageController.create);
router.post(
  '/:id/settle',
  requireRole('accountant'),
  settlePackageValidation,
  packageController.settle
);

module.exports = router;
