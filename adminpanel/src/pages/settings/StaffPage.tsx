import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { usersApi, type StaffPayload } from '../../services/thiqaApi';
import type { MasterStatus, User, VehicleType } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Checkbox from '../../components/form/input/Checkbox';
import MultiSelect from '../../components/form/MultiSelect';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

type StaffRole = StaffPayload['role'];

type StaffForm = {
  name: string;
  username: string;
  password: string;
  phone: string;
  role: StaffRole;
  status: MasterStatus;
  monthly_salary: string;
  is_driver: boolean;
  vehicle_types: string[];
};

const emptyForm: StaffForm = {
  name: '',
  username: '',
  password: '',
  phone: '',
  role: 'employee',
  status: 'active',
  monthly_salary: '',
  is_driver: false,
  vehicle_types: [],
};

export default function StaffPage() {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const roleOptions = useMemo(
    () => [
      { value: 'officeAdmin', label: t('roles.officeAdmin') },
      { value: 'accountant', label: t('roles.accountant') },
      { value: 'employee', label: t('roles.employee') },
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

  const vehicleOptions = useMemo(
    () => [
      { value: 'van', text: t('packages.van') },
      { value: 'bus', text: t('packages.bus') },
      { value: 'vip', text: t('packages.vip') },
    ],
    [t]
  );

  const statusLabel = (status: string) =>
    status === 'active' ? t('common.active') : status === 'inactive' ? t('common.inactive') : status;

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      officeAdmin: t('roles.officeAdmin'),
      accountant: t('roles.accountant'),
      employee: t('roles.employee'),
      superAdmin: t('roles.superAdmin'),
    };
    return map[role] || role;
  };

  const load = () =>
    usersApi.list().then((res) => setItems(res.data.data)).catch((err) => setError(getApiErrorMessage(err, t)));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };

  const openEdit = (staff: User) => {
    setEditingId(staff.id);
    setForm({
      name: staff.name,
      username: staff.username,
      password: '',
      phone: staff.phone || '',
      role: staff.role as StaffRole,
      status: staff.status,
      monthly_salary: staff.monthly_salary != null ? String(staff.monthly_salary) : '',
      is_driver: Boolean(staff.is_driver),
      vehicle_types: Array.isArray(staff.vehicle_types) ? staff.vehicle_types : [],
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

  const buildPayload = (): StaffPayload => {
    const payload: StaffPayload = {
      name: form.name.trim(),
      username: form.username.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      status: form.status,
    };

    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    if (form.role === 'employee') {
      payload.monthly_salary = form.monthly_salary.trim()
        ? Number(form.monthly_salary)
        : null;
      payload.is_driver = form.is_driver;
      payload.vehicle_types = form.is_driver ? (form.vehicle_types as VehicleType[]) : null;
    } else {
      payload.monthly_salary = null;
      payload.is_driver = false;
      payload.vehicle_types = null;
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await usersApi.update(editingId, payload);
      } else {
        if (!payload.password) {
          setError(t('errors.VALIDATION_PASSWORD_REQUIRED'));
          setSaving(false);
          return;
        }
        await usersApi.create(payload);
      }
      closeModal();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (staff: User) => {
    if (currentUser?.id === staff.id) return;
    const nextStatus: MasterStatus = staff.status === 'active' ? 'inactive' : 'active';
    const confirmKey =
      nextStatus === 'inactive' ? 'staff.confirmDeactivate' : 'staff.confirmActivate';
    if (!window.confirm(t(confirmKey, { name: staff.name }))) return;

    setError('');
    try {
      await usersApi.update(staff.id, { status: nextStatus });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    }
  };

  const handleDelete = async (staff: User) => {
    if (currentUser?.id === staff.id) return;
    if (!window.confirm(t('staff.confirmDelete', { name: staff.name }))) return;

    setError('');
    try {
      await usersApi.remove(staff.id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    }
  };

  const canSubmit =
    form.name.trim() &&
    form.username.trim() &&
    (editingId ? true : form.password.trim().length >= 6);

  return (
    <PageLayout
      title={t('staff.title')}
      description={t('staff.description')}
      action={
        <Button size="sm" onClick={openCreate}>
          {t('staff.add')}
        </Button>
      }
    >
      {error && !open ? (
        <p className="mb-4 text-sm text-error-500">{error}</p>
      ) : null}

      <DataTable
        headers={[
          t('common.name'),
          t('auth.username'),
          t('common.phone'),
          t('staff.role'),
          t('common.status'),
          t('common.driver'),
          t('common.actions'),
        ]}
        rows={items.map((staff) => {
          const isSelf = currentUser?.id === staff.id;
          return [
            staff.name,
            staff.username,
            staff.phone || t('common.emDash'),
            roleLabel(staff.role),
            statusLabel(staff.status),
            staff.role === 'employee' && staff.is_driver
              ? t('common.yes')
              : staff.role === 'employee'
                ? t('common.no')
                : t('common.emDash'),
            <div key={staff.id} className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(staff)}>
                {t('common.edit')}
              </Button>
              {!isSelf && (
                <Button size="sm" variant="outline" onClick={() => handleToggleStatus(staff)}>
                  {staff.status === 'active' ? t('staff.deactivate') : t('staff.activate')}
                </Button>
              )}
              {!isSelf && (
                <Button size="sm" variant="outline" onClick={() => handleDelete(staff)}>
                  {t('common.remove')}
                </Button>
              )}
            </div>,
          ];
        })}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? t('staff.edit') : t('staff.add')}
        </h2>
        {error ? <p className="mb-3 text-sm text-error-500">{error}</p> : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('common.name')}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>{t('auth.username')}</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <Label>
              {editingId ? t('staff.passwordOptional') : t('auth.password')}
            </Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            <Label>{t('staff.role')}</Label>
            <Select
              key={`role-${editingId ?? 'new'}-${open}-${i18n.language}`}
              options={roleOptions}
              defaultValue={form.role}
              onChange={(v) => setForm({ ...form, role: v as StaffRole })}
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

          {form.role === 'employee' && (
            <>
              <div>
                <Label>{t('staff.monthlySalary')}</Label>
                <Input
                  type="number"
                  min="0"
                  step={0.01}
                  value={form.monthly_salary}
                  onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
                />
              </div>
              <Checkbox
                label={t('staff.isDriver')}
                checked={form.is_driver}
                onChange={(checked) =>
                  setForm({
                    ...form,
                    is_driver: checked,
                    vehicle_types: checked ? form.vehicle_types : [],
                  })
                }
              />
              {form.is_driver && (
                <MultiSelect
                  label={t('staff.vehicleTypes')}
                  options={vehicleOptions}
                  value={form.vehicle_types}
                  onChange={(selected) => setForm({ ...form, vehicle_types: selected })}
                  placeholder={t('staff.selectVehicles')}
                />
              )}
            </>
          )}

          <Button type="submit" size="sm" disabled={!canSubmit || saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
