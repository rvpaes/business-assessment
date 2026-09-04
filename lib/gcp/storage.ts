// lib/gcp/storage.ts - Upload e gestão de arquivos em Google Cloud Storage
import { getGcpAccessToken, GCS_BUCKET, GCS_PREFIX } from "./auth";

export interface GcsUploadResult {
  folderUri: string;
  archiveUri: string;
  filesUploaded: string[];
}

export function generateFolderName(customerName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");

  const sanitizedCustomer = customerName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // Formato: datahoje_hora_nome_cliente (ex: 20260904_103000_hypera_pharma)
  return `${year}${month}${day}_${hour}${min}${sec}_${sanitizedCustomer || "cliente"}`;
}

export async function uploadBufferToGcs(
  bucket: string,
  destinationPath: string,
  buffer: Buffer,
  contentType: string = "application/octet-stream"
): Promise<string> {
  const token = await getGcpAccessToken();
  const encodedPath = encodeURIComponent(destinationPath);
  const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodedPath}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
      "Content-Length": buffer.length.toString()
    },
    body: buffer
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha no upload para GCS (${response.status}): ${errorText}`);
  }

  return `gs://${bucket}/${destinationPath}`;
}

export async function uploadAssessmentPackage(
  customerName: string,
  zipBuffer: Buffer,
  extractedFiles: { name: string; buffer: Buffer; contentType: string }[]
): Promise<GcsUploadResult> {
  const folderName = generateFolderName(customerName);
  const folderPath = `${GCS_PREFIX}/${folderName}`;
  const archivePath = `${folderPath}/metadata_assessment_organization.zip`;

  // 1. Upload do ZIP original
  const archiveUri = await uploadBufferToGcs(
    GCS_BUCKET,
    archivePath,
    zipBuffer,
    "application/zip"
  );

  const filesUploaded: string[] = [archiveUri];

  // 2. Upload dos arquivos extraídos (manifest.json, dictionary.csv, summary.md)
  for (const file of extractedFiles) {
    const filePath = `${folderPath}/${file.name}`;
    const uri = await uploadBufferToGcs(
      GCS_BUCKET,
      filePath,
      file.buffer,
      file.contentType
    );
    filesUploaded.push(uri);
  }

  return {
    folderUri: `gs://${GCS_BUCKET}/${folderPath}`,
    archiveUri,
    filesUploaded
  };
}
