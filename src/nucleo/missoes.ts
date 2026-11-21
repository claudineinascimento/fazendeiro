import type { Evento } from './acoes';
import { ganharXp } from './economia';
import type { EstadoJogo } from './estado';

// Missões diárias (GDD seção 7): 3 por dia, renovam à meia-noite de Brasília (UTC−3).
// Aqui entram as missões que o protótipo já consegue medir; as sociais entram com os vizinhos.

export type TipoMissao = 'colher' | 'arar' | 'coletar' | 'vender';

export interface MissaoAtiva {
  tipo: TipoMissao;
  alvo: number;
  progresso: number;
  moedas: number;
  xp: number;
  resgatada: boolean;
}

export interface EstadoMissoes {
  dia: string; // "AAAA-MM-DD" no horário de Brasília
  lista: MissaoAtiva[];
  bonusResgatado: boolean;
}

export const BONUS_DIARIO = { moedas: 100, diamantes: 1 };

interface Modelo {
  tipo: TipoMissao;
  base: number;
  moedas: number;
  xp: number;
  texto: (alvo: number) => string;
}

// Banco inicial. alvo = round(base × (1 + nível/10)).
export const MODELOS: Modelo[] = [
  { tipo: 'colher', base: 10, moedas: 50, xp: 10, texto: (n) => `Colha ${n} culturas` },
  { tipo: 'arar', base: 10, moedas: 30, xp: 5, texto: (n) => `Are ${n} canteiros` },
  { tipo: 'coletar', base: 3, moedas: 60, xp: 10, texto: (n) => `Colete ${n} produtos de animais` },
  { tipo: 'vender', base: 200, moedas: 50, xp: 10, texto: (n) => `Venda produtos somando ${n} moedas` },
];

export const textoMissao = (m: MissaoAtiva): string => MODELOS.find((x) => x.tipo === m.tipo)!.texto(m.alvo);

/** Dia (AAAA-MM-DD) no horário de Brasília para um instante em ms. */
export function diaBrasilia(ms: number): string {
  return new Date(ms - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

// Gerador pseudoaleatório determinístico: o mesmo dia sorteia as mesmas missões.
function semente(texto: string): () => number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Sorteia 3 missões distintas. Sem animais ainda (nível < 3), "coletar" fica de fora. */
export function sortearMissoes(dia: string, nivel: number): MissaoAtiva[] {
  const rnd = semente(`${dia}:${nivel}`);
  const banco = MODELOS.filter((m) => m.tipo !== 'coletar' || nivel >= 3);
  const lista: MissaoAtiva[] = [];
  while (lista.length < 3 && banco.length) {
    const m = banco.splice(Math.floor(rnd() * banco.length), 1)[0]!;
    lista.push({ tipo: m.tipo, alvo: Math.max(1, Math.round(m.base * (1 + nivel / 10))), progresso: 0, moedas: m.moedas, xp: m.xp, resgatada: false });
  }
  return lista;
}

/** Garante as missões do dia atual (renova na virada do dia). */
export function garantirMissoes(estado: EstadoJogo, agoraMs: number): EstadoJogo {
  const dia = diaBrasilia(agoraMs);
  if (estado.missoes?.dia === dia) return estado;
  return { ...estado, missoes: { dia, lista: sortearMissoes(dia, estado.nivel), bonusResgatado: false } };
}

/** Atualiza o progresso das missões com os eventos de uma ação. */
export function registrarEventos(estado: EstadoJogo, eventos: Evento[]): EstadoJogo {
  if (!estado.missoes) return estado;
  const lista = estado.missoes.lista.map((m) => {
    let soma = 0;
    for (const e of eventos) {
      if (m.tipo === 'colher' && e.tipo === 'colheu') soma += 1;
      if (m.tipo === 'arar' && e.tipo === 'arou') soma += 1;
      if (m.tipo === 'coletar' && e.tipo === 'coletou') soma += 1;
      if (m.tipo === 'vender' && e.tipo === 'vendeu') soma += e.moedas;
    }
    return soma ? { ...m, progresso: Math.min(m.alvo, m.progresso + soma) } : m;
  });
  return { ...estado, missoes: { ...estado.missoes, lista } };
}

export type ResultadoMissao = { ok: true; estado: EstadoJogo; niveis: number[] } | { ok: false; erro: string };

export function resgatarMissao(antigo: EstadoJogo, indice: number): ResultadoMissao {
  const m = antigo.missoes?.lista[indice];
  if (!m) return { ok: false, erro: 'Missão não encontrada.' };
  if (m.resgatada) return { ok: false, erro: 'Recompensa já resgatada.' };
  if (m.progresso < m.alvo) return { ok: false, erro: 'Missão ainda não concluída.' };
  const estado = structuredClone(antigo);
  estado.missoes!.lista[indice]!.resgatada = true;
  estado.moedas += m.moedas;
  return { ok: true, estado, niveis: ganharXp(estado, m.xp).niveisGanhos };
}

/** Bônus de completar as 3 missões: 1 diamante + 100 moedas. */
export function resgatarBonus(antigo: EstadoJogo): ResultadoMissao {
  const ms = antigo.missoes;
  if (!ms || ms.lista.length === 0 || !ms.lista.every((m) => m.resgatada)) return { ok: false, erro: 'Resgate as 3 missões primeiro.' };
  if (ms.bonusResgatado) return { ok: false, erro: 'Bônus já resgatado hoje.' };
  const estado = structuredClone(antigo);
  estado.missoes!.bonusResgatado = true;
  estado.moedas += BONUS_DIARIO.moedas;
  estado.diamantes += BONUS_DIARIO.diamantes;
  return { ok: true, estado, niveis: [] };
}
