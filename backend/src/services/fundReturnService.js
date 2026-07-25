const {
  FundReturn,
  TourPackage,
  Tourist,
  User,
  Handoff,
  PackageSpending,
  WalletTransaction,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');
const exchangeRateService = require('./exchangeRateService');
const walletService = require('./walletService');

const listIncludes = [
  {
    model: TourPackage,
    as: 'package',
    attributes: ['id', 'expected_cost', 'status', 'tourist_id'],
    include: [{ model: Tourist, as: 'tourist', attributes: ['id', 'name'] }],
    required: false,
  },
  { model: User, as: 'accountant', attributes: ['id', 'name'] },
  { model: User, as: 'receiver', attributes: ['id', 'name'], required: false },
];

async function list(user) {
  const where = {};
  if (user.role === 'accountant') {
    where.accountant_id = user.id;
  }

  return FundReturn.findAll({
    where,
    include: listIncludes,
    order: [['created_at', 'DESC']],
  });
}

async function getById(id) {
  const row = await FundReturn.findByPk(id, { include: listIncludes });
  if (!row) throw new AppError('FUND_RETURN_NOT_FOUND', ERROR_CODES.FUND_RETURN_NOT_FOUND, 404);
  return row;
}

async function getPendingReturnUsd(accountantId) {
  const rows = await FundReturn.findAll({
    where: { accountant_id: accountantId, status: 'pending' },
    attributes: ['amount_usd'],
  });
  return rows.reduce((sum, r) => sum + Number(r.amount_usd || 0), 0);
}

async function create(data, accountantUser, options = {}) {
  const amountUsd = Number(data.amount_usd);
  const package_id = data.package_id ? Number(data.package_id) : null;
  const notes = data.notes || null;
  const { transaction: outerTransaction } = options;

  if (!amountUsd || Number.isNaN(amountUsd) || amountUsd <= 0) {
    throw new AppError('VALIDATION_FAILED', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (package_id) {
    const pkg = await TourPackage.findByPk(package_id);
    if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  }

  const rate = await exchangeRateService.requireCurrent();
  const exchange_rate = Number(rate.usd_to_etb);
  const amount_etb = exchangeRateService.usdToEtb(amountUsd, exchange_rate);

  const wallet = await walletService.getWallet(accountantUser.id);
  const pendingUsd = await getPendingReturnUsd(accountantUser.id);
  const availableUsd = Math.round((wallet.balance_usd - pendingUsd) * 100) / 100;
  if (amountUsd > availableUsd) {
    throw new AppError('INSUFFICIENT_WALLET_BALANCE', ERROR_CODES.INSUFFICIENT_WALLET_BALANCE, 400);
  }

  const run = async (transaction) => {
    const fundReturn = await FundReturn.create(
      {
        accountant_id: accountantUser.id,
        package_id,
        amount_usd: amountUsd,
        amount_etb,
        exchange_rate,
        status: 'pending',
        notes,
        sent_at: new Date(),
      },
      { transaction }
    );
    return fundReturn.id;
  };

  const fundReturnId = outerTransaction
    ? await run(outerTransaction)
    : await sequelize.transaction(run);

  return getById(fundReturnId);
}

async function receive(id, superAdminUser) {
  const fundReturn = await FundReturn.findByPk(id);
  if (!fundReturn) throw new AppError('FUND_RETURN_NOT_FOUND', ERROR_CODES.FUND_RETURN_NOT_FOUND, 404);

  if (fundReturn.status !== 'pending') {
    throw new AppError('FUND_RETURN_NOT_PENDING', ERROR_CODES.FUND_RETURN_NOT_PENDING, 400);
  }

  const amountUsd = Number(fundReturn.amount_usd);
  const amountEtb = Number(fundReturn.amount_etb);
  const exchangeRate = Number(fundReturn.exchange_rate);

  const wallet = await walletService.getWallet(fundReturn.accountant_id);
  if (amountUsd > wallet.balance_usd) {
    throw new AppError('INSUFFICIENT_WALLET_BALANCE', ERROR_CODES.INSUFFICIENT_WALLET_BALANCE, 400);
  }

  await sequelize.transaction(async (transaction) => {
    await fundReturn.update(
      {
        status: 'received',
        received_at: new Date(),
        received_by: superAdminUser.id,
      },
      { transaction }
    );

    await WalletTransaction.create(
      {
        user_id: fundReturn.accountant_id,
        type: 'debit',
        amount: amountUsd,
        amount_usd: amountUsd,
        amount_etb: amountEtb,
        exchange_rate: exchangeRate,
        fund_return_id: fundReturn.id,
        note: `Fund return #${fundReturn.id} confirmed`,
      },
      { transaction }
    );
  });

  return getById(id);
}

async function getPackageRemainingUsd(packageId) {
  const handoffs = await Handoff.findAll({
    where: { package_id: packageId, status: 'received' },
    attributes: ['amount'],
  });
  const spendings = await PackageSpending.findAll({
    where: { package_id: packageId },
    attributes: ['id'],
  });
  const spendingIds = spendings.map((s) => s.id);
  let spent = 0;
  if (spendingIds.length > 0) {
    const txs = await WalletTransaction.findAll({
      where: {
        package_spending_id: { [Op.in]: spendingIds },
        type: 'debit',
      },
      attributes: ['amount_usd', 'amount'],
    });
    spent = txs.reduce((sum, tx) => sum + Number(tx.amount_usd ?? tx.amount ?? 0), 0);
  }
  const pendingReturns = await FundReturn.findAll({
    where: {
      package_id: packageId,
      status: { [Op.in]: ['pending', 'received'] },
    },
    attributes: ['amount_usd'],
  });

  const funded = handoffs.reduce((sum, h) => sum + Number(h.amount || 0), 0);
  const returned = pendingReturns.reduce((sum, r) => sum + Number(r.amount_usd || 0), 0);

  return Math.max(0, Math.round((funded - spent - returned) * 100) / 100);
}

module.exports = {
  list,
  getById,
  create,
  receive,
  getPendingReturnUsd,
  getPackageRemainingUsd,
};
