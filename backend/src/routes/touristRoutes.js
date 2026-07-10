const express = require('express');
const touristController = require('../controllers/touristController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { touristValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('superAdmin', 'officeAdmin'), touristController.list);
router.get('/:id', requireRole('superAdmin', 'officeAdmin'), touristController.get);
router.post('/', requireRole('superAdmin', 'officeAdmin'), touristValidation, touristController.create);
router.put('/:id', requireRole('superAdmin', 'officeAdmin'), touristController.update);
router.delete('/:id', requireRole('superAdmin', 'officeAdmin'), touristController.remove);

module.exports = router;
