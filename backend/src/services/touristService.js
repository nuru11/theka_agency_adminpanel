const { Op } = require('sequelize');
const { Tourist, User, TourPackage, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function list() {
  return Tourist.findAll({
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
  });
}

async function getById(id) {
  const tourist = await Tourist.findByPk(id, {
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
  });
  if (!tourist) throw new AppError('TOURIST_NOT_FOUND', ERROR_CODES.TOURIST_NOT_FOUND, 404);
  return tourist;
}

async function create(data, userId) {
  return Tourist.create({ ...data, created_by: userId });
}

async function markPackagesDoneForTourist(touristId, transaction) {
  await TourPackage.update(
    { status: 'done' },
    {
      where: {
        tourist_id: touristId,
        status: { [Op.notIn]: ['settled', 'done'] },
      },
      transaction,
    }
  );
}

async function update(id, data) {
  const tourist = await Tourist.findByPk(id);
  if (!tourist) throw new AppError('TOURIST_NOT_FOUND', ERROR_CODES.TOURIST_NOT_FOUND, 404);

  const nextStatus = data.status;
  const shouldClosePackages = nextStatus === 'cancelled' || nextStatus === 'departed';

  if (shouldClosePackages) {
    await sequelize.transaction(async (transaction) => {
      await tourist.update(data, { transaction });
      await markPackagesDoneForTourist(id, transaction);
    });
  } else {
    await tourist.update(data);
  }

  return getById(id);
}

async function remove(id) {
  const tourist = await Tourist.findByPk(id);
  if (!tourist) throw new AppError('TOURIST_NOT_FOUND', ERROR_CODES.TOURIST_NOT_FOUND, 404);
  await tourist.destroy();
}

module.exports = { list, getById, create, update, remove };
