import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, {
  DataTable,
  StatCard,
  currentMonth,
  formatCurrency,
} from '../../components/common/PageLayout';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import { reportsApi } from '../../services/thiqaApi';
import type { BuiltinSpendingReason, MonthlyAnalysis } from '../../types';

const SPEND_REASONS: BuiltinSpendingReason[] = ['accommodation', 'park', 'food', 'other'];

function formatPeriodLabel(period: string, locale: string): string {
  const [yearStr, monthStr] = period.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return period;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleString(locale === 'ar' ? 'ar' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDisplayDate(value?: string | null, locale = 'en'): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function MonthlyAnalysisPage() {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState(currentMonth());
  const [analysis, setAnalysis] = useState<MonthlyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    reportsApi
      .monthly(period)
      .then((res) => setAnalysis(res.data.data))
      .catch(() => {
        setAnalysis(null);
        setError(t('monthlyAnalysis.loadError'));
      })
      .finally(() => setLoading(false));
  }, [period, t]);

  useEffect(() => {
    load();
  }, [load]);

  const reasonLabels = useMemo(
    () => ({
      accommodation: t('spending.reasonAccommodation'),
      park: t('spending.reasonPark'),
      food: t('spending.reasonFood'),
      other: t('spending.reasonOther'),
    }),
    [t]
  );

  const touristHeaders = useMemo(
    () => [
      t('common.name'),
      t('tourists.comeDate'),
      t('monthlyAnalysis.income'),
      t('monthlyAnalysis.expectedSpend'),
      t('monthlyAnalysis.expectedIncome'),
      t('monthlyAnalysis.spendUsd'),
      t('monthlyAnalysis.spendEtb'),
      t('monthlyAnalysis.profit'),
    ],
    [t]
  );

  const dayHeaders = useMemo(
    () => [
      t('spending.date'),
      t('monthlyAnalysis.income'),
      t('monthlyAnalysis.expectedSpend'),
      t('monthlyAnalysis.expectedIncome'),
      t('monthlyAnalysis.spendUsd'),
      t('monthlyAnalysis.dailyNet'),
    ],
    [t]
  );

  const touristRows = useMemo(() => {
    if (!analysis) return [];
    return analysis.by_tourist.map((row) => [
      row.name,
      formatDisplayDate(row.come_date, i18n.language),
      formatCurrency(row.income, 'USD'),
      formatCurrency(row.expected_spend, 'USD'),
      <span
        key={`expected-income-${row.tourist_id}`}
        className={
          row.expected_income >= 0
            ? 'text-success-600 dark:text-success-400'
            : 'text-error-600 dark:text-error-400'
        }
      >
        {formatCurrency(row.expected_income, 'USD')}
      </span>,
      formatCurrency(row.expense, 'USD'),
      formatCurrency(row.expense_etb, 'ETB'),
      <span
        key={`profit-${row.tourist_id}`}
        className={
          row.profit >= 0
            ? 'text-success-600 dark:text-success-400'
            : 'text-error-600 dark:text-error-400'
        }
      >
        {formatCurrency(row.profit, 'USD')}
      </span>,
    ]);
  }, [analysis, i18n.language]);

  const dayRows = useMemo(() => {
    if (!analysis) return [];
    return analysis.by_day.map((row) => [
      formatDisplayDate(row.date, i18n.language),
      formatCurrency(row.income, 'USD'),
      formatCurrency(row.expected_spend, 'USD'),
      <span
        key={`expected-income-${row.date}`}
        className={
          row.expected_income >= 0
            ? 'text-success-600 dark:text-success-400'
            : 'text-error-600 dark:text-error-400'
        }
      >
        {formatCurrency(row.expected_income, 'USD')}
      </span>,
      formatCurrency(row.expense, 'USD'),
      <span
        key={`net-${row.date}`}
        className={
          row.net >= 0
            ? 'text-success-600 dark:text-success-400'
            : 'text-error-600 dark:text-error-400'
        }
      >
        {formatCurrency(row.net, 'USD')}
      </span>,
    ]);
  }, [analysis, i18n.language]);

  return (
    <PageLayout
      title={t('monthlyAnalysis.title')}
      description={t('monthlyAnalysis.description')}
    >
      {error && <p className="mb-4 text-sm text-error-500">{error}</p>}

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <Label>{t('monthlyAnalysis.period')}</Label>
          <Input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-44"
          />
        </div>
        <p className="pb-2 text-sm text-gray-500 dark:text-gray-400">
          {analysis?.period_label || formatPeriodLabel(period, i18n.language)}
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
      ) : (
        analysis && (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard
                label={t('monthlyAnalysis.totalIncome')}
                value={formatCurrency(analysis.income, 'USD')}
              />
              <StatCard
                label={t('monthlyAnalysis.expectedSpend')}
                value={formatCurrency(analysis.expected_spend, 'USD')}
                color="yellow"
              />
              <StatCard
                label={t('monthlyAnalysis.expectedIncome')}
                value={formatCurrency(analysis.expected_income, 'USD')}
                color={analysis.expected_income >= 0 ? 'green' : 'red'}
              />
              <StatCard
                label={t('monthlyAnalysis.totalSpend')}
                value={formatCurrency(analysis.expense, 'USD')}
                color="yellow"
              />
              <StatCard
                label={t('monthlyAnalysis.netProfit')}
                value={formatCurrency(analysis.net_profit, 'USD')}
                color={analysis.net_profit >= 0 ? 'green' : 'red'}
              />
            </div>

            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {t('monthlyAnalysis.touristCount', { count: analysis.tourist_count })}
              {' · '}
              {t('monthlyAnalysis.spendEtbTotal', {
                amount: formatCurrency(analysis.expense_etb, 'ETB'),
              })}
              {' · '}
              {t('monthlyAnalysis.expectedSpendEtbTotal', {
                amount: formatCurrency(analysis.expected_spend_etb, 'ETB'),
              })}
            </p>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SPEND_REASONS.map((reason) => (
                <div key={reason}>
                  <StatCard
                    label={reasonLabels[reason]}
                    value={formatCurrency(analysis.expense_by_reason[reason] || 0, 'USD')}
                    color="yellow"
                  />
                  <p className="mt-1 px-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(analysis.expense_etb_by_reason[reason] || 0, 'ETB')}
                  </p>
                </div>
              ))}
            </div>

            <h2 className="mb-3 text-lg font-medium text-gray-800 dark:text-white">
              {t('monthlyAnalysis.byTourist')}
            </h2>
            <div className="mb-6">
              <DataTable
                headers={touristHeaders}
                rows={touristRows}
                emptyMessage={t('monthlyAnalysis.noTourists')}
              />
            </div>

            <h2 className="mb-3 text-lg font-medium text-gray-800 dark:text-white">
              {t('monthlyAnalysis.dailyBreakdown')}
            </h2>
            <DataTable
              headers={dayHeaders}
              rows={dayRows}
              emptyMessage={t('monthlyAnalysis.noData')}
            />
          </>
        )
      )}
    </PageLayout>
  );
}
