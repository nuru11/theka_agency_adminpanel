import { useEffect, useState } from 'react';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { activityApi } from '../../services/thiqaApi';
import type { Activity } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

const emptyForm = { name: '', default_price: '', status: 'active' as Activity['status'] };

export default function ActivitiesPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => activityApi.list().then((res) => setItems(res.data.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setForm({
      name: activity.name,
      default_price: String(activity.default_price),
      status: activity.status,
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
      default_price: Number(form.default_price),
      status: form.status,
    };
    if (editingId) {
      await activityApi.update(editingId, payload);
    } else {
      await activityApi.create(payload);
    }
    closeModal();
    load();
  };

  return (
    <PageLayout title="Activities" description="Activity catalog" action={<Button size="sm" onClick={openCreate}>Add Activity</Button>}>
      <DataTable
        headers={['Name', 'Default Price', 'Status', 'Actions']}
        rows={items.map((a) => [
          a.name,
          `$${a.default_price}`,
          a.status,
          <Button key={a.id} size="sm" variant="outline" onClick={() => openEdit(a)}>Edit</Button>,
        ])}
      />
      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit Activity' : 'Add Activity'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Default Price</Label><Input required type="number" min="0" step="0.01" value={form.default_price} onChange={(e) => setForm({ ...form, default_price: e.target.value })} /></div>
          {editingId && (
            <div>
              <Label>Status</Label>
              <Select
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                defaultValue={form.status}
                onChange={(v) => setForm({ ...form, status: v as Activity['status'] })}
              />
            </div>
          )}
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
