const reportService = require('../services/reportService');

async function monthly(req, res, next) {
  try {
    const data = await reportService.getMonthlyAnalysis(req.query.period);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { monthly };
