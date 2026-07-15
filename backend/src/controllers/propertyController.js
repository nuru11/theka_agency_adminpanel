const propertyService = require('../services/propertyService');

async function list(_req, res, next) {
  try {
    const data = await propertyService.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const data = await propertyService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await propertyService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await propertyService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await propertyService.remove(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, update, remove };
