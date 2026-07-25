import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, { StatCard, formatCurrency } from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import TextArea from '../../components/form/input/TextArea';
import FileInput from '../../components/form/input/FileInput';
import { packageSpendingApi, packageApi, walletApi, exchangeRateApi } from '../../services/thiqaApi';
import type {
  PackageSpending,
  TourPackage,
  SpendingReason,
  WalletSummary,
  ExchangeRate,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

type FormState = {
  package_id: string;
  amount: string;
  reason: SpendingReason | '';
  notes: string;
};

const emptyForm: FormState = {
  package_id: '',
  amount: '',
  reason: '',
  notes: '',
};

export default function PackageSpendingPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAccountant = user?.role === 'accountant';
  const isSuperAdmin = user?.role === 'superAdmin';

  const [items, setItems] = useState<PackageSpending[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formKey, setFormKey] = useState(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [settlingId, setSettlingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reasonOptions = useMemo(
    () => [
      { value: 'accommodation', label: t('spending.reasonAccommodation') },
      { value: 'park', label: t('spending.reasonPark') },
      { value: 'food', label: t('spending.reasonFood') },
      { value: 'other', label: t('spending.reasonOther') },
    ],
    [t]
  );

  const reasonLabel = (reason: string) => {
    const map: Record<string, string> = {
      accommodation: t('spending.reasonAccommodation'),
      park: t('spending.reasonPark'),
      food: t('spending.reasonFood'),
      other: t('spending.reasonOther'),
    };
    return map[reason] || reason;
  };

  const load = async () => {
    const [spendingsRes, packagesRes] = await Promise.all([
      packageSpendingApi.list(),
      packageApi.list(),
    ]);
    setItems(spendingsRes.data.data);
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
    } else {
      setWallet(null);
      setRate(null);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const usdToEtb = rate ? Number(rate.usd_to_etb) : 0;
  const usdPreview =
    usdToEtb > 0 && Number(form.amount) > 0
      ? Math.round((Number(form.amount) / usdToEtb) * 100) / 100
      : 0;

  const packageOptions = packages.map((p) => ({
    value: String(p.id),
    label: t('spending.packageOption', {
      id: p.id,
      name: p.tourist?.name || t('spending.touristFallback'),
      expected: formatCurrency(Number(p.expected_cost), 'ETB'),
    }),
  }));

  const settleablePackages = packages.filter((p) => p.status === 'accountant_received');

  const canSubmit =
    isAccountant &&
    !!form.package_id &&
    !!form.reason &&
    Number(form.amount) > 0 &&
    !!screenshot;

  const locale = i18n.language === 'ar' ? 'ar' : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving || !screenshot) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('package_id', form.package_id);
      formData.append('amount', form.amount);
      formData.append('reason', form.reason);
      if (form.notes.trim()) formData.append('notes', form.notes.trim());
      formData.append('screenshot', screenshot);

      await packageSpendingApi.create(formData);
      setSuccess(t('spending.success'));
      setForm(emptyForm);
      setScreenshot(null);
      setFormKey((k) => k + 1);
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t, 'spending.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSettle = async (packageId: number, action: 'keep' | 'return') => {
    if (!isAccountant || settlingId) return;
    setSettlingId(packageId);
    setError('');
    setSuccess('');
    try {
      await packageApi.settle(packageId, { action });
      setSuccess(t('packages.settleSuccess'));
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t, 'packages.settleError'));
    } finally {
      setSettlingId(null);
    }
  };

  const viewScreenshot = async (id: number) => {
    const res = await packageSpendingApi.screenshot(id);
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank');
  };

  return (
    <PageLayout title={t('spending.title')} description={t('spending.description')}>
      {isAccountant && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label={t('spending.walletUsd')}
            value={formatCurrency(Number(wallet?.balance_usd ?? wallet?.balance ?? 0), 'USD')}
          />
          <StatCard
            label={t('spending.walletEtb')}
            value={formatCurrency(Number(wallet?.balance_etb ?? 0), 'ETB')}
          />
        </div>
      )}

      {error && <p className="mb-4 text-sm text-error-500">{error}</p>}
      {success && <p className="mb-4 text-sm text-success-500">{success}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isAccountant && (
          <div className="space-y-6">
            <ComponentCard title={t('spending.newSpending')}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>{t('common.package')}</Label>
                  <Select
                    key={`pkg-${formKey}-${i18n.language}`}
                    options={packageOptions}
                    placeholder={t('spending.selectPackage')}
                    defaultValue={form.package_id}
                    onChange={(v) => setForm((prev) => ({ ...prev, package_id: v }))}
                  />
                </div>
                <div>
                  <Label>{t('spending.amountEtb')}</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step={0.01}
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                  {usdPreview > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {t('spending.usdPreview', {
                        amount: formatCurrency(usdPreview, 'USD'),
                      })}
                    </p>
                  )}
                </div>
                <div>
                  <Label>{t('spending.reason')}</Label>
                  <Select
                    key={`reason-${formKey}-${i18n.language}`}
                    options={reasonOptions}
                    placeholder={t('spending.selectReason')}
                    defaultValue={form.reason}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, reason: v as SpendingReason }))
                    }
                  />
                </div>
                <div>
                  <Label>{t('spending.screenshot')}</Label>
                  <FileInput
                    key={`file-${formKey}`}
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt={t('spending.screenshotPreview')}
                      className="mt-3 max-h-48 rounded-lg border border-gray-200 object-contain dark:border-gray-700"
                    />
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
                  {saving ? t('common.saving') : t('spending.saveSpending')}
                </Button>
              </form>
            </ComponentCard>

            {settleablePackages.length > 0 && (
              <ComponentCard title={t('spending.settlePackage')}>
                <div className="space-y-3">
                  {settleablePackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        #{pkg.id} — {pkg.tourist?.name || t('spending.touristFallback')}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatCurrency(Number(pkg.expected_cost), 'ETB')} →{' '}
                        {formatCurrency(Number(pkg.actual_spend || 0), 'ETB')}
                      </p>
                      {Number(pkg.remaining_usd || 0) > 0 && (
                        <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                          {t('packages.remainingUsd', {
                            amount: formatCurrency(Number(pkg.remaining_usd), 'USD'),
                          })}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={settlingId === pkg.id}
                          onClick={() => handleSettle(pkg.id, 'keep')}
                        >
                          {t('packages.settleKeep')}
                        </Button>
                        <Button
                          size="sm"
                          disabled={settlingId === pkg.id || Number(pkg.remaining_usd || 0) <= 0}
                          onClick={() => handleSettle(pkg.id, 'return')}
                        >
                          {t('packages.settleReturn')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentCard>
            )}
          </div>
        )}

        <ComponentCard
          title={t('spending.spendingHistory')}
          className={isAccountant ? 'lg:col-span-2' : 'lg:col-span-3'}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[
                    t('common.package'),
                    t('common.tourist'),
                    t('spending.reason'),
                    t('spending.amountEtb'),
                    ...(isSuperAdmin
                      ? [t('packages.expectedCost'), t('packages.actualSpend')]
                      : []),
                    t('spending.by'),
                    t('spending.date'),
                    t('spending.screenshot'),
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
                    <td
                      colSpan={isSuperAdmin ? 9 : 7}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      {t('spending.noSpending')}
                    </td>
                  </tr>
                ) : (
                  items.map((row) => {
                    const pkg = packages.find((p) => p.id === row.package_id);
                    return (
                      <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          #{row.package_id}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {row.package?.tourist?.name || t('common.emDash')}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {reasonLabel(row.reason)}
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                          {formatCurrency(Number(row.amount), 'ETB')}
                        </td>
                        {isSuperAdmin && (
                          <>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {formatCurrency(
                                Number(pkg?.expected_cost ?? row.package?.expected_cost ?? 0),
                                'ETB'
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {formatCurrency(Number(pkg?.actual_spend ?? 0), 'ETB')}
                            </td>
                          </>
                        )}
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {row.creator?.name || t('common.emDash')}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleString(locale)
                            : t('common.emDash')}
                        </td>
                        <td className="px-3 py-2">
                          <Button size="sm" variant="outline" onClick={() => viewScreenshot(row.id)}>
                            {t('common.view')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </PageLayout>
  );
}
