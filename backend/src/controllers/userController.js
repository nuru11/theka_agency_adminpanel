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

module.exports = { listDrivers, listAccountants };
