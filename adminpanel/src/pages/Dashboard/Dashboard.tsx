import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageLayout, {
  StatCard,
  currentMonth,
  formatCurrency,
} from '../../components/common/PageLayout';
import { useAuth } from '../../context/AuthContext';
import {
  touristApi,
  packageApi,
  handoffApi,
  fundReturnApi,
  reportsApi,
} from '../../services/thiqaApi';
import type { MonthlyAnalysis, UserRole } from '../../types';

type DashboardCounts = {
  activeTourists: number | null;
  openPackages: number | null;
  pendingHandoffs: number | null;
  pendingFundReturns: number | null;
};

const EMPTY_COUNTS: DashboardCounts = {
  activeTourists: null,
  openPackages: null,
  pendingHandoffs: null,
  pendingFundReturns: null,
};

function canFetchTourists(role: UserRole) {
  return role === 'superAdmin' || role === 'officeAdmin' || role === 'employee';
}

function canFetchHandoffs(role: UserRole) {
  return role === 'superAdmin' || role === 'officeAdmin' || role === 'accountant';
}

function canFetchFundReturns(role: UserRole) {
  return role === 'superAdmin' || role === 'accountant';
}

function canFetchMonthly(role: UserRole) {
  return role === 'superAdmin';
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, hasRole } = useAuth();
  const role = user?.role;

  const [counts, setCounts] = useState<DashboardCounts>(EMPTY_COUNTS);
  const [monthly, setMonthly] = useState<MonthlyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!role) return;

    setLoading(true);
    setError('');

    const tasks: Promise<void>[] = [];

    tasks.push(
      packageApi
        .list()
        .then((res) => {
          const open = res.data.data.filter((p) => p.status !== 'settled' && p.status !== 'done');
          setCounts((prev) => ({ ...prev, openPackages: open.length }));
        })
        .catch(() => {
          setCounts((prev) => ({ ...prev, openPackages: null }));
          throw new Error('packages');
        })
    );

    if (canFetchTourists(role)) {
      tasks.push(
        touristApi
          .list()
          .then((res) => {
            const active = res.data.data.filter(
              (tour) => tour.status === 'expected' || tour.status === 'received'
            );
            setCounts((prev) => ({ ...prev, activeTourists: active.length }));
          })
          .catch(() => {
            setCounts((prev) => ({ ...prev, activeTourists: null }));
            throw new Error('tourists');
          })
      );
    }

    if (canFetchHandoffs(role)) {
      tasks.push(
        handoffApi
          .list()
          .then((res) => {
            const pending = res.data.data.filter((h) => h.status === 'pending');
            setCounts((prev) => ({ ...prev, pendingHandoffs: pending.length }));
          })
          .catch(() => {
            setCounts((prev) => ({ ...prev, pendingHandoffs: null }));
            throw new Error('handoffs');
          })
      );
    }

    if (canFetchFundReturns(role)) {
      tasks.push(
        fundReturnApi
          .list()
          .then((res) => {
            const pending = res.data.data.filter((r) => r.status === 'pending');
            setCounts((prev) => ({ ...prev, pendingFundReturns: pending.length }));
          })
          .catch(() => {
            setCounts((prev) => ({ ...prev, pendingFundReturns: null }));
            throw new Error('fundReturns');
          })
      );
    }

    if (canFetchMonthly(role)) {
      tasks.push(
        reportsApi
          .monthly(currentMonth())
          .then((res) => setMonthly(res.data.data))
          .catch(() => {
            setMonthly(null);
            throw new Error('monthly');
          })
      );
    }

    const results = await Promise.allSettled(tasks);
    if (results.some((r) => r.status === 'rejected')) {
      setError(t('dashboard.loadError'));
    }
    setLoading(false);
  }, [role, t]);

  useEffect(() => {
    setCounts(EMPTY_COUNTS);
    setMonthly(null);
    load();
  }, [load]);

  const showTourists = role ? canFetchTourists(role) : false;
  const showHandoffs = role ? canFetchHandoffs(role) : false;
  const showFundReturns = role ? canFetchFundReturns(role) : false;
  const showMonthly = role ? canFetchMonthly(role) : false;

  const isAccountantOnly = hasRole('accountant') && !hasRole('superAdmin');
  const packagesPath = isAccountantOnly ? '/accountant-packages' : '/packages';
  const moneyPath = isAccountantOnly ? '/received' : '/handoffs';
  const moneyLabel = isAccountantOnly ? t('nav.received') : t('nav.handoffs');

  return (
    <PageLayout title={t('dashboard.title')} description={t('dashboard.description')}>
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
      ) : (
        <>
          {error && <p className="mb-4 text-sm text-error-500">{error}</p>}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {showTourists && (
              <StatCard
                label={t('dashboard.activeTourists')}
                value={counts.activeTourists ?? '—'}
              />
            )}
            <StatCard
              label={t('dashboard.openPackages')}
              value={counts.openPackages ?? '—'}
            />
            {showHandoffs && (
              <StatCard
                label={t('dashboard.pendingHandoffs')}
                value={counts.pendingHandoffs ?? '—'}
                color="yellow"
              />
            )}
            {showFundReturns && (
              <StatCard
                label={t('dashboard.pendingFundReturns')}
                value={counts.pendingFundReturns ?? '—'}
                color="yellow"
              />
            )}
          </div>

          {showMonthly && (
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t('dashboard.thisMonth')}
                  {monthly?.period_label ? (
                    <span className="ms-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({monthly.period_label})
                    </span>
                  ) : null}
                </h2>
                <Link
                  to="/reports/monthly"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  {t('dashboard.viewMonthlyAnalysis')}
                </Link>
              </div>
              {monthly ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label={t('monthlyAnalysis.totalIncome')}
                    value={formatCurrency(monthly.income, 'USD')}
                  />
                  <StatCard
                    label={t('monthlyAnalysis.totalSpend')}
                    value={formatCurrency(monthly.expense, 'USD')}
                    color="yellow"
                  />
                  <StatCard
                    label={t('monthlyAnalysis.netProfit')}
                    value={formatCurrency(monthly.net_profit, 'USD')}
                    color={monthly.net_profit >= 0 ? 'green' : 'red'}
                  />
                  <StatCard
                    label={t('dashboard.monthTourists')}
                    value={monthly.tourist_count}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('monthlyAnalysis.noData')}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            {showTourists && (
              <Link
                to="/tourists"
                className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t('nav.tourists')}
              </Link>
            )}
            <Link
              to={packagesPath}
              className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isAccountantOnly ? t('nav.accountantPackages') : t('nav.packages')}
            </Link>
            {showHandoffs && (
              <Link
                to={moneyPath}
                className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {moneyLabel}
              </Link>
            )}
            {showFundReturns && (
              <Link
                to="/fund-returns"
                className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t('nav.fundReturns')}
              </Link>
            )}
            {showMonthly && (
              <Link
                to="/reports/monthly"
                className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t('nav.monthlyAnalysis')}
              </Link>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}
