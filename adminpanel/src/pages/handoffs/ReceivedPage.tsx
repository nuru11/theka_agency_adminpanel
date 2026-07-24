import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, { StatCard, formatCurrency, formatDualAmount } from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { handoffApi, walletApi } from '../../services/thiqaApi';
import type { Handoff, WalletSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { computeHandoffSummary } from '../../utils/computeHandoffSummary';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

function StatusLabel({ status }: { status: Handoff['status'] }) {
  const { t } = useTranslation();
  const isPending = status === 'pending';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isPending
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400'
          : 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400'
      }`}
    >
      {isPending ? t('common.pending') : t('common.received')}
    </span>
  );
}

export default function ReceivedPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<Handoff[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [receivingId, setReceivingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    const handoffsRes = await handoffApi.list();
    setItems(handoffsRes.data.data);

    if (user?.role === 'accountant') {
      try {
        const walletRes = await walletApi.get();
        setWallet(walletRes.data.data);
      } catch {
        setWallet(null);
      }
    } else {
      setWallet(null);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id, user?.role]);

  const summary = useMemo(() => computeHandoffSummary(items), [items]);
  const pending = items.filter((h) => h.status === 'pending');
  const received = items.filter((h) => h.status === 'received');
  const locale = i18n.language === 'ar' ? 'ar' : undefined;

  const handleReceive = async (id: number) => {
    if (receivingId) return;
    setReceivingId(id);
    setError('');
    try {
      await handoffApi.receive(id);
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t, 'receivedPage.error'));
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <PageLayout title={t('receivedPage.title')} description={t('receivedPage.description')}>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {user?.role === 'accountant' && (
          <>
            <StatCard
              label={t('receivedPage.walletUsd')}
              value={formatCurrency(Number(wallet?.balance_usd ?? wallet?.balance ?? 0), 'USD')}
            />
            <StatCard
              label={t('receivedPage.walletEtb')}
              value={formatCurrency(Number(wallet?.balance_etb ?? 0), 'ETB')}
            />
          </>
        )}
        <StatCard
          label={t('receivedPage.pendingAmount')}
          value={formatCurrency(summary.total_pending, 'USD')}
          color="yellow"
        />
        <StatCard
          label={t('receivedPage.receivedTotal')}
          value={formatCurrency(summary.total_received, 'USD')}
          color="green"
        />
      </div>

      {error && <p className="mb-4 text-sm text-error-500">{error}</p>}

      <div className="mb-6">
        <ComponentCard title={t('receivedPage.awaitingConfirmation')}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[
                    t('common.package'),
                    t('common.tourist'),
                    t('common.amount'),
                    t('receivedPage.from'),
                    t('receivedPage.sentAt'),
                    t('receivedPage.action'),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-start font-medium text-gray-600 dark:text-gray-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                      {t('receivedPage.noPending')}
                    </td>
                  </tr>
                ) : (
                  pending.map((h) => (
                    <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">#{h.package_id}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.package?.tourist?.name || t('common.emDash')}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                        {formatDualAmount(Number(h.amount), Number(h.amount_etb || 0))}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.officeAdmin?.name || t('common.emDash')}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.sent_at ? new Date(h.sent_at).toLocaleString(locale) : t('common.emDash')}
                      </td>
                      <td className="px-3 py-2">
                        {user?.role === 'accountant' ? (
                          <Button
                            size="sm"
                            disabled={receivingId === h.id}
                            onClick={() => handleReceive(h.id)}
                          >
                            {receivingId === h.id
                              ? t('receivedPage.accepting')
                              : t('receivedPage.iReceived')}
                          </Button>
                        ) : (
                          t('common.emDash')
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>

      <ComponentCard title={t('receivedPage.receivedHistory')}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {[
                  t('common.package'),
                  t('common.tourist'),
                  t('common.amount'),
                  t('receivedPage.from'),
                  t('common.status'),
                  t('receivedPage.receivedAt'),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-start font-medium text-gray-600 dark:text-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {received.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                    {t('receivedPage.noReceived')}
                  </td>
                </tr>
              ) : (
                received.map((h) => (
                  <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">#{h.package_id}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {h.package?.tourist?.name || t('common.emDash')}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                      {formatDualAmount(Number(h.amount), Number(h.amount_etb || 0))}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {h.officeAdmin?.name || t('common.emDash')}
                    </td>
                    <td className="px-3 py-2">
                      <StatusLabel status={h.status} />
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {h.received_at
                        ? new Date(h.received_at).toLocaleString(locale)
                        : t('common.emDash')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </PageLayout>
  );
}
