const userService = require('../services/userService');

async function list(req, res, next) {
  try {
    const users = await userService.listUsers(req.query);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

async function listEmployees(req, res, next) {
  try {
    const users = await userService.listEmployees();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

async function listDrivers(req, res, next) {
  try {
    const users = await userService.listDrivers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const user = await userService.getUser(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.deleteUser(req.params.id, req.user.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, listEmployees, listDrivers, get, create, update, remove };
