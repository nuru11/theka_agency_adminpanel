const express = require('express');
const { property } = require('../controllers/masterDataController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { propertyValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), property.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'accountant', 'employee'), property.get);
router.post('/', requireRole('superAdmin', 'officeAdmin'), propertyValidation, property.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin'), propertyValidation, property.update);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin'), property.remove);

module.exports = router;
