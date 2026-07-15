const { WalletTransaction, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

async function getWallet(userId) {
  const [row] = await sequelize.query(
    `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) AS balance
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

  return {
    balance: Number(row?.balance || 0),
    transactions,
  };
}

module.exports = { getWallet };
