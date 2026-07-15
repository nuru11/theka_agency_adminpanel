import { useEffect, useState } from 'react';
import PageLayout, { StatCard, formatCurrency } from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import TextArea from '../../components/form/input/TextArea';
import FileInput from '../../components/form/input/FileInput';
import { packageSpendingApi, packageApi, walletApi } from '../../services/thiqaApi';
import type { PackageSpending, TourPackage, SpendingReason, WalletSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';

const REASON_OPTIONS = [
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'park', label: 'Park' },
  { value: 'food', label: 'Food' },
  { value: 'other', label: 'Other' },
];

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
  const { user } = useAuth();
  const isAccountant = user?.role === 'accountant';

  const [items, setItems] = useState<PackageSpending[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formKey, setFormKey] = useState(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [spendingsRes, packagesRes] = await Promise.all([
      packageSpendingApi.list(),
      packageApi.list(),
    ]);
    setItems(spendingsRes.data.data);
    setPackages(packagesRes.data.data);

    if (isAccountant) {
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

  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const packageOptions = packages.map((p) => ({
    value: String(p.id),
    label: `#${p.id} — ${p.tourist?.name || 'Tourist'}`,
  }));

  const canSubmit =
    isAccountant &&
    !!form.package_id &&
    !!form.reason &&
    Number(form.amount) > 0 &&
    !!screenshot;

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
      setSuccess('Spending recorded and wallet updated.');
      setForm(emptyForm);
      setScreenshot(null);
      setFormKey((k) => k + 1);
      await load();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save spending.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const viewScreenshot = async (id: number) => {
    const res = await packageSpendingApi.screenshot(id);
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank');
  };

  return (
    <PageLayout
      title="Package Spending"
      description="Record package expenses with screenshot proof"
    >
      {isAccountant && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Wallet balance" value={formatCurrency(Number(wallet?.balance ?? 0))} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isAccountant && (
          <ComponentCard title="New spending">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-error-500">{error}</p>}
              {success && <p className="text-sm text-success-500">{success}</p>}
              <div>
                <Label>Package</Label>
                <Select
                  key={`pkg-${formKey}`}
                  options={packageOptions}
                  placeholder="Select package"
                  defaultValue={form.package_id}
                  onChange={(v) => setForm((prev) => ({ ...prev, package_id: v }))}
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0.01"
                  step={0.01}
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Select
                  key={`reason-${formKey}`}
                  options={REASON_OPTIONS}
                  placeholder="Select reason"
                  defaultValue={form.reason}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, reason: v as SpendingReason }))
                  }
                />
              </div>
              <div>
                <Label>Screenshot</Label>
                <FileInput
                  key={`file-${formKey}`}
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="mt-3 max-h-48 rounded-lg border border-gray-200 object-contain dark:border-gray-700"
                  />
                )}
              </div>
              <div>
                <Label>Notes</Label>
                <TextArea
                  value={form.notes}
                  onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
                  rows={3}
                />
              </div>
              <Button type="submit" size="sm" disabled={!canSubmit || saving}>
                {saving ? 'Saving...' : 'Save spending'}
              </Button>
            </form>
          </ComponentCard>
        )}

        <ComponentCard
          title="Spending history"
          className={isAccountant ? 'lg:col-span-2' : 'lg:col-span-3'}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Package', 'Tourist', 'Reason', 'Amount', 'By', 'Date', 'Screenshot'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                      No spending recorded yet
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        #{row.package_id}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.package?.tourist?.name || '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.reason}</td>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(Number(row.amount))}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.creator?.name || '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline" onClick={() => viewScreenshot(row.id)}>
                          View
                        </Button>
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
