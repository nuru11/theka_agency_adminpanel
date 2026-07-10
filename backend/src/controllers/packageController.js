const packageService = require('../services/packageService');

async function list(req, res, next) {
  try {
    const filters = {};
    if (req.user.role === 'employee') {
      filters.employeeId = req.user.id;
    }
    if (req.query.status) filters.status = req.query.status;
    const data = await packageService.list(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const data = await packageService.getById(req.params.id);
    if (req.user.role === 'employee' && data.assigned_employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
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

async function update(req, res, next) {
  try {
    const data = await packageService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const data = await packageService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function addLog(req, res, next) {
  try {
    const data = await packageService.addLog(req.params.id, req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listLogs(req, res, next) {
  try {
    const data = await packageService.listLogs(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await packageService.remove(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, update, updateStatus, addLog, listLogs, remove };
