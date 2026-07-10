import { useEffect, useState } from 'react';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { expenseApi } from '../../services/thiqaApi';
import type { Expense } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: 'rent' as 'rent' | 'salaries' | 'other', amount: '', description: '', expense_date: new Date().toISOString().slice(0, 10) });

  const load = () => expenseApi.list().then((r) => setExpenses(r.data.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await expenseApi.create({ ...form, amount: Number(form.amount) });
    setOpen(false);
    load();
  };

  return (
    <PageLayout title="Expenses" description="Rent, salaries, and other operating expenses" action={<Button size="sm" onClick={() => setOpen(true)}>Add Expense</Button>}>
      <DataTable
        headers={['Date', 'Category', 'Amount', 'Description']}
        rows={expenses.map((e) => [e.expense_date, e.category, `$${e.amount}`, e.description || '-'])}
      />
      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">Add Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Category</Label><Select options={['rent','salaries','other'].map(c => ({value:c,label:c}))} defaultValue="rent" onChange={(v) => setForm({...form, category: v as 'rent' | 'salaries' | 'other'})} /></div>
          <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /></div>
          <div><Label>Date</Label><Input type="date" value={form.expense_date} onChange={(e) => setForm({...form, expense_date: e.target.value})} /></div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
