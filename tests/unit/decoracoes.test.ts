import { describe, it, expect } from 'vitest';
import { estadoInicial, limitesArea } from '../../src/nucleo/estado';
import { colocarDecoracao, guardarDecoracao, arar, comprarAnimal } from '../../src/nucleo/acoes';

const T0 = 1_000_000_000_000;
const { min } = limitesArea(10);

describe('decoração', () => {
  it('compra e coloca com moedas, dá 1 XP e bloqueia o tile', () => {
    const r = colocarDecoracao(estadoInicial(T0), min, min, 'cerca');
    if (!r.ok) throw new Error(r.erro);
    expect(r.estado.moedas).toBe(190);
    expect(r.estado.xp).toBe(1);
    expect(arar(r.estado, min, min).ok).toBe(false);
    expect(colocarDecoracao(r.estado, min, min, 'cerca').ok).toBe(false);
    expect(comprarAnimal({ ...r.estado, nivel: 3 }, min, min, 'galinha', T0).ok).toBe(false);
  });

  it('respeita nível e saldo; diamantes pagam a fonte', () => {
    expect(colocarDecoracao(estadoInicial(T0), min, min, 'poco').ok).toBe(false); // nível 8
    const r = colocarDecoracao(estadoInicial(T0), min, min, 'fonte');
    if (!r.ok) throw new Error(r.erro);
    expect(r.estado.diamantes).toBe(2);
    expect(colocarDecoracao({ ...estadoInicial(T0), diamantes: 2 }, min, min, 'fonte').ok).toBe(false);
  });

  it('guardar devolve ao inventário e recolocar é grátis e sem XP', () => {
    const c = colocarDecoracao(estadoInicial(T0), min, min, 'cerca');
    if (!c.ok) throw new Error();
    const g = guardarDecoracao(c.estado, min, min);
    if (!g.ok) throw new Error();
    expect(g.estado.guardadas).toEqual({ cerca: 1 });
    const r = colocarDecoracao(g.estado, min + 1, min, 'cerca');
    if (!r.ok) throw new Error();
    expect(r.estado.moedas).toBe(g.estado.moedas);
    expect(r.estado.xp).toBe(g.estado.xp);
    expect(r.estado.guardadas).toEqual({});
  });
});
