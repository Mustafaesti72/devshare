import { listings } from "@/lib/submissions.mjs";
export const dynamic = "force-dynamic";
export async function GET() {
  const projects = await listings("approved");
  return Response.json(
    {
      projects: projects.map(({ id, full_name, summary }) => ({
        id,
        full_name,
        summary,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30",
        "X-Robots-Tag": "noindex",
      },
    },
  );
}
