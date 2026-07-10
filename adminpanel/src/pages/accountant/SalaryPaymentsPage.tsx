import { useEffect, useState } from 'react';
import PageLayout, { DataTable, currentMonth } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { salaryApi, userApi } from '../../services/thiqaApi';
import type { SalaryPayment, User } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';

export default function SalaryPaymentsPage() {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: '', pay_period: currentMonth() });

  const load = () => {
    salaryApi.list().then((r) => setPayments(r.data.data));
    userApi.listEmployees().then((r) => setEmployees(r.data.data));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await salaryApi.create({ employee_id: Number(form.employee_id), pay_period: form.pay_period });
    setOpen(false);
    load();
  };

  return (
    <PageLayout title="Salary Payments" description="Record monthly salary payouts" action={<Button size="sm" onClick={() => setOpen(true)}>Pay Salary</Button>}>
      <DataTable
        headers={['Employee', 'Period', 'Amount', 'Paid At']}
        rows={payments.map((p) => [
          p.employee?.name || p.employee_id,
          p.pay_period,
          `$${p.amount}`,
          new Date(p.paid_at).toLocaleDateString(),
        ])}
      />
      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">Pay Salary</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Employee</Label><Select options={employees.map(e => ({value:String(e.id), label:`${e.name} ($${e.monthly_salary || 0})`}))} onChange={(v) => setForm({...form, employee_id: v})} /></div>
          <div><Label>Pay Period</Label><input type="month" value={form.pay_period} onChange={(e) => setForm({...form, pay_period: e.target.value})} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" /></div>
          <Button type="submit" size="sm">Pay</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
