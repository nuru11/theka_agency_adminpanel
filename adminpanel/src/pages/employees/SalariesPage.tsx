import { useEffect, useState } from 'react';
import PageLayout, { DataTable } from '../../components/common/PageLayout';
import { userApi, salaryApi } from '../../services/thiqaApi';
import type { User, SalaryPayment } from '../../types';

export default function SalariesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [payments, setPayments] = useState<SalaryPayment[]>([]);

  useEffect(() => {
    userApi.listEmployees().then((r) => setEmployees(r.data.data));
    salaryApi.list().then((r) => setPayments(r.data.data));
  }, []);

  return (
    <PageLayout title="Salary Overview" description="Employee salaries and payment history">
      <DataTable
        headers={['Employee', 'Monthly Salary', 'Status']}
        rows={employees.map((e) => [e.name, e.monthly_salary ? `$${e.monthly_salary}` : 'Not set', e.status])}
      />
      <h2 className="mt-8 mb-4 text-lg font-semibold">Payment History</h2>
      <DataTable
        headers={['Employee', 'Period', 'Amount', 'Paid At']}
        rows={payments.map((p) => [
          p.employee?.name || p.employee_id,
          p.pay_period,
          `$${p.amount}`,
          new Date(p.paid_at).toLocaleDateString(),
        ])}
      />
    </PageLayout>
  );
}
