const express = require('express');
const walletController = require('../controllers/walletController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('accountant', 'superAdmin'), walletController.getMine);

module.exports = router;
