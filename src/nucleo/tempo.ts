import type { Cultura } from '../dados/tipos';
import type { Canteiro } from './estado';

// Relógio do jogo. Na Fase 3 o offset passa a vir do servidor (Firestore).
let offsetMs = 0;
export const definirOffset = (ms: number): void => {
  offsetMs = ms;
};
export const agora = (): number => Date.now() + offsetMs;

/** Fração de crescimento de 0 a 1, calculada só por timestamps (vale com o jogo fechado). */
export function progresso(c: Canteiro, cultura: Cultura, agoraMs: number): number {
  if (!c.cultura || c.plantadoEm === null) return 0;
  const total = cultura.tempoSegundos * 1000;
  return Math.min(1, Math.max(0, (agoraMs - c.plantadoEm) / total));
}

/** Estágio visual: 0 semente, 1 broto (>=1/3), 2 crescendo (>=2/3), 3 pronto. */
export function estagio(p: number): 0 | 1 | 2 | 3 {
  if (p >= 1) return 3;
  if (p >= 2 / 3) return 2;
  if (p >= 1 / 3) return 1;
  return 0;
}

export function restanteMs(c: Canteiro, cultura: Cultura, agoraMs: number): number {
  if (c.plantadoEm === null) return 0;
  return Math.max(0, c.plantadoEm + cultura.tempoSegundos * 1000 - agoraMs);
}

/** "1h 05min", "4min 10s" ou "30s". */
export function formatarDuracao(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  if (m > 0) return `${m}min ${String(seg).padStart(2, '0')}s`;
  return `${seg}s`;
}
