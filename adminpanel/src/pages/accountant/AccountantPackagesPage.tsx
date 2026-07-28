import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { packageApi } from '../../services/thiqaApi';
import type { TourPackage } from '../../types';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

export default function AccountantPackagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<TourPackage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await packageApi.list();
        if (!cancelled) setItems(res.data.data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, t, 'accountantPackages.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const activePackages = useMemo(
    () => items.filter((pkg) => pkg.status !== 'done' && pkg.status !== 'settled'),
    [items]
  );

  return (
    <PageLayout
      title={t('accountantPackages.title')}
      description={t('accountantPackages.description')}
    >
      {error && <p className="mb-4 text-sm text-error-500">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">{t('common.loading')}</p>
      ) : (
        <DataTable
          headers={[
            t('common.tourist'),
            t('accountantPackages.amountReceived'),
            t('accountantPackages.expectedSpend'),
            t('accountantPackages.actualSpend'),
            t('accountantPackages.remainingSpend'),
            t('common.status'),
            t('common.actions'),
          ]}
          rows={activePackages.map((pkg) => {
            const expected = Number(pkg.expected_cost || 0);
            const actual = Number(pkg.actual_spend || 0);
            const remaining = Math.round((expected - actual) * 100) / 100;
            return [
              pkg.tourist?.name || `#${pkg.tourist_id}`,
              formatCurrency(Number(pkg.tourist?.amount_received || 0)),
              formatCurrency(expected, 'ETB'),
              formatCurrency(actual, 'ETB'),
              formatCurrency(remaining, 'ETB'),
              pkg.status,
              <Button
                key={pkg.id}
                size="sm"
                variant="outline"
                onClick={() => navigate(`/accountant-packages/${pkg.id}`)}
              >
                {t('common.view')}
              </Button>,
            ];
          })}
        />
      )}
    </PageLayout>
  );
}
