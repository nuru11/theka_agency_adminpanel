import { useEffect, useState } from 'react';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { handoffApi, packageApi } from '../../services/thiqaApi';
import type { Handoff, TourPackage } from '../../types';

export default function HandoffsPage() {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);

  const load = () => {
    handoffApi.list().then((res) => setHandoffs(res.data.data));
    packageApi.list().then((res) => setPackages(res.data.data.filter((p) => ['active', 'ready_for_handoff'].includes(p.status))));
  };

  useEffect(() => { load(); }, []);

  const markReady = async (packageId: number) => {
    await handoffApi.markReady(packageId);
    load();
  };

  const sendToAccountant = async (packageId: number) => {
    await handoffApi.create({ package_id: packageId });
    load();
  };

  return (
    <PageLayout title="Send to Accountant" description="Mark packages ready and send to Salah">
      <DataTable
        headers={['Package', 'Tourist', 'Status', 'Actions']}
        rows={packages.map((p) => [
          `#${p.id}`,
          p.tourist?.name || '-',
          p.status,
          <div key={p.id} className="flex gap-2">
            {p.status === 'active' && (
              <Button size="sm" variant="outline" onClick={() => markReady(p.id)}>Mark Ready</Button>
            )}
            {['ready_for_handoff', 'active'].includes(p.status) && (
              <Button size="sm" onClick={() => sendToAccountant(p.id)}>Send to Salah</Button>
            )}
          </div>,
        ])}
      />

      <h2 className="mt-8 mb-4 text-lg font-semibold">Handoff History</h2>
      <DataTable
        headers={['Package', 'Amount', 'Status', 'Sent', 'Received']}
        rows={handoffs.map((h) => [
          `#${h.package_id}`,
          formatCurrency(Number(h.amount_collected)),
          h.status,
          new Date(h.sent_at).toLocaleDateString(),
          h.received_at ? new Date(h.received_at).toLocaleDateString() : '-',
        ])}
      />
    </PageLayout>
  );
}
