const walletService = require('../services/walletService');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');

async function getMine(req, res, next) {
  try {
    if (req.user.role !== 'accountant' && req.user.role !== 'superAdmin') {
      throw new AppError('FORBIDDEN', ERROR_CODES.FORBIDDEN, 403);
    }

    // Accountant: own wallet. SuperAdmin can pass ?user_id= for any, else own (likely 0).
    let userId = req.user.id;
    if (req.user.role === 'superAdmin' && req.query.user_id) {
      userId = Number(req.query.user_id);
    } else if (req.user.role === 'accountant') {
      userId = req.user.id;
    }

    const data = await walletService.getWallet(userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMine };
