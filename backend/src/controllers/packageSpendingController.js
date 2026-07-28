const fs = require('fs');
const path = require('path');
const packageSpendingService = require('../services/packageSpendingService');

async function list(_req, res, next) {
  try {
    const data = await packageSpendingService.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await packageSpendingService.create(req.body, req.file, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function screenshot(req, res, next) {
  try {
    const spending = await packageSpendingService.getById(req.params.id);
    const filePath = packageSpendingService.resolveScreenshotAbsolutePath(spending);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Screenshot not found' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const typeByExt = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    res.setHeader('Content-Type', typeByExt[ext] || 'image/jpeg');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, screenshot };
