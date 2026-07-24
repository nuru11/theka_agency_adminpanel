const path = require('path');
const {
  PackageSpending,
  TourPackage,
  Tourist,
  User,
  WalletTransaction,
  FundReturn,
  sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');
const walletService = require('./walletService');
const exchangeRateService = require('./exchangeRateService');
const { uploadDir } = require('../middleware/upload');
const { SPENDING_REASONS } = require('../constants');

const listIncludes = [
  {
    model: TourPackage,
    as: 'package',
    attributes: ['id', 'expected_cost', 'status', 'tourist_id'],
    include: [{ model: Tourist, as: 'tourist', attributes: ['id', 'name'] }],
  },
  { model: User, as: 'creator', attributes: ['id', 'name'] },
];

async function list() {
  return PackageSpending.findAll({
    include: listIncludes,
    order: [['created_at', 'DESC']],
  });
}

async function getById(id) {
  const row = await PackageSpending.findByPk(id, { include: listIncludes });
  if (!row) throw new AppError('PACKAGE_SPENDING_NOT_FOUND', ERROR_CODES.PACKAGE_SPENDING_NOT_FOUND, 404);
  return row;
}

async function getPendingReturnEtb(userId) {
  const rows = await FundReturn.findAll({
    where: { accountant_id: userId, status: 'pending' },
    attributes: ['amount_etb'],
  });
  return rows.reduce((sum, r) => sum + Number(r.amount_etb || 0), 0);
}

async function create(data, file, userId) {
  if (!file) throw new AppError('SCREENSHOT_REQUIRED', ERROR_CODES.SCREENSHOT_REQUIRED, 400);

  const package_id = Number(data.package_id);
  const amountEtb = Number(data.amount);
  const reason = data.reason;
  const notes = data.notes || null;

  if (!package_id || Number.isNaN(amountEtb) || amountEtb <= 0) {
    throw new AppError('VALIDATION_FAILED', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (!SPENDING_REASONS.includes(reason)) {
    throw new AppError('VALIDATION_FAILED', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const pkg = await TourPackage.findByPk(package_id);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);

  const rate = await exchangeRateService.requireCurrent();
  const exchange_rate = Number(rate.usd_to_etb);
  const amountUsd = exchangeRateService.etbToUsd(amountEtb, exchange_rate);

  const wallet = await walletService.getWallet(userId);
  const pendingEtb = await getPendingReturnEtb(userId);
  const availableEtb = Math.round((wallet.balance_etb - pendingEtb) * 100) / 100;
  if (amountEtb > availableEtb) {
    throw new AppError('INSUFFICIENT_WALLET_BALANCE', ERROR_CODES.INSUFFICIENT_WALLET_BALANCE, 400);
  }

  const relativePath = path.join('package-spendings', file.filename).replace(/\\/g, '/');

  const spendingId = await sequelize.transaction(async (transaction) => {
    const spending = await PackageSpending.create(
      {
        package_id,
        amount: amountEtb,
        reason,
        screenshot_path: relativePath,
        notes,
        created_by: userId,
      },
      { transaction }
    );

    await WalletTransaction.create(
      {
        user_id: userId,
        type: 'debit',
        amount: amountUsd,
        amount_usd: amountUsd,
        amount_etb: amountEtb,
        exchange_rate,
        package_spending_id: spending.id,
        note: `Package spending #${spending.id} (${reason})`,
      },
      { transaction }
    );

    return spending.id;
  });

  return getById(spendingId);
}

function resolveScreenshotAbsolutePath(spending) {
  return path.join(uploadDir, path.basename(spending.screenshot_path));
}

module.exports = {
  list,
  getById,
  create,
  resolveScreenshotAbsolutePath,
};
