/**
 * Extração de texto de PDF / DOCX / texto puro.
 *
 * Lazy-require dos parsers — `pdf-parse` tem efeito colateral chato no
 * carregamento (procura por arquivo de teste se carregado no top-level),
 * então só carrega quando precisar.
 *
 * Limites:
 *   - PDF: usa pdf-parse (texto extraído sem layout). Funciona pra apostila
 *     e lista de exercício comum. Não funciona bem em PDF que é só imagem
 *     escaneada — esse caso pede OCR (Fase 2).
 *   - DOCX: usa mammoth com extractRawText (perde formatação rica, preserva
 *     texto linear — suficiente pra RAG).
 *   - Texto puro / Markdown: passa direto.
 */

export type MaterialMime =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain"
  | "text/markdown";

export async function extractText(
  buffer: Buffer,
  mime: string,
  filename: string,
): Promise<string> {
  const lowerName = filename.toLowerCase();
  if (mime === "application/pdf" || lowerName.endsWith(".pdf")) {
    return extractPdf(buffer);
  }
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    return extractDocx(buffer);
  }
  if (
    mime.startsWith("text/") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".txt")
  ) {
    return buffer.toString("utf-8");
  }
  throw new Error(`Tipo de arquivo não suportado: ${mime} (${filename})`);
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const mod = (await import("pdf-parse")) as unknown as {
    default: (b: Buffer) => Promise<{ text: string }>;
  };
  const result = await mod.default(buffer);
  return result.text ?? "";
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = (await import("mammoth")) as unknown as {
    default: { extractRawText: (input: { buffer: Buffer }) => Promise<{ value: string }> };
    extractRawText?: (input: { buffer: Buffer }) => Promise<{ value: string }>;
  };
  const fn = mammoth.extractRawText ?? mammoth.default.extractRawText;
  const result = await fn({ buffer });
  return result.value ?? "";
}
