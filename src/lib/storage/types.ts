/**
 * Tipos abstratos do storage.
 *
 * A abstração existe para permitir trocar Vercel Blob → R2 → S3 mudando
 * apenas o provider, sem mexer em componentes/server actions.
 */

export type StorageKind = "image" | "audio" | "document" | "logo";

export interface StoredFile {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
}

export interface UploadOptions {
  tenantId: string;
  kind: StorageKind;
  /** Identificador do dono lógico (ex: studentId, conversationId) */
  ownerId?: string;
  /** Sobrescrever nome do arquivo (caso queira nome determinístico) */
  filename?: string;
  /** Tornar a URL não pública (signed URL com expiração) */
  privateAccess?: boolean;
}

export interface StorageProvider {
  upload(file: File | Blob, options: UploadOptions): Promise<StoredFile>;
  delete(pathname: string): Promise<void>;
}
