const { Op, fn, col, literal } = require('sequelize');
const {
  Payment,
  Expense,
  PackageSpending,
  Handoff,
  Tourist,
  TourPackage,
  User,
} = require('../models');

function getMonthRange(month) {
  const now = new Date();
  const [year, m] = month ? month.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const from = `${year}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(year, m, 0).getDate();
  const to = `${year}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

async function sumPayments(from, to) {
  const result = await Payment.sum('amount', {
    where: { payment_date: { [Op.between]: [from, to] } },
  });
  return parseFloat(result || 0);
}

async function sumExpenses(from, to) {
  const result = await Expense.sum('amount', {
    where: { expense_date: { [Op.between]: [from, to] } },
  });
  return parseFloat(result || 0);
}

async function sumPackageSpending(from, to) {
  const spendings = await PackageSpending.findAll({
    where: { created_at: { [Op.between]: [new Date(from), new Date(`${to}T23:59:59`)] } },
  });
  return spendings.reduce((sum, s) => {
    return (
      sum +
      parseFloat(s.accommodation_cost) +
      parseFloat(s.transport_cost) +
      parseFloat(s.activities_cost) +
      parseFloat(s.sim_cost) +
      parseFloat(s.park_commission) +
      parseFloat(s.other_cost)
    );
  }, 0);
}

async function getDashboard(month) {
  const { from, to } = getMonthRange(month);
  const revenue = await sumPayments(from, to);
  const operatingExpenses = await sumExpenses(from, to);
  const packageCosts = await sumPackageSpending(from, to);
  const totalExpenses = operatingExpenses + packageCosts;
  const netProfit = revenue - totalExpenses;

  const touristsCount = await Tourist.count({
    where: { created_at: { [Op.between]: [new Date(from), new Date(`${to}T23:59:59`)] } },
  });
  const packagesCount = await TourPackage.count({
    where: { created_at: { [Op.between]: [new Date(from), new Date(`${to}T23:59:59`)] } },
  });
  const pendingHandoffs = await Handoff.count({ where: { status: 'pending' } });

  return {
    month: month || `${from.slice(0, 7)}`,
    revenue,
    operatingExpenses,
    packageCosts,
    totalExpenses,
    netProfit,
    touristsCount,
    packagesCount,
    pendingHandoffs,
  };
}

async function getOfficeAdminSummary(month) {
  const { from, to } = getMonthRange(month);
  const touristsCount = await Tourist.count({
    where: { created_at: { [Op.between]: [new Date(from), new Date(`${to}T23:59:59`)] } },
  });
  const packages = await TourPackage.findAll({
    where: { created_at: { [Op.between]: [new Date(from), new Date(`${to}T23:59:59`)] } },
  });
  const packagesSold = packages.length;
  const totalPackageValue = packages.reduce((s, p) => s + parseFloat(p.package_price), 0);
  const revenue = await sumPayments(from, to);
  const handoffsSent = await Handoff.count({
    where: { sent_at: { [Op.between]: [new Date(from), new Date(`${to}T23:59:59`)] } },
  });

  return {
    month: month || from.slice(0, 7),
    touristsReceived: touristsCount,
    packagesSold,
    totalPackageValue,
    moneyCollected: revenue,
    sentToAccountant: handoffsSent,
  };
}

async function getAccountantSummary(month) {
  const { from, to } = getMonthRange(month);
  const handoffsReceived = await Handoff.count({
    where: {
      status: 'received',
      received_at: { [Op.between]: [new Date(from), new Date(`${to}T23:59:59`)] },
    },
  });
  const pendingHandoffs = await Handoff.count({ where: { status: 'pending' } });
  const packageCosts = await sumPackageSpending(from, to);

  const rent = await Expense.sum('amount', {
    where: { category: 'rent', expense_date: { [Op.between]: [from, to] } },
  });
  const salaries = await Expense.sum('amount', {
    where: { category: 'salaries', expense_date: { [Op.between]: [from, to] } },
  });
  const other = await Expense.sum('amount', {
    where: { category: 'other', expense_date: { [Op.between]: [from, to] } },
  });

  return {
    month: month || from.slice(0, 7),
    handoffsReceived,
    pendingHandoffs,
    packageSpending: packageCosts,
    rent: parseFloat(rent || 0),
    salaries: parseFloat(salaries || 0),
    otherExpenses: parseFloat(other || 0),
    totalSpent: packageCosts + parseFloat(rent || 0) + parseFloat(salaries || 0) + parseFloat(other || 0),
  };
}

module.exports = { getDashboard, getOfficeAdminSummary, getAccountantSummary };
