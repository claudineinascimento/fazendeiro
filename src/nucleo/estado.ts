import type { Estatisticas } from './conquistas';
import type { EstadoMissoes } from './missoes';
import { AREA_INICIAL, MAPA, VERSAO_SAVE } from '../config';
import { culturaPorId } from '../dados';

// Um canteiro arado. Se `cultura` for null, está arado e vazio.
export interface Canteiro {
  cultura: string | null;
  plantadoEm: number | null; // ms, hora do jogo (Date.now() + offset do servidor)
}

// Um animal colocado na fazenda. Produz em ciclo contínuo (timestamp do último ciclo).
export interface AnimalFazenda {
  tipo: string;
  x: number;
  y: number;
  cicloDesde: number; // ms: início do ciclo atual
}

export interface EstadoJogo {
  versao: number;
  moedas: number;
  diamantes: number;
  xp: number; // XP acumulado total
  nivel: number;
  area: number; // lado da área utilizável (10, 12, 15 ou 20)
  canteiros: Record<string, Canteiro>; // chave "x,y"
  celeiro: Record<string, number>; // id do item (cultura ou produto) -> quantidade
  animais: Record<string, AnimalFazenda>; // chave "x,y"
  estatisticas?: Estatisticas; // contadores das conquistas
  conquistas?: Record<string, number>; // id -> grau já resgatado (0 a 3)
  missoes?: EstadoMissoes; // sorteadas ao abrir o jogo, a cada dia
  ultimaCultura: string | null;
  config: { som: boolean };
}

export const chave = (x: number, y: number): string => `${x},${y}`;

/** Limites (inclusivos) da área utilizável, centralizada no mapa. */
export function limitesArea(area: number): { min: number; max: number } {
  const min = Math.floor((MAPA - area) / 2);
  return { min, max: min + area - 1 };
}

export function dentroDaArea(estado: EstadoJogo, x: number, y: number): boolean {
  const { min, max } = limitesArea(estado.area);
  return x >= min && x <= max && y >= min && y <= max;
}

/** Estado de um jogador novo: 200 moedas, 5 diamantes, 6 canteiros com alface pronta (tutorial). */
export function estadoInicial(agora: number): EstadoJogo {
  const { min } = limitesArea(AREA_INICIAL);
  const alface = culturaPorId('alface');
  const plantadoEm = agora - (alface ? alface.tempoSegundos * 1000 : 0);
  const canteiros: Record<string, Canteiro> = {};
  for (let i = 0; i < 6; i++) {
    canteiros[chave(min + 3 + (i % 3), min + 4 + Math.floor(i / 3))] = { cultura: 'alface', plantadoEm };
  }
  return {
    versao: VERSAO_SAVE,
    moedas: 200,
    diamantes: 5,
    xp: 0,
    nivel: 1,
    area: AREA_INICIAL,
    canteiros,
    celeiro: {},
    animais: {},
    ultimaCultura: 'rabanete',
    config: { som: true },
  };
}
