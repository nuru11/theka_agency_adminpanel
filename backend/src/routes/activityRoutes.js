const express = require('express');
const { activity } = require('../controllers/masterDataController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), activity.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), activity.get);
router.post('/', requireRole('superAdmin', 'officeAdmin'), activity.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin'), activity.update);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin'), activity.remove);

module.exports = router;
