export type Receipts = { gross: number; refunds: number; tax: number; fees: number };
export type Share = { creator: string; units: number };

function integer(value: number) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("Expected nonnegative whole units");
  return BigInt(value);
}

// Version 1 rehearsal. Money is expressed in USD cents throughout.
export function allocate(receipts: Receipts, shares: Share[]) {
  const sum = integer(receipts.gross) - integer(receipts.refunds) - integer(receipts.tax) - integer(receipts.fees);
  const net = sum > BigInt(0) ? sum : BigInt(0);
  const pool = net / BigInt(2);
  const names = new Set<string>();
  let total = BigInt(0);
  for (const { creator, units } of shares) {
    if (typeof creator !== "string" || !creator.trim() || names.has(creator)) throw new Error("Invalid creator");
    names.add(creator);
    total += integer(units);
  }
  const rows = shares.map(({ creator, units }) => {
    const weighted = pool * BigInt(units);
    return { creator, cents: total ? Number(weighted / total) : 0, remainder: total ? weighted % total : BigInt(0) };
  });
  rows.sort((a, b) => a.remainder === b.remainder ? (a.creator < b.creator ? -1 : 1) : a.remainder > b.remainder ? -1 : 1);
  const residual = Number(pool) - rows.reduce((n, r) => n + r.cents, 0);
  if (total) for (let i = 0; i < residual; i++) rows[i].cents++;
  return { net: Number(net), pool: Number(pool), retained: Number(net - pool), unallocated: total ? 0 : Number(pool),
    allocations: rows.map(({ creator, cents }) => ({ creator, cents })) };
}

type Event = { actor: string; creator: string; day: string; verified: boolean; flagged: boolean };
export function monthlyUnits(month: string, events: Event[]) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Invalid reporting month");
  const seen = new Set<string>();
  const creators = new Map<string, number>();
  for (const { actor, creator, day, verified, flagged } of events) {
    if (typeof actor !== "string" || !actor.trim() || typeof creator !== "string" || !creator.trim()
      || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0,10) !== day)
      throw new Error("Invalid event");
    const key = JSON.stringify([actor, creator, day]);
    if (!day.startsWith(month + "-") || verified !== true || flagged !== false || actor === creator || seen.has(key)) continue;
    seen.add(key);
    creators.set(creator, (creators.get(creator) || 0) + 1);
  }
  return Array.from(creators, ([creator, units]) => ({ creator, units }));
}
