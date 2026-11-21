import { jogo } from './jogo';

// Sons placeholder gerados na hora (sem arquivos). Só tocam depois do primeiro toque
// (exigência dos navegadores) e respeitam o botão de silenciar.
let ctx: AudioContext | null = null;

function contexto(): AudioContext | null {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function nota(freq: number, inicio: number, dur: number, tipo: OscillatorType = 'sine', vol = 0.15): void {
  const c = contexto();
  if (!c || !jogo.estado.config.som) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, c.currentTime + inicio);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + inicio + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + inicio);
  o.stop(c.currentTime + inicio + dur);
}

export const som = {
  clique: () => nota(520, 0, 0.06, 'square', 0.06),
  arar: () => nota(160, 0, 0.12, 'triangle'),
  plantar: () => {
    nota(330, 0, 0.08);
    nota(440, 0.07, 0.1);
  },
  colher: () => {
    nota(523, 0, 0.08);
    nota(659, 0.07, 0.08);
    nota(784, 0.14, 0.12);
  },
  moeda: () => {
    nota(988, 0, 0.07, 'square', 0.08);
    nota(1319, 0.07, 0.15, 'square', 0.08);
  },
  nivel: () => [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.1, 0.2, 'triangle', 0.18)),
  erro: () => nota(140, 0, 0.15, 'sawtooth', 0.08),
};
