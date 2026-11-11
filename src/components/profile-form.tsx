"use client";
import { useState } from "react";
import type { User } from "@/lib/accounts.mjs";
export function ProfileForm({user}:{user:User}) {
  const [displayName,setDisplayName]=useState(user.display_name);
  const [bio,setBio]=useState(user.bio);
  const [website,setWebsite]=useState(user.website);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState("");
  async function save(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setStatus("");
    try {
      const response=await fetch("/api/profile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({display_name:displayName,bio,website})});
      const result=await response.json();setStatus(response.ok?"Profile saved.":result.error);
    } catch {setStatus("Connection failed. Please try again.");}
    finally {setBusy(false);}
  }
  return <form onSubmit={save} className="profile-form"><p>These details appear on your public profile.</p>
    <label>Display name<input required minLength={2} maxLength={80} autoComplete="name" value={displayName} onChange={e=>setDisplayName(e.target.value)}/></label>
    <label>Bio<textarea rows={4} maxLength={500} value={bio} onChange={e=>setBio(e.target.value)}/></label>
    <label>Website<input type="url" placeholder="https://example.com" maxLength={300} value={website} onChange={e=>setWebsite(e.target.value)}/></label>
    {status&&<p role="status">{status}</p>}<button className="btn primary" disabled={busy}>{busy?"Saving…":"Save profile"}</button>
  </form>;
}
