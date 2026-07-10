import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PageLayout from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';
import { touristApi } from '../../services/thiqaApi';
import type { Tourist } from '../../types';
import { formatCurrency } from '../../components/common/PageLayout';

export default function TouristDetailPage() {
  const { id } = useParams();
  const [tourist, setTourist] = useState<Tourist | null>(null);

  useEffect(() => {
    if (id) touristApi.get(Number(id)).then((res) => setTourist(res.data.data));
  }, [id]);

  if (!tourist) return <PageLayout title="Tourist Detail"><p>Loading...</p></PageLayout>;

  return (
    <PageLayout title={tourist.name} description="Tourist details and packages">
      <ComponentCard title="Tourist Info">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="text-gray-500">Phone:</span> {tourist.phone || '-'}</p>
          <p><span className="text-gray-500">Email:</span> {tourist.email || '-'}</p>
          <p><span className="text-gray-500">Nationality:</span> {tourist.nationality || '-'}</p>
          <p><span className="text-gray-500">Group Size:</span> {tourist.group_size}</p>
          <p><span className="text-gray-500">Arrival:</span> {tourist.arrival_date || '-'}</p>
          <p><span className="text-gray-500">Departure:</span> {tourist.departure_date || '-'}</p>
        </div>
        {tourist.notes && <p className="mt-4 text-sm text-gray-600">{tourist.notes}</p>}
      </ComponentCard>

      <ComponentCard title="Packages" className="mt-6">
        {tourist.packages?.length ? (
          <ul className="space-y-2 text-sm">
            {tourist.packages.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                <span>Package #{p.id} - {p.status}</span>
                <span>{formatCurrency(Number(p.package_price))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No packages yet</p>
        )}
      </ComponentCard>
    </PageLayout>
  );
}
