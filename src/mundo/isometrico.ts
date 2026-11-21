import { TILE_A, TILE_L } from '../config';

// Conversões entre grade (gx, gy) e coordenadas do mundo (px). Projeção 2:1.
// Retorna o CENTRO do losango do tile.
export function isoParaTela(gx: number, gy: number): { x: number; y: number } {
  return {
    x: ((gx - gy) * TILE_L) / 2,
    y: ((gx + gy) * TILE_A) / 2 + TILE_A / 2,
  };
}

/** Converte um ponto do mundo no tile (gx, gy) que contém o ponto (área do losango). */
export function telaParaGrade(tx: number, ty: number): { x: number; y: number } {
  const a = tx / (TILE_L / 2); // = gx - gy
  const b = (ty - TILE_A / 2) / (TILE_A / 2); // = gx + gy
  // o centro do tile fica em (gx, gy); somar 0,5 centraliza o arredondamento
  return { x: Math.floor((a + b) / 2 + 0.5), y: Math.floor((b - a) / 2 + 0.5) };
}

/** Profundidade para ordenar sprites: (x + y) × 10 + camada (0 chão, 1 objeto, 2 efeitos). */
export const profundidade = (gx: number, gy: number, camada: number): number => (gx + gy) * 10 + camada;
