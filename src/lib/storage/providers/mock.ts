import type { StorageProvider, StoredFile } from "../types";
import { buildPathname } from "../path";

/**
 * Provider mock — usado quando BLOB_READ_WRITE_TOKEN não está configurado.
 *
 * Retorna uma data URL inline (para imagens pequenas) ou um placeholder
 * com path determinístico. Permite testar upload UX sem habilitar Blob.
 */

export const mockStorageProvider: StorageProvider = {
  async upload(file, options): Promise<StoredFile> {
    const originalName = file instanceof File ? file.name : "blob";
    const pathname = buildPathname(options, originalName);

    let url = `https://placehold.co/600x400/EEE/333?text=${encodeURIComponent(
      `mock-${originalName}`,
    )}`;

    // Para imagens pequenas, retorna data URL inline (chat consegue mostrar)
    if (file.size < 1024 * 1024 && file.type.startsWith("image/")) {
      try {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        url = `data:${file.type};base64,${base64}`;
      } catch {
        // mantém placeholder
      }
    }

    return {
      url,
      pathname,
      size: file.size,
      contentType: file.type || "application/octet-stream",
      uploadedAt: new Date(),
    };
  },

  async delete(): Promise<void> {
    // no-op
  },
};
