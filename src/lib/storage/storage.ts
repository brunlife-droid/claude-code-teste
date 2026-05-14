import type { StorageProvider, UploadOptions } from "./types";
import { vercelBlobProvider } from "./providers/vercel-blob";
import { mockStorageProvider } from "./providers/mock";

/**
 * Escolhe o provider em runtime baseado em variáveis de ambiente.
 *
 * - BLOB_READ_WRITE_TOKEN presente → Vercel Blob
 * - caso contrário → mock (placeholder URLs / data URLs)
 *
 * Trocar para R2/S3 no futuro = adicionar novo provider e mudar essa função.
 */

function pickProvider(): StorageProvider {
  if (process.env.BLOB_READ_WRITE_TOKEN) return vercelBlobProvider;
  return mockStorageProvider;
}

let cached: StorageProvider | null = null;

export function storage(): StorageProvider {
  if (!cached) cached = pickProvider();
  return cached;
}

export async function uploadFile(file: File | Blob, options: UploadOptions) {
  return storage().upload(file, options);
}

export async function deleteFile(pathname: string) {
  return storage().delete(pathname);
}
