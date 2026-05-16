"use client";

import { useState, type FormEvent } from "react";
import { Copy, Download, Loader2, Sparkles } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

const SUBJECTS = [
  "Matemática",
  "Língua Portuguesa",
  "Ciências",
  "História",
  "Geografia",
];
const GRADES = ["6º ano", "7º ano", "8º ano", "9º ano"];
const DURATIONS = ["30 min", "50 min", "1h 30min", "2h"];
const VERSIONS = ["A", "A e B", "A, B e C"];

export function ProvasClient() {
  const [subject, setSubject] = useState("Matemática");
  const [grade, setGrade] = useState("7º ano");
  const [topics, setTopics] = useState("Frações equivalentes e porcentagem simples");
  const [questionCount, setQuestionCount] = useState(10);
  const [versions, setVersions] = useState("A e B");
  const [duration, setDuration] = useState("50 min");
  const [difficulty, setDifficulty] = useState("3 fáceis, 5 médias, 2 difíceis");
  const [exam, setExam] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedArtifactId, setSavedArtifactId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (generating || !topics.trim()) return;

    setError(null);
    setExam("");
    setSavedArtifactId(null);
    setGenerating(true);

    try {
      const response = await fetch("/api/exam-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          grade,
          topics,
          questionCount,
          versions,
          duration,
          difficulty,
        }),
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
          const chunk = JSON.parse(line.slice(6));
          if (chunk.type === "text" && chunk.text) {
            accumulated += chunk.text;
            setExam(accumulated);
          } else if (chunk.type === "done") {
            setSavedArtifactId(chunk.meta?.artifactId ?? null);
          } else if (chunk.type === "error") {
            throw new Error(chunk.error ?? "stream error");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  }

  async function copyExam() {
    if (!exam) return;
    await navigator.clipboard.writeText(exam);
  }

  function downloadExam() {
    if (!exam) return;
    const blob = new Blob([exam], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prova-${subject.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <Card className="p-5">
        <div className="text-sm font-semibold">Parâmetros da avaliação</div>
        <div className="text-text-muted mt-1 text-xs">
          A IA monta matriz, questões, versões e gabarito comentado.
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

          <FormField label="Tema(s)">
            <textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              disabled={generating}
              placeholder="Ex: Frações equivalentes, porcentagem simples"
              className="bg-surface-2 border-border min-h-20 w-full resize-y rounded-md border px-3 py-2 text-sm"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Questões">
              <input
                type="number"
                min={3}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                disabled={generating}
                className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
              />
            </FormField>
            <FormField label="Versões">
              <select
                value={versions}
                onChange={(e) => setVersions(e.target.value)}
                disabled={generating}
                className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
              >
                {VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

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

          <FormField label="Dificuldade">
            <input
              type="text"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={generating}
              className="bg-surface-2 border-border w-full rounded-md border px-3 py-2 text-sm"
            />
          </FormField>

          <Button
            type="submit"
            disabled={generating || !topics.trim()}
            className="mt-2 w-full justify-center"
          >
            {generating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {generating ? "Gerando..." : exam ? "Regenerar prova" : "Gerar prova"}
          </Button>
        </form>

        {error && (
          <div className="bg-danger-soft text-danger-fg mt-3 rounded-md p-3 text-xs">
            {error}
          </div>
        )}
      </Card>

      <Card className="p-0">
        <div className="border-border flex items-center justify-between gap-3 border-b px-6 py-4">
          <div>
            <div className="font-serif text-xl font-semibold tracking-tight">
              {topics.trim() || "Prova"}
            </div>
            <div className="text-text-muted mt-0.5 text-xs">
              {grade} · {questionCount} questões · {versions} ·{" "}
              <span className="text-text-faint">
                {generating
                  ? "gerando..."
                  : exam
                    ? "matriz + gabarito prontos"
                    : "aguardando geração"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {savedArtifactId && (
              <Badge tone="success" title={savedArtifactId}>
                salvo
              </Badge>
            )}
            {exam && !generating && (
              <Badge tone="primary">
                <Sparkles size={10} />
                gerado por IA
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6">
          {!exam && !generating && (
            <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <Sparkles size={20} className="text-text-faint" />
              <div className="text-text-muted text-sm">
                Configure a avaliação e clique em <b>Gerar prova</b>.
              </div>
              <div className="text-text-faint max-w-md text-xs">
                O resultado vem com questões, matriz de habilidades BNCC,
                versões e gabarito comentado para revisão do professor.
              </div>
            </div>
          )}

          {(exam || generating) && (
            <article className="prose prose-sm max-w-none text-[14px] leading-relaxed whitespace-pre-wrap">
              {exam}
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

        {exam && !generating && (
          <div className="border-border flex items-center justify-end gap-2 border-t px-6 py-3">
            <Button type="button" variant="secondary" onClick={copyExam}>
              <Copy size={14} />
              Copiar
            </Button>
            <Button type="button" onClick={downloadExam}>
              <Download size={14} />
              Baixar .md
            </Button>
          </div>
        )}
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
