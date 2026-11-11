export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (
      process.env.NODE_ENV !== "production" ||
      !process.env.DATABASE_URL ||
      !process.env.S3_BUCKET
    )
      return;
    const { cleanMedia } = await import("./lib/listing-images.mjs");
    let running = false;
    const timer = setInterval(async () => {
      if (running) return;
      running = true;
      try {
        await cleanMedia();
      } catch {
        console.error("Queued image cleanup will retry");
      } finally {
        running = false;
      }
    }, 60000);
    timer.unref();
  }
}
