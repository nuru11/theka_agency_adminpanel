const salaryService = require('../services/salaryService');

async function list(_req, res, next) {
  try {
    const data = await salaryService.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await salaryService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
