import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
let client;
export function storageConfigured() {
  return !!(process.env.S3_BUCKET && process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
}
function s3() {
  if (!storageConfigured()) throw new Error("Object storage is not configured");
  if (!client) client = new S3Client({endpoint:process.env.S3_ENDPOINT,region:process.env.S3_REGION || "auto",
    forcePathStyle:process.env.S3_URL_STYLE === "path",maxAttempts:3,
    credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY}});
  return client;
}
export async function readImage(name) {
  const response = await s3().send(new GetObjectCommand({Bucket:process.env.S3_BUCKET,Key:"owners/"+name}),{abortSignal:AbortSignal.timeout(10000)});
  if (!response.Body) throw new Error("Empty image");
  const bytes = await response.Body.transformToByteArray();
  return {bytes,etag:response.ETag};
}
export async function writeImage(name, bytes) {
  await s3().send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:"owners/"+name,Body:bytes,ContentType:"image/png",CacheControl:"public, max-age=86400"}),{abortSignal:AbortSignal.timeout(10000)});
}
export async function checkStorage() {
  await s3().send(new HeadObjectCommand({Bucket:process.env.S3_BUCKET,Key:"owners/duckdb.png"}),{abortSignal:AbortSignal.timeout(5000)});
}
