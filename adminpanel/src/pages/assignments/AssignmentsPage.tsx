import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { packageApi } from '../../services/thiqaApi';
import type { TourPackage } from '../../types';

export default function AssignmentsPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);

  useEffect(() => {
    packageApi.list().then((res) => setPackages(res.data.data));
  }, []);

  return (
    <PageLayout title="My Assignments" description="Packages assigned to you">
      <DataTable
        headers={['Package', 'Tourist', 'People', 'Price', 'Status', 'Action']}
        rows={packages.map((p) => [
          `#${p.id}`,
          p.tourist?.name || '-',
          p.people_count,
          formatCurrency(Number(p.package_price)),
          p.status,
          <Link key={p.id} to={`/assignments/${p.id}/log`}>
            <Button size="sm">Log Service</Button>
          </Link>,
        ])}
      />
    </PageLayout>
  );
}
