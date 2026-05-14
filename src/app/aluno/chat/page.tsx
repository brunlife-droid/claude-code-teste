import {
  ArrowUp,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Sparkles,
  Tag,
  Volume2,
} from "lucide-react";
import { Chip } from "@/components/ui";
import { getCurrentTenant } from "@/lib/tenants/server";
import { CHAT_INICIAL } from "@/lib/mocks";

export default async function ChatPage() {
  const tenant = await getCurrentTenant();
  const tutorInitial = tenant.tutorName[0];

  return (
    <div className="flex h-full flex-col">
      {/* Header da conversa */}
      <header className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-6">
        <div
          className="relative flex size-8 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            background: tenant.primarySoft,
            color: tenant.primary,
            fontFamily: "var(--font-serif)",
          }}
        >
          {tutorInitial}
          <div className="bg-success border-surface absolute -right-px -bottom-px size-2.5 rounded-full border-2" />
        </div>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold">{tenant.tutorName}</div>
          <div className="text-text-faint text-[11.5px]">
            tutora · {tenant.short.toLowerCase()}
          </div>
        </div>
        <div className="flex-1" />
        <div
          className="text-text-faint hidden items-center gap-1.5 text-[11.5px] sm:flex"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Tag size={11} />
          EF07MA04 · Frações equivalentes
        </div>
      </header>

      {/* Área da conversa (scrollable) */}
      <div className="scroll-thin flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[760px] flex-col gap-6 px-6 py-8">
          {/* Separador de data */}
          <div className="text-text-faint flex items-center justify-center gap-2 text-[11.5px]">
            <span className="bg-border h-px flex-1" />
            <span>Hoje · 15:32</span>
            <span className="bg-border h-px flex-1" />
          </div>

          {CHAT_INICIAL.map((m, i) => (
            <Message
              key={i}
              from={m.from}
              text={m.text}
              tutorInitial={tutorInitial}
              tutorPrimary={tenant.primary}
              tutorSoft={tenant.primarySoft}
              hora={m.hora}
            />
          ))}

          {/* Sugestões de continuação (estilo Claude) */}
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip className="hover:bg-surface-3 cursor-pointer">
              <Sparkles size={11} style={{ color: tenant.primary }} />
              Explicar de outro jeito
            </Chip>
            <Chip className="hover:bg-surface-3 cursor-pointer">Me dá um exemplo</Chip>
            <Chip className="hover:bg-surface-3 cursor-pointer">
              <Volume2 size={11} />
              Ouvir em áudio
            </Chip>
          </div>
        </div>
      </div>

      {/* Input fixo no rodapé */}
      <div className="border-border border-t px-6 py-4">
        <div className="mx-auto max-w-[760px]">
          <div
            className="bg-surface border-border-strong focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-soft)] flex items-end gap-2 rounded-2xl border p-3 transition-all"
          >
            <button
              type="button"
              aria-label="Anexar"
              className="text-text-muted hover:bg-surface-2 shrink-0 rounded-md p-2 transition-colors"
            >
              <Paperclip size={18} />
            </button>
            <button
              type="button"
              aria-label="Tirar foto"
              className="text-text-muted hover:bg-surface-2 shrink-0 rounded-md p-2 transition-colors"
            >
              <ImageIcon size={18} />
            </button>

            <div
              className="text-text-muted flex-1 self-center px-2 py-2 text-[14.5px] leading-tight"
              role="textbox"
              tabIndex={0}
            >
              Pergunte sobre matéria, mande foto da questão ou um áudio…
            </div>

            <button
              type="button"
              aria-label="Gravar áudio"
              className="text-text-muted hover:bg-surface-2 shrink-0 rounded-md p-2 transition-colors"
            >
              <Mic size={18} />
            </button>
            <button
              type="button"
              aria-label="Enviar"
              className="shrink-0 rounded-md p-2 transition-colors"
              style={{
                background: tenant.primary,
                color: tenant.primaryFg,
              }}
            >
              <ArrowUp size={18} />
            </button>
          </div>
          <div className="text-text-faint mt-2 text-center text-[11px]">
            {tenant.tutorName} ensina pelo método socrático — guia o raciocínio
            sem entregar respostas prontas.
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({
  from,
  text,
  tutorInitial,
  tutorPrimary,
  tutorSoft,
  hora,
}: {
  from: "user" | "tutor";
  text: string;
  tutorInitial: string;
  tutorPrimary: string;
  tutorSoft: string;
  hora: string;
}) {
  if (from === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-surface-2 max-w-[80%] rounded-2xl rounded-tr-md px-4 py-3 text-[15px] leading-relaxed">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        style={{
          background: tutorSoft,
          color: tutorPrimary,
          fontFamily: "var(--font-serif)",
        }}
      >
        {tutorInitial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] leading-relaxed">{text}</div>
        <div className="text-text-faint mt-1.5 text-[11px]">{hora}</div>
      </div>
    </div>
  );
}
