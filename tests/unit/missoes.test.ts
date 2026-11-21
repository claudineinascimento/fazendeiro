import { describe, it, expect } from 'vitest';
import { estadoInicial } from '../../src/nucleo/estado';
import { diaBrasilia, garantirMissoes, registrarEventos, resgatarMissao, resgatarBonus, sortearMissoes } from '../../src/nucleo/missoes';

// 2026-11-21 12:00 UTC = 09:00 em Brasília
const MANHA = Date.UTC(2026, 10, 21, 12, 0, 0);

describe('missões diárias', () => {
  it('o dia vira à meia-noite de Brasília (03:00 UTC)', () => {
    expect(diaBrasilia(Date.UTC(2026, 10, 21, 2, 59))).toBe('2026-11-20');
    expect(diaBrasilia(Date.UTC(2026, 10, 21, 3, 0))).toBe('2026-11-21');
  });

  it('sorteia 3 missões distintas, sempre as mesmas no mesmo dia', () => {
    const a = sortearMissoes('2026-11-21', 1);
    expect(a).toHaveLength(3);
    expect(new Set(a.map((m) => m.tipo)).size).toBe(3);
    expect(sortearMissoes('2026-11-21', 1)).toEqual(a);
    expect(a.some((m) => m.tipo === 'coletar')).toBe(false); // sem animais no nível 1
  });

  it('renova ao virar o dia e mantém dentro do dia', () => {
    const e1 = garantirMissoes(estadoInicial(MANHA), MANHA);
    expect(garantirMissoes(e1, MANHA + 3600_000)).toBe(e1);
    const e2 = garantirMissoes(e1, MANHA + 24 * 3600_000);
    expect(e2.missoes!.dia).toBe('2026-11-22');
  });

  it('progresso, resgate e bônus diário', () => {
    let e = garantirMissoes(estadoInicial(MANHA), MANHA);
    expect(resgatarMissao(e, 0).ok).toBe(false); // não concluída
    const moedas0 = e.moedas;
    for (let i = 0; i < 3; i++) {
      const m = e.missoes!.lista[i]!;
      const eventos = m.tipo === 'vender' ? [{ tipo: 'vendeu' as const, moedas: m.alvo }] : Array.from({ length: m.alvo }, () => (m.tipo === 'colher' ? { tipo: 'colheu' as const, x: 0, y: 0, cultura: 'alface', xp: 0 } : { tipo: 'arou' as const, x: 0, y: 0, custo: 5, xp: 1 }));
      e = registrarEventos(e, eventos);
      const r = resgatarMissao(e, i);
      if (!r.ok) throw new Error(r.erro);
      e = r.estado;
    }
    expect(e.moedas).toBeGreaterThan(moedas0);
    expect(resgatarMissao(e, 0).ok).toBe(false); // já resgatada
    const b = resgatarBonus(e);
    if (!b.ok) throw new Error(b.erro);
    expect(b.estado.diamantes).toBe(e.diamantes + 1);
    expect(resgatarBonus(b.estado).ok).toBe(false);
  });
});
