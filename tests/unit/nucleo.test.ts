import { describe, it, expect } from 'vitest';
import { estadoInicial, limitesArea, chave } from '../../src/nucleo/estado';
import { arar, plantar, colher, vender, venderTudo, tocar } from '../../src/nucleo/acoes';
import { xpParaProximo, xpAcumuladoNivel } from '../../src/nucleo/economia';
import { estagio, progresso, formatarDuracao } from '../../src/nucleo/tempo';
import { culturaPorId } from '../../src/dados';
import { isoParaTela, telaParaGrade } from '../../src/mundo/isometrico';

const T0 = 1_000_000_000_000;
const { min } = limitesArea(10);

function ok<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  if (!r.ok) throw new Error('esperava sucesso: ' + JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}

describe('economia', () => {
  it('XP por nível bate com a tabela do GDD', () => {
    expect(xpParaProximo(1)).toBe(30);
    expect(xpParaProximo(2)).toBe(80);
    expect(xpParaProximo(10)).toBe(755);
    expect(xpAcumuladoNivel(5)).toBe(460);
    expect(xpAcumuladoNivel(10)).toBe(2770);
  });
});

describe('estado inicial', () => {
  it('tem 200 moedas, 5 diamantes e 6 alfaces prontas', () => {
    const e = estadoInicial(T0);
    expect(e.moedas).toBe(200);
    expect(e.diamantes).toBe(5);
    const alface = culturaPorId('alface')!;
    const cs = Object.values(e.canteiros);
    expect(cs).toHaveLength(6);
    for (const c of cs) expect(progresso(c, alface, T0)).toBe(1);
  });
});

describe('ações', () => {
  it('arar cobra 5 moedas e dá 1 XP', () => {
    const e = estadoInicial(T0);
    const r = ok(arar(e, min, min));
    expect(r.estado.moedas).toBe(195);
    expect(r.estado.xp).toBe(1);
    expect(e.moedas).toBe(200); // o estado antigo não muda
  });

  it('não ara fora da área nem canteiro já arado', () => {
    const e = estadoInicial(T0);
    expect(arar(e, 0, 0).ok).toBe(false);
    const r = ok(arar(e, min, min));
    expect(arar(r.estado, min, min).ok).toBe(false);
  });

  it('plantar exige arar, moedas e nível', () => {
    const e = estadoInicial(T0);
    expect(plantar(e, min, min, 'rabanete', T0).ok).toBe(false); // sem arar
    const arado = ok(arar(e, min, min)).estado;
    expect(plantar(arado, min, min, 'milho', T0).ok).toBe(false); // nível 3
    const r = ok(plantar(arado, min, min, 'rabanete', T0));
    expect(r.estado.moedas).toBe(195 - 5);
    expect(plantar(r.estado, min, min, 'rabanete', T0).ok).toBe(false); // já plantado
  });

  it('colher só quando pronto e vai para o celeiro com XP', () => {
    let e = ok(arar(estadoInicial(T0), min, min)).estado;
    e = ok(plantar(e, min, min, 'rabanete', T0)).estado;
    expect(colher(e, min, min, T0 + 59_000).ok).toBe(false);
    const r = ok(colher(e, min, min, T0 + 60_000));
    expect(r.estado.celeiro['rabanete']).toBe(1);
    expect(r.estado.canteiros[chave(min, min)]).toEqual({ cultura: null, plantadoEm: null });
  });

  it('timers continuam com o jogo fechado (só dependem do timestamp)', () => {
    const base = estadoInicial(T0);
    base.nivel = 2; // cenoura é do nível 2
    let e = ok(arar(base, min, min)).estado;
    e = ok(plantar(e, min, min, 'cenoura', T0)).estado;
    const c = e.canteiros[chave(min, min)]!;
    const cenoura = culturaPorId('cenoura')!;
    // "fecha" o jogo por 9 min e abre de novo: 9/15 do tempo
    expect(estagio(progresso(c, cenoura, T0 + 9 * 60_000))).toBe(1);
    expect(estagio(progresso(c, cenoura, T0 + 10 * 60_000))).toBe(2);
    expect(estagio(progresso(c, cenoura, T0 + 15 * 60_000))).toBe(3);
  });

  it('subir de nível paga 50 × nível moedas e 1 diamante', () => {
    let e = estadoInicial(T0);
    e.xp = 29;
    e = ok(arar(e, min, min)).estado; // +1 XP => 30 => nível 2
    expect(e.nivel).toBe(2);
    expect(e.diamantes).toBe(6);
    expect(e.moedas).toBe(200 - 5 + 100);
  });

  it('vender e vender tudo', () => {
    const e = estadoInicial(T0);
    e.celeiro = { alface: 3, rabanete: 2 };
    const r1 = ok(vender(e, 'alface', 1));
    expect(r1.estado.moedas).toBe(222);
    expect(r1.estado.celeiro['alface']).toBe(2);
    const r2 = ok(venderTudo(r1.estado));
    expect(r2.estado.moedas).toBe(222 + 2 * 22 + 2 * 10);
    expect(r2.estado.celeiro).toEqual({});
    expect(venderTudo(r2.estado).ok).toBe(false);
  });

  it('ferramenta inteligente: ara, planta e colhe com toques', () => {
    let e = estadoInicial(T0);
    e = ok(tocar(e, min, min, T0)).estado; // arar
    expect(e.canteiros[chave(min, min)]!.cultura).toBeNull();
    e = ok(tocar(e, min, min, T0)).estado; // plantar a última semente
    expect(e.canteiros[chave(min, min)]!.cultura).toBe('rabanete');
    expect(tocar(e, min, min, T0 + 1000).ok).toBe(false); // crescendo
    e = ok(tocar(e, min, min, T0 + 60_000)).estado; // colher
    expect(e.celeiro['rabanete']).toBe(1);
  });
});

describe('tempo', () => {
  it('formata durações', () => {
    expect(formatarDuracao(30_000)).toBe('30s');
    expect(formatarDuracao(250_000)).toBe('4min 10s');
    expect(formatarDuracao(3_900_000)).toBe('1h 05min');
  });
});

describe('grade isométrica', () => {
  it('conversão tile -> tela -> tile é consistente', () => {
    for (const [gx, gy] of [[0, 0], [5, 7], [19, 19], [3, 15]] as const) {
      const p = isoParaTela(gx, gy);
      expect(telaParaGrade(p.x, p.y)).toEqual({ x: gx, y: gy });
    }
  });
  it('toque nos cantos do losango cai no tile certo e fora dele é do vizinho', () => {
    const p = isoParaTela(4, 4); // centro do tile
    expect(telaParaGrade(p.x + 40, p.y)).toEqual({ x: 4, y: 4 });
    expect(telaParaGrade(p.x, p.y + 30)).toEqual({ x: 4, y: 4 });
    expect(telaParaGrade(p.x, p.y + 40)).toEqual({ x: 5, y: 5 }); // passou da borda inferior: tile logo abaixo na tela
  });
});
