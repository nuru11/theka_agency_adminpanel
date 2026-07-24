import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const NATIONALITY_PRESET_VALUES = [
  'Saudi Arabia',
  'Kuwait',
  'Qatar',
  'United Arab Emirates',
] as const;

function resolveNationalityFields(value?: string | null): Pick<TouristForm, 'nationality_option' | 'nationality_other'> {
  if (!value) return { nationality_option: '', nationality_other: '' };
  if ((NATIONALITY_PRESET_VALUES as readonly string[]).includes(value)) {
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

export default function TouristsPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Tourist[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TouristForm>(emptyForm);

  const statusOptions = useMemo(
    () => [
      { value: 'expected', label: t('tourists.statusExpected') },
      { value: 'received', label: t('tourists.statusReceived') },
      { value: 'departed', label: t('tourists.statusDeparted') },
      { value: 'cancelled', label: t('tourists.statusCancelled') },
    ],
    [t]
  );

  const nationalityOptions = useMemo(
    () => [
      { value: 'Saudi Arabia', label: t('tourists.nationalitySaudi') },
      { value: 'Kuwait', label: t('tourists.nationalityKuwait') },
      { value: 'Qatar', label: t('tourists.nationalityQatar') },
      { value: 'United Arab Emirates', label: t('tourists.nationalityUae') },
      { value: 'other', label: t('tourists.nationalityOther') },
    ],
    [t]
  );

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      expected: t('tourists.statusExpected'),
      received: t('tourists.statusReceived'),
      departed: t('tourists.statusDeparted'),
      cancelled: t('tourists.statusCancelled'),
    };
    return map[status] || status;
  };

  const formatDisplayDate = (value?: string | null): string => {
    if (!value) return t('common.emDash');
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return t('common.emDash');
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    const locale = i18n.language === 'ar' ? 'ar' : undefined;
    return hasTime
      ? d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
      : d.toLocaleDateString(locale, { dateStyle: 'medium' });
  };

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
      title={t('tourists.title')}
      description={t('tourists.description')}
      action={
        <Button size="sm" onClick={openCreate}>
          {t('tourists.addTourist')}
        </Button>
      }
    >
      <DataTable
        headers={[
          t('common.name'),
          t('common.phone'),
          t('tourists.nationality'),
          t('tourists.come'),
          t('tourists.leave'),
          t('common.status'),
          t('tourists.amountReceived'),
          t('common.actions'),
        ]}
        rows={items.map((item) => [
          item.name,
          item.phone || t('common.emDash'),
          item.nationality || t('common.emDash'),
          formatDisplayDate(item.come_date),
          formatDisplayDate(item.leave_date),
          statusLabel(item.status),
          formatCurrency(Number(item.amount_received)),
          <div key={item.id} className="flex flex-wrap gap-2">
            {item.status !== 'received' && (
              <Button size="sm" onClick={() => markReceived(item)}>
                {t('tourists.markReceived')}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
              {t('common.edit')}
            </Button>
          </div>,
        ])}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? t('tourists.editTourist') : t('tourists.addTourist')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('common.name')}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('common.phone')}</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('tourists.nationality')}</Label>
            <Select
              key={`nationality-${editingId ?? 'new'}-${open}-${i18n.language}`}
              options={nationalityOptions}
              placeholder={t('tourists.selectNationality')}
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
              <Label>{t('tourists.otherNationality')}</Label>
              <Input
                placeholder={t('tourists.enterNationality')}
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
                label={t('tourists.comeDate')}
                placeholder={t('tourists.selectComeDate')}
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
                label={t('tourists.comeTime')}
                placeholder={t('tourists.selectComeTime')}
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
                label={t('tourists.leaveDate')}
                placeholder={t('tourists.selectLeaveDate')}
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
                label={t('tourists.leaveTime')}
                placeholder={t('tourists.selectLeaveTime')}
                timeOnly
                defaultDate={form.leave_time || undefined}
                onChange={(_dates, timeStr) =>
                  setForm((prev) => ({ ...prev, leave_time: timeStr }))
                }
              />
            </div>
          </div>
          <div>
            <Label>{t('common.status')}</Label>
            <Select
              key={`status-${editingId ?? 'new'}-${open}-${i18n.language}`}
              options={statusOptions}
              defaultValue={form.status}
              onChange={(v) => setForm({ ...form, status: v as TouristStatus })}
            />
          </div>
          <div>
            <Label>{t('tourists.amountReceivedLabel')}</Label>
            <Input
              type="number"
              min="0"
              step={0.01}
              value={form.amount_received}
              onChange={(e) => setForm({ ...form, amount_received: e.target.value })}
            />
          </div>
          <Button type="submit" size="sm" disabled={!form.name.trim()}>
            {t('common.save')}
          </Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
