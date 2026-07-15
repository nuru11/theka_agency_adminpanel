const packageService = require('../services/packageService');

async function list(_req, res, next) {
  try {
    const data = await packageService.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const data = await packageService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await packageService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create };
