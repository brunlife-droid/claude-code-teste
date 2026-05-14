import type { UploadOptions } from "./types";

/**
 * Convenção de paths no storage:
 *
 *   tenants/<tenantId>/<kind>/<ownerId?>/<timestamp>-<random>-<filename>
 *
 * Vantagens:
 * - Tenant na raiz → fácil listar/deletar tudo de uma prefeitura (LGPD)
 * - Kind segregado → fotos de exercício, áudios, PDFs e logos não se misturam
 * - Timestamp + random → evita colisão sem precisar de DB lookup
 * - Filename original preservado para download bonito
 */

const ALLOWED_FILENAME = /[^a-zA-Z0-9._-]/g;

function sanitize(name: string): string {
  return name.replace(ALLOWED_FILENAME, "_").slice(0, 80);
}

function randomToken(): string {
  // 8 caracteres alfanuméricos suficientes contra colisão prática
  return Math.random().toString(36).slice(2, 10);
}

export function buildPathname(
  options: UploadOptions,
  originalName: string,
): string {
  const ts = Date.now();
  const safe = sanitize(options.filename ?? originalName);
  const tail = `${ts}-${randomToken()}-${safe}`;
  const owner = options.ownerId ? `${sanitize(options.ownerId)}/` : "";
  return `tenants/${sanitize(options.tenantId)}/${options.kind}/${owner}${tail}`;
}
