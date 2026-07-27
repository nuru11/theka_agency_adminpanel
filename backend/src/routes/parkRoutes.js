const express = require('express');
const parkController = require('../controllers/parkController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { parkValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'employee'), parkController.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'employee'), parkController.get);
router.post('/', requireRole('superAdmin', 'officeAdmin'), parkValidation, parkController.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin'), parkValidation, parkController.update);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin'), parkController.remove);

module.exports = router;
