import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { touristApi } from '../../services/thiqaApi';
import type { Tourist } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';

export default function TouristsPage() {
  const [items, setItems] = useState<Tourist[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', nationality: '', group_size: '1',
    arrival_date: '', departure_date: '', notes: '',
  });

  const load = () => touristApi.list().then((res) => setItems(res.data.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await touristApi.create({
      ...form,
      group_size: Number(form.group_size),
      arrival_date: form.arrival_date || undefined,
      departure_date: form.departure_date || undefined,
    });
    setOpen(false);
    load();
  };

  return (
    <PageLayout title="Tourists" description="Receive and manage tourists" action={<Button size="sm" onClick={() => setOpen(true)}>Add Tourist</Button>}>
      <DataTable
        headers={['Name', 'Nationality', 'Group', 'Arrival', 'Packages', 'Actions']}
        rows={items.map((t) => [
          t.name,
          t.nationality || '-',
          t.group_size,
          t.arrival_date || '-',
          t.packages?.length || 0,
          <Link key={t.id} to={`/tourists/${t.id}`} className="text-brand-500 hover:underline">View</Link>,
        ])}
      />
      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">Add Tourist</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Nationality</Label><Input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></div>
          <div><Label>Group Size</Label><Input type="number" value={form.group_size} onChange={(e) => setForm({ ...form, group_size: e.target.value })} /></div>
          <div><Label>Arrival Date</Label><Input type="date" value={form.arrival_date} onChange={(e) => setForm({ ...form, arrival_date: e.target.value })} /></div>
          <div><Label>Departure Date</Label><Input type="date" value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} /></div>
          <div><Label>Notes</Label><TextArea value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} rows={3} /></div>
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
