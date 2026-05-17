"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { LlmMarkdown } from "@/components/llm";
import { Badge, Button, Card } from "@/components/ui";

const SUBJECTS = [
  "Matemática",
  "Língua Portuguesa",
  "Ciências",
  "História",
  "Geografia",
];
const GRADES = [
  "6º ano",
  "7º ano",
  "8º ano",
  "9º ano",
];
const DURATIONS = ["30 min", "50 min", "1h 30min", "2h"];

export function CopilotoClient() {
  const [subject, setSubject] = useState("Matemática");
  const [grade, setGrade] = useState("7º ano");
  const [topic, setTopic] = useState("Frações equivalentes");
  const [duration, setDuration] = useState("50 min");
  const [plan, setPlan] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedArtifactId, setSavedArtifactId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (generating || !topic.trim()) return;

    setError(null);
    setPlan("");
    setSavedArtifactId(null);
    setGenerating(true);

    try {
      const response = await fetch("/api/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade, topic, duration }),
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
              setPlan(accumulated);
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
      setGenerating(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card className="p-5">
        <div className="text-sm font-semibold">Parâmetros</div>
        <div className="text-text-muted mt-1 text-xs">
          A IA identifica a habilidade BNCC automaticamente.
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <FormField label="Disciplina">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={generating}
              className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Série">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={generating}
              className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Tema">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generating}
              placeholder="Ex: Frações equivalentes"
              className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Duração">
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={generating}
              className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FormField>

          <Button
            type="submit"
            disabled={generating || !topic.trim()}
            className="mt-2 w-full justify-center"
          >
            {generating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {generating ? "Gerando..." : plan ? "Regenerar" : "Gerar plano"}
          </Button>
        </form>
        {error && (
          <div className="bg-danger-soft text-danger-fg mt-3 rounded-md p-3 text-xs">
            {error}
          </div>
        )}
      </Card>

      <Card className="p-0">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="font-serif text-xl font-semibold tracking-tight">
              {topic.trim() || "Plano de aula"}
            </div>
            <div className="text-text-muted mt-0.5 text-xs">
              {grade} · {duration} ·{" "}
              <span className="text-text-faint">
                {generating
                  ? "gerando..."
                  : plan
                    ? "alinhado à BNCC pela IA"
                    : "aguardando geração"}
              </span>
            </div>
          </div>
          {plan && !generating && (
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
          {!plan && !generating && (
            <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <Sparkles size={20} className="text-text-faint" />
              <div className="text-text-muted text-sm">
                Preencha os parâmetros à esquerda e clique em <b>Gerar plano</b>.
              </div>
              <div className="text-text-faint max-w-md text-xs">
                A IA usa Claude Haiku 4.5 via OpenRouter. Sem
                OPENROUTER_API_KEY configurado, cai no mock provider (texto
                placeholder).
              </div>
            </div>
          )}
          {(plan || generating) && (
            <article>
              {plan && <LlmMarkdown content={plan} />}
              {generating && (
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
