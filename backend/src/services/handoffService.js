const { sequelize, Handoff, TourPackage, Tourist, User, Payment } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

const handoffIncludes = [
  {
    model: TourPackage,
    as: 'package',
    include: [
      { model: Tourist, as: 'tourist' },
      { model: Payment, as: 'payments' },
    ],
  },
  { model: User, as: 'officeAdmin', attributes: ['id', 'name'] },
  { model: User, as: 'accountant', attributes: ['id', 'name'] },
];

async function list(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  return Handoff.findAll({ where, include: handoffIncludes, order: [['sent_at', 'DESC']] });
}

async function getById(id) {
  const handoff = await Handoff.findByPk(id, { include: handoffIncludes });
  if (!handoff) throw new AppError('HANDOFF_NOT_FOUND', ERROR_CODES.HANDOFF_NOT_FOUND, 404);
  return handoff;
}

async function create(data, officeAdminId) {
  const pkg = await TourPackage.findByPk(data.package_id, {
    include: [{ model: Payment, as: 'payments' }],
  });
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  if (!['ready_for_handoff', 'active'].includes(pkg.status)) {
    throw new AppError('PACKAGE_NOT_READY', ERROR_CODES.PACKAGE_NOT_READY, 400);
  }

  const totalPayments = (pkg.payments || []).reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const amountCollected = data.amount_collected ?? totalPayments;

  return sequelize.transaction(async (t) => {
    const handoff = await Handoff.create(
      {
        package_id: data.package_id,
        office_admin_id: officeAdminId,
        amount_collected: amountCollected,
        notes: data.notes || null,
        status: 'pending',
        sent_at: new Date(),
      },
      { transaction: t }
    );
    await pkg.update({ status: 'sent_to_accountant' }, { transaction: t });
    return getById(handoff.id);
  });
}

async function receive(id, accountantId) {
  const handoff = await Handoff.findByPk(id, { include: [{ model: TourPackage, as: 'package' }] });
  if (!handoff) throw new AppError('HANDOFF_NOT_FOUND', ERROR_CODES.HANDOFF_NOT_FOUND, 404);
  if (handoff.status !== 'pending') {
    throw new AppError('HANDOFF_NOT_PENDING', ERROR_CODES.HANDOFF_NOT_PENDING, 400);
  }

  return sequelize.transaction(async (t) => {
    await handoff.update(
      { status: 'received', accountant_id: accountantId, received_at: new Date() },
      { transaction: t }
    );
    await handoff.package.update({ status: 'accountant_received' }, { transaction: t });
    return getById(id);
  });
}

async function markReady(packageId) {
  const pkg = await TourPackage.findByPk(packageId);
  if (!pkg) throw new AppError('PACKAGE_NOT_FOUND', ERROR_CODES.PACKAGE_NOT_FOUND, 404);
  await pkg.update({ status: 'ready_for_handoff' });
  return pkg;
}

module.exports = { list, getById, create, receive, markReady };
