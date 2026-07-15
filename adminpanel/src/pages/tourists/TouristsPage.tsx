import { useEffect, useState } from 'react';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { touristApi } from '../../services/thiqaApi';
import type { Tourist, TouristStatus } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import DatePicker from '../../components/form/date-picker';

type TouristForm = {
  name: string;
  phone: string;
  nationality_option: string;
  nationality_other: string;
  come_date: string;
  come_time: string;
  leave_date: string;
  leave_time: string;
  status: TouristStatus;
  amount_received: string;
};

const emptyForm: TouristForm = {
  name: '',
  phone: '',
  nationality_option: '',
  nationality_other: '',
  come_date: '',
  come_time: '',
  leave_date: '',
  leave_time: '',
  status: 'expected',
  amount_received: '0',
};

const STATUS_OPTIONS = [
  { value: 'expected', label: 'Expected' },
  { value: 'received', label: 'Received' },
  { value: 'departed', label: 'Departed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const NATIONALITY_PRESETS = [
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
] as const;

const NATIONALITY_OPTIONS = [
  ...NATIONALITY_PRESETS.map((n) => ({ value: n.value, label: n.label })),
  { value: 'other', label: 'Other' },
];

function resolveNationalityFields(value?: string | null): Pick<TouristForm, 'nationality_option' | 'nationality_other'> {
  if (!value) return { nationality_option: '', nationality_other: '' };
  if (NATIONALITY_PRESETS.some((n) => n.value === value)) {
    return { nationality_option: value, nationality_other: '' };
  }
  return { nationality_option: 'other', nationality_other: value };
}

function resolveNationalityValue(form: TouristForm): string | null {
  if (form.nationality_option === 'other') {
    return form.nationality_other.trim() || null;
  }
  return form.nationality_option || null;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function splitDateTime(value?: string | null): { date: string; time: string } {
  if (!value) return { date: '', time: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const time = hours === 0 && minutes === 0 ? '' : `${pad2(hours)}:${pad2(minutes)}`;
  return { date, time };
}

function combineDateTime(date: string, time: string): string | null {
  if (!date) return null;
  return time ? `${date}T${time}:00` : `${date}T00:00:00`;
}

function formatDisplayDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return hasTime
    ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function TouristsPage() {
  const [items, setItems] = useState<Tourist[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TouristForm>(emptyForm);

  const load = () => touristApi.list().then((res) => setItems(res.data.data));
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (tourist: Tourist) => {
    const come = splitDateTime(tourist.come_date);
    const leave = splitDateTime(tourist.leave_date);
    const nationality = resolveNationalityFields(tourist.nationality);
    setEditingId(tourist.id);
    setForm({
      name: tourist.name,
      phone: tourist.phone || '',
      nationality_option: nationality.nationality_option,
      nationality_other: nationality.nationality_other,
      come_date: come.date,
      come_time: come.time,
      leave_date: leave.date,
      leave_time: leave.time,
      status: tourist.status,
      amount_received: String(tourist.amount_received ?? 0),
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
      phone: form.phone.trim() || null,
      nationality: resolveNationalityValue(form),
      come_date: combineDateTime(form.come_date, form.come_time),
      leave_date: combineDateTime(form.leave_date, form.leave_time),
      status: form.status,
      amount_received: Number(form.amount_received || 0),
    };
    if (editingId) {
      await touristApi.update(editingId, payload);
    } else {
      await touristApi.create(payload);
    }
    closeModal();
    load();
  };

  const markReceived = async (tourist: Tourist) => {
    if (tourist.status === 'received') return;
    await touristApi.update(tourist.id, {
      name: tourist.name,
      phone: tourist.phone,
      nationality: tourist.nationality,
      come_date: tourist.come_date,
      leave_date: tourist.leave_date,
      status: 'received',
      amount_received: Number(tourist.amount_received ?? 0),
    });
    load();
  };

  return (
    <PageLayout
      title="Tourists"
      description="Manage tourist stays"
      action={
        <Button size="sm" onClick={openCreate}>
          Add Tourist
        </Button>
      }
    >
      <DataTable
        headers={['Name', 'Phone', 'Nationality', 'Come', 'Leave', 'Status', 'Amount Received', 'Actions']}
        rows={items.map((t) => [
          t.name,
          t.phone || '—',
          t.nationality || '—',
          formatDisplayDate(t.come_date),
          formatDisplayDate(t.leave_date),
          t.status,
          formatCurrency(Number(t.amount_received)),
          <div key={t.id} className="flex flex-wrap gap-2">
            {t.status !== 'received' && (
              <Button size="sm" onClick={() => markReceived(t)}>
                Received
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
              Edit
            </Button>
          </div>,
        ])}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit Tourist' : 'Add Tourist'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>Nationality</Label>
            <Select
              key={`nationality-${editingId ?? 'new'}-${open}`}
              options={NATIONALITY_OPTIONS}
              placeholder="Select nationality"
              defaultValue={form.nationality_option}
              onChange={(v) =>
                setForm({
                  ...form,
                  nationality_option: v,
                  nationality_other: v === 'other' ? form.nationality_other : '',
                })
              }
            />
          </div>
          {form.nationality_option === 'other' && (
            <div>
              <Label>Other nationality</Label>
              <Input
                placeholder="Enter nationality"
                value={form.nationality_other}
                onChange={(e) => setForm({ ...form, nationality_other: e.target.value })}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <DatePicker
                key={`come-date-${editingId ?? 'new'}-${open}`}
                id={`tourist-come-date-${editingId ?? 'new'}`}
                label="Come date"
                placeholder="Select come date"
                defaultDate={form.come_date || undefined}
                onChange={(_dates, dateStr) =>
                  setForm((prev) => ({ ...prev, come_date: dateStr }))
                }
              />
            </div>
            <div>
              <DatePicker
                key={`come-time-${editingId ?? 'new'}-${open}`}
                id={`tourist-come-time-${editingId ?? 'new'}`}
                label="Come time (optional)"
                placeholder="Select come time"
                timeOnly
                defaultDate={form.come_time || undefined}
                onChange={(_dates, timeStr) =>
                  setForm((prev) => ({ ...prev, come_time: timeStr }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <DatePicker
                key={`leave-date-${editingId ?? 'new'}-${open}`}
                id={`tourist-leave-date-${editingId ?? 'new'}`}
                label="Leave date"
                placeholder="Select leave date"
                defaultDate={form.leave_date || undefined}
                onChange={(_dates, dateStr) =>
                  setForm((prev) => ({ ...prev, leave_date: dateStr }))
                }
              />
            </div>
            <div>
              <DatePicker
                key={`leave-time-${editingId ?? 'new'}-${open}`}
                id={`tourist-leave-time-${editingId ?? 'new'}`}
                label="Leave time (optional)"
                placeholder="Select leave time"
                timeOnly
                defaultDate={form.leave_time || undefined}
                onChange={(_dates, timeStr) =>
                  setForm((prev) => ({ ...prev, leave_time: timeStr }))
                }
              />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              key={`status-${editingId ?? 'new'}-${open}`}
              options={STATUS_OPTIONS}
              defaultValue={form.status}
              onChange={(v) => setForm({ ...form, status: v as TouristStatus })}
            />
          </div>
          <div>
            <Label>Amount received</Label>
            <Input
              type="number"
              min="0"
              step={0.01}
              value={form.amount_received}
              onChange={(e) => setForm({ ...form, amount_received: e.target.value })}
            />
          </div>
          <Button type="submit" size="sm" disabled={!form.name.trim()}>
            Save
          </Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
