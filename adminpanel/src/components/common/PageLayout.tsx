import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import PageMeta from '../common/PageMeta';
import ComponentCard from '../common/ComponentCard';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function PageLayout({ title, description, children, action }: PageLayoutProps) {
  return (
    <>
      <PageMeta title={`${title} | Thiqa`} description={description || title} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </>
  );
}

export function DataTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
}) {
  const { t } = useTranslation();

  return (
    <ComponentCard title={t('common.records')}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-start font-medium text-gray-600 dark:text-gray-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage ?? t('common.noRecords')}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ComponentCard>
  );
}

export function StatCard({ label, value, color = 'brand' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold text-${color}-600 dark:text-white`}>{value}</p>
    </div>
  );
}

export function formatCurrency(amount: number, currency: 'USD' | 'ETB' = 'USD') {
  const locale = i18n.language === 'ar' ? 'ar' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDualAmount(usd: number, etb: number) {
  return `${formatCurrency(usd, 'USD')} / ${formatCurrency(etb, 'ETB')}`;
}

export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
