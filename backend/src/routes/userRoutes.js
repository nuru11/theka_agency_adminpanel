const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { userCreateValidation, userUpdateValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/drivers', requireRole('superAdmin', 'officeAdmin', 'employee'), userController.listDrivers);
router.get(
  '/accountants',
  requireRole('superAdmin', 'officeAdmin'),
  userController.listAccountants
);

router.get('/', requireRole('superAdmin', 'officeAdmin'), userController.list);
router.post('/', requireRole('superAdmin', 'officeAdmin'), userCreateValidation, userController.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin'), userUpdateValidation, userController.update);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin'), userController.remove);

module.exports = router;
