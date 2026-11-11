import type { Metadata } from "next";
import { siteUrl, indexable } from "@/lib/site";
import { WorkspaceProvider, Shell } from "@/components/workspace";
import "./globals.css";
import "./workbench.css";
import "./directory.css";
import { ResearchProvider } from "@/lib/research";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Discover developer projects | DevShare",
    template: "%s | DevShare",
  },
  description:
    "Discover open source developer tools, explore real GitHub repositories, read practical engineering guides and submit your own project.",
  robots: { index: indexable, follow: true },
  openGraph: {
    title: "DevShare · Developer discovery",
    description: "A workspace for finding and organizing developer projects.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <WorkspaceProvider>
          <ResearchProvider>
            <Shell>{children}</Shell>
          </ResearchProvider>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
