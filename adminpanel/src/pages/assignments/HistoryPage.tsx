import { useEffect, useState } from 'react';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import { packageApi } from '../../services/thiqaApi';
import type { PackageLog } from '../../types';

export default function HistoryPage() {
  const [logs, setLogs] = useState<PackageLog[]>([]);

  useEffect(() => {
    packageApi.listLogs().then((res) => setLogs(res.data.data));
  }, []);

  return (
    <PageLayout title="History" description="Past completed service logs">
      <DataTable
        headers={['Package', 'Tourist', 'People', 'Money Received', 'Date']}
        rows={logs.map((l) => [
          `#${l.package_id}`,
          l.package?.tourist?.name || '-',
          l.people_count,
          formatCurrency(Number(l.money_received)),
          l.created_at ? new Date(l.created_at).toLocaleDateString() : '-',
        ])}
      />
    </PageLayout>
  );
}
