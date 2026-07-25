const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCodes');
const { SPENDING_REASONS } = require('../constants');
const exchangeRateService = require('./exchangeRateService');

function parsePeriod(period) {
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    throw new AppError('INVALID_PAY_PERIOD', ERROR_CODES.INVALID_PAY_PERIOD, 400);
  }
  const [yearStr, monthStr] = period.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (month < 1 || month > 12) {
    throw new AppError('INVALID_PAY_PERIOD', ERROR_CODES.INVALID_PAY_PERIOD, 400);
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const period_label = start.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  return { start, end, period_label };
}

function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

function emptyReasonMap() {
  return SPENDING_REASONS.reduce((acc, reason) => {
    acc[reason] = 0;
    return acc;
  }, {});
}

function toDateKey(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function emptyTotals() {
  return {
    income: 0,
    expense: 0,
    expense_etb: 0,
    expected_spend: 0,
    expected_spend_etb: 0,
    expected_income: 0,
    net_profit: 0,
  };
}

async function getMonthlyAnalysis(period) {
  const { start, end, period_label } = parsePeriod(period);

  const tourists = await sequelize.query(
    `
    SELECT
      id,
      name,
      come_date,
      created_at,
      amount_received,
      COALESCE(come_date, created_at) AS effective_date
    FROM tourists
    WHERE status <> 'cancelled'
      AND (
        (come_date IS NOT NULL AND come_date >= :start AND come_date < :end)
        OR (come_date IS NULL AND created_at >= :start AND created_at < :end)
      )
    ORDER BY COALESCE(come_date, created_at) ASC, id ASC
    `,
    {
      replacements: { start, end },
      type: QueryTypes.SELECT,
    }
  );

  const expense_by_reason = emptyReasonMap();
  const expense_etb_by_reason = emptyReasonMap();
  const empty = emptyTotals();

  if (tourists.length === 0) {
    return {
      period,
      period_label,
      ...empty,
      tourist_count: 0,
      expense_by_reason,
      expense_etb_by_reason,
      by_tourist: [],
      by_day: [],
    };
  }

  const touristIds = tourists.map((t) => t.id);

  const rateRow = await exchangeRateService.getCurrent();
  const usdToEtbRate = rateRow ? Number(rateRow.usd_to_etb) : 0;

  const [spendRows, expectedRows] = await Promise.all([
    sequelize.query(
      `
      SELECT
        tp.tourist_id,
        ps.reason,
        COALESCE(SUM(ps.amount), 0) AS expense_etb,
        COALESCE(SUM(COALESCE(wt.amount_usd, wt.amount, 0)), 0) AS expense_usd
      FROM package_spendings ps
      INNER JOIN tour_packages tp ON tp.id = ps.package_id
      LEFT JOIN wallet_transactions wt
        ON wt.package_spending_id = ps.id AND wt.type = 'debit'
      WHERE tp.tourist_id IN (:touristIds)
      GROUP BY tp.tourist_id, ps.reason
      `,
      {
        replacements: { touristIds },
        type: QueryTypes.SELECT,
      }
    ),
    sequelize.query(
      `
      SELECT
        tourist_id,
        COALESCE(SUM(expected_cost), 0) AS expected_spend_etb
      FROM tour_packages
      WHERE tourist_id IN (:touristIds)
      GROUP BY tourist_id
      `,
      {
        replacements: { touristIds },
        type: QueryTypes.SELECT,
      }
    ),
  ]);

  const spendByTourist = {};
  for (const row of spendRows) {
    const touristId = Number(row.tourist_id);
    if (!spendByTourist[touristId]) {
      spendByTourist[touristId] = { expense: 0, expense_etb: 0 };
    }
    const usd = round2(row.expense_usd);
    const etb = round2(row.expense_etb);
    spendByTourist[touristId].expense = round2(spendByTourist[touristId].expense + usd);
    spendByTourist[touristId].expense_etb = round2(spendByTourist[touristId].expense_etb + etb);

    const reason = SPENDING_REASONS.includes(row.reason) ? row.reason : 'other';
    expense_by_reason[reason] = round2(expense_by_reason[reason] + usd);
    expense_etb_by_reason[reason] = round2(expense_etb_by_reason[reason] + etb);
  }

  const expectedByTourist = {};
  for (const row of expectedRows) {
    const touristId = Number(row.tourist_id);
    const expectedEtb = round2(row.expected_spend_etb);
    expectedByTourist[touristId] = {
      expected_spend_etb: expectedEtb,
      expected_spend: usdToEtbRate
        ? exchangeRateService.etbToUsd(expectedEtb, usdToEtbRate)
        : 0,
    };
  }

  let income = 0;
  let expense = 0;
  let expense_etb = 0;
  let expected_spend = 0;
  let expected_spend_etb = 0;
  let expected_income = 0;
  const dayMap = {};

  const by_tourist = tourists.map((tourist) => {
    const touristIncome = round2(tourist.amount_received);
    const spend = spendByTourist[tourist.id] || { expense: 0, expense_etb: 0 };
    const expected = expectedByTourist[tourist.id] || {
      expected_spend: 0,
      expected_spend_etb: 0,
    };
    const touristExpense = round2(spend.expense);
    const touristExpenseEtb = round2(spend.expense_etb);
    const touristExpectedSpend = round2(expected.expected_spend);
    const touristExpectedSpendEtb = round2(expected.expected_spend_etb);
    const touristExpectedIncome = round2(touristIncome - touristExpectedSpend);
    const profit = round2(touristIncome - touristExpense);
    const dateKey = toDateKey(tourist.effective_date) || toDateKey(start);

    income = round2(income + touristIncome);
    expense = round2(expense + touristExpense);
    expense_etb = round2(expense_etb + touristExpenseEtb);
    expected_spend = round2(expected_spend + touristExpectedSpend);
    expected_spend_etb = round2(expected_spend_etb + touristExpectedSpendEtb);
    expected_income = round2(expected_income + touristExpectedIncome);

    if (!dayMap[dateKey]) {
      dayMap[dateKey] = {
        date: dateKey,
        income: 0,
        expense: 0,
        expected_spend: 0,
        expected_income: 0,
        net: 0,
      };
    }
    dayMap[dateKey].income = round2(dayMap[dateKey].income + touristIncome);
    dayMap[dateKey].expense = round2(dayMap[dateKey].expense + touristExpense);
    dayMap[dateKey].expected_spend = round2(
      dayMap[dateKey].expected_spend + touristExpectedSpend
    );
    dayMap[dateKey].expected_income = round2(
      dayMap[dateKey].expected_income + touristExpectedIncome
    );
    dayMap[dateKey].net = round2(dayMap[dateKey].income - dayMap[dateKey].expense);

    return {
      tourist_id: tourist.id,
      name: tourist.name,
      come_date: tourist.come_date || tourist.created_at,
      income: touristIncome,
      expected_spend: touristExpectedSpend,
      expected_spend_etb: touristExpectedSpendEtb,
      expected_income: touristExpectedIncome,
      expense: touristExpense,
      expense_etb: touristExpenseEtb,
      profit,
    };
  });

  const by_day = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    period,
    period_label,
    income,
    expense,
    expense_etb,
    expected_spend,
    expected_spend_etb,
    expected_income,
    net_profit: round2(income - expense),
    tourist_count: tourists.length,
    expense_by_reason,
    expense_etb_by_reason,
    by_tourist,
    by_day,
  };
}

module.exports = {
  getMonthlyAnalysis,
};
