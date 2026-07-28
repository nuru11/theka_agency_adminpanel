import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import { packageApi } from '../../services/thiqaApi';
import type { TourPackage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

export default function PackageHistoryPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const isEmployee = hasRole('employee');
  const [items, setItems] = useState<TourPackage[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    packageApi
      .list()
      .then((res) => setItems(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err, t)));
  }, [t]);

  const historyPackages = useMemo(
    () => items.filter((pkg) => pkg.status === 'settled' || pkg.status === 'done'),
    [items]
  );

  return (
    <PageLayout title={t('packages.historyTitle')} description={t('packages.historyDescription')}>
      {error ? <p className="mb-4 text-sm text-error-500">{error}</p> : null}

      <DataTable
        headers={[
          t('common.tourist'),
          t('packages.people'),
          t('packages.days'),
          t('packages.expectedCost'),
          ...(isEmployee
            ? []
            : [t('packages.actualSpend'), t('packages.amountReceived')]),
          t('common.status'),
          t('packages.createdBy'),
        ]}
        rows={historyPackages.map((pkg) => [
          pkg.tourist?.name || `#${pkg.tourist_id}`,
          String(pkg.people_count),
          String(pkg.days_count),
          formatCurrency(Number(pkg.expected_cost), 'ETB'),
          ...(isEmployee
            ? []
            : [
                formatCurrency(Number(pkg.actual_spend || 0), 'ETB'),
                formatCurrency(Number(pkg.tourist?.amount_received || 0)),
              ]),
          pkg.status,
          pkg.creator?.name || t('common.emDash'),
        ])}
      />
    </PageLayout>
  );
}
