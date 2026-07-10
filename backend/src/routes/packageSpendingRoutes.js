const express = require('express');
const packageSpendingController = require('../controllers/packageSpendingController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'accountant'), packageSpendingController.list);
router.get('/:id', requireRole('superAdmin', 'accountant'), packageSpendingController.get);
router.post('/', requireRole('accountant'), packageSpendingController.create);
router.put('/:id', requireRole('accountant'), packageSpendingController.update);
router.delete('/:id', requireRole('accountant'), packageSpendingController.remove);

module.exports = router;
