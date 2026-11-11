import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { userProjects } from "@/lib/accounts.mjs";
export const metadata={title:"Your dashboard",robots:{index:false,follow:false}};
export default async function Dashboard(){
  const user=await currentUser();if(!user)redirect("/login");
  const projects=await userProjects(user.github_id);
  return <main id="main" className="directory account-page"><header className="account-heading"><div><p>@{user.github_login}</p><h1>{user.display_name}’s workspace</h1></div><Link className="btn primary" href="/for-developers">Submit a repository</Link></header>
  <nav className="account-nav"><Link href={"/members/"+user.id}>Public profile</Link><Link href="/profile">Edit profile</Link><Link href="/saved">Library</Link></nav>
  <section><h2>Your repositories</h2>{projects.length?<div className="account-projects">{projects.map(p=><article key={p.id}><div><a href={"https://github.com/"+p.full_name}>{p.full_name} ↗</a><span className="status-pill">{p.status==="pending"?"In review":p.status==="approved"?"Published":"Hidden"}</span></div><p>{p.summary}</p><small>Submitted {new Date(p.submitted).toLocaleDateString("en-US",{dateStyle:"medium",timeZone:"UTC"})}</small></article>)}</div>:<div className="account-empty"><p>Your first repository starts here.</p><p>Submit a personal public GitHub repository. Once ownership is confirmed, it enters editorial review.</p><Link href="/for-developers">Submit your first repository →</Link></div>}</section>
  <section className="account-security"><h2>Account access</h2><p>You’re signed in with GitHub. Sessions expire after 30 days.</p><div className="account-actions"><form method="post" action="/api/auth/logout"><button className="btn">Sign out</button></form><form method="post" action="/api/auth/logout"><input type="hidden" name="all" value="true"/><button className="btn">Sign out on all devices</button></form></div></section></main>;
}
