const exchangeRateService = require('../services/exchangeRateService');

async function getCurrent(_req, res, next) {
  try {
    const data = await exchangeRateService.getCurrent();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function setRate(req, res, next) {
  try {
    const data = await exchangeRateService.setRate(req.body.usd_to_etb, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCurrent, setRate };
