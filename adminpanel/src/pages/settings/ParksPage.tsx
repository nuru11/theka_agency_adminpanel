import { useEffect, useState } from 'react';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { parkApi } from '../../services/thiqaApi';
import type { Park } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';

export default function ParksPage() {
  const [items, setItems] = useState<Park[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', commission_amount: '', commission_rate: '', location: '' });

  const load = () => parkApi.list().then((res) => setItems(res.data.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await parkApi.create({
      name: form.name,
      commission_amount: Number(form.commission_amount),
      commission_rate: form.commission_rate ? Number(form.commission_rate) : undefined,
      location: form.location || undefined,
    });
    setOpen(false);
    load();
  };

  return (
    <PageLayout title="Parks" description="Partner parks and commissions" action={<Button size="sm" onClick={() => setOpen(true)}>Add Park</Button>}>
      <DataTable
        headers={['Name', 'Commission', 'Rate %', 'Location', 'Status']}
        rows={items.map((p) => [p.name, `$${p.commission_amount}`, p.commission_rate || '-', p.location || '-', p.status])}
      />
      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">Add Park</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Commission Amount</Label><Input type="number" value={form.commission_amount} onChange={(e) => setForm({ ...form, commission_amount: e.target.value })} /></div>
          <div><Label>Commission Rate %</Label><Input type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} /></div>
          <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
