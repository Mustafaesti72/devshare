import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { allocate, monthlyUnits } from "../src/lib/revenue.ts";
const receipts = { gross: 10, fees: 0, refunds: 0, tax: 0 };
test("every cent reconciles and ties resolve consistently", () => {
  const rows = ["c","b","a"].map(creator => ({creator, units:1}));
  assert.deepEqual(allocate(receipts,rows).allocations, [{creator:"a",cents:2},{creator:"b",cents:2},{creator:"c",cents:1}]);
  assert.equal(allocate(receipts,[]).unallocated,5);
  assert.equal(allocate({...receipts, tax:15},rows).pool,0);
  assert.throws(() => allocate({...receipts,gross:1.5},rows));
});
const event = {actor:"reader", creator:"maker", day:"2026-10-01", verified:true,flagged:false};
test("monthly eligibility filters before counting unique reader-days", () => {
  const events = [event,event,{...event, day:"2026-10-02"},{...event, day:"2026-11-01"},{...event, actor:"maker"},{...event, actor:"no",verified:false},{...event, actor:"flag",flagged:true}];
  assert.deepEqual(monthlyUnits("2026-10",events),[{creator:"maker",units:2}]);
  assert.throws(() => monthlyUnits("2026-10",[{...event,day:"2026-02-31"}]));
});
test("rehearsals survive restarts and reject conflicting period results", t => {
  const dir = mkdtempSync(join(tmpdir(), "devshare-rehearse-"));
  t.after(() => rmSync(dir,{recursive:true,force:true}));
  const path = join(dir,"month.json");
  const data = {month:"2026-10",currency:"USD",receipts,events:[event]};
  const run = () => spawnSync(process.execPath, ["--experimental-strip-types","scripts/rehearse.mjs",path],{env:{...process.env,DEVSHARE_DATA_DIR:dir}, encoding:"utf8"});
  writeFileSync(path,JSON.stringify(data));
  assert.equal(JSON.parse(run().stdout).pool,5);
  assert.equal(run().status,0);
  writeFileSync(path,JSON.stringify({...data,events:[]}));
  assert.notEqual(run().status,0);
  writeFileSync(path,JSON.stringify(data));
  assert.equal(run().status,0);
});
