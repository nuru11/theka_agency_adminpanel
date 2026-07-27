const express = require('express');
const reportController = require('../controllers/reportController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/monthly', requireRole('superAdmin'), reportController.monthly);

module.exports = router;
