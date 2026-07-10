const reportService = require('../services/reportService');

async function dashboard(req, res, next) {
  try {
    const data = await reportService.getDashboard(req.query.month);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function officeAdmin(req, res, next) {
  try {
    const data = await reportService.getOfficeAdminSummary(req.query.month);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function accountant(req, res, next) {
  try {
    const data = await reportService.getAccountantSummary(req.query.month);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard, officeAdmin, accountant };
