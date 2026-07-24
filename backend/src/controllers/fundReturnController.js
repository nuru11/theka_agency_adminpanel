const fundReturnService = require('../services/fundReturnService');

async function list(req, res, next) {
  try {
    const data = await fundReturnService.list(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const data = await fundReturnService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await fundReturnService.create(req.body, req.user);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function receive(req, res, next) {
  try {
    const data = await fundReturnService.receive(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, receive };
