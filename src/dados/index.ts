import culturasJson from './culturas.json';
import animaisJson from './animais.json';
import type { Cultura, Animal } from './tipos';

// Tabelas de design carregadas dos JSON. Nenhum número de economia fica no código.
export const CUSTO_ARAR: number = culturasJson.custoArar;
export const XP_ARAR: number = culturasJson.xpArar;
export const CULTURAS: Cultura[] = culturasJson.culturas as Cultura[];
export const ANIMAIS: Animal[] = animaisJson.animais as Animal[];

export function culturaPorId(id: string): Cultura | undefined {
  return CULTURAS.find((c) => c.id === id);
}
