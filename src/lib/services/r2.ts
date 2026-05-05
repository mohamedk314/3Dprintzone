import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function deleteR2Object(imageUrl: string): Promise<void> {
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucketName || !publicUrl) return;
  const client = getR2Client();
  if (!client) return;
  const prefix = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
  if (!imageUrl.startsWith(prefix)) return;
  const key = imageUrl.slice(prefix.length);
  if (!key) return;
  await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
}

export async function deleteR2Objects(imageUrls: string[]): Promise<void> {
  await Promise.allSettled(imageUrls.map(deleteR2Object));
}
