import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { allocate, monthlyUnits } from "../src/lib/revenue.ts";

const input = JSON.parse(readFileSync(process.argv[2], "utf8"));
const { month, receipts, events } = input;
if (input.currency !== "USD") throw new Error("Expected USD cents");
const units = monthlyUnits(month, events).sort((a,b) => a.creator < b.creator ? -1 : 1);
const result = allocate(receipts, units);
const report = JSON.stringify({ version: 1, mode: "simulation", currency: "USD", month,
  receipts: { gross: receipts.gross, refunds: receipts.refunds, tax: receipts.tax, fees: receipts.fees }, units, ...result });
const dir = process.env.DEVSHARE_DATA_DIR || ".data";
mkdirSync(dir, { recursive: true, mode: 0o700 });
const db = new DatabaseSync(join(dir, "rehearsals.sqlite"));
try {
  db.exec("PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS periods(month TEXT PRIMARY KEY, report TEXT NOT NULL); BEGIN IMMEDIATE");
  db.prepare("INSERT OR IGNORE INTO periods VALUES (?,?)").run(month, report);
  if (db.prepare("SELECT report FROM periods WHERE month=?").get(month).report !== report)
    throw new Error("This period already contains a different rehearsal");
  db.exec("COMMIT");
  console.log(report);
} finally { db.close(); }
