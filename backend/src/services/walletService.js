const { WalletTransaction, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const exchangeRateService = require('./exchangeRateService');

async function getWallet(userId) {
  const [row] = await sequelize.query(
    `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'credit' THEN COALESCE(amount_usd, amount) ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN type = 'debit' THEN COALESCE(amount_usd, amount) ELSE 0 END), 0) AS balance_usd
    FROM wallet_transactions
    WHERE user_id = :userId
    `,
    { replacements: { userId }, type: QueryTypes.SELECT }
  );

  const transactions = await WalletTransaction.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: 50,
  });

  const balance_usd = Number(row?.balance_usd || 0);
  const rate = await exchangeRateService.getCurrent();
  const balance_etb = rate
    ? exchangeRateService.usdToEtb(balance_usd, Number(rate.usd_to_etb))
    : 0;

  return {
    balance: balance_usd,
    balance_usd,
    balance_etb,
    transactions,
  };
}

module.exports = { getWallet };
