import crypto from "crypto";

export async function presignUpload({ keyPrefix, contentType }) {
  const key = `${keyPrefix}/${crypto.randomUUID()}`;
  return {
    uploadUrl: `https://example-upload-endpoint/${key}`,
    key,
    publicUrl: `${process.env.S3_PUBLIC_BASE?.replace(
      "{bucket}",
      process.env.S3_BUCKET
    )}/${key}`,
    fields: {},
    method: "PUT",
    headers: { "Content-Type": contentType },
  };
}
