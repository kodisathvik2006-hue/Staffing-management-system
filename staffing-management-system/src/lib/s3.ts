import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );
}

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (isS3Configured()) {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return key;
  }

  const localPath = path.join(LOCAL_UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, body);
  return `local:${key}`;
}

export async function getDownloadUrl(key: string): Promise<string> {
  if (key.startsWith("local:")) {
    return `/api/files/${key.replace("local:", "")}`;
  }

  if (!isS3Configured()) {
    throw new Error("S3 is not configured");
  }

  const client = getS3Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    }),
    { expiresIn: 3600 }
  );
}

export function buildDocumentKey(
  projectId: string,
  documentId: string,
  version: number,
  fileName: string
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `projects/${projectId}/${documentId}/v${version}/${safeName}`;
}
