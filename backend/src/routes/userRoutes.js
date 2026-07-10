const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { createUserValidation, updateUserValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin'), userController.list);
router.get('/employees', requireRole('superAdmin', 'officeAdmin', 'accountant'), userController.listEmployees);
router.get('/drivers', requireRole('superAdmin', 'officeAdmin'), userController.listDrivers);
router.get('/:id', requireRole('superAdmin'), userController.get);
router.post('/', requireRole('superAdmin'), createUserValidation, userController.create);
router.put('/:id', requireRole('superAdmin'), updateUserValidation, userController.update);
router.delete('/:id', requireRole('superAdmin'), userController.remove);

module.exports = router;
