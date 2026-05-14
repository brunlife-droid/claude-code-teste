/**
 * Tipos do domínio Nexus Education.
 *
 * Estes tipos serão a base do schema Drizzle no Bloco G. Por enquanto
 * estão aqui para tipar mocks; depois viram colunas das tabelas reais.
 */

export type ProficiencyLevel =
  | "avancada"
  | "adequada"
  | "basica"
  | "insuficiente";

export type RiskLevel = "baixo" | "medio" | "alto";

export type TenantHealth = "good" | "warn" | "risk" | "pending";

export type TenantStatus = "ativo" | "trial" | "onboarding";

export interface Escola {
  id: string;
  nome: string;
  alunos: number;
  profs: number;
  risco: RiskLevel;
  ieb: number;
  regiao: string;
}

export interface Aluno {
  id: string;
  nome: string;
  serie: string;
  escola: string;
  prof: ProficiencyLevel;
  acessos: number;
  ultimoAcesso: string;
  risco: boolean;
  foto: string; // iniciais
}

export interface HabilidadeBNCC {
  codigo: string;
  desc: string;
  area: string;
}

export interface ChatMessage {
  from: "user" | "tutor";
  text: string;
  hora: string;
}

export interface Comunicado {
  id: string;
  titulo: string;
  origem: "Secretaria" | "Escola" | "Turma 7º A";
  autor: string;
  data: string;
  lido: boolean;
  prioridade: "alta" | "media" | "baixa";
}

export interface TrilhaItem {
  area: string;
  dominado: number;
  total: number;
  atual: string;
  proximo: string;
  cor: string;
}

export type AlertaProf =
  | { tipo: "risco"; aluno: string; motivo: string; urgencia: "alta" | "media" | "baixa" }
  | { tipo: "pendencia"; aluno: string; motivo: string; urgencia: "alta" | "media" | "baixa" }
  | { tipo: "achievement"; aluno: string; motivo: string; urgencia: "alta" | "media" | "baixa" };

export interface IdebPoint {
  ano: number;
  rede: number;
  meta: number;
  projecao?: boolean;
}

export interface IndicadorNexus {
  sigla: string;
  nome: string;
  valor: number;
  delta: number;
  ideal: number;
  desc: string;
  inverso?: boolean;
}

export interface PrefeituraNexus {
  id: string;
  nome: string;
  alunos: number;
  status: TenantStatus;
  mrr: number;
  ultimoLogin: string;
  health: TenantHealth;
  proxCobranca: string;
  uf: string;
}
