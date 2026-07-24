import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

export default function PropertiesPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PropertyForm>(emptyForm);

  const typeOptions = useMemo(
    () => [
      { value: 'hotel', label: t('properties.hotel') },
      { value: 'apartment', label: t('properties.apartment') },
      { value: 'villa', label: t('properties.villa') },
    ],
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { value: 'active', label: t('common.active') },
      { value: 'inactive', label: t('common.inactive') },
    ],
    [t]
  );

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      hotel: t('properties.hotel'),
      apartment: t('properties.apartment'),
      villa: t('properties.villa'),
    };
    return map[type] || type;
  };

  const statusLabel = (status: string) =>
    status === 'active' ? t('common.active') : status === 'inactive' ? t('common.inactive') : status;

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
      title={t('properties.title')}
      description={t('properties.description')}
      action={
        <Button size="sm" onClick={openCreate}>
          {t('properties.add')}
        </Button>
      }
    >
      <DataTable
        headers={[
          t('common.name'),
          t('common.type'),
          t('common.location'),
          t('common.city'),
          t('common.price'),
          t('common.commission'),
          t('common.status'),
          t('common.actions'),
        ]}
        rows={items.map((p) => [
          p.name,
          typeLabel(p.type),
          p.location || t('common.emDash'),
          p.city,
          formatCurrency(Number(p.price)),
          formatCurrency(Number(p.commission)),
          statusLabel(p.status),
          <Button key={p.id} size="sm" variant="outline" onClick={() => openEdit(p)}>
            {t('common.edit')}
          </Button>,
        ])}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? t('properties.edit') : t('properties.add')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('common.name')}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>{t('common.type')}</Label>
            <Select
              key={`type-${editingId ?? 'new'}-${open}-${i18n.language}`}
              options={typeOptions}
              defaultValue={form.type}
              onChange={(v) => setForm({ ...form, type: v as PropertyType })}
            />
          </div>
          <div>
            <Label>{t('common.location')}</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('common.city')}</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>{t('common.price')}</Label>
            <Input
              type="number"
              min="0"
              step={0.01}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('common.commission')}</Label>
            <Input
              type="number"
              min="0"
              step={0.01}
              value={form.commission}
              onChange={(e) => setForm({ ...form, commission: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('common.status')}</Label>
            <Select
              key={`status-${editingId ?? 'new'}-${open}-${i18n.language}`}
              options={statusOptions}
              defaultValue={form.status}
              onChange={(v) => setForm({ ...form, status: v as MasterStatus })}
            />
          </div>
          <Button type="submit" size="sm" disabled={!form.name.trim() || !form.city.trim()}>
            {t('common.save')}
          </Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
