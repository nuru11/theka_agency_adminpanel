const {
  Handoff,
  TourPackage,
  Tourist,
  User,
  WalletTransaction,
  sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');
const exchangeRateService = require('./exchangeRateService');

const listIncludes = [
  {
    model: TourPackage,
    as: 'package',
    attributes: ['id', 'expected_cost', 'status', 'tourist_id'],
    include: [{ model: Tourist, as: 'tourist', attributes: ['id', 'name'] }],
  },
  { model: User, as: 'officeAdmin', attributes: ['id', 'name'] },
  { model: User, as: 'accountant', attributes: ['id', 'name'] },
];

async function assertPackage(id) {
  const pkg = await TourPackage.findByPk(id);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  return pkg;
}

async function assertAccountant(id) {
  const accountant = await User.findOne({
    where: { id, role: 'accountant', status: 'active' },
  });
  if (!accountant) throw new AppError('ACCOUNTANT_NOT_FOUND', ERROR_CODES.ACCOUNTANT_NOT_FOUND, 404);
  return accountant;
}

async function list(user) {
  const where = {};
  if (user.role === 'accountant') {
    where.accountant_id = user.id;
  }

  return Handoff.findAll({
    where,
    include: listIncludes,
    order: [['created_at', 'DESC']],
  });
}

async function getById(id) {
  const handoff = await Handoff.findByPk(id, { include: listIncludes });
  if (!handoff) throw new AppError('HANDOFF_NOT_FOUND', ERROR_CODES.HANDOFF_NOT_FOUND, 404);
  return handoff;
}

async function create(data, senderId) {
  const { package_id, amount, accountant_id, notes } = data;

  await assertPackage(package_id);
  await assertAccountant(accountant_id);

  const rate = await exchangeRateService.requireCurrent();
  const amountUsd = Number(amount);
  const exchange_rate = Number(rate.usd_to_etb);
  const amount_etb = exchangeRateService.usdToEtb(amountUsd, exchange_rate);

  const handoffId = await sequelize.transaction(async (transaction) => {
    const handoff = await Handoff.create(
      {
        package_id,
        office_admin_id: senderId,
        accountant_id,
        amount: amountUsd,
        exchange_rate,
        amount_etb,
        status: 'pending',
        sent_at: new Date(),
        notes: notes || null,
      },
      { transaction }
    );

    await TourPackage.update(
      { status: 'sent_to_accountant' },
      { where: { id: package_id }, transaction }
    );

    return handoff.id;
  });

  return getById(handoffId);
}

async function receive(id, accountantUser) {
  const handoff = await Handoff.findByPk(id);
  if (!handoff) throw new AppError('HANDOFF_NOT_FOUND', ERROR_CODES.HANDOFF_NOT_FOUND, 404);

  if (handoff.status !== 'pending') {
    throw new AppError('HANDOFF_NOT_PENDING', ERROR_CODES.HANDOFF_NOT_PENDING, 400);
  }

  if (handoff.accountant_id !== accountantUser.id) {
    throw new AppError('FORBIDDEN', ERROR_CODES.FORBIDDEN, 403);
  }

  const amountUsd = Number(handoff.amount);
  const amountEtb = Number(handoff.amount_etb || 0);
  const exchangeRate = handoff.exchange_rate != null ? Number(handoff.exchange_rate) : null;

  await sequelize.transaction(async (transaction) => {
    await handoff.update(
      {
        status: 'received',
        received_at: new Date(),
      },
      { transaction }
    );

    await WalletTransaction.create(
      {
        user_id: accountantUser.id,
        type: 'credit',
        amount: amountUsd,
        amount_usd: amountUsd,
        amount_etb: amountEtb,
        exchange_rate: exchangeRate,
        handoff_id: handoff.id,
        note: `Handoff #${handoff.id} received`,
      },
      { transaction }
    );

    await TourPackage.update(
      { status: 'accountant_received' },
      { where: { id: handoff.package_id }, transaction }
    );
  });

  return getById(id);
}

module.exports = { list, getById, create, receive };
