const express = require('express');
const packageController = require('../controllers/packageController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { packageValidation, packageLogValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/logs/history', requireRole('employee'), packageController.listLogs);
router.get('/', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), packageController.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), packageController.get);
router.post('/', requireRole('superAdmin', 'officeAdmin'), packageValidation, packageController.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin'), packageController.update);
router.patch('/:id/status', requireRole('superAdmin', 'officeAdmin'), packageController.updateStatus);
router.post('/:id/logs', requireRole('employee'), packageLogValidation, packageController.addLog);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin'), packageController.remove);

module.exports = router;
