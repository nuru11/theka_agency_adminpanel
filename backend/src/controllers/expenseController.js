const expenseService = require('../services/expenseService');

async function list(_req, res, next) {
  try {
    const data = await expenseService.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const data = await expenseService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await expenseService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await expenseService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await expenseService.remove(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, update, remove };
