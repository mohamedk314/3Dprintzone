import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

function getR2Config() {
  const accountId       = process.env.R2_ACCOUNT_ID;
  const accessKeyId     = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName      = process.env.R2_BUCKET_NAME;
  const publicUrl       = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null;
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export async function POST(req: NextRequest) {
  const config = getR2Config();

  if (!config) {
    return NextResponse.json(
      { success: false, message: "Storage service is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { filename, contentType } = body;

    if (!filename || typeof filename !== "string" || filename.trim() === "") {
      return NextResponse.json(
        { success: false, message: "filename is required" },
        { status: 400 }
      );
    }

    if (!contentType || typeof contentType !== "string" || !contentType.includes("/")) {
      return NextResponse.json(
        { success: false, message: "contentType is required (e.g. image/jpeg)" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const random    = Math.random().toString(36).slice(2, 8);
    const safe      = sanitizeFilename(filename.trim());
    const key       = `uploads/${timestamp}-${random}-${safe}`;

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket:      config.bucketName,
      Key:         key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 min
    const publicUrl = `${config.publicUrl}/${key}`;

    return NextResponse.json({ success: true, uploadUrl, publicUrl });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
