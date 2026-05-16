"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

const SAMPLE_ESSAY = `A desigualdade social no Brasil é um problema histórico que se mantém até os dias atuais. Apesar dos avanços, milhões de pessoas ainda vivem em condições precárias enquanto poucos concentram grande parte da riqueza nacional. Esse cenário compromete não apenas a economia, mas também a dignidade humana.

As pessoas mais pobres enfrentam dificuldades de acesso à educação de qualidade, saúde e moradia. As pessoas que vivem em áreas periféricas, por exemplo, dependem de serviços públicos precários. As pessoas com baixa renda ainda sofrem com a falta de oportunidades no mercado de trabalho.

Portanto, é necessário que o governo, junto com a sociedade civil, crie políticas públicas de redistribuição de renda, investindo em educação pública gratuita de qualidade, programas de capacitação profissional e moradia popular, para que assim possamos construir um Brasil mais justo para todos.`;

export function CorrecaoClient() {
  const [studentName, setStudentName] = useState("João Pedro Silva");
  const [topic, setTopic] = useState(
    "Desigualdade social no Brasil contemporâneo",
  );
  const [essay, setEssay] = useState(SAMPLE_ESSAY);
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedArtifactId, setSavedArtifactId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (grading || !essay.trim()) return;

    setError(null);
    setFeedback("");
    setSavedArtifactId(null);
    setGrading(true);

    try {
      const response = await fetch("/api/essay-correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, topic, essay }),
      });

      if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status} ${detail}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const chunk = JSON.parse(line.slice(6));
            if (chunk.type === "text" && chunk.text) {
              accumulated += chunk.text;
              setFeedback(accumulated);
            } else if (chunk.type === "done") {
              setSavedArtifactId(chunk.meta?.artifactId ?? null);
            } else if (chunk.type === "error") {
              throw new Error(chunk.error ?? "stream error");
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes("stream error")) {
              throw err;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGrading(false);
    }
  }

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card className="p-0">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="text-sm font-semibold">Texto da redação</div>
            <div className="text-text-muted mt-0.5 text-xs">
              {wordCount} palavras · cola o texto do aluno na íntegra
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="grid grid-cols-1 gap-3 border-b border-[var(--border)] px-6 py-4 sm:grid-cols-2">
            <FormField label="Aluno">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={grading}
                className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
              />
            </FormField>
            <FormField label="Tema">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={grading}
                className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
              />
            </FormField>
          </div>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={grading}
            placeholder="Cole aqui o texto da redação do aluno..."
            className="min-h-[420px] resize-y border-0 bg-transparent px-6 py-5 font-serif text-[15px] leading-relaxed outline-none"
          />
          <div className="border-border flex items-center justify-between border-t px-6 py-3.5">
            <div className="text-text-muted text-xs">
              Modelo: <b>GPT-4o-mini</b> via OpenRouter (norma culta + ENEM).
              Sem OPENAI/OPENROUTER key → mock.
            </div>
            <Button
              type="submit"
              disabled={grading || !essay.trim()}
              className="justify-center"
            >
              {grading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {grading ? "Analisando..." : feedback ? "Recorrigir" : "Corrigir"}
            </Button>
          </div>
        </form>
        {error && (
          <div className="bg-danger-soft text-danger-fg m-4 rounded-md p-3 text-xs">
            {error}
          </div>
        )}
      </Card>

      <Card className="p-0">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="text-sm font-semibold">
              Devolutiva sugerida pela IA
            </div>
            <div className="text-text-muted mt-0.5 text-xs">
              5 competências ENEM · feedback pedagógico, não nota final
            </div>
          </div>
          {feedback && !grading && (
            <div className="flex items-center gap-2">
              {savedArtifactId && (
                <Badge tone="success" title={savedArtifactId}>
                  salvo
                </Badge>
              )}
              <Badge tone="primary">
                <Sparkles size={10} />
                gerado por IA
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6">
          {!feedback && !grading && (
            <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <Sparkles size={20} className="text-text-faint" />
              <div className="text-text-muted text-sm">
                Cole a redação e clique em <b>Corrigir</b>.
              </div>
              <div className="text-text-faint max-w-md text-xs">
                A IA marca trechos e sugere o que dar de devolutiva ao aluno
                em cada competência ENEM. Não substitui o professor — é
                rascunho de correção.
              </div>
            </div>
          )}
          {(feedback || grading) && (
            <article className="prose prose-sm max-w-none text-[14px] leading-relaxed whitespace-pre-wrap">
              {feedback}
              {grading && (
                <span
                  className="ml-1 inline-block h-4 w-0.5 align-middle"
                  style={{
                    background: "var(--primary)",
                    animation: "blink 1s infinite",
                  }}
                />
              )}
              <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
            </article>
          )}
        </div>
      </Card>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
