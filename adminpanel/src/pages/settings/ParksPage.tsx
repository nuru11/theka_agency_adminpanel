import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

export default function ParksPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Park[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ParkForm>(emptyForm);

  const statusOptions = useMemo(
    () => [
      { value: 'active', label: t('common.active') },
      { value: 'inactive', label: t('common.inactive') },
    ],
    [t]
  );

  const statusLabel = (status: string) =>
    status === 'active' ? t('common.active') : status === 'inactive' ? t('common.inactive') : status;

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
      title={t('parks.title')}
      description={t('parks.description')}
      action={
        <Button size="sm" onClick={openCreate}>
          {t('parks.add')}
        </Button>
      }
    >
      <DataTable
        headers={[
          t('common.name'),
          t('common.city'),
          t('common.price'),
          t('common.status'),
          t('common.actions'),
        ]}
        rows={items.map((p) => [
          p.name,
          p.city,
          formatCurrency(Number(p.price)),
          statusLabel(p.status),
          <Button key={p.id} size="sm" variant="outline" onClick={() => openEdit(p)}>
            {t('common.edit')}
          </Button>,
        ])}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? t('parks.edit') : t('parks.add')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('common.name')}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
