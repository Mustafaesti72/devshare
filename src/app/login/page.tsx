import Link from "next/link";
import { redirect } from "next/navigation";
import { authConfigured, currentUser } from "@/lib/auth";
export const metadata={title:"Sign in",robots:{index:false,follow:true}};
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}) {
  if(await currentUser())redirect("/dashboard");
  const {error}=await searchParams;
  return <main id="main" className="directory account-page"><section className="account-intro"><Link href="/">← Discover projects</Link><h1>Your projects.<br/>Your maintainer profile.</h1><p>Join with GitHub to submit your repositories, track their review and build a public profile.</p>
  {error&&<p role="alert">{error==="unavailable"?"Sign in is temporarily unavailable. Please try again later.":"Sign in could not finish. Please try again."}</p>}
  {authConfigured()?<a className="btn primary" href="/api/auth/github">Continue with GitHub</a>:<p>GitHub sign in is being configured.</p>}
  <p className="account-note">Your public GitHub name, avatar and bio appear on your profile. You can edit the name and bio after joining. By continuing, you agree to our <Link href="/terms">terms</Link> and <Link href="/privacy">privacy notice</Link>.</p></section></main>;
}
