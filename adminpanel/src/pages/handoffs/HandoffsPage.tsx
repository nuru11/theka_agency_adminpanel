import { useEffect, useMemo, useState } from 'react';
import PageLayout, { StatCard, formatCurrency } from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { handoffApi, packageApi, accountantsApi } from '../../services/thiqaApi';
import type { Accountant, Handoff, TourPackage } from '../../types';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import TextArea from '../../components/form/input/TextArea';
import { computeHandoffSummary } from '../../utils/computeHandoffSummary';

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

export default function HandoffsPage() {
  const [items, setItems] = useState<Handoff[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [handoffsRes, packagesRes, accountantsRes] = await Promise.all([
      handoffApi.list(),
      packageApi.list(),
      accountantsApi.list(),
    ]);
    setItems(handoffsRes.data.data);
    setPackages(packagesRes.data.data);
    setAccountants(accountantsRes.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => computeHandoffSummary(items), [items]);

  const packageOptions = packages.map((p) => ({
    value: String(p.id),
    label: `#${p.id} — ${p.tourist?.name || 'Tourist'} (expected ${formatCurrency(Number(p.expected_cost))})`,
  }));

  const accountantOptions = accountants.map((a) => ({
    value: String(a.id),
    label: a.name,
  }));

  const canSubmit =
    !!form.package_id && !!form.accountant_id && Number(form.amount) > 0;

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
      setSuccess('Transfer sent successfully.');
      setForm(emptyForm);
      setFormKey((k) => k + 1);
      await load();
    } catch {
      setError('Failed to send transfer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title="Send to Accountant"
      description="Transfer package money to the accountant wallet"
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total sent" value={formatCurrency(summary.total_sent)} />
        <StatCard label="Pending acceptance" value={formatCurrency(summary.total_pending)} color="yellow" />
        <StatCard label="Received" value={formatCurrency(summary.total_received)} color="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComponentCard title="New transfer">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-error-500">{error}</p>}
            {success && <p className="text-sm text-success-500">{success}</p>}
            <div>
              <Label>Package</Label>
              <Select
                key={`package-${formKey}`}
                options={packageOptions}
                placeholder="Select package"
                defaultValue={form.package_id}
                onChange={(v) => setForm((prev) => ({ ...prev, package_id: v }))}
              />
            </div>
            <div>
              <Label>Accountant</Label>
              <Select
                key={`accountant-${formKey}`}
                options={accountantOptions}
                placeholder="Select accountant"
                defaultValue={form.accountant_id}
                onChange={(v) => setForm((prev) => ({ ...prev, accountant_id: v }))}
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
              <Label>Notes</Label>
              <TextArea
                value={form.notes}
                onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
                rows={3}
              />
            </div>
            <Button type="submit" size="sm" disabled={!canSubmit || saving}>
              {saving ? 'Sending...' : 'Transfer'}
            </Button>
          </form>
        </ComponentCard>

        <ComponentCard title="Recent transfers" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Package', 'Tourist', 'Accountant', 'Amount', 'Status', 'Sent At'].map((h) => (
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
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                      No transfers yet
                    </td>
                  </tr>
                ) : (
                  items.map((h) => (
                    <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">#{h.package_id}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.package?.tourist?.name || '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.accountant?.name || '—'}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(Number(h.amount))}
                      </td>
                      <td className="px-3 py-2">
                        <StatusLabel status={h.status} />
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {h.sent_at ? new Date(h.sent_at).toLocaleString() : '—'}
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
