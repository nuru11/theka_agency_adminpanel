import { useEffect, useState } from 'react';
import PageLayout, { DataTable, currentMonth, StatCard, formatCurrency } from '../../components/common/PageLayout';
import { reportApi } from '../../services/thiqaApi';
import type { AccountantReport } from '../../types';

export default function AccountantReportPage() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<AccountantReport | null>(null);

  useEffect(() => {
    reportApi.accountant(month).then((res) => setData(res.data.data));
  }, [month]);

  return (
    <PageLayout title="Accountant Summary" description="Salah's monthly totals">
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="mb-4 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
          <StatCard label="Handoffs Received" value={data.handoffsReceived} />
          <StatCard label="Pending Handoffs" value={data.pendingHandoffs} />
          <StatCard label="Package Spending" value={formatCurrency(data.packageSpending)} />
          <StatCard label="Rent" value={formatCurrency(data.rent)} />
          <StatCard label="Salaries" value={formatCurrency(data.salaries)} />
          <StatCard label="Total Spent" value={formatCurrency(data.totalSpent)} />
        </div>
      )}
      <DataTable
        headers={['Category', 'Amount']}
        rows={
          data
            ? [
                ['Package Spending', formatCurrency(data.packageSpending)],
                ['Rent', formatCurrency(data.rent)],
                ['Salaries', formatCurrency(data.salaries)],
                ['Other', formatCurrency(data.otherExpenses)],
                ['Total', formatCurrency(data.totalSpent)],
              ]
            : []
        }
      />
    </PageLayout>
  );
}
