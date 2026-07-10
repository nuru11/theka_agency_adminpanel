import { useEffect, useState } from 'react';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { propertyApi } from '../../services/thiqaApi';
import type { Property } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

const ACCOMMODATION_TYPES = ['hotel', 'apartment', 'villa'] as const;
const emptyForm = {
  name: '',
  type: 'hotel' as Property['type'],
  price_per_night: '',
  location: '',
  status: 'active' as Property['status'],
};

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => propertyApi.list().then((res) => setItems(res.data.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (property: Property) => {
    setEditingId(property.id);
    setForm({
      name: property.name,
      type: property.type,
      price_per_night: String(property.price_per_night),
      location: property.location || '',
      status: property.status,
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
      type: form.type,
      price_per_night: Number(form.price_per_night),
      location: form.location.trim() || undefined,
      status: form.status,
    };
    if (editingId) {
      await propertyApi.update(editingId, payload);
    } else {
      await propertyApi.create(payload);
    }
    closeModal();
    load();
  };

  return (
    <PageLayout title="Accommodations" description="Hotels, apartments, and villas" action={<Button size="sm" onClick={openCreate}>Add Accommodation</Button>}>
      <DataTable
        headers={['Name', 'Type', 'Default Price', 'Location', 'Status', 'Actions']}
        rows={items.map((p) => [
          p.name,
          p.type,
          `$${p.price_per_night}`,
          p.location || '-',
          p.status,
          <Button key={p.id} size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>,
        ])}
      />
      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit Accommodation' : 'Add Accommodation'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <Label>Type</Label>
            <Select
              options={ACCOMMODATION_TYPES.map((t) => ({ value: t, label: t }))}
              defaultValue={form.type}
              onChange={(v) => setForm({ ...form, type: v as Property['type'] })}
            />
          </div>
          <div><Label>Default Price</Label><Input required type="number" min="0" step="0.01" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: e.target.value })} /></div>
          <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          {editingId && (
            <div>
              <Label>Status</Label>
              <Select
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                defaultValue={form.status}
                onChange={(v) => setForm({ ...form, status: v as Property['status'] })}
              />
            </div>
          )}
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
