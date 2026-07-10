import { useEffect, useState } from 'react';
import PageLayout, { DataTable, currentMonth } from '../../components/common/PageLayout';
import { reportApi } from '../../services/thiqaApi';
import type { OfficeAdminReport } from '../../types';
import { StatCard, formatCurrency } from '../../components/common/PageLayout';

export default function OfficeAdminReportPage() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<OfficeAdminReport | null>(null);

  useEffect(() => {
    reportApi.officeAdmin(month).then((res) => setData(res.data.data));
  }, [month]);

  return (
    <PageLayout title="Office Admin Summary" description="Abdul Rahman's monthly totals">
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="mb-4 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
          <StatCard label="Tourists Received" value={data.touristsReceived} />
          <StatCard label="Packages Sold" value={data.packagesSold} />
          <StatCard label="Package Value" value={formatCurrency(data.totalPackageValue)} />
          <StatCard label="Money Collected" value={formatCurrency(data.moneyCollected)} />
          <StatCard label="Sent to Accountant" value={data.sentToAccountant} />
        </div>
      )}
      <DataTable
        headers={['Metric', 'Value']}
        rows={
          data
            ? [
                ['Tourists Received', data.touristsReceived],
                ['Packages Sold', data.packagesSold],
                ['Total Package Value', formatCurrency(data.totalPackageValue)],
                ['Money Collected', formatCurrency(data.moneyCollected)],
                ['Sent to Accountant', data.sentToAccountant],
              ]
            : []
        }
      />
    </PageLayout>
  );
}
