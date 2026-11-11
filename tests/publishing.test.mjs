import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {startProof,getProof,submit,listings,review} from "../src/lib/submissions.mjs";
test("verification is scoped, single-use and moderated before publication",async t=>{
 const dir=mkdtempSync(join(tmpdir(),"devshare-test-"));process.env.DEVSHARE_DATA_DIR=dir;t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const {token,phrase}=await startProof("alice/widget");assert.equal((await getProof(token)).phrase,phrase);
 const repo={id:42,full_name:"alice/widget",owner:{id:7}};
 await assert.rejects(()=>submit(token,{...repo,full_name:"other/widget"},"Description"));
 await submit(token,repo,"Verified description");assert.equal(await getProof(token),undefined);await assert.rejects(()=>submit(token,repo,"Again"));
 assert.equal((await listings("approved")).length,0);assert.equal((await listings("pending")).length,1);
 await review(42,"approved");assert.equal((await listings("approved"))[0].summary,"Verified description");await review(42,"hidden");assert.equal((await listings("approved")).length,0);
});