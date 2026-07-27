const express = require('express');
const touristController = require('../controllers/touristController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { touristValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin', 'employee'), touristController.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin', 'employee'), touristController.get);
router.post('/', requireRole('superAdmin', 'officeAdmin', 'employee'), touristValidation, touristController.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin', 'employee'), touristValidation, touristController.update);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin', 'employee'), touristController.remove);

module.exports = router;
