import { useEffect, useState } from 'react';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { packageSpendingApi, handoffApi } from '../../services/thiqaApi';
import type { PackageSpending, Handoff } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

export default function PackageSpendingPage() {
  const [spendings, setSpendings] = useState<PackageSpending[]>([]);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    package_id: '', handoff_id: '',
    accommodation_cost: '0', transport_cost: '0', activities_cost: '0',
    sim_cost: '0', park_commission: '0', other_cost: '0', notes: '',
  });

  const load = () => {
    packageSpendingApi.list().then((r) => setSpendings(r.data.data));
    handoffApi.list('received').then((r) => setHandoffs(r.data.data));
  };

  useEffect(() => { load(); }, []);

  const total = (s: PackageSpending) =>
    Number(s.accommodation_cost) + Number(s.transport_cost) + Number(s.activities_cost) +
    Number(s.sim_cost) + Number(s.park_commission) + Number(s.other_cost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await packageSpendingApi.create({
      package_id: Number(form.package_id),
      handoff_id: form.handoff_id ? Number(form.handoff_id) : undefined,
      accommodation_cost: Number(form.accommodation_cost),
      transport_cost: Number(form.transport_cost),
      activities_cost: Number(form.activities_cost),
      sim_cost: Number(form.sim_cost),
      park_commission: Number(form.park_commission),
      other_cost: Number(form.other_cost),
      notes: form.notes || undefined,
    });
    setOpen(false);
    load();
  };

  return (
    <PageLayout title="Package Spending" description="Record actual costs per package" action={<Button size="sm" onClick={() => setOpen(true)}>Add Spending</Button>}>
      <DataTable
        headers={['Package', 'Tourist', 'Total Cost', 'Notes']}
        rows={spendings.map((s) => [
          `#${s.package_id}`,
          s.package?.tourist?.name || '-',
          formatCurrency(total(s)),
          s.notes || '-',
        ])}
      />
      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-lg font-semibold">Record Package Spending</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Handoff / Package</Label>
            <Select options={handoffs.map(h => ({value:String(h.package_id), label:`Package #${h.package_id} - ${h.package?.tourist?.name}`}))} onChange={(v) => {
              const h = handoffs.find(x => String(x.package_id) === v);
              setForm({...form, package_id: v, handoff_id: h ? String(h.id) : ''});
            }} />
          </div>
          {['accommodation_cost','transport_cost','activities_cost','sim_cost','park_commission','other_cost'].map((field) => (
            <div key={field}><Label>{field.replace(/_/g,' ')}</Label><Input type="number" value={(form as Record<string,string>)[field]} onChange={(e) => setForm({...form, [field]: e.target.value})} /></div>
          ))}
          <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
