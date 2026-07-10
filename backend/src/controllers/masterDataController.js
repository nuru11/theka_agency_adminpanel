const makeCrudController = (service, activeOnlyQuery = false) => ({
  async list(req, res, next) {
    try {
      const activeOnly = activeOnlyQuery && !['superAdmin', 'officeAdmin'].includes(req.user.role);
      const data = await service.list(activeOnly);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
  async get(req, res, next) {
    try {
      const data = await service.getById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
  async create(req, res, next) {
    try {
      const data = await service.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const data = await service.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
  async remove(req, res, next) {
    try {
      await service.remove(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  },
});

const propertyService = require('../services/propertyService');
const parkService = require('../services/parkService');
const activityService = require('../services/activityService');

module.exports = {
  property: makeCrudController(propertyService, true),
  park: makeCrudController(parkService, true),
  activity: makeCrudController(activityService, true),
};
