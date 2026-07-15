import { useEffect, useState } from 'react';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { parkApi } from '../../services/thiqaApi';
import type { MasterStatus, Park } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

type ParkForm = {
  name: string;
  city: string;
  price: string;
  status: MasterStatus;
};

const emptyForm: ParkForm = {
  name: '',
  city: '',
  price: '0',
  status: 'active',
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function ParksPage() {
  const [items, setItems] = useState<Park[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ParkForm>(emptyForm);

  const load = () => parkApi.list().then((res) => setItems(res.data.data));
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (park: Park) => {
    setEditingId(park.id);
    setForm({
      name: park.name,
      city: park.city,
      price: String(park.price ?? 0),
      status: park.status,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      price: Number(form.price || 0),
      status: form.status,
    };
    if (editingId) {
      await parkApi.update(editingId, payload);
    } else {
      await parkApi.create(payload);
    }
    closeModal();
    load();
  };

  return (
    <PageLayout
      title="Parks"
      description="Park catalog"
      action={
        <Button size="sm" onClick={openCreate}>
          Add Park
        </Button>
      }
    >
      <DataTable
        headers={['Name', 'City', 'Price', 'Status', 'Actions']}
        rows={items.map((p) => [
          p.name,
          p.city,
          formatCurrency(Number(p.price)),
          p.status,
          <Button key={p.id} size="sm" variant="outline" onClick={() => openEdit(p)}>
            Edit
          </Button>,
        ])}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit Park' : 'Add Park'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              min="0"
              step={0.01}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              key={`status-${editingId ?? 'new'}-${open}`}
              options={STATUS_OPTIONS}
              defaultValue={form.status}
              onChange={(v) => setForm({ ...form, status: v as MasterStatus })}
            />
          </div>
          <Button type="submit" size="sm" disabled={!form.name.trim() || !form.city.trim()}>
            Save
          </Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
