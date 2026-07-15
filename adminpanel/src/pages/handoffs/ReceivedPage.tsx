import { useEffect, useMemo, useState } from 'react';
import PageLayout, { StatCard, formatCurrency } from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { handoffApi, walletApi } from '../../services/thiqaApi';
import type { Handoff, WalletSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { computeHandoffSummary } from '../../utils/computeHandoffSummary';

function StatusLabel({ status }: { status: Handoff['status'] }) {
  const isPending = status === 'pending';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isPending
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400'
          : 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400'
      }`}
    >
      {isPending ? 'Pending' : 'Received'}
    </span>
  );
}

export default function ReceivedPage() {
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

  const handleReceive = async (id: number) => {
    if (receivingId) return;
    setReceivingId(id);
    setError('');
    try {
      await handoffApi.receive(id);
      await load();
    } catch {
      setError('Failed to confirm transfer. Please try again.');
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <PageLayout title="Received" description="Confirm money transfers and view wallet balance">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {user?.role === 'accountant' && (
          <StatCard label="Wallet balance" value={formatCurrency(Number(wallet?.balance ?? 0))} />
        )}
        <StatCard
          label="Pending amount"
          value={formatCurrency(summary.total_pending)}
          color="yellow"
        />
        <StatCard
          label="Received total"
          value={formatCurrency(summary.total_received)}
          color="green"
        />
      </div>

      {error && <p className="mb-4 text-sm text-error-500">{error}</p>}

      <div className="mb-6">
        <ComponentCard title="Awaiting confirmation">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Package', 'Tourist', 'Amount', 'From', 'Sent At', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
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
                      No pending transfers
                    </td>
                  </tr>
                ) : (
                  pending.map((h) => (
                    <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">#{h.package_id}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.package?.tourist?.name || '—'}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(Number(h.amount))}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.officeAdmin?.name || '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.sent_at ? new Date(h.sent_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {user?.role === 'accountant' ? (
                          <Button
                            size="sm"
                            disabled={receivingId === h.id}
                            onClick={() => handleReceive(h.id)}
                          >
                            {receivingId === h.id ? 'Accepting...' : 'I received'}
                          </Button>
                        ) : (
                          '—'
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

      <ComponentCard title="Received history">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {['Package', 'Tourist', 'Amount', 'From', 'Status', 'Received At'].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
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
                    No received transfers yet
                  </td>
                </tr>
              ) : (
                received.map((h) => (
                  <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">#{h.package_id}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {h.package?.tourist?.name || '—'}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(Number(h.amount))}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {h.officeAdmin?.name || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <StatusLabel status={h.status} />
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {h.received_at ? new Date(h.received_at).toLocaleString() : '—'}
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
