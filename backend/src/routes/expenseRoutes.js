const express = require('express');
const expenseController = require('../controllers/expenseController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { expenseValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'employee', 'accountant'), expenseController.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'employee', 'accountant'), expenseController.get);
router.post('/', requireRole('superAdmin', 'officeAdmin'), expenseValidation, expenseController.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin'), expenseValidation, expenseController.update);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin'), expenseController.remove);

module.exports = router;
