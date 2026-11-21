import type { EstadoJogo } from './nucleo/estado';
import { carregar, salvar, apagarSave } from './nucleo/salvamento';
import { agora } from './nucleo/tempo';
import * as acoes from './nucleo/acoes';
import type { Evento, Resultado } from './nucleo/acoes';

// Armazena o estado único do jogo e avisa quem estiver interessado (cena e interface).
type Ouvinte = (estado: EstadoJogo, eventos: Evento[]) => void;
type OuvinteErro = (mensagem: string) => void;

class Jogo {
  estado: EstadoJogo = carregar(agora());
  private ouvintes: Ouvinte[] = [];
  private ouvintesErro: OuvinteErro[] = [];
  private timerSave: number | null = null;

  aoMudar(fn: Ouvinte): void {
    this.ouvintes.push(fn);
  }
  aoErrar(fn: OuvinteErro): void {
    this.ouvintesErro.push(fn);
  }

  /** Único ponto de entrada para alterar o estado. */
  executar(fazer: (estado: EstadoJogo, agoraMs: number) => Resultado): boolean {
    const r = fazer(this.estado, agora());
    if (!r.ok) {
      this.ouvintesErro.forEach((f) => f(r.erro));
      return false;
    }
    this.estado = r.estado;
    this.agendarSave();
    this.ouvintes.forEach((f) => f(this.estado, r.eventos));
    return true;
  }

  tocar = (x: number, y: number) => this.executar((e, t) => acoes.tocar(e, x, y, t));
  vender = (id: string, qtd?: number) => this.executar((e) => acoes.vender(e, id, qtd));
  venderTudo = () => this.executar((e) => acoes.venderTudo(e));

  escolherSemente(id: string): void {
    this.estado = { ...this.estado, ultimaCultura: id };
    this.agendarSave();
    this.ouvintes.forEach((f) => f(this.estado, []));
  }

  alternarSom(): void {
    this.estado = { ...this.estado, config: { ...this.estado.config, som: !this.estado.config.som } };
    this.agendarSave();
    this.ouvintes.forEach((f) => f(this.estado, []));
  }

  novoJogo(): void {
    apagarSave();
    window.location.reload();
  }

  // Salva logo após cada ação (pequeno atraso para juntar toques seguidos) e ao sair da página.
  private agendarSave(): void {
    if (this.timerSave !== null) return;
    this.timerSave = window.setTimeout(() => {
      this.timerSave = null;
      salvar(this.estado);
    }, 400);
  }

  salvarAgora(): void {
    if (this.timerSave !== null) window.clearTimeout(this.timerSave);
    this.timerSave = null;
    salvar(this.estado);
  }
}

export const jogo = new Jogo();

// Garante o save ao fechar a aba ou trocar de app no celular.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') jogo.salvarAgora();
});
window.addEventListener('pagehide', () => jogo.salvarAgora());
