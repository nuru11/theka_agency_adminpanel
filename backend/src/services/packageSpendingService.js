const path = require('path');
const {
  PackageSpending,
  TourPackage,
  Tourist,
  User,
  WalletTransaction,
  sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');
const walletService = require('./walletService');
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

async function create(data, file, userId) {
  if (!file) throw new AppError('SCREENSHOT_REQUIRED', ERROR_CODES.SCREENSHOT_REQUIRED, 400);

  const package_id = Number(data.package_id);
  const amount = Number(data.amount);
  const reason = data.reason;
  const notes = data.notes || null;

  if (!package_id || Number.isNaN(amount) || amount <= 0) {
    throw new AppError('VALIDATION_FAILED', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (!SPENDING_REASONS.includes(reason)) {
    throw new AppError('VALIDATION_FAILED', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const pkg = await TourPackage.findByPk(package_id);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);

  const wallet = await walletService.getWallet(userId);
  if (amount > wallet.balance) {
    throw new AppError('INSUFFICIENT_WALLET_BALANCE', ERROR_CODES.INSUFFICIENT_WALLET_BALANCE, 400);
  }

  const relativePath = path.join('package-spendings', file.filename).replace(/\\/g, '/');

  const spendingId = await sequelize.transaction(async (transaction) => {
    const spending = await PackageSpending.create(
      {
        package_id,
        amount,
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
        amount,
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
