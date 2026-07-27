const userService = require('../services/userService');
const { User } = require('../models');

async function listDrivers(_req, res, next) {
  try {
    const data = await User.findAll({
      where: { role: 'employee', is_driver: true, status: 'active' },
      attributes: ['id', 'name', 'phone', 'vehicle_types'],
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listAccountants(_req, res, next) {
  try {
    const data = await User.findAll({
      where: { role: 'accountant', status: 'active' },
      attributes: ['id', 'name', 'phone', 'username'],
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function list(_req, res, next) {
  try {
    const data = await userService.listStaff();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await userService.createStaff(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await userService.updateStaff(req.params.id, req.body, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.removeStaff(req.params.id, req.user.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDrivers, listAccountants, list, create, update, remove };
