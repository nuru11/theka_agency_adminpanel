const express = require('express');
const propertyController = require('../controllers/propertyController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { propertyValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin'), propertyController.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin'), propertyController.get);
router.post('/', requireRole('superAdmin', 'officeAdmin'), propertyValidation, propertyController.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin'), propertyValidation, propertyController.update);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin'), propertyController.remove);

module.exports = router;
