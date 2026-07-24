const { ExchangeRate, User } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function getCurrent() {
  const rate = await ExchangeRate.findOne({
    include: [{ model: User, as: 'setter', attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
  });
  return rate;
}

async function requireCurrent() {
  const rate = await getCurrent();
  if (!rate) {
    throw new AppError('EXCHANGE_RATE_NOT_SET', ERROR_CODES.EXCHANGE_RATE_NOT_SET, 400);
  }
  return rate;
}

async function setRate(usdToEtb, userId) {
  const value = Number(usdToEtb);
  if (!value || value <= 0 || Number.isNaN(value)) {
    throw new AppError('VALIDATION_FAILED', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const created = await ExchangeRate.create({
    usd_to_etb: value,
    set_by: userId,
  });

  return ExchangeRate.findByPk(created.id, {
    include: [{ model: User, as: 'setter', attributes: ['id', 'name'] }],
  });
}

function usdToEtb(amountUsd, rate) {
  return Math.round(Number(amountUsd) * Number(rate) * 100) / 100;
}

function etbToUsd(amountEtb, rate) {
  const r = Number(rate);
  if (!r) return 0;
  return Math.round((Number(amountEtb) / r) * 100) / 100;
}

module.exports = {
  getCurrent,
  requireCurrent,
  setRate,
  usdToEtb,
  etbToUsd,
};
