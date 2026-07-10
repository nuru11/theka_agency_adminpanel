import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageLayout, { StatCard, formatCurrency, currentMonth } from '../../components/common/PageLayout';
import { reportApi } from '../../services/thiqaApi';
import type { DashboardReport } from '../../types';
import ComponentCard from '../../components/common/ComponentCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<DashboardReport | null>(null);

  useEffect(() => {
    reportApi.dashboard(month).then((res) => setData(res.data.data));
  }, [month]);

  const title =
    user?.role === 'officeAdmin'
      ? 'Office Admin Dashboard'
      : user?.role === 'accountant'
        ? 'Accountant Dashboard'
        : user?.role === 'employee'
          ? 'My Dashboard'
          : 'Super Admin Dashboard';

  return (
    <PageLayout title={title} description="Overview for the selected month">
      <div className="mb-4">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {user?.role === 'superAdmin' && (
            <StatCard label="Net Profit" value={formatCurrency(data.netProfit)} />
          )}
          <StatCard label="Revenue" value={formatCurrency(data.revenue)} />
          <StatCard label="Total Expenses" value={formatCurrency(data.totalExpenses)} />
          <StatCard label="Tourists" value={data.touristsCount} />
          <StatCard label="Packages" value={data.packagesCount} />
          <StatCard label="Pending Handoffs" value={data.pendingHandoffs} />
          <StatCard label="Package Costs" value={formatCurrency(data.packageCosts)} />
          <StatCard label="Operating Expenses" value={formatCurrency(data.operatingExpenses)} />
        </div>
      )}

      <ComponentCard title="Quick Info" className="mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Welcome, {user?.name}. Use the sidebar to manage tourists, packages, handoffs, and finances.
        </p>
      </ComponentCard>
    </PageLayout>
  );
}
