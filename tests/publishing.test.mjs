import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {startProof,getProof,submit,listings,review} from "../src/lib/submissions.mjs";
test("verification is scoped, single-use and moderated before publication",t=>{
 const dir=mkdtempSync(join(tmpdir(),"devshare-test-"));process.env.DEVSHARE_DATA_DIR=dir;t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const {token,phrase}=startProof("alice/widget");assert.equal(getProof(token).phrase,phrase);
 const repo={id:42,full_name:"alice/widget",owner:{id:7}};
 assert.throws(()=>submit(token,{...repo,full_name:"other/widget"},"Description"));
 submit(token,repo,"Verified description");assert.equal(getProof(token),undefined);assert.throws(()=>submit(token,repo,"Again"));
 assert.equal(listings("approved").length,0);assert.equal(listings("pending").length,1);
 review(42,"approved");assert.equal(listings("approved")[0].summary,"Verified description");review(42,"hidden");assert.equal(listings("approved").length,0);
});