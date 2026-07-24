import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, { StatCard, formatCurrency, formatDualAmount } from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { handoffApi, packageApi, accountantsApi, exchangeRateApi } from '../../services/thiqaApi';
import type { Accountant, ExchangeRate, Handoff, TourPackage } from '../../types';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import TextArea from '../../components/form/input/TextArea';
import { computeHandoffSummary } from '../../utils/computeHandoffSummary';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { useAuth } from '../../context/AuthContext';

type FormState = {
  package_id: string;
  accountant_id: string;
  amount: string;
  notes: string;
};

const emptyForm: FormState = {
  package_id: '',
  accountant_id: '',
  amount: '',
  notes: '',
};

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

export default function HandoffsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superAdmin';

  const [items, setItems] = useState<Handoff[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [rateInput, setRateInput] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rateError, setRateError] = useState('');
  const [rateSuccess, setRateSuccess] = useState('');

  const load = async () => {
    const [handoffsRes, packagesRes, accountantsRes, rateRes] = await Promise.all([
      handoffApi.list(),
      packageApi.list(),
      accountantsApi.list(),
      exchangeRateApi.get(),
    ]);
    setItems(handoffsRes.data.data);
    setPackages(packagesRes.data.data);
    setAccountants(accountantsRes.data.data);
    const current = rateRes.data.data;
    setRate(current);
    if (current) setRateInput(String(current.usd_to_etb));
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => computeHandoffSummary(items), [items]);
  const usdToEtb = rate ? Number(rate.usd_to_etb) : 0;
  const etbPreview =
    usdToEtb > 0 && Number(form.amount) > 0
      ? Math.round(Number(form.amount) * usdToEtb * 100) / 100
      : 0;

  const packageOptions = packages.map((p) => ({
    value: String(p.id),
    label: t('handoffs.packageOption', {
      id: p.id,
      name: p.tourist?.name || t('handoffs.touristFallback'),
      cost: formatCurrency(Number(p.expected_cost), 'ETB'),
    }),
  }));

  const accountantOptions = accountants.map((a) => ({
    value: String(a.id),
    label: a.name,
  }));

  const canSubmit =
    !!form.package_id && !!form.accountant_id && Number(form.amount) > 0 && !!rate;

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin || savingRate || Number(rateInput) <= 0) return;
    setSavingRate(true);
    setRateError('');
    setRateSuccess('');
    try {
      const res = await exchangeRateApi.set(Number(rateInput));
      setRate(res.data.data);
      setRateSuccess(t('handoffs.rateSaved'));
    } catch (err: unknown) {
      setRateError(getApiErrorMessage(err, t, 'handoffs.rateSaveError'));
    } finally {
      setSavingRate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await handoffApi.create({
        package_id: Number(form.package_id),
        accountant_id: Number(form.accountant_id),
        amount: Number(form.amount),
        notes: form.notes.trim() || null,
      });
      setSuccess(t('handoffs.success'));
      setForm(emptyForm);
      setFormKey((k) => k + 1);
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t, 'handoffs.error'));
    } finally {
      setSaving(false);
    }
  };

  const locale = i18n.language === 'ar' ? 'ar' : undefined;

  return (
    <PageLayout title={t('handoffs.title')} description={t('handoffs.description')}>
      {isSuperAdmin && (
        <div className="mb-6">
          <ComponentCard title={t('handoffs.setRate')}>
            <form onSubmit={handleSaveRate} className="flex flex-wrap items-end gap-4">
              <div className="min-w-[200px] flex-1">
                <Label>{t('handoffs.rateHint')}</Label>
                <Input
                  type="number"
                  min="0.0001"
                  step={0.0001}
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" disabled={savingRate || Number(rateInput) <= 0}>
                {savingRate ? t('common.saving') : t('handoffs.saveRate')}
              </Button>
              {rateError && <p className="w-full text-sm text-error-500">{rateError}</p>}
              {rateSuccess && <p className="w-full text-sm text-success-500">{rateSuccess}</p>}
            </form>
          </ComponentCard>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {rate
          ? t('handoffs.currentRate', { rate: Number(rate.usd_to_etb) })
          : t('handoffs.noRate')}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t('handoffs.totalSent')} value={formatCurrency(summary.total_sent, 'USD')} />
        <StatCard
          label={t('handoffs.pendingAcceptance')}
          value={formatCurrency(summary.total_pending, 'USD')}
          color="yellow"
        />
        <StatCard
          label={t('handoffs.received')}
          value={formatCurrency(summary.total_received, 'USD')}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComponentCard title={t('handoffs.newTransfer')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-error-500">{error}</p>}
            {success && <p className="text-sm text-success-500">{success}</p>}
            <div>
              <Label>{t('common.package')}</Label>
              <Select
                key={`package-${formKey}-${i18n.language}`}
                options={packageOptions}
                placeholder={t('handoffs.selectPackage')}
                defaultValue={form.package_id}
                onChange={(v) => setForm((prev) => ({ ...prev, package_id: v }))}
              />
            </div>
            <div>
              <Label>{t('handoffs.accountant')}</Label>
              <Select
                key={`accountant-${formKey}-${i18n.language}`}
                options={accountantOptions}
                placeholder={t('handoffs.selectAccountant')}
                defaultValue={form.accountant_id}
                onChange={(v) => setForm((prev) => ({ ...prev, accountant_id: v }))}
              />
            </div>
            <div>
              <Label>{t('handoffs.amountUsd')}</Label>
              <Input
                type="number"
                min="0.01"
                step={0.01}
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
              {etbPreview > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {t('handoffs.etbPreview', { amount: formatCurrency(etbPreview, 'ETB') })}
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
              {saving ? t('handoffs.sending') : t('handoffs.transfer')}
            </Button>
          </form>
        </ComponentCard>

        <ComponentCard title={t('handoffs.recentTransfers')} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[
                    t('common.package'),
                    t('common.tourist'),
                    t('handoffs.accountant'),
                    t('common.amount'),
                    t('common.status'),
                    t('handoffs.sentAt'),
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
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                      {t('handoffs.noTransfers')}
                    </td>
                  </tr>
                ) : (
                  items.map((h) => (
                    <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">#{h.package_id}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.package?.tourist?.name || t('common.emDash')}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.accountant?.name || t('common.emDash')}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                        {formatDualAmount(Number(h.amount), Number(h.amount_etb || 0))}
                      </td>
                      <td className="px-3 py-2">
                        <StatusLabel status={h.status} />
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.sent_at ? new Date(h.sent_at).toLocaleString(locale) : t('common.emDash')}
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
