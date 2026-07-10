import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageLayout from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { packageApi, propertyApi, activityApi, userApi } from '../../services/thiqaApi';
import type { TourPackage, Property, Activity, User } from '../../types';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import ComponentCard from '../../components/common/ComponentCard';

export default function LogServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [form, setForm] = useState({
    accommodation_type: 'hotel', property_id: '', transport_type: 'van',
    driver_id: '', activity_ids: [] as string[], sim_included: false,
    sim_cost: '', people_count: '1', money_received: '', notes: '',
  });

  useEffect(() => {
    if (id) packageApi.get(Number(id)).then((r) => {
      setPkg(r.data.data);
      setForm((f) => ({ ...f, people_count: String(r.data.data.people_count) }));
    });
    propertyApi.list().then((r) => setProperties(r.data.data));
    activityApi.list().then((r) => setActivities(r.data.data));
    userApi.listDrivers().then((r) => setDrivers(r.data.data));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await packageApi.addLog(Number(id), {
      accommodation_type: form.accommodation_type,
      property_id: form.property_id ? Number(form.property_id) : undefined,
      transport_type: form.transport_type,
      driver_id: form.driver_id ? Number(form.driver_id) : undefined,
      activity_ids: form.activity_ids.map(Number),
      sim_included: form.sim_included,
      sim_cost: form.sim_included ? Number(form.sim_cost) : undefined,
      people_count: Number(form.people_count),
      money_received: Number(form.money_received),
      notes: form.notes || undefined,
    });
    navigate('/assignments');
  };

  if (!pkg) return <PageLayout title="Log Service"><p>Loading...</p></PageLayout>;

  return (
    <PageLayout title={`Log Service - Package #${pkg.id}`} description={pkg.tourist?.name}>
      <ComponentCard title="Service Details">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Accommodation Type</Label><Select options={['hotel','apartment','villa','house'].map(t => ({value:t,label:t}))} onChange={(v) => setForm({...form, accommodation_type: v})} /></div>
          <div><Label>Property</Label><Select options={properties.map(p => ({value:String(p.id),label:p.name}))} onChange={(v) => setForm({...form, property_id: v})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Transport</Label><Select options={['van','bus','vip'].map(t => ({value:t,label:t}))} onChange={(v) => setForm({...form, transport_type: v})} /></div>
            <div><Label>Driver</Label><Select options={drivers.map(d => ({value:String(d.id),label:d.name}))} onChange={(v) => setForm({...form, driver_id: v})} /></div>
          </div>
          <div>
            <Label>Activities</Label>
            <div className="space-y-2">
              {activities.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.activity_ids.includes(String(a.id))} onChange={(e) => {
                    setForm({...form, activity_ids: e.target.checked ? [...form.activity_ids, String(a.id)] : form.activity_ids.filter(x => x !== String(a.id))});
                  }} />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.sim_included} onChange={(e) => setForm({...form, sim_included: e.target.checked})} /> SIM Card</label>
          {form.sim_included && <div><Label>SIM Cost</Label><Input type="number" value={form.sim_cost} onChange={(e) => setForm({...form, sim_cost: e.target.value})} /></div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label>People Count</Label><Input type="number" value={form.people_count} onChange={(e) => setForm({...form, people_count: e.target.value})} /></div>
            <div><Label>Money Received</Label><Input type="number" value={form.money_received} onChange={(e) => setForm({...form, money_received: e.target.value})} /></div>
          </div>
          <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
          <Button type="submit" size="sm">Submit Log</Button>
        </form>
      </ComponentCard>
    </PageLayout>
  );
}
