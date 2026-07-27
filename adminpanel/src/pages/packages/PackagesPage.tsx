import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import {
  packageApi,
  touristApi,
  propertyApi,
  parkApi,
  driversApi,
} from '../../services/thiqaApi';
import type {
  TourPackage,
  Tourist,
  Property,
  Park,
  Driver,
  VehicleType,
} from '../../types';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import { useAuth } from '../../context/AuthContext';
import { useSubmitLock } from '../../hooks/useSubmitLock';

type DayForm = {
  day_number: number;
  park_id: string;
  park_price: string;
  property_id: string;
  accommodation_price: string;
  driver_id: string;
};

type PackageForm = {
  tourist_id: string;
  people_count: string;
  days_count: string;
  driver_id: string;
  vehicle_type: VehicleType | '';
  days: DayForm[];
};

const emptyDay = (day_number: number): DayForm => ({
  day_number,
  park_id: '',
  park_price: '0',
  property_id: '',
  accommodation_price: '0',
  driver_id: '',
});

const emptyForm = (): PackageForm => ({
  tourist_id: '',
  people_count: '1',
  days_count: '1',
  driver_id: '',
  vehicle_type: '',
  days: [emptyDay(1)],
});

export default function PackagesPage() {
  const { t, i18n } = useTranslation();
  const { hasRole } = useAuth();
  const isEmployee = hasRole('employee');
  const [items, setItems] = useState<TourPackage[]>([]);
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PackageForm>(emptyForm());
  const { submitting, run } = useSubmitLock();

  const vehicleOptions = useMemo(
    () => [
      { value: 'van', label: t('packages.van') },
      { value: 'bus', label: t('packages.bus') },
      { value: 'vip', label: t('packages.vip') },
    ],
    [t]
  );

  const load = async () => {
    const [pkgs, touristRes, propertyRes, parkRes, driverRes] = await Promise.all([
      packageApi.list(),
      touristApi.list(),
      propertyApi.list(),
      parkApi.list(),
      driversApi.list(),
    ]);
    setItems(pkgs.data.data);
    setTourists(touristRes.data.data);
    setProperties(propertyRes.data.data.filter((p) => p.status === 'active'));
    setParks(parkRes.data.data.filter((p) => p.status === 'active'));
    setDrivers(driverRes.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const expectedCost = useMemo(() => {
    return form.days.reduce(
      (sum, d) => sum + Number(d.accommodation_price || 0) + Number(d.park_price || 0),
      0
    );
  }, [form.days]);

  const touristOptions = tourists.map((item) => ({ value: String(item.id), label: item.name }));
  const propertyOptions = properties.map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.city})`,
  }));
  const parkOptions = parks.map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.city})`,
  }));
  const driverOptions = drivers.map((d) => ({ value: String(d.id), label: d.name }));

  const openCreate = () => {
    setForm(emptyForm());
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setForm(emptyForm());
  };

  const addDay = () => {
    setForm((prev) => {
      const days = [...prev.days, emptyDay(prev.days.length + 1)];
      return { ...prev, days_count: String(days.length), days };
    });
  };

  const removeDay = (dayNumber: number) => {
    setForm((prev) => {
      if (prev.days.length <= 1) return prev;
      const days = prev.days
        .filter((d) => d.day_number !== dayNumber)
        .map((d, index) => ({ ...d, day_number: index + 1 }));
      return { ...prev, days_count: String(days.length), days };
    });
  };

  const updateDay = (dayNumber: number, patch: Partial<DayForm>) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.day_number === dayNumber ? { ...d, ...patch } : d)),
    }));
  };

  const onParkChange = (dayNumber: number, parkId: string) => {
    const park = parks.find((p) => String(p.id) === parkId);
    updateDay(dayNumber, {
      park_id: parkId,
      park_price: park ? String(park.price) : '0',
    });
  };

  const onPropertyChange = (dayNumber: number, propertyId: string) => {
    const property = properties.find((p) => String(p.id) === propertyId);
    updateDay(dayNumber, {
      property_id: propertyId,
      accommodation_price: property
        ? String(
            Math.max(
              0,
              Number(property.price) - Number(property.commission || 0)
            )
          )
        : '0',
    });
  };

  const canSubmit =
    !!form.tourist_id &&
    !!form.driver_id &&
    !!form.vehicle_type &&
    Number(form.people_count) >= 1 &&
    form.days.every((d) => d.park_id && d.property_id && d.driver_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await run(async () => {
      await packageApi.create({
        tourist_id: Number(form.tourist_id),
        people_count: Number(form.people_count),
        days_count: Number(form.days_count),
        driver_id: Number(form.driver_id),
        vehicle_type: form.vehicle_type as VehicleType,
        days: form.days.map((d) => ({
          day_number: d.day_number,
          park_id: Number(d.park_id),
          park_price: Number(d.park_price || 0),
          property_id: Number(d.property_id),
          accommodation_price: Number(d.accommodation_price || 0),
          driver_id: Number(d.driver_id),
        })),
      });
      closeModal();
      await load();
    });
  };

  return (
    <PageLayout
      title={t('packages.title')}
      description={t('packages.description')}
      action={
        <Button size="sm" onClick={openCreate}>
          {t('packages.create')}
        </Button>
      }
    >
      <DataTable
        headers={[
          t('common.tourist'),
          t('packages.people'),
          t('packages.days'),
          t('packages.expectedCost'),
          ...(isEmployee
            ? []
            : [
                t('packages.actualSpend'),
                t('packages.amountReceived'),
                t('packages.variance'),
              ]),
          t('common.status'),
          t('packages.createdBy'),
        ]}
        rows={items.map((pkg) => [
          pkg.tourist?.name || `#${pkg.tourist_id}`,
          String(pkg.people_count),
          String(pkg.days_count),
          formatCurrency(Number(pkg.expected_cost), 'ETB'),
          ...(isEmployee
            ? []
            : [
                formatCurrency(Number(pkg.actual_spend || 0), 'ETB'),
                formatCurrency(Number(pkg.tourist?.amount_received || 0)),
                formatCurrency(Number(pkg.variance || 0)),
              ]),
          pkg.status,
          pkg.creator?.name || t('common.emDash'),
        ])}
      />

      <Modal isOpen={open} onClose={closeModal} className="max-w-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pe-1">
          <div className="sticky top-0 z-10 -mx-1 mb-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('packages.expectedCostLabel')}</p>
            <p className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
              {formatCurrency(expectedCost, 'ETB')}
            </p>
          </div>

          <h2 className="text-lg font-semibold">{t('packages.create')}</h2>

          <div>
            <Label>{t('common.tourist')}</Label>
            <Select
              key={`tourist-${open}-${i18n.language}`}
              options={touristOptions}
              placeholder={t('packages.selectTourist')}
              defaultValue={form.tourist_id}
              onChange={(v) => setForm((prev) => ({ ...prev, tourist_id: v }))}
            />
          </div>

          <div>
            <Label>{t('packages.peopleCount')}</Label>
            <Input
              type="number"
              min="1"
              value={form.people_count}
              onChange={(e) => setForm((prev) => ({ ...prev, people_count: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('common.driver')}</Label>
              <Select
                key={`driver-${open}-${i18n.language}`}
                options={driverOptions}
                placeholder={t('packages.selectDriver')}
                defaultValue={form.driver_id}
                onChange={(v) => setForm((prev) => ({ ...prev, driver_id: v }))}
              />
            </div>
            <div>
              <Label>{t('packages.car')}</Label>
              <Select
                key={`vehicle-${open}-${i18n.language}`}
                options={vehicleOptions}
                placeholder={t('packages.selectCar')}
                defaultValue={form.vehicle_type}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, vehicle_type: v as VehicleType }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t('packages.daysCount', { count: form.days.length })}</h3>
              <Button type="button" size="sm" variant="outline" onClick={addDay}>
                {t('packages.addDay')}
              </Button>
            </div>
            {form.days.map((day) => (
              <div
                key={day.day_number}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">{t('packages.dayN', { n: day.day_number })}</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={form.days.length <= 1}
                    onClick={() => removeDay(day.day_number)}
                  >
                    {t('common.remove')}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>{t('packages.accommodation')}</Label>
                    <Select
                      key={`property-${open}-${day.day_number}-${form.days.length}-${i18n.language}`}
                      options={propertyOptions}
                      placeholder={t('packages.selectAccommodation')}
                      defaultValue={day.property_id}
                      onChange={(v) => onPropertyChange(day.day_number, v)}
                    />
                  </div>
                  {!isEmployee && (
                    <div>
                      <Label>{t('packages.accommodationPrice')}</Label>
                      <Input
                        type="number"
                        min="0"
                        step={0.01}
                        value={day.accommodation_price}
                        onChange={(e) =>
                          updateDay(day.day_number, { accommodation_price: e.target.value })
                        }
                      />
                    </div>
                  )}
                  <div>
                    <Label>{t('common.park')}</Label>
                    <Select
                      key={`park-${open}-${day.day_number}-${form.days.length}-${i18n.language}`}
                      options={parkOptions}
                      placeholder={t('packages.selectPark')}
                      defaultValue={day.park_id}
                      onChange={(v) => onParkChange(day.day_number, v)}
                    />
                  </div>
                  {!isEmployee && (
                    <div>
                      <Label>{t('packages.parkPrice')}</Label>
                      <Input
                        type="number"
                        min="0"
                        step={0.01}
                        value={day.park_price}
                        onChange={(e) =>
                          updateDay(day.day_number, { park_price: e.target.value })
                        }
                      />
                    </div>
                  )}
                  <div>
                    <Label>{t('common.driver')}</Label>
                    <Select
                      key={`day-driver-${open}-${day.day_number}-${form.days.length}-${i18n.language}`}
                      options={driverOptions}
                      placeholder={t('packages.selectDriver')}
                      defaultValue={day.driver_id}
                      onChange={(v) => updateDay(day.day_number, { driver_id: v })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" size="sm" disabled={!canSubmit || submitting}>
            {submitting ? t('common.saving') : t('packages.savePackage')}
          </Button>
        </form>
      </Modal>
    </PageLayout>
  );
}
