import { CHAVE_SAVE, VERSAO_SAVE } from '../config';
import { estadoInicial, type EstadoJogo } from './estado';

// Save local (Fase 2). A nuvem (Firestore) entra na Fase 3 sem mudar o formato.

export function carregar(agoraMs: number): EstadoJogo {
  try {
    const bruto = localStorage.getItem(CHAVE_SAVE);
    if (bruto) {
      const estado = JSON.parse(bruto) as EstadoJogo;
      if (estado && typeof estado.moedas === 'number' && estado.canteiros) return migrar(estado);
    }
  } catch {
    // save corrompido ou armazenamento bloqueado: começa um jogo novo
  }
  return estadoInicial(agoraMs);
}

export function salvar(estado: EstadoJogo): void {
  try {
    localStorage.setItem(CHAVE_SAVE, JSON.stringify(estado));
  } catch {
    // armazenamento cheio ou bloqueado: o jogo continua sem salvar
  }
}

export function apagarSave(): void {
  try {
    localStorage.removeItem(CHAVE_SAVE);
  } catch {
    /* sem armazenamento */
  }
}

/** Migrações por versão do formato. Hoje só existe a versão 1. */
export function migrar(estado: EstadoJogo): EstadoJogo {
  estado.versao = VERSAO_SAVE;
  return estado;
}
