import { useEffect, useState } from 'react';
import PageLayout, { DataTable, formatCurrency } from '../../components/common/PageLayout';
import Button from '../../components/ui/button/Button';
import { handoffApi } from '../../services/thiqaApi';
import type { Handoff } from '../../types';

export default function ReceivedPage() {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);

  const load = () => handoffApi.list().then((res) => setHandoffs(res.data.data));

  useEffect(() => { load(); }, []);

  const receive = async (id: number) => {
    await handoffApi.receive(id);
    load();
  };

  return (
    <PageLayout title="Received" description="Handoffs from Office Admin — acknowledge receipt">
      <DataTable
        headers={['Package', 'Tourist', 'Amount', 'Status', 'Sent', 'Action']}
        rows={handoffs.map((h) => [
          `#${h.package_id}`,
          h.package?.tourist?.name || '-',
          formatCurrency(Number(h.amount_collected)),
          h.status,
          new Date(h.sent_at).toLocaleDateString(),
          h.status === 'pending' ? (
            <Button key={h.id} size="sm" onClick={() => receive(h.id)}>I Received</Button>
          ) : (
            'Received'
          ),
        ])}
      />
    </PageLayout>
  );
}
