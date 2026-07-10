import { useEffect, useState } from 'react';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { userApi } from '../../services/thiqaApi';
import type { User, UserRole } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

const ROLES: UserRole[] = ['superAdmin', 'officeAdmin', 'accountant', 'employee'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'employee' as UserRole,
    monthly_salary: '',
    is_driver: false,
    vehicle_types: [] as string[],
  });

  const load = () => userApi.list().then((res) => setUsers(res.data.data));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await userApi.create({
      ...form,
      monthly_salary: form.monthly_salary ? Number(form.monthly_salary) : undefined,
      vehicle_types: form.is_driver ? form.vehicle_types : undefined,
    });
    setOpen(false);
    setForm({ name: '', username: '', password: '', role: 'employee', monthly_salary: '', is_driver: false, vehicle_types: [] });
    load();
  };

  return (
    <PageLayout
      title="User Management"
      description="Create and manage system users"
      action={<Button size="sm" onClick={() => setOpen(true)}>Add User</Button>}
    >
      <DataTable
        headers={['Name', 'Username', 'Role', 'Status', 'Salary']}
        rows={users.map((u) => [
          u.name,
          u.username,
          u.role,
          u.status,
          u.monthly_salary ? `$${u.monthly_salary}` : '-',
        ])}
      />

      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">Add User</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div>
            <Label>Role</Label>
            <Select
              options={ROLES.map((r) => ({ value: r, label: r }))}
              defaultValue={form.role}
              onChange={(v) => setForm({ ...form, role: v as UserRole })}
            />
          </div>
          {form.role === 'employee' && (
            <>
              <div><Label>Monthly Salary</Label><Input type="number" value={form.monthly_salary} onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_driver} onChange={(e) => setForm({ ...form, is_driver: e.target.checked })} />
                Is Driver
              </label>
            </>
          )}
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
