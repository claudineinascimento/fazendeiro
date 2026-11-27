import type { EstadoJogo } from './nucleo/estado';
import { carregar, salvar, apagarSave } from './nucleo/salvamento';
import { agora } from './nucleo/tempo';
import * as acoes from './nucleo/acoes';
import type { Evento, Resultado } from './nucleo/acoes';
import { registrarEstatisticas, resgatarConquista } from './nucleo/conquistas';
import { garantirMissoes, registrarEventos, resgatarMissao, resgatarBonus, type ResultadoMissao } from './nucleo/missoes';

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
    this.estado = registrarEventos(garantirMissoes(registrarEstatisticas(r.estado, r.eventos), agora()), r.eventos);
    this.agendarSave();
    this.ouvintes.forEach((f) => f(this.estado, r.eventos));
    return true;
  }

  /** Animal escolhido na loja, aguardando o toque no terreno (só interface, não é salvo). */
  colocando: string | null = null;
  /** Decoração escolhida para colocar, ou 'guardar' para o modo de guardar. */
  decorando: string | null = null;

  tocar = (x: number, y: number): boolean => {
    if (this.decorando) {
      const modo = this.decorando;
      if (modo === 'guardar') return this.executar((e) => acoes.guardarDecoracao(e, x, y));
      const ok = this.executar((e) => acoes.colocarDecoracao(e, x, y, modo));
      // continua no modo enquanto houver decoração para colocar (inventário)
      if (ok && !((this.estado.guardadas?.[modo] ?? 0) > 0)) this.decorando = null;
      return ok;
    }
    if (this.colocando) {
      const tipo = this.colocando;
      const ok = this.executar((e, t) => acoes.comprarAnimal(e, x, y, tipo, t));
      if (ok) this.colocando = null;
      return ok;
    }
    return this.executar((e, t) => acoes.tocar(e, x, y, t));
  };
  vender = (id: string, qtd?: number) => this.executar((e) => acoes.vender(e, id, qtd));
  venderTudo = () => this.executar((e) => acoes.venderTudo(e));

  /** Resgata a recompensa de uma missão (ou o bônus diário se indice for -1). */
  resgatar(indice: number): boolean {
    this.estado = garantirMissoes(this.estado, agora());
    const r: ResultadoMissao = indice < 0 ? resgatarBonus(this.estado) : resgatarMissao(this.estado, indice);
    if (!r.ok) {
      this.ouvintesErro.forEach((f) => f(r.erro));
      return false;
    }
    this.estado = r.estado;
    this.agendarSave();
    const eventos: Evento[] = r.niveis.map((n) => ({ tipo: 'nivel', nivel: n, moedas: 50 * n }));
    this.ouvintes.forEach((f) => f(this.estado, eventos));
    return true;
  }

  resgatarConquista(id: string): boolean {
    const r = resgatarConquista(this.estado, id);
    if (!r.ok) {
      this.ouvintesErro.forEach((f) => f(r.erro));
      return false;
    }
    this.estado = r.estado;
    this.agendarSave();
    this.ouvintes.forEach((f) => f(this.estado, []));
    return true;
  }

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

  /** Sai de qualquer modo de colocar/guardar. */
  cancelarModo(): void {
    this.colocando = null;
    this.decorando = null;
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
jogo.estado = garantirMissoes(jogo.estado, agora());

// Garante o save ao fechar a aba ou trocar de app no celular.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') jogo.salvarAgora();
});
window.addEventListener('pagehide', () => jogo.salvarAgora());
