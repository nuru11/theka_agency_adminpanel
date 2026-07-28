import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { expenseApi } from '../../services/thiqaApi';
import type { Expense, MasterStatus } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

type ExpenseForm = {
  name: string;
  price: string;
  status: MasterStatus;
};

const emptyForm: ExpenseForm = {
  name: '',
  price: '0',
  status: 'active',
};

export default function ExpensesPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const [error, setError] = useState('');

  const statusOptions = useMemo(
    () => [
      { value: 'active', label: t('common.active') },
      { value: 'inactive', label: t('common.inactive') },
    ],
    [t]
  );

  const statusLabel = (status: string) =>
    status === 'active' ? t('common.active') : status === 'inactive' ? t('common.inactive') : status;

  const load = () =>
    expenseApi
      .list()
      .then((res) => setItems(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err, t)));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      name: expense.name,
      price: String(expense.price ?? 0),
      status: expense.status,
    });
    setError('');
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name.trim(),
      price: Number(form.price || 0),
      status: form.status,
    };
    try {
      if (editingId) {
        await expenseApi.update(editingId, payload);
      } else {
        await expenseApi.create(payload);
      }
      closeModal();
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    }
  };

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(t('expenses.confirmDelete', { name: expense.name }))) return;
    setError('');
    try {
      await expenseApi.remove(expense.id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    }
  };

  return (
    <PageLayout
      title={t('expenses.title')}
      description={t('expenses.description')}
      action={
        <Button size="sm" onClick={openCreate}>
          {t('expenses.add')}
        </Button>
      }
    >
      {error && !open ? (
        <p className="mb-4 text-sm text-error-500">{error}</p>
      ) : null}

      <DataTable
        headers={[t('common.name'), t('common.price'), t('common.status'), t('common.actions')]}
        rows={items.map((item) => [
          item.name,
          formatCurrency(Number(item.price)),
          statusLabel(item.status),
          <div key={item.id} className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
              {t('common.edit')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDelete(item)}>
              {t('common.remove')}
            </Button>
          </div>,
        ])}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? t('expenses.edit') : t('expenses.add')}
        </h2>
        {error ? <p className="mb-3 text-sm text-error-500">{error}</p> : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('common.name')}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
          <Button type="submit" size="sm" disabled={!form.name.trim()}>
            {t('common.save')}
          </Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
