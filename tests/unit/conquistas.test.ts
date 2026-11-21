import { describe, it, expect } from 'vitest';
import { estadoInicial } from '../../src/nucleo/estado';
import { CONQUISTAS, grauAtingido, registrarEstatisticas, resgatarConquista, temConquistaPendente } from '../../src/nucleo/conquistas';

const colheu = (cultura: string) => ({ tipo: 'colheu' as const, x: 0, y: 0, cultura, xp: 0 });

describe('conquistas', () => {
  it('conta colheitas e tipos diferentes', () => {
    let e = estadoInicial(0);
    e = registrarEstatisticas(e, [colheu('alface'), colheu('alface'), colheu('milho')]);
    expect(e.estatisticas!.colheitas).toBe(3);
    expect(e.estatisticas!.culturasColhidas).toEqual(['alface', 'milho']);
  });

  it('bronze com 50 colheitas e resgate paga 1 diamante, uma vez só', () => {
    let e = estadoInicial(0);
    e = registrarEstatisticas(e, Array.from({ length: 50 }, () => colheu('alface')));
    const c = CONQUISTAS.find((x) => x.id === 'colheitas')!;
    expect(grauAtingido(c, e)).toBe(1);
    expect(temConquistaPendente(e)).toBe(true);
    const r = resgatarConquista(e, 'colheitas');
    if (!r.ok) throw new Error(r.erro);
    expect(r.estado.diamantes).toBe(e.diamantes + 1);
    expect(r.estado.moedas).toBe(e.moedas + 100);
    expect(resgatarConquista(r.estado, 'colheitas').ok).toBe(false);
  });

  it('conquista de nível usa o nível atual', () => {
    const e = { ...estadoInicial(0), nivel: 5 };
    expect(grauAtingido(CONQUISTAS.find((x) => x.id === 'nivel')!, e)).toBe(1);
  });
});
