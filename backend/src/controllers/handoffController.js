const handoffService = require('../services/handoffService');

async function list(req, res, next) {
  try {
    const data = await handoffService.list(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const data = await handoffService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await handoffService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function receive(req, res, next) {
  try {
    const data = await handoffService.receive(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, receive };
