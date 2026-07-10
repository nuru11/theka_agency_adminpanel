const express = require('express');
const { park } = require('../controllers/masterDataController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), park.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), park.get);
router.post('/', requireRole('superAdmin'), park.create);
router.put('/:id', requireRole('superAdmin'), park.update);
router.delete('/:id', requireRole('superAdmin'), park.remove);

module.exports = router;
