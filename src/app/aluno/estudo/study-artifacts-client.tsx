"use client";

import { useMemo, useRef, useState } from "react";
import {
  BookOpenCheck,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Layers3,
  ListChecks,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Wand2,
  XCircle,
} from "lucide-react";
import { LlmMarkdown } from "@/components/llm";
import type {
  StudentArtifact,
  StudentArtifactContent,
  StudentArtifactKind,
} from "@/lib/student/artifacts";
import { cn } from "@/lib/cn";

type ClientArtifact = Omit<StudentArtifact, "createdAt"> & {
  createdAt: string;
};

interface Props {
  tenant: {
    primary: string;
    primaryFg: string;
    primarySoft: string;
    secondary: string;
    short: string;
    tutorName: string;
  };
  conversationId: string | null;
  initialArtifacts: ClientArtifact[];
}

const MODES: Array<{
  kind: StudentArtifactKind;
  label: string;
  description: string;
  icon: typeof Layers3;
}> = [
  {
    kind: "flashcards",
    label: "Cartões",
    description: "Vire, marque domínio e revise o que ainda ficou frágil.",
    icon: Layers3,
  },
  {
    kind: "quiz",
    label: "Quiz",
    description: "Responda com feedback imediato e placar de acertos.",
    icon: ClipboardList,
  },
  {
    kind: "summary",
    label: "Resumo",
    description: "Leia, siga passos curtos e finalize com uma pergunta.",
    icon: BookOpenCheck,
  },
];

export function StudyArtifactsClient({
  tenant,
  conversationId,
  initialArtifacts,
}: Props) {
  const [artifacts, setArtifacts] = useState<ClientArtifact[]>(initialArtifacts);
  const [activeKind, setActiveKind] =
    useState<StudentArtifactKind>("flashcards");
  const [topic, setTopic] = useState("");
  const [current, setCurrent] = useState<ClientArtifact | null>(
    initialArtifacts[0] ?? null,
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);

  const selectedMode = MODES.find((mode) => mode.kind === activeKind) ?? MODES[0];

  function focusViewer() {
    window.requestAnimationFrame(() => {
      viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function selectArtifact(artifact: ClientArtifact) {
    setCurrent(artifact);
    focusViewer();
  }

  async function generateArtifact() {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/student-artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: activeKind,
          topic: topic.trim(),
          conversationId,
        }),
      });
      const data = (await response.json()) as {
        artifact?: ClientArtifact;
        error?: string;
      };
      if (!response.ok || !data.artifact) {
        throw new Error(data.error ?? "Falha ao gerar estudo.");
      }
      const artifact = {
        ...data.artifact,
        createdAt: data.artifact.createdAt ?? new Date().toISOString(),
      };
      setArtifacts((prev) => [
        artifact,
        ...prev.filter((item) => item.id !== artifact.id),
      ]);
      setCurrent(artifact);
      focusViewer();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="scroll-thin relative isolate h-full overflow-y-auto">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--primary) 7%, #ffffff) 0%, #f8fbff 42%, color-mix(in srgb, var(--secondary) 10%, #ffffff) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--primary) 22%, transparent) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage:
            "linear-gradient(180deg, black 0, black 420px, transparent 100%)",
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
              Estudo ativo - {tenant.short}
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Treino bonito, rápido e feito para lembrar
            </h1>
            <p className="text-text-muted mt-2 max-w-2xl text-[15px] leading-relaxed">
              Transforme uma conversa, imagem, áudio ou documento em cartões,
              quiz e resumo guiado com a {tenant.tutorName}.
            </p>
          </div>

          <div className="rounded-lg border border-white/70 bg-white/76 p-4 shadow-[0_16px_42px_rgba(16,24,40,0.09)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div
                className="grid size-10 place-items-center rounded-md"
                style={{ background: tenant.primary, color: tenant.primaryFg }}
              >
                <Brain size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold">Memória de estudo</div>
                <div className="text-text-muted text-xs">
                  {artifacts.length} artefato{artifacts.length === 1 ? "" : "s"} salvo
                  {artifacts.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            <div className="bg-primary-soft text-primary mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11.5px] font-medium">
              <Sparkles size={12} />
              {conversationId ? "Usando conversa atual" : "Tema livre"}
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0 space-y-5">
            <section className="rounded-lg border border-white/70 bg-white/78 p-4 shadow-[0_18px_50px_rgba(16,24,40,0.10)] backdrop-blur-xl sm:p-5">
              <div className="grid gap-3 lg:grid-cols-3">
                {MODES.map((mode) => (
                  <ModeButton
                    key={mode.kind}
                    mode={mode}
                    active={activeKind === mode.kind}
                    tenant={tenant}
                    onClick={() => setActiveKind(mode.kind)}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="relative block">
                  <Wand2
                    size={16}
                    className="text-text-faint pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                  />
                  <input
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder={
                      conversationId
                        ? "Tema opcional para orientar a conversa atual"
                        : "Digite o tema: frações, fotossíntese, texto argumentativo..."
                    }
                    className="border-border-strong bg-surface-raised placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-soft)] h-12 w-full rounded-lg border pr-3 pl-10 text-[14px] outline-none transition-colors"
                  />
                </label>
                <button
                  type="button"
                  onClick={generateArtifact}
                  disabled={generating || (!conversationId && !topic.trim())}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-px disabled:translate-y-0 disabled:opacity-45"
                  style={{ background: tenant.primary, color: tenant.primaryFg }}
                >
                  {generating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Gerar {selectedMode.label.toLowerCase()}
                </button>
              </div>

              {error && (
                <div className="text-danger-fg bg-danger-soft mt-3 rounded-md px-3 py-2 text-sm">
                  {error}
                </div>
              )}
            </section>

            <section
              ref={viewerRef}
              className="scroll-mt-4 rounded-lg border border-white/70 bg-white/82 p-4 shadow-[0_18px_50px_rgba(16,24,40,0.10)] backdrop-blur-xl sm:p-5"
            >
              {current ? (
                <ArtifactViewer artifact={current} tenant={tenant} />
              ) : (
                <EmptyArtifactState tenant={tenant} />
              )}
            </section>
          </main>

          <RecentArtifacts
            artifacts={artifacts}
            currentId={current?.id ?? null}
            onSelect={selectArtifact}
            tenant={tenant}
          />
        </div>
      </div>
    </div>
  );
}

function ModeButton({
  mode,
  active,
  tenant,
  onClick,
}: {
  mode: (typeof MODES)[number];
  active: boolean;
  tenant: Props["tenant"];
  onClick: () => void;
}) {
  const Icon = mode.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "lift-on-hover min-h-[112px] rounded-md border p-3 text-left transition-all",
        active
          ? "border-transparent shadow-[0_14px_34px_rgba(16,24,40,0.12)]"
          : "border-border-strong bg-white/72 hover:bg-white",
      )}
      style={
        active
          ? {
              background:
                "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--secondary) 35%, var(--primary)))",
              color: tenant.primaryFg,
            }
          : undefined
      }
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-md",
          active ? "bg-white/18" : "bg-primary-soft text-primary",
        )}
      >
        <Icon size={17} />
      </span>
      <span className="mt-3 block text-sm font-semibold">{mode.label}</span>
      <span
        className={cn(
          "mt-1 block text-xs leading-relaxed",
          active ? "text-white/82" : "text-text-muted",
        )}
      >
        {mode.description}
      </span>
    </button>
  );
}

function RecentArtifacts({
  artifacts,
  currentId,
  onSelect,
  tenant,
}: {
  artifacts: ClientArtifact[];
  currentId: string | null;
  onSelect: (artifact: ClientArtifact) => void;
  tenant: Props["tenant"];
}) {
  return (
    <aside className="h-fit rounded-lg border border-white/70 bg-white/76 shadow-[0_16px_42px_rgba(16,24,40,0.08)] backdrop-blur-xl">
      <div className="border-border/70 border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">Recentes</div>
            <div className="text-text-muted mt-1 text-xs">
              Seus materiais para revisar depois.
            </div>
          </div>
          <div
            className="grid size-8 place-items-center rounded-md"
            style={{ background: tenant.primarySoft, color: tenant.primary }}
          >
            <ListChecks size={16} />
          </div>
        </div>
      </div>
      <div className="max-h-[640px] overflow-y-auto p-2">
        {artifacts.length === 0 ? (
          <div className="text-text-muted px-3 py-8 text-center text-sm">
            Nada salvo ainda.
          </div>
        ) : (
          artifacts.map((artifact) => (
            <button
              key={artifact.id}
              type="button"
              onClick={() => onSelect(artifact)}
              className={cn(
                "group flex w-full flex-col gap-2 rounded-md border border-transparent px-3 py-3 text-left transition-colors hover:bg-white",
                currentId === artifact.id && "border-primary-border bg-primary-soft",
              )}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium">{artifact.title}</span>
                <ArtifactKindIcon kind={artifact.kind} />
              </span>
              <span className="text-text-faint text-[11.5px]">
                {kindLabel(artifact.kind)} - {formatDate(artifact.createdAt)}
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

function ArtifactViewer({
  artifact,
  tenant,
}: {
  artifact: ClientArtifact;
  tenant: Props["tenant"];
}) {
  const content = artifact.content;
  return (
    <div className="min-h-[540px]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-text-faint flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <ArtifactKindIcon kind={artifact.kind} />
            {kindLabel(artifact.kind)}
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {artifact.title}
          </h2>
        </div>
        <div className="text-text-faint rounded-full border border-white/70 bg-white/72 px-3 py-1 text-xs">
          {artifact.provider ?? "ia"} - {artifact.model ?? "modelo"}
        </div>
      </div>

      {content.kind === "flashcards" && (
        <FlashcardViewer content={content} tenant={tenant} />
      )}
      {content.kind === "quiz" && <QuizViewer content={content} tenant={tenant} />}
      {content.kind === "summary" && (
        <SummaryViewer content={content} tenant={tenant} />
      )}
    </div>
  );
}

function FlashcardViewer({
  content,
  tenant,
}: {
  content: Extract<StudentArtifactContent, { kind: "flashcards" }>;
  tenant: Props["tenant"];
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [mastery, setMastery] = useState<Record<number, "review" | "known">>({});
  const card = content.cards[index] ?? content.cards[0];
  const knownCount = Object.values(mastery).filter((value) => value === "known").length;
  const progress = ((index + 1) / Math.max(content.cards.length, 1)) * 100;

  if (!card) return null;

  function move(next: number) {
    setIndex((prev) => {
      const length = content.cards.length;
      return (prev + next + length) % length;
    });
    setRevealed(false);
  }

  function mark(value: "review" | "known") {
    setMastery((prev) => ({ ...prev, [index]: value }));
    window.setTimeout(() => move(1), 180);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-text-muted text-sm">
            Cartão {index + 1} de {content.cards.length}
          </div>
          <div className="text-text-faint text-xs">
            {knownCount} dominado{knownCount === 1 ? "" : "s"}
          </div>
        </div>
        <div className="bg-border/70 mb-4 h-2 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: tenant.primary }}
          />
        </div>

        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          className="block w-full [perspective:1400px]"
        >
          <div
            className="relative min-h-[360px] transition-transform duration-500"
            style={{
              transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <FlashcardFace
              eyebrow="Frente"
              title="Pense antes de virar"
              content={card.front}
              hint={card.hint}
              tenant={tenant}
            />
            <FlashcardFace
              back
              eyebrow="Resposta"
              title="Compare com sua tentativa"
              content={card.back}
              tenant={tenant}
            />
          </div>
        </button>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              className="border-border-strong hover:bg-surface-2 inline-flex size-10 items-center justify-center rounded-md border bg-white/70"
              aria-label="Cartão anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="border-border-strong hover:bg-surface-2 inline-flex size-10 items-center justify-center rounded-md border bg-white/70"
              aria-label="Próximo cartão"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium"
            style={{ background: tenant.primary, color: tenant.primaryFg }}
          >
            <RotateCcw size={15} />
            Virar cartão
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <section className="rounded-lg border border-white/70 bg-white/72 p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Target size={16} style={{ color: tenant.primary }} />
            Ritmo de revisão
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md bg-success-soft px-2 py-3">
              <div className="text-lg font-semibold">{knownCount}</div>
              <div className="text-text-muted text-[11px]">dominei</div>
            </div>
            <div className="rounded-md bg-warning-soft px-2 py-3">
              <div className="text-lg font-semibold">
                {Object.values(mastery).filter((value) => value === "review").length}
              </div>
              <div className="text-text-muted text-[11px]">revisar</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/70 bg-white/72 p-4 shadow-[var(--shadow-sm)]">
          <div className="text-sm font-semibold">Depois de virar</div>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              disabled={!revealed}
              onClick={() => mark("review")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-warning/30 bg-warning-soft px-3 text-sm font-medium text-warning-fg disabled:opacity-45"
            >
              <RefreshCw size={15} />
              Revisar depois
            </button>
            <button
              type="button"
              disabled={!revealed}
              onClick={() => mark("known")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-success/30 bg-success-soft px-3 text-sm font-medium text-success-fg disabled:opacity-45"
            >
              <Check size={15} />
              Já entendi
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function FlashcardFace({
  eyebrow,
  title,
  content,
  hint,
  tenant,
  back = false,
}: {
  eyebrow: string;
  title: string;
  content: string;
  hint?: string;
  tenant: Props["tenant"];
  back?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex min-h-[360px] flex-col justify-center overflow-hidden rounded-lg border border-white/76 p-7 text-left shadow-[0_22px_60px_rgba(16,24,40,0.14)]",
        back && "[transform:rotateY(180deg)]",
      )}
      style={{
        backfaceVisibility: "hidden",
        background: back
          ? "linear-gradient(135deg, color-mix(in srgb, var(--primary) 88%, #1f2937), color-mix(in srgb, var(--secondary) 45%, var(--primary)))"
          : "linear-gradient(135deg, rgba(255,255,255,0.98), color-mix(in srgb, var(--primary) 9%, #ffffff))",
        color: back ? tenant.primaryFg : "var(--text)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: back ? "rgba(255,255,255,0.38)" : tenant.primary }}
      />
      <div className={cn("text-xs font-semibold tracking-widest uppercase", back ? "text-white/70" : "text-text-faint")}>
        {eyebrow}
      </div>
      <div className="mt-1 text-sm font-medium opacity-80">{title}</div>
      <LlmMarkdown
        className="mt-6 text-2xl font-semibold leading-snug"
        content={content}
        variant="compact"
      />
      {!back && hint && (
        <div className="bg-white/72 text-text-muted mt-7 rounded-md border border-white/70 px-3 py-2 text-sm">
          <span className="font-medium">Pista: </span>
          <LlmMarkdown content={hint} variant="compact" />
        </div>
      )}
      <div className={cn("mt-7 text-xs", back ? "text-white/72" : "text-text-faint")}>
        Toque no cartão para virar
      </div>
    </div>
  );
}

function QuizViewer({
  content,
  tenant,
}: {
  content: Extract<StudentArtifactContent, { kind: "quiz" }>;
  tenant: Props["tenant"];
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const question = content.questions[index] ?? content.questions[0];
  const selected = answers[index];
  const answeredCount = Object.keys(answers).length;
  const score = useMemo(
    () =>
      content.questions.reduce(
        (sum, item, itemIndex) =>
          answers[itemIndex] === item.correctIndex ? sum + 1 : sum,
        0,
      ),
    [answers, content.questions],
  );
  const complete = answeredCount === content.questions.length;
  const progress = (answeredCount / Math.max(content.questions.length, 1)) * 100;

  if (!question) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-text-muted text-sm">
            Questão {index + 1} de {content.questions.length}
          </div>
          <div className="text-text-faint text-xs">
            {answeredCount}/{content.questions.length} respondidas
          </div>
        </div>
        <div className="bg-border/70 mb-4 h-2 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: tenant.primary }}
          />
        </div>

        <div className="rounded-lg border border-white/74 bg-white/74 p-5 shadow-[0_16px_42px_rgba(16,24,40,0.08)]">
          <LlmMarkdown
            className="text-xl font-semibold leading-snug"
            content={question.question}
            variant="compact"
          />
        </div>

        <div className="mt-4 grid gap-2">
          {question.options.map((option, optionIndex) => {
            const answered = selected !== undefined;
            const correct = optionIndex === question.correctIndex;
            const picked = selected === optionIndex;
            return (
              <button
                key={`${option}-${optionIndex}`}
                type="button"
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
                }
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-lg border bg-white/78 px-4 py-3 text-left text-sm shadow-[var(--shadow-xs)] transition-all hover:-translate-y-px hover:bg-white",
                  answered && correct && "border-success bg-success-soft",
                  answered && picked && !correct && "border-danger bg-danger-soft",
                  answered && !picked && !correct && "opacity-72",
                )}
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background: tenant.primarySoft,
                    color: tenant.primary,
                  }}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <LlmMarkdown className="flex-1" content={option} variant="compact" />
                {answered && correct && <CheckCircle2 className="text-success-fg" size={17} />}
                {answered && picked && !correct && <XCircle className="text-danger-fg" size={17} />}
              </button>
            );
          })}
        </div>

        {selected !== undefined && (
          <div
            className={cn(
              "mt-4 rounded-lg border p-4 text-sm leading-relaxed shadow-[var(--shadow-xs)]",
              selected === question.correctIndex
                ? "border-success/30 bg-success-soft"
                : "border-warning/30 bg-warning-soft",
            )}
          >
            <div className="mb-1 font-semibold">
              {selected === question.correctIndex
                ? "Boa, esse caminho está certo."
                : "Quase. Olhe a explicação e tente a próxima."}
            </div>
            <LlmMarkdown content={question.explanation} variant="compact" />
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              setIndex((prev) =>
                prev === 0 ? content.questions.length - 1 : prev - 1,
              )
            }
            className="border-border-strong inline-flex h-10 items-center gap-2 rounded-md border bg-white/70 px-3 text-sm"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % content.questions.length)}
            className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium"
            style={{ background: tenant.primary, color: tenant.primaryFg }}
          >
            Próxima
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <section className="rounded-lg border border-white/70 bg-white/72 p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Trophy size={16} style={{ color: tenant.primary }} />
            Placar
          </div>
          <div className="mt-4 flex items-end gap-2">
            <div className="text-4xl font-semibold">{score}</div>
              <div className="text-text-muted pb-1 text-sm">
                de {content.questions.length}
              </div>
          </div>
          <div className="text-text-muted mt-2 text-xs">
            O placar atualiza a cada resposta.
          </div>
        </section>

        {complete && (
          <section className="rounded-lg border border-success/30 bg-success-soft p-4 shadow-[var(--shadow-sm)]">
            <div className="text-sm font-semibold text-success-fg">
              Sessão concluída
            </div>
            <p className="text-text-muted mt-1 text-xs leading-relaxed">
              Revise as questões que errou e gere outro formato se quiser fixar
              melhor.
            </p>
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setIndex(0);
              }}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-white/76 px-3 text-xs font-medium"
            >
              <RefreshCw size={14} />
              Refazer quiz
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

function SummaryViewer({
  content,
  tenant,
}: {
  content: Extract<StudentArtifactContent, { kind: "summary" }>;
  tenant: Props["tenant"];
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const done = Object.values(checked).filter(Boolean).length;
  const total = content.studySteps.length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)]">
      <div className="rounded-lg border border-white/72 bg-white/76 p-5 shadow-[0_16px_42px_rgba(16,24,40,0.08)]">
        <div className="text-text-faint text-xs font-semibold tracking-widest uppercase">
          Resumo
        </div>
        <LlmMarkdown className="mt-3" content={content.summary} variant="chat" />
        {content.practicePrompt && (
          <div
            className="mt-5 rounded-lg border p-4"
            style={{
              borderColor: "var(--primary-border)",
              background:
                "linear-gradient(135deg, var(--primary-soft), rgba(255,255,255,0.82))",
            }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target size={15} style={{ color: tenant.primary }} />
              Pergunta de treino
            </div>
            <LlmMarkdown
              className="text-text-muted mt-2"
              content={content.practicePrompt}
              variant="compact"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <section className="rounded-lg border border-white/72 bg-white/76 p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Plano de 10 minutos</div>
            <div className="text-text-faint text-xs">
              {done}/{total}
            </div>
          </div>
          <div className="bg-border/70 mt-3 h-2 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: tenant.primary }}
            />
          </div>
          <ol className="mt-4 space-y-2 text-sm">
            {content.studySteps.map((step, stepIndex) => {
              const active = !!checked[stepIndex];
              return (
                <li key={step} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setChecked((prev) => ({
                        ...prev,
                        [stepIndex]: !prev[stepIndex],
                      }))
                    }
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                      active
                        ? "border-success bg-success-soft text-success-fg"
                        : "border-border-strong bg-white/76 text-text-faint",
                    )}
                  >
                    {active ? <Check size={13} /> : stepIndex + 1}
                  </button>
                  <div className={cn(active && "text-text-muted line-through")}>
                    <LlmMarkdown content={step} variant="compact" />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rounded-lg border border-white/72 bg-white/76 p-4 shadow-[var(--shadow-sm)]">
          <div className="text-sm font-semibold">Pontos-chave</div>
          <ul className="mt-3 space-y-2 text-sm">
            {content.keyPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full"
                  style={{ background: tenant.primary }}
                />
                <LlmMarkdown content={point} variant="compact" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function EmptyArtifactState({ tenant }: { tenant: Props["tenant"] }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-white/80 bg-white/54 px-6 text-center shadow-[var(--shadow-sm)]">
      <div
        className="flex size-12 items-center justify-center rounded-lg"
        style={{ background: tenant.primarySoft, color: tenant.primary }}
      >
        <Sparkles size={21} />
      </div>
      <div className="mt-4 text-base font-semibold">
        Escolha um formato e gere seu material
      </div>
      <p className="text-text-muted mt-2 max-w-sm text-sm">
        Use um tema ou a conversa aberta para criar uma revisão curta.
      </p>
    </div>
  );
}

function ArtifactKindIcon({ kind }: { kind: StudentArtifactKind }) {
  if (kind === "flashcards") return <Layers3 size={14} />;
  if (kind === "quiz") return <ClipboardList size={14} />;
  return <BookOpenCheck size={14} />;
}

function kindLabel(kind: StudentArtifactKind): string {
  if (kind === "flashcards") return "Cartões";
  if (kind === "quiz") return "Quiz";
  return "Resumo";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
