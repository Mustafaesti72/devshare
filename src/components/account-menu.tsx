"use client";
import { setAccountScope } from "@/lib/browser-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
type Account={id:string;display_name:string};
export function AccountMenu() {
  const path=usePathname();
  const [account,setAccount]=useState<Account|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/auth/session",{cache:"no-store",signal:controller.signal}).then(r=>r.ok?r.json():null).then(d=>{if(!d)return;setAccount(d.user||null);setAccountScope(d.user?.id||null);}).catch(()=>{});
    return ()=>controller.abort();
  },[path]);
  return <Link className="account-link" href={account?"/dashboard":"/login"}>{account?account.display_name:"Sign in"}</Link>;
}
