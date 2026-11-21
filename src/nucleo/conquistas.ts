import type { Evento } from './acoes';
import { ganharXp } from './economia';
import type { EstadoJogo } from './estado';

// Conquistas permanentes com 3 graus: bronze, prata e ouro (GDD seção 8).
// Aqui entram as que o jogo já mede; as de vizinhos e decoração entram com esses sistemas.

export interface Estatisticas {
  colheitas: number;
  arados: number;
  coletas: number;
  moedasVendidas: number;
  culturasColhidas: string[]; // tipos diferentes já colhidos
}

export const estatisticasIniciais = (): Estatisticas => ({ colheitas: 0, arados: 0, coletas: 0, moedasVendidas: 0, culturasColhidas: [] });

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  metas: [number, number, number]; // bronze, prata, ouro
  valor: (e: EstadoJogo) => number;
}

export const CONQUISTAS: Conquista[] = [
  { id: 'colheitas', nome: 'Mão na Terra', descricao: 'Colheitas feitas', metas: [50, 500, 5000], valor: (e) => e.estatisticas?.colheitas ?? 0 },
  { id: 'arados', nome: 'Arador Incansável', descricao: 'Canteiros arados', metas: [100, 1000, 10000], valor: (e) => e.estatisticas?.arados ?? 0 },
  { id: 'vendas', nome: 'Rico de Verdade', descricao: 'Moedas ganhas vendendo', metas: [5000, 50000, 500000], valor: (e) => e.estatisticas?.moedasVendidas ?? 0 },
  { id: 'coletas', nome: 'Criador', descricao: 'Produtos de animais coletados', metas: [20, 200, 2000], valor: (e) => e.estatisticas?.coletas ?? 0 },
  { id: 'tipos', nome: 'Colecionador', descricao: 'Tipos de cultura colhidos', metas: [4, 8, 12], valor: (e) => e.estatisticas?.culturasColhidas.length ?? 0 },
  { id: 'nivel', nome: 'Experiente', descricao: 'Nível alcançado', metas: [5, 15, 30], valor: (e) => e.nivel },
];

// Recompensa por grau: diamantes (1, 2, 3 — GDD) e moedas.
export const RECOMPENSA_GRAU = [
  { diamantes: 1, moedas: 100 },
  { diamantes: 2, moedas: 500 },
  { diamantes: 3, moedas: 2000 },
] as const;
export const NOME_GRAU = ['Bronze', 'Prata', 'Ouro'] as const;

/** Grau já atingido (0 a 3) de uma conquista. */
export function grauAtingido(c: Conquista, estado: EstadoJogo): number {
  const v = c.valor(estado);
  return c.metas.filter((m) => v >= m).length;
}

export function registrarEstatisticas(estado: EstadoJogo, eventos: Evento[]): EstadoJogo {
  const base = estado.estatisticas ?? estatisticasIniciais();
  const s: Estatisticas = { ...base, culturasColhidas: [...base.culturasColhidas] };
  let mudou = false;
  for (const e of eventos) {
    if (e.tipo === 'colheu') {
      s.colheitas += 1;
      if (!s.culturasColhidas.includes(e.cultura)) s.culturasColhidas.push(e.cultura);
      mudou = true;
    } else if (e.tipo === 'arou') {
      s.arados += 1;
      mudou = true;
    } else if (e.tipo === 'coletou') {
      s.coletas += 1;
      mudou = true;
    } else if (e.tipo === 'vendeu') {
      s.moedasVendidas += e.moedas;
      mudou = true;
    }
  }
  return mudou ? { ...estado, estatisticas: s } : estado;
}

export type ResultadoConquista = { ok: true; estado: EstadoJogo; niveis: number[] } | { ok: false; erro: string };

/** Resgata o próximo grau pendente de uma conquista. */
export function resgatarConquista(antigo: EstadoJogo, id: string): ResultadoConquista {
  const c = CONQUISTAS.find((x) => x.id === id);
  if (!c) return { ok: false, erro: 'Conquista desconhecida.' };
  const resgatado = antigo.conquistas?.[id] ?? 0;
  if (grauAtingido(c, antigo) <= resgatado) return { ok: false, erro: 'Nada para resgatar ainda.' };
  const r = RECOMPENSA_GRAU[resgatado]!;
  const estado = structuredClone(antigo);
  estado.conquistas = { ...(estado.conquistas ?? {}), [id]: resgatado + 1 };
  estado.moedas += r.moedas;
  estado.diamantes += r.diamantes;
  return { ok: true, estado, niveis: ganharXp(estado, 0).niveisGanhos };
}

export const temConquistaPendente = (e: EstadoJogo): boolean => CONQUISTAS.some((c) => grauAtingido(c, e) > (e.conquistas?.[c.id] ?? 0));
