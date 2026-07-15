import { useEffect, useState } from 'react';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { propertyApi } from '../../services/thiqaApi';
import type { MasterStatus, Property, PropertyType } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

type PropertyForm = {
  name: string;
  type: PropertyType;
  location: string;
  city: string;
  price: string;
  commission: string;
  status: MasterStatus;
};

const emptyForm: PropertyForm = {
  name: '',
  type: 'hotel',
  location: '',
  city: '',
  price: '0',
  commission: '0',
  status: 'active',
};

const TYPE_OPTIONS = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PropertyForm>(emptyForm);

  const load = () => propertyApi.list().then((res) => setItems(res.data.data));
  useEffect(() => {
    load();
  }, []);

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
      location: property.location || '',
      city: property.city,
      price: String(property.price ?? 0),
      commission: String(property.commission ?? 0),
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
      location: form.location.trim() || null,
      city: form.city.trim(),
      price: Number(form.price || 0),
      commission: Number(form.commission || 0),
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
    <PageLayout
      title="Accommodations"
      description="Hotels, apartments, and villas"
      action={
        <Button size="sm" onClick={openCreate}>
          Add Accommodation
        </Button>
      }
    >
      <DataTable
        headers={['Name', 'Type', 'Location', 'City', 'Price', 'Commission', 'Status', 'Actions']}
        rows={items.map((p) => [
          p.name,
          p.type,
          p.location || '—',
          p.city,
          formatCurrency(Number(p.price)),
          formatCurrency(Number(p.commission)),
          p.status,
          <Button key={p.id} size="sm" variant="outline" onClick={() => openEdit(p)}>
            Edit
          </Button>,
        ])}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? 'Edit Accommodation' : 'Add Accommodation'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              key={`type-${editingId ?? 'new'}-${open}`}
              options={TYPE_OPTIONS}
              defaultValue={form.type}
              onChange={(v) => setForm({ ...form, type: v as PropertyType })}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
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
            <Label>Commission</Label>
            <Input
              type="number"
              min="0"
              step={0.01}
              value={form.commission}
              onChange={(e) => setForm({ ...form, commission: e.target.value })}
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
