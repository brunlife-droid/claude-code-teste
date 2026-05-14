/**
 * Mock data portado do protótipo (data.jsx).
 *
 * Em produção, isso vira queries no DB (Bloco G+). Por enquanto serve
 * para construir todas as telas com dados realistas.
 */

import type {
  AlertaProf,
  Aluno,
  ChatMessage,
  Comunicado,
  Escola,
  HabilidadeBNCC,
  IdebPoint,
  IndicadorNexus,
  PrefeituraNexus,
  TrilhaItem,
} from "./types";

export const ESCOLAS_ALFENAS: Escola[] = [
  { id: "e1", nome: "EM Dr. Sebastião Gualberto", alunos: 412, profs: 26, risco: "baixo", ieb: 6.1, regiao: "Centro" },
  { id: "e2", nome: "EM Hélio Bagatini", alunos: 387, profs: 24, risco: "medio", ieb: 5.4, regiao: "Jardim Boa Esperança" },
  { id: "e3", nome: "EM Padre Vitor Coelho", alunos: 296, profs: 19, risco: "baixo", ieb: 6.3, regiao: "Jardim São Lucas" },
  { id: "e4", nome: "EM Senhora de Lourdes", alunos: 268, profs: 18, risco: "alto", ieb: 4.8, regiao: "Capelinha" },
  { id: "e5", nome: "EM Prof. José Marques", alunos: 341, profs: 22, risco: "baixo", ieb: 6.0, regiao: "Jardim São Carlos" },
  { id: "e6", nome: "EM Vereador Roberto Coelho", alunos: 224, profs: 15, risco: "medio", ieb: 5.6, regiao: "Pinheirinho" },
  { id: "e7", nome: "EM Sebastião Gomes", alunos: 198, profs: 14, risco: "baixo", ieb: 6.2, regiao: "Pinheirinho" },
  { id: "e8", nome: "EM Profa. Maria Aparecida", alunos: 312, profs: 21, risco: "medio", ieb: 5.5, regiao: "Vila Teixeira" },
];

export const ALUNOS_7A: Aluno[] = [
  { id: "a1", nome: "João Pedro Silva", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "adequada", acessos: 42, ultimoAcesso: "há 2h", risco: false, foto: "JP" },
  { id: "a2", nome: "Maria Eduarda Costa", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "avancada", acessos: 68, ultimoAcesso: "há 1h", risco: false, foto: "ME" },
  { id: "a3", nome: "Lucas Henrique Souza", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "basica", acessos: 12, ultimoAcesso: "ontem", risco: true, foto: "LH" },
  { id: "a4", nome: "Ana Júlia Ferreira", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "adequada", acessos: 51, ultimoAcesso: "há 3h", risco: false, foto: "AJ" },
  { id: "a5", nome: "Gabriel Oliveira Lima", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "insuficiente", acessos: 5, ultimoAcesso: "há 4 dias", risco: true, foto: "GO" },
  { id: "a6", nome: "Beatriz Almeida Rocha", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "avancada", acessos: 73, ultimoAcesso: "há 30min", risco: false, foto: "BA" },
  { id: "a7", nome: "Rafael Cardoso Pinto", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "adequada", acessos: 38, ultimoAcesso: "há 5h", risco: false, foto: "RC" },
  { id: "a8", nome: "Letícia Barbosa Mendes", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "basica", acessos: 21, ultimoAcesso: "há 2 dias", risco: false, foto: "LB" },
  { id: "a9", nome: "Pedro Henrique Martins", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "adequada", acessos: 44, ultimoAcesso: "há 6h", risco: false, foto: "PH" },
  { id: "a10", nome: "Sophia Ribeiro Carvalho", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "avancada", acessos: 58, ultimoAcesso: "há 1h", risco: false, foto: "SR" },
  { id: "a11", nome: "Davi Lucas Nogueira", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "insuficiente", acessos: 8, ultimoAcesso: "há 1 semana", risco: true, foto: "DL" },
  { id: "a12", nome: "Isabela Gomes Pereira", serie: "7º A", escola: "EM Dr. Sebastião Gualberto", prof: "adequada", acessos: 49, ultimoAcesso: "há 4h", risco: false, foto: "IG" },
];

export const HABILIDADES_BNCC: HabilidadeBNCC[] = [
  { codigo: "EF07MA01", desc: "Resolver e elaborar problemas com números naturais", area: "Matemática" },
  { codigo: "EF07MA04", desc: "Reconhecer frações equivalentes", area: "Matemática" },
  { codigo: "EF07MA08", desc: "Comparar e ordenar números inteiros", area: "Matemática" },
  { codigo: "EF07MA09", desc: "Operações com números racionais (forma decimal)", area: "Matemática" },
  { codigo: "EF07MA12", desc: "Resolver problemas com proporcionalidade direta", area: "Matemática" },
  { codigo: "EF07LP01", desc: "Distinguir diferentes propostas editoriais", area: "Língua Portuguesa" },
  { codigo: "EF07LP04", desc: "Reconhecer características do discurso jornalístico", area: "Língua Portuguesa" },
  { codigo: "EF07LP08", desc: "Identificar efeitos de sentido em textos argumentativos", area: "Língua Portuguesa" },
  { codigo: "EF07LP12", desc: "Reconhecer recursos coesivos", area: "Língua Portuguesa" },
];

export const CHAT_INICIAL: ChatMessage[] = [
  { from: "tutor", text: "Oi, João! Tudo bem? Vi que você fez uma tarefa de frações ontem. Quer continuar ou abrir outra coisa?", hora: "15:32" },
  { from: "user", text: "Oi, profe. Tenho uma dúvida de matemática, é da prova de amanhã 😬", hora: "15:33" },
  { from: "tutor", text: "Bora resolver. Manda a questão por foto, áudio ou escreve aqui — o que for melhor pra você.", hora: "15:33" },
  { from: "user", text: "Tá: Em uma pizza dividida em 8 pedaços, 3 foram comidos. Que fração sobrou?", hora: "15:34" },
  { from: "tutor", text: "Boa! Antes de eu te dar a resposta, deixa eu te perguntar: se a pizza tem 8 pedaços no total, e 3 foram comidos, quantos ainda estão lá?", hora: "15:34" },
  { from: "user", text: "5", hora: "15:35" },
  { from: "tutor", text: "Isso! Agora, como você escreveria isso em forma de fração? Lembra: numerador é a parte, denominador é o total.", hora: "15:35" },
];

export const COMUNICADOS: Comunicado[] = [
  { id: "c1", titulo: "Reunião de pais — sábado 09h", origem: "Escola", autor: "Coord. Sandra", data: "12/05", lido: false, prioridade: "alta" },
  { id: "c2", titulo: "Lista de material complementar — 2º bimestre", origem: "Turma 7º A", autor: "Prof. Ricardo", data: "10/05", lido: true, prioridade: "media" },
  { id: "c3", titulo: "Campanha do agasalho da rede municipal", origem: "Secretaria", autor: "SEMED Alfenas", data: "08/05", lido: true, prioridade: "baixa" },
  { id: "c4", titulo: "Excursão pedagógica ao Inhotim — autorização", origem: "Escola", autor: "Direção", data: "05/05", lido: false, prioridade: "alta" },
  { id: "c5", titulo: "Cronograma de provas bimestrais", origem: "Turma 7º A", autor: "Prof. Ricardo", data: "02/05", lido: true, prioridade: "media" },
];

export const TRILHA: TrilhaItem[] = [
  { area: "Matemática", dominado: 14, total: 22, atual: "Frações equivalentes", proximo: "Razão e proporção", cor: "var(--prof-adequate)" },
  { area: "Língua Portuguesa", dominado: 18, total: 26, atual: "Texto argumentativo", proximo: "Coesão referencial", cor: "var(--prof-advanced)" },
  { area: "Ciências", dominado: 9, total: 20, atual: "Sistema reprodutor", proximo: "Ecossistemas", cor: "var(--prof-basic)" },
  { area: "História", dominado: 11, total: 18, atual: "Brasil Império", proximo: "Revolução Industrial", cor: "var(--prof-adequate)" },
  { area: "Geografia", dominado: 8, total: 17, atual: "Climas do Brasil", proximo: "Regionalizações", cor: "var(--prof-basic)" },
];

export const ALERTAS_PROF: AlertaProf[] = [
  { tipo: "risco", aluno: "Gabriel Oliveira Lima", motivo: "4 dias sem acesso, proficiência caindo em Mat.", urgencia: "alta" },
  { tipo: "risco", aluno: "Davi Lucas Nogueira", motivo: "1 semana sem acesso, último teste 4.2", urgencia: "alta" },
  { tipo: "pendencia", aluno: "7º A", motivo: "12 redações aguardando devolutiva", urgencia: "media" },
  { tipo: "achievement", aluno: "Beatriz Almeida Rocha", motivo: "Atingiu proficiência avançada em LP", urgencia: "baixa" },
];

export const IDEB_SERIE: IdebPoint[] = [
  { ano: 2017, rede: 4.6, meta: 4.4 },
  { ano: 2019, rede: 4.9, meta: 4.7 },
  { ano: 2021, rede: 5.1, meta: 5.0 },
  { ano: 2023, rede: 5.4, meta: 5.3 },
  { ano: 2025, rede: 5.7, meta: 5.5, projecao: true },
];

export const INDICADORES_NEXUS: IndicadorNexus[] = [
  { sigla: "IEP", nome: "Índice de Engajamento Pedagógico", valor: 78, delta: 6, ideal: 80, desc: "% alunos usando ≥3x/semana" },
  { sigla: "IRA", nome: "Índice de Risco de Abandono", valor: 4.2, delta: -1.1, ideal: 3, desc: "% alunos sem acesso há ≥14d", inverso: true },
  { sigla: "TPL", nome: "Taxa de Proficiência por Letramento", valor: 64, delta: 4, ideal: 70, desc: "% atingindo nível adequado/avançado" },
  { sigla: "SRE", nome: "Score de Resposta Emocional", valor: 91, delta: 2, ideal: 85, desc: "Saúde socioemocional via NLP" },
  { sigla: "IEQ", nome: "Índice de Eficiência de Questões", valor: 82, delta: 3, ideal: 80, desc: "Acertos vs. tempo médio por questão" },
];

export const PREFEITURAS_NEXUS: PrefeituraNexus[] = [
  { id: "t1", nome: "Alfenas-MG", alunos: 9420, status: "ativo", mrr: 18840, ultimoLogin: "há 2h", health: "good", proxCobranca: "01/06", uf: "MG" },
  { id: "t2", nome: "Pouso Alegre-MG", alunos: 17840, status: "ativo", mrr: 32200, ultimoLogin: "há 4h", health: "good", proxCobranca: "15/05", uf: "MG" },
  { id: "t3", nome: "Varginha-MG", alunos: 16210, status: "ativo", mrr: 28800, ultimoLogin: "há 1d", health: "warn", proxCobranca: "10/05", uf: "MG" },
  { id: "t4", nome: "Itajubá-MG", alunos: 6890, status: "ativo", mrr: 13900, ultimoLogin: "há 5h", health: "good", proxCobranca: "20/05", uf: "MG" },
  { id: "t5", nome: "Três Corações-MG", alunos: 5120, status: "ativo", mrr: 10240, ultimoLogin: "há 3h", health: "good", proxCobranca: "28/05", uf: "MG" },
  { id: "t6", nome: "Lavras-MG", alunos: 8410, status: "trial", mrr: 0, ultimoLogin: "há 8d", health: "risk", proxCobranca: "—", uf: "MG" },
  { id: "t7", nome: "Boa Esperança-MG", alunos: 1980, status: "ativo", mrr: 4200, ultimoLogin: "há 6h", health: "good", proxCobranca: "05/06", uf: "MG" },
  { id: "t8", nome: "Machado-MG", alunos: 3210, status: "onboarding", mrr: 0, ultimoLogin: "nunca", health: "pending", proxCobranca: "—", uf: "MG" },
];

/** Heatmap aluno × habilidade — deterministic pseudo-random */
export function buildHeatmap() {
  const habs = ["EF07MA01", "EF07MA04", "EF07MA08", "EF07MA09", "EF07MA12", "EF07MA15"];
  const data = ALUNOS_7A.slice(0, 9).map((al) => ({
    aluno: al.foto,
    nome: al.nome,
    cells: habs.map((h, j) => {
      const seed = (al.id.charCodeAt(1) * 13 + j * 31) % 100;
      return { hab: h, score: Math.max(0.2, Math.min(0.98, seed / 100)) };
    }),
  }));
  return { habs, data };
}
