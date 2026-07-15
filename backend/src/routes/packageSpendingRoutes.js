const express = require('express');
const packageSpendingController = require('../controllers/packageSpendingController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { uploadScreenshot } = require('../middleware/upload');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  requireRole('superAdmin', 'accountant'),
  packageSpendingController.list
);

router.post(
  '/',
  requireRole('accountant'),
  (req, res, next) => {
    uploadScreenshot(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
      }
      next();
    });
  },
  packageSpendingController.create
);

router.get(
  '/:id/screenshot',
  requireRole('superAdmin', 'accountant'),
  packageSpendingController.screenshot
);

module.exports = router;
