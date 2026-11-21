import culturasJson from './culturas.json';
import animaisJson from './animais.json';
import type { Cultura, Animal } from './tipos';

// Tabelas de design carregadas dos JSON. Nenhum número de economia fica no código.
export const CUSTO_ARAR: number = culturasJson.custoArar;
export const XP_ARAR: number = culturasJson.xpArar;
export const CULTURAS: Cultura[] = culturasJson.culturas as Cultura[];
export const ANIMAIS: Animal[] = animaisJson.animais as Animal[];

export function animalPorId(id: string): Animal | undefined {
  return ANIMAIS.find((a) => a.id === id);
}

/** Qualquer item vendável do celeiro: colheita ou produto de animal. */
export function itemVendavel(id: string): { nome: string; venda: number } | undefined {
  const c = culturaPorId(id);
  if (c) return { nome: c.nome, venda: c.venda };
  const a = ANIMAIS.find((x) => x.produtoId === id);
  return a ? { nome: a.produtoNome, venda: a.vendaProduto } : undefined;
}

export const LIMITE_ANIMAIS: number = animaisJson.limiteAnimaisTotal;

export function culturaPorId(id: string): Cultura | undefined {
  return CULTURAS.find((c) => c.id === id);
}
