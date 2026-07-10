const express = require('express');
const expenseController = require('../controllers/expenseController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { expenseValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'accountant'), expenseController.list);
router.get('/:id', requireRole('superAdmin', 'accountant'), expenseController.get);
router.post('/', requireRole('accountant'), expenseValidation, expenseController.create);
router.put('/:id', requireRole('accountant'), expenseController.update);
router.delete('/:id', requireRole('accountant'), expenseController.remove);

module.exports = router;
