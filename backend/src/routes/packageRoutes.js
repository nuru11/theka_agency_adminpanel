const express = require('express');
const packageController = require('../controllers/packageController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { packageValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'accountant'), packageController.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'accountant'), packageController.get);
router.post('/', requireRole('superAdmin', 'officeAdmin'), packageValidation, packageController.create);

module.exports = router;
