import { useEffect, useState } from 'react';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { packageApi, touristApi, userApi, propertyApi, activityApi } from '../../services/thiqaApi';
import type { TourPackage, Tourist, User, Property, Activity } from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

type SelectedActivity = {
  activity_id: number;
  name: string;
  default_price: number;
  price: string;
};

const emptyForm = {
  tourist_id: '', assigned_employee_id: '', package_price: '', people_count: '1',
  accommodation_id: '', accommodation_price: '', driver_id: '', vehicle_type: 'van',
  sim_included: false, sim_cost: '', payment_amount: '', notes: '',
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
  const [activityToAdd, setActivityToAdd] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => packageApi.list().then((res) => setPackages(res.data.data));

  useEffect(() => {
    load();
    touristApi.list().then((r) => setTourists(r.data.data));
    userApi.listEmployees().then((r) => setEmployees(r.data.data));
    userApi.listDrivers().then((r) => setDrivers(r.data.data));
    propertyApi.list().then((r) => setProperties(r.data.data.filter((p) => p.status === 'active')));
    activityApi.list().then((r) => setActivities(r.data.data.filter((a) => a.status === 'active')));
  }, []);

  const availableActivities = activities.filter(
    (a) => !selectedActivities.some((s) => s.activity_id === a.id)
  );

  const addActivity = () => {
    const activity = activities.find((a) => String(a.id) === activityToAdd);
    if (!activity) return;
    setSelectedActivities((prev) => [
      ...prev,
      {
        activity_id: activity.id,
        name: activity.name,
        default_price: Number(activity.default_price),
        price: String(activity.default_price),
      },
    ]);
    setActivityToAdd('');
  };

  const removeActivity = (activityId: number) => {
    setSelectedActivities((prev) => prev.filter((a) => a.activity_id !== activityId));
  };

  const updateActivityPrice = (activityId: number, price: string) => {
    setSelectedActivities((prev) =>
      prev.map((a) => (a.activity_id === activityId ? { ...a, price } : a))
    );
  };

  const activitiesTotal = selectedActivities.reduce(
    (sum, a) => sum + (Number(a.price) || 0),
    0
  );

  const handleAccommodationChange = (id: string) => {
    const property = properties.find((p) => String(p.id) === id);
    setForm({
      ...form,
      accommodation_id: id,
      accommodation_price: property ? String(property.price_per_night) : '',
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedActivities([]);
    setActivityToAdd('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = [];
    if (form.accommodation_id) {
      items.push({
        item_type: 'accommodation',
        property_id: Number(form.accommodation_id),
        price: Number(form.accommodation_price),
      });
    }
    if (form.driver_id) {
      items.push({ item_type: 'transport', driver_id: Number(form.driver_id), vehicle_type: form.vehicle_type });
    }
    for (const activity of selectedActivities) {
      items.push({
        item_type: 'activity',
        activity_id: activity.activity_id,
        price: Number(activity.price),
      });
    }
    if (form.sim_included) {
      items.push({ item_type: 'sim', sim_included: true, sim_cost: Number(form.sim_cost || 0) });
    }

    const payments = form.payment_amount
      ? [{ amount: Number(form.payment_amount), payment_date: new Date().toISOString().slice(0, 10) }]
      : [];

    try {
      await packageApi.create({
        tourist_id: Number(form.tourist_id),
        assigned_employee_id: form.assigned_employee_id ? Number(form.assigned_employee_id) : undefined,
        package_price: Number(form.package_price),
        people_count: Number(form.people_count),
        status: 'active',
        notes: form.notes || undefined,
        items,
        payments,
      });
      setOpen(false);
      resetForm();
      load();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      window.alert(message || 'Failed to create package');
    }
  };

  return (
    <PageLayout title="Packages" description="Create tourist packages" action={<Button size="sm" onClick={() => setOpen(true)}>Create Package</Button>}>
      <DataTable
        headers={['ID', 'Tourist', 'Employee', 'People', 'Price', 'Status']}
        rows={packages.map((p) => [
          p.id,
          p.tourist?.name || p.tourist_id,
          p.assignedEmployee?.name || '-',
          p.people_count,
          formatCurrency(Number(p.package_price)),
          p.status,
        ])}
      />

      <Modal isOpen={open} onClose={() => { setOpen(false); resetForm(); }} className="max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-lg font-semibold">Create Package</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Tourist</Label><Select options={tourists.map(t => ({value:String(t.id),label:t.name}))} onChange={(v) => setForm({...form, tourist_id: v})} /></div>
          <div><Label>Assigned Employee</Label><Select options={employees.map(e => ({value:String(e.id),label:e.name}))} onChange={(v) => setForm({...form, assigned_employee_id: v})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Package Price</Label><Input type="number" value={form.package_price} onChange={(e) => setForm({...form, package_price: e.target.value})} /></div>
            <div><Label>People Count</Label><Input type="number" value={form.people_count} onChange={(e) => setForm({...form, people_count: e.target.value})} /></div>
          </div>
          <div className="space-y-3">
            <Label>Accommodation</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Price defaults to catalog price; edit to override for this package.
            </p>
            {properties.length > 0 ? (
              <>
                <Select
                  options={properties.map((p) => ({ value: String(p.id), label: `${p.name} (${p.type})` }))}
                  placeholder="Select accommodation"
                  onChange={handleAccommodationChange}
                />
                {form.accommodation_id && (
                  <div>
                    <Label>Accommodation Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.accommodation_price}
                      onChange={(e) => setForm({ ...form, accommodation_price: e.target.value })}
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No active accommodations available. Add accommodations in the Accommodations catalog first.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Driver</Label><Select options={drivers.map(d => ({value:String(d.id),label:d.name}))} onChange={(v) => setForm({...form, driver_id: v})} /></div>
            <div><Label>Vehicle</Label><Select options={['van','bus','vip'].map(v => ({value:v,label:v}))} defaultValue="van" onChange={(v) => setForm({...form, vehicle_type: v})} /></div>
          </div>

          <div className="space-y-3">
            <Label>Activities</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Price defaults to catalog price; edit to override for this package.
            </p>
            {selectedActivities.length > 0 && (
              <div className="space-y-2">
                {selectedActivities.map((a) => (
                  <div key={a.activity_id} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <span className="min-w-[120px] flex-1 text-sm font-medium">{a.name}</span>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={a.price}
                        onChange={(e) => updateActivityPrice(a.activity_id, e.target.value)}
                      />
                    </div>
                    <Button type="button" size="sm" onClick={() => removeActivity(a.activity_id)}>Remove</Button>
                  </div>
                ))}
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Activities total: {formatCurrency(activitiesTotal)}
                </p>
              </div>
            )}
            {availableActivities.length > 0 ? (
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[200px] flex-1">
                  <Select
                    key={selectedActivities.map((a) => a.activity_id).join('-') || 'empty'}
                    options={availableActivities.map((a) => ({ value: String(a.id), label: a.name }))}
                    placeholder="Select activity"
                    onChange={(v) => setActivityToAdd(v)}
                  />
                </div>
                <Button type="button" size="sm" onClick={addActivity} disabled={!activityToAdd}>Add Activity</Button>
              </div>
            ) : selectedActivities.length === 0 ? (
              <p className="text-sm text-gray-500">No active activities available. Add activities in the Activities catalog first.</p>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.sim_included} onChange={(e) => setForm({...form, sim_included: e.target.checked})} /> SIM Card</label>
          {form.sim_included && <div><Label>SIM Cost</Label><Input type="number" value={form.sim_cost} onChange={(e) => setForm({...form, sim_cost: e.target.value})} /></div>}
          <div><Label>Money Received</Label><Input type="number" value={form.payment_amount} onChange={(e) => setForm({...form, payment_amount: e.target.value})} /></div>
          <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
          <Button type="submit" size="sm">Create Package</Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
