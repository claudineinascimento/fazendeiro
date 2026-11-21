import { describe, it, expect } from 'vitest';
import { estadoInicial, limitesArea, chave } from '../../src/nucleo/estado';
import { comprarAnimal, coletar, tocar, arar, vender } from '../../src/nucleo/acoes';

const T0 = 1_000_000_000_000;
const { min } = limitesArea(10);
const nivel3 = () => ({ ...estadoInicial(T0), nivel: 3, moedas: 1000 });

describe('animais', () => {
  it('galinha exige nível 3 e 150 moedas', () => {
    expect(comprarAnimal(estadoInicial(T0), min, min, 'galinha', T0).ok).toBe(false);
    const r = comprarAnimal(nivel3(), min, min, 'galinha', T0);
    expect(r.ok && r.estado.moedas).toBe(850);
  });

  it('não coloca animal sobre canteiro, outro animal ou fora da área', () => {
    const e = nivel3();
    const [k] = Object.keys(e.canteiros);
    const [x, y] = k!.split(',').map(Number);
    expect(comprarAnimal(e, x!, y!, 'galinha', T0).ok).toBe(false);
    expect(comprarAnimal(e, 0, 0, 'galinha', T0).ok).toBe(false);
    const r = comprarAnimal(e, min, min, 'galinha', T0);
    if (!r.ok) throw new Error();
    expect(comprarAnimal(r.estado, min, min, 'galinha', T0).ok).toBe(false);
    expect(arar(r.estado, min, min).ok).toBe(false);
  });

  it('coleta só após o ciclo, reinicia o ciclo e rende produto e XP', () => {
    const r = comprarAnimal(nivel3(), min, min, 'galinha', T0);
    if (!r.ok) throw new Error();
    expect(coletar(r.estado, min, min, T0 + 29 * 60_000).ok).toBe(false);
    const c = coletar(r.estado, min, min, T0 + 30 * 60_000);
    if (!c.ok) throw new Error();
    expect(c.estado.celeiro['ovo']).toBe(1);
    expect(c.estado.animais[chave(min, min)]!.cicloDesde).toBe(T0 + 30 * 60_000);
    expect(coletar(c.estado, min, min, T0 + 30 * 60_000 + 1000).ok).toBe(false);
  });

  it('ovo é vendável por 15 moedas; tocar no animal coleta', () => {
    const r = comprarAnimal(nivel3(), min, min, 'galinha', T0);
    if (!r.ok) throw new Error();
    const c = tocar(r.estado, min, min, T0 + 30 * 60_000);
    if (!c.ok) throw new Error();
    const v = vender(c.estado, 'ovo');
    expect(v.ok && v.estado.moedas).toBe(850 + 15);
  });
});
