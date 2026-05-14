export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type LayerKey = "aluno" | "professor" | "secretaria" | "admin";

export type LayerConfig = {
  key: LayerKey;
  label: string;
  intro?: string;
  user?: { name: string; role: string };
  groups: NavGroup[];
};

export const LAYERS: Record<LayerKey, LayerConfig> = {
  aluno: {
    key: "aluno",
    label: "Aluno",
    intro: "PWA mobile-first. 80% do tráfego é Android barato + WhatsApp.",
    user: { name: "João Pedro Silva", role: "7º A · EM Dr. Sebastião Gualberto" },
    groups: [
      {
        title: "Telas",
        items: [
          { id: "A1", label: "Onboarding", href: "/aluno/onboarding" },
          { id: "A2", label: "Chat principal", href: "/aluno/chat" },
          { id: "A3", label: "Histórico", href: "/aluno/historico" },
          { id: "A4", label: "Trilha de aprendizagem", href: "/aluno/trilha" },
          { id: "A5", label: "Mural de recados", href: "/aluno/mural" },
          { id: "A6", label: "Acessibilidade", href: "/aluno/acessibilidade" },
        ],
      },
    ],
  },
  professor: {
    key: "professor",
    label: "Professor",
    intro: "Densidade média, foco em eficiência docente.",
    user: { name: "Ricardo Marques", role: "Mat. · 7º A, 7º B, 8º A" },
    groups: [
      {
        title: "Cotidiano",
        items: [
          { id: "P1", label: "Dashboard", href: "/professor" },
          { id: "P2", label: "Copiloto de plano", href: "/professor/copiloto" },
          { id: "P3", label: "Correção de redação", href: "/professor/correcao" },
          { id: "P4", label: "Gerador de prova", href: "/professor/provas" },
        ],
      },
      {
        title: "Turma",
        items: [
          { id: "P5", label: "Dashboard da turma", href: "/professor/turma" },
          { id: "P6", label: "Perfil de aluno", href: "/professor/alunos" },
          { id: "P7", label: "Biblioteca da rede", href: "/professor/biblioteca" },
          { id: "P8", label: "Diário pedagógico", href: "/professor/diario" },
        ],
      },
    ],
  },
  secretaria: {
    key: "secretaria",
    label: "Secretaria",
    intro: "Dashboards estratégicos. Comunicação com prefeito, vereadores, imprensa.",
    user: { name: "Cláudia Resende", role: "Secretária Municipal de Educação" },
    groups: [
      {
        title: "Visão da rede",
        items: [
          { id: "S1", label: "Dashboard estratégico", href: "/secretaria" },
          { id: "S2", label: "Drill · Escola", href: "/secretaria/escolas" },
          { id: "S3", label: "Drill · Turma", href: "/secretaria/turmas" },
          { id: "S4", label: "Drill · Aluno", href: "/secretaria/alunos" },
        ],
      },
      {
        title: "Comunicação",
        items: [
          { id: "S5", label: "Relatório mensal", href: "/secretaria/relatorio" },
          { id: "S6", label: "Mural", href: "/secretaria/mural" },
        ],
      },
      {
        title: "Administração",
        items: [
          { id: "S7", label: "Rede (escolas, turmas)", href: "/secretaria/rede" },
          { id: "S8", label: "Identidade visual", href: "/secretaria/identidade" },
          { id: "S9", label: "Usuários internos", href: "/secretaria/usuarios" },
        ],
      },
    ],
  },
  admin: {
    key: "admin",
    label: "Admin Nexus",
    intro: "Interno do time Nexus. Multi-tenant operations.",
    user: { name: "Bruno Andrade", role: "CEO · Nexus Education" },
    groups: [
      {
        title: "Negócio",
        items: [
          { id: "N1", label: "Dashboard de negócio", href: "/admin" },
          { id: "N2", label: "Prefeituras", href: "/admin/prefeituras" },
          { id: "N3", label: "Onboarding (wizard)", href: "/admin/onboarding" },
          { id: "N4", label: "Perfil da prefeitura", href: "/admin/prefeituras/exemplo" },
        ],
      },
      {
        title: "Plataforma",
        items: [
          { id: "N5", label: "Base de conhecimento", href: "/admin/base" },
          { id: "N6", label: "Financeiro", href: "/admin/financeiro" },
          { id: "N7", label: "Observabilidade", href: "/admin/observabilidade" },
          { id: "N8", label: "Configurações globais", href: "/admin/configuracoes" },
          { id: "N9", label: "Suporte/CSM", href: "/admin/suporte" },
        ],
      },
    ],
  },
};
