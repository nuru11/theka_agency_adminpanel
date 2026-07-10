import { useEffect, useState } from 'react';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { userApi } from '../../services/thiqaApi';
import type { User } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', monthly_salary: '', is_driver: false });

  const load = () => userApi.listEmployees().then((res) => setEmployees(res.data.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await userApi.create({
      ...form,
      role: 'employee',
      monthly_salary: Number(form.monthly_salary),
      vehicle_types: form.is_driver ? ['van'] : undefined,
    });
    setOpen(false);
    load();
  };

  return (
    <PageLayout title="Employees" description="Manage field staff and drivers" action={<Button size="sm" onClick={() => setOpen(true)}>Add Employee</Button>}>
      <DataTable
        headers={['Name', 'Username', 'Salary', 'Driver', 'Vehicle Types', 'Status']}
        rows={employees.map((e) => [
          e.name,
          e.username,
          e.monthly_salary ? `$${e.monthly_salary}` : '-',
          e.is_driver ? 'Yes' : 'No',
          e.vehicle_types?.join(', ') || '-',
          e.status,
        ])}
      />
      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">Add Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div><Label>Monthly Salary</Label><Input type="number" value={form.monthly_salary} onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_driver} onChange={(e) => setForm({ ...form, is_driver: e.target.checked })} /> Is Driver</label>
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
