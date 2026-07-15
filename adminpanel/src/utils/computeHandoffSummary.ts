import type { Handoff } from '../types';

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export type HandoffSummary = {
  total_sent: number;
  total_pending: number;
  total_received: number;
};

export function computeHandoffSummary(handoffs: Handoff[]): HandoffSummary {
  let totalSent = 0;
  let totalPending = 0;
  let totalReceived = 0;

  for (const handoff of handoffs) {
    const amount = Number(handoff.amount) || 0;
    totalSent += amount;
    if (handoff.status === 'pending') {
      totalPending += amount;
    } else if (handoff.status === 'received') {
      totalReceived += amount;
    }
  }

  return {
    total_sent: round2(totalSent),
    total_pending: round2(totalPending),
    total_received: round2(totalReceived),
  };
}
