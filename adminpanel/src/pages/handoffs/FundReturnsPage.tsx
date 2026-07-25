import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, { StatCard, formatCurrency, formatDualAmount } from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import TextArea from '../../components/form/input/TextArea';
import { fundReturnApi, packageApi, walletApi, exchangeRateApi } from '../../services/thiqaApi';
import type { FundReturn, TourPackage, WalletSummary, ExchangeRate } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

type FormState = {
  package_id: string;
  amount_usd: string;
  notes: string;
};

const emptyForm: FormState = {
  package_id: '',
  amount_usd: '',
  notes: '',
};

function StatusLabel({ status }: { status: FundReturn['status'] }) {
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

export default function FundReturnsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAccountant = user?.role === 'accountant';
  const isSuperAdmin = user?.role === 'superAdmin';

  const [items, setItems] = useState<FundReturn[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [receivingId, setReceivingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [returnsRes, packagesRes] = await Promise.all([
      fundReturnApi.list(),
      packageApi.list(),
    ]);
    setItems(returnsRes.data.data);
    setPackages(packagesRes.data.data);

    if (isAccountant) {
      try {
        const [walletRes, rateRes] = await Promise.all([
          walletApi.get(),
          exchangeRateApi.get(),
        ]);
        setWallet(walletRes.data.data);
        setRate(rateRes.data.data);
      } catch {
        setWallet(null);
        setRate(null);
      }
    }
  };

  useEffect(() => {
    load();
  }, [user?.id, user?.role]);

  const pending = items.filter((r) => r.status === 'pending');
  const history = items.filter((r) => r.status === 'received');
  const locale = i18n.language === 'ar' ? 'ar' : undefined;

  const usdToEtb = rate ? Number(rate.usd_to_etb) : 0;
  const etbPreview =
    usdToEtb > 0 && Number(form.amount_usd) > 0
      ? Math.round(Number(form.amount_usd) * usdToEtb * 100) / 100
      : 0;

  const packageOptions = useMemo(
    () =>
      packages.map((p) => ({
        value: String(p.id),
        label: `#${p.id} — ${p.tourist?.name || t('common.tourist')}`,
      })),
    [packages, t]
  );

  const canSubmit = isAccountant && Number(form.amount_usd) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await fundReturnApi.create({
        amount_usd: Number(form.amount_usd),
        package_id: form.package_id ? Number(form.package_id) : null,
        notes: form.notes.trim() || null,
      });
      setSuccess(t('fundReturns.success'));
      setForm(emptyForm);
      setFormKey((k) => k + 1);
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t, 'fundReturns.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleReceive = async (id: number) => {
    if (!isSuperAdmin || receivingId) return;
    setReceivingId(id);
    setError('');
    setSuccess('');
    try {
      await fundReturnApi.receive(id);
      setSuccess(t('fundReturns.receiveSuccess'));
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t, 'fundReturns.error'));
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <PageLayout title={t('fundReturns.title')} description={t('fundReturns.description')}>
      {isAccountant && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label={t('fundReturns.walletUsd')}
            value={formatCurrency(Number(wallet?.balance_usd ?? wallet?.balance ?? 0), 'USD')}
          />
        </div>
      )}

      {error && <p className="mb-4 text-sm text-error-500">{error}</p>}
      {success && <p className="mb-4 text-sm text-success-500">{success}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isAccountant && (
          <ComponentCard title={t('fundReturns.newReturn')}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('fundReturns.selectPackageOptional')}</Label>
                <Select
                  key={`pkg-${formKey}-${i18n.language}`}
                  options={packageOptions}
                  placeholder={t('fundReturns.selectPackageOptional')}
                  defaultValue={form.package_id}
                  onChange={(v) => setForm((prev) => ({ ...prev, package_id: v }))}
                />
              </div>
              <div>
                <Label>{t('fundReturns.amountUsd')}</Label>
                <Input
                  type="number"
                  min="0.01"
                  step={0.01}
                  value={form.amount_usd}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount_usd: e.target.value }))}
                />
                {etbPreview > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {t('fundReturns.etbPreview', {
                      amount: formatCurrency(etbPreview, 'ETB'),
                    })}
                  </p>
                )}
              </div>
              <div>
                <Label>{t('common.notes')}</Label>
                <TextArea
                  value={form.notes}
                  onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
                  rows={3}
                />
              </div>
              <Button type="submit" size="sm" disabled={!canSubmit || saving}>
                {saving ? t('common.saving') : t('fundReturns.createReturn')}
              </Button>
            </form>
          </ComponentCard>
        )}

        <ComponentCard
          title={t('fundReturns.pending')}
          className={isAccountant ? 'lg:col-span-2' : 'lg:col-span-3'}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[
                    t('common.package'),
                    t('common.tourist'),
                    t('common.amount'),
                    isSuperAdmin ? t('handoffs.accountant') : t('fundReturns.amountUsd'),
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
                      {t('fundReturns.noPending')}
                    </td>
                  </tr>
                ) : (
                  pending.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.package_id ? `#${row.package_id}` : t('common.emDash')}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.package?.tourist?.name || t('common.emDash')}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                        {formatDualAmount(Number(row.amount_usd), Number(row.amount_etb))}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {isSuperAdmin
                          ? row.accountant?.name || t('common.emDash')
                          : formatCurrency(Number(row.amount_usd), 'USD')}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.sent_at
                          ? new Date(row.sent_at).toLocaleString(locale)
                          : t('common.emDash')}
                      </td>
                      <td className="px-3 py-2">
                        {isSuperAdmin ? (
                          <Button
                            size="sm"
                            disabled={receivingId === row.id}
                            onClick={() => handleReceive(row.id)}
                          >
                            {receivingId === row.id
                              ? t('fundReturns.receiving')
                              : t('fundReturns.iReceived')}
                          </Button>
                        ) : (
                          <StatusLabel status={row.status} />
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

      <div className="mt-6">
        <ComponentCard title={t('fundReturns.history')}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[
                    t('common.package'),
                    t('common.amount'),
                    t('handoffs.accountant'),
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
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                      {t('fundReturns.noHistory')}
                    </td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.package_id ? `#${row.package_id}` : t('common.emDash')}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                        {formatDualAmount(Number(row.amount_usd), Number(row.amount_etb))}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.accountant?.name || t('common.emDash')}
                      </td>
                      <td className="px-3 py-2">
                        <StatusLabel status={row.status} />
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.received_at
                          ? new Date(row.received_at).toLocaleString(locale)
                          : t('common.emDash')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </PageLayout>
  );
}
