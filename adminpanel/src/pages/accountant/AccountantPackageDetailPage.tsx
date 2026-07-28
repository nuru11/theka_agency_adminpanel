import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageLayout, { DataTable, StatCard, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { useAuth } from '../../context/AuthContext';
import { packageApi, packageSpendingApi } from '../../services/thiqaApi';
import type { TourPackage } from '../../types';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

export default function AccountantPackageDetailPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const packageId = Number(id);
  const locale = i18n.language === 'ar' ? 'ar' : 'en-US';
  const isSuperAdmin = user?.role === 'superAdmin';

  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reasonLabel = useMemo(() => {
    const map: Record<string, string> = {
      accommodation: t('spending.reasonAccommodation'),
      park: t('spending.reasonPark'),
      food: t('spending.reasonFood'),
      other: t('spending.reasonOther'),
    };
    return (reason: string) => map[reason] || reason;
  }, [t]);

  useEffect(() => {
    if (!packageId) {
      setError(t('accountantPackages.loadError'));
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await packageApi.get(packageId);
        if (!cancelled) setPkg(res.data.data);
      } catch (err) {
        if (!cancelled) {
          setPkg(null);
          setError(getApiErrorMessage(err, t, 'accountantPackages.loadError'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [packageId, t]);

  const viewScreenshot = async (spendingId: number) => {
    const res = await packageSpendingApi.screenshot(spendingId);
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank');
  };

  const expected = Number(pkg?.expected_cost || 0);
  const actual = Number(pkg?.actual_spend || 0);
  const remaining = Math.round((expected - actual) * 100) / 100;
  const spendings = pkg?.spendings || [];

  return (
    <PageLayout
      title={
        pkg
          ? t('accountantPackages.detailTitle', {
              name: pkg.tourist?.name || `#${pkg.tourist_id}`,
            })
          : t('accountantPackages.detailFallbackTitle')
      }
      description={t('accountantPackages.detailDescription')}
      action={
        <Link to="/accountant-packages">
          <Button size="sm" variant="outline">
            {t('accountantPackages.back')}
          </Button>
        </Link>
      }
    >
      {error && <p className="mb-4 text-sm text-error-500">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">{t('common.loading')}</p>
      ) : pkg ? (
        <>
          <div
            className={`mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 ${
              isSuperAdmin ? 'xl:grid-cols-6' : 'xl:grid-cols-5'
            }`}
          >
            <StatCard
              label={t('accountantPackages.amountReceived')}
              value={formatCurrency(Number(pkg.tourist?.amount_received || 0))}
            />
            <StatCard
              label={t('accountantPackages.expectedSpend')}
              value={formatCurrency(expected, 'ETB')}
            />
            <StatCard
              label={t('accountantPackages.actualSpend')}
              value={formatCurrency(actual, 'ETB')}
            />
            <StatCard
              label={t('accountantPackages.remainingSpend')}
              value={formatCurrency(remaining, 'ETB')}
            />
            {isSuperAdmin && (
              <StatCard
                label={t('accountantPackages.netProfit')}
                value={formatCurrency(Number(pkg.net_profit || 0))}
              />
            )}
            <StatCard label={t('common.status')} value={pkg.status} />
          </div>

          <DataTable
            headers={[
              t('spending.reason'),
              t('spending.amountEtb'),
              t('spending.by'),
              t('spending.date'),
              t('spending.screenshot'),
            ]}
            emptyMessage={t('accountantPackages.noSpendings')}
            rows={spendings.map((row) => [
              reasonLabel(row.reason),
              formatCurrency(Number(row.amount), 'ETB'),
              row.creator?.name || t('common.emDash'),
              row.created_at
                ? new Date(row.created_at).toLocaleString(locale)
                : t('common.emDash'),
              row.screenshot_path ? (
                <Button
                  key={row.id}
                  size="sm"
                  variant="outline"
                  onClick={() => viewScreenshot(row.id)}
                >
                  {t('common.view')}
                </Button>
              ) : (
                t('common.emDash')
              ),
            ])}
          />
        </>
      ) : null}
    </PageLayout>
  );
}
