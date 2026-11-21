import type { EstadoJogo } from './estado';

export const NIVEL_MAXIMO = 30;

/** XP para passar do nível n ao n+1 (GDD seção 3.2): round(30 × n^1.4 / 5) × 5. */
export function xpParaProximo(n: number): number {
  return Math.round((30 * Math.pow(n, 1.4)) / 5) * 5;
}

/** XP acumulado necessário para chegar ao nível n. */
export function xpAcumuladoNivel(n: number): number {
  let total = 0;
  for (let i = 1; i < n; i++) total += xpParaProximo(i);
  return total;
}

export interface ResultadoXp {
  niveisGanhos: number[]; // níveis alcançados nesta adição
}

/** Soma XP, sobe de nível e paga a recompensa: 50 × novo nível moedas + 1 diamante. */
export function ganharXp(estado: EstadoJogo, xp: number): ResultadoXp {
  estado.xp += xp;
  const niveisGanhos: number[] = [];
  while (estado.nivel < NIVEL_MAXIMO && estado.xp >= xpAcumuladoNivel(estado.nivel + 1)) {
    estado.nivel += 1;
    estado.moedas += 50 * estado.nivel;
    estado.diamantes += 1;
    niveisGanhos.push(estado.nivel);
  }
  return { niveisGanhos };
}
