/**
 * Chunking simples por parágrafo + janela deslizante.
 *
 * Não é estado-da-arte — é o suficiente pra material escolar (apostila,
 * lista de exercício, slide convertido). Pra Fase 1 serve. Quando subir
 * material com tabela complexa ou matemática rica, vale revisitar com
 * chunking baseado em estrutura (LangChain-style).
 *
 * Heurística:
 *   1. Divide em parágrafos (\\n\\n).
 *   2. Junta parágrafos até ~MAX_CHARS por chunk.
 *   3. Overlap de OVERLAP_CHARS entre chunks pra preservar contexto na borda.
 */

const MAX_CHARS = 1800; // ≈ 450 tokens — caber 4-5 chunks no contexto sem estourar
const OVERLAP_CHARS = 200;

export interface Chunk {
  index: number;
  content: string;
}

export function chunkText(raw: string): Chunk[] {
  const clean = raw.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return [];

  const paragraphs = clean.split(/\n\n+/);
  const chunks: string[] = [];
  let buffer = "";

  for (const p of paragraphs) {
    const para = p.trim();
    if (!para) continue;
    if (buffer.length + para.length + 2 <= MAX_CHARS) {
      buffer += (buffer ? "\n\n" : "") + para;
      continue;
    }
    if (buffer) chunks.push(buffer);
    if (para.length <= MAX_CHARS) {
      buffer = para;
    } else {
      // Parágrafo gigante — quebra por janela.
      for (let i = 0; i < para.length; i += MAX_CHARS - OVERLAP_CHARS) {
        chunks.push(para.slice(i, i + MAX_CHARS));
      }
      buffer = "";
    }
  }
  if (buffer) chunks.push(buffer);

  // Aplica overlap entre chunks consecutivos.
  const withOverlap = chunks.map((c, i) => {
    if (i === 0) return c;
    const prev = chunks[i - 1];
    const tail = prev.slice(-OVERLAP_CHARS);
    return tail + "\n\n" + c;
  });

  return withOverlap.map((content, index) => ({ index, content }));
}
