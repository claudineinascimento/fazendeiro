import './estilos.css';
import { CULTURAS } from '../dados';
import { COR_CULTURA } from '../mundo/texturas';
import { jogo } from '../jogo';
import { som } from '../audio';
import { T } from '../textos/pt-BR';
import { xpAcumuladoNivel, NIVEL_MAXIMO } from '../nucleo/economia';
import { formatarDuracao } from '../nucleo/tempo';
import { culturaPorId } from '../dados';

// Camada DOM por cima do canvas: HUD, loja de sementes e celeiro (inventário/venda).
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, classe = '', html = ''): HTMLElementTagNameMap[K] => {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (html) e.innerHTML = html;
  return e;
};
const num = (n: number): string => n.toLocaleString('pt-BR');

export function montarInterface(): void {
  const raiz = document.getElementById('ui')!;

  // ---- topo: moedas, diamantes, nível ----
  const topo = el('div', 'topo');
  const pMoedas = el('div', 'pilula');
  const pDiam = el('div', 'pilula');
  const pNivel = el('div', 'pilula nivel');
  topo.append(pMoedas, pDiam, pNivel);

  // ---- rodapé: semente, loja, celeiro, som ----
  const rodape = el('div', 'rodape');
  const bSemente = el('button', 'semente');
  const bLoja = el('button', 'botao', `🌱 ${T.loja}`);
  const bCeleiro = el('button', 'botao azul', `🏠 ${T.celeiro}`);
  const bSom = el('button', 'botao cinza mini');
  rodape.append(bSemente, bLoja, bCeleiro, bSom);

  const toast = el('div', 'toast');
  const painelLoja = criarPainel(`🌱 ${T.loja}`);
  const painelCeleiro = criarPainel(`🏠 ${T.celeiro}`);
  raiz.append(topo, rodape, toast, painelLoja.fundo, painelCeleiro.fundo);

  // ---- toast ----
  let timerToast = 0;
  const avisar = (msg: string, classe = '') => {
    toast.textContent = msg;
    toast.className = `toast visivel ${classe}`;
    window.clearTimeout(timerToast);
    timerToast = window.setTimeout(() => toast.classList.remove('visivel'), 2200);
  };
  jogo.aoErrar((m) => {
    avisar(m);
    som.erro();
  });

  // ---- desenho do HUD ----
  const desenharHud = () => {
    const e = jogo.estado;
    pMoedas.innerHTML = `<span class="ico">🪙</span>${num(e.moedas)}`;
    pDiam.innerHTML = `<span class="ico">💎</span>${num(e.diamantes)}`;
    const base = xpAcumuladoNivel(e.nivel);
    const prox = e.nivel >= NIVEL_MAXIMO ? base : xpAcumuladoNivel(e.nivel + 1);
    const pct = prox > base ? Math.min(100, ((e.xp - base) / (prox - base)) * 100) : 100;
    pNivel.innerHTML = `<span>${T.nivel} ${e.nivel} · ${num(e.xp - base)}/${num(prox - base)} XP</span><div class="barra"><i style="width:${pct}%"></i></div>`;
    const c = culturaPorId(e.ultimaCultura ?? 'rabanete');
    bSemente.innerHTML = `${c?.nome ?? ''}<small>${T.sementeAtual} · ${c?.custo ?? 0} 🪙</small>`;
    bSom.textContent = e.config.som ? '🔊' : '🔇';
    bSom.title = e.config.som ? T.somLigado : T.somDesligado;
    if (painelLoja.fundo.classList.contains('aberto')) desenharLoja();
    if (painelCeleiro.fundo.classList.contains('aberto')) desenharCeleiro();
  };

  // ---- loja ----
  const desenharLoja = () => {
    const e = jogo.estado;
    painelLoja.lista.replaceChildren(
      ...CULTURAS.map((c) => {
        const livre = e.nivel >= c.nivelDesbloqueio;
        const item = el('div', `item${e.ultimaCultura === c.id ? ' ativo' : ''}${livre ? '' : ' trava'}`);
        const bola = el('div', 'bolinha');
        bola.style.background = `#${(COR_CULTURA[c.id] ?? 0xffffff).toString(16).padStart(6, '0')}`;
        const info = el('div', 'info', `<div class="nome">${c.nome}</div><div class="det">${T.tempo} ${formatarDuracao(c.tempoSegundos * 1000)} · ${T.custo} ${c.custo} 🪙 · ${T.venda} ${c.venda} 🪙 · ${c.xp} XP</div>`);
        const b = el('button', 'botao mini', livre ? (e.ultimaCultura === c.id ? '✔' : 'Usar') : `🔒 ${T.bloqueado(c.nivelDesbloqueio)}`);
        b.disabled = !livre;
        b.onclick = () => {
          som.clique();
          jogo.escolherSemente(c.id);
          avisar(T.escolhida(c.nome));
          fechar(painelLoja);
        };
        item.append(bola, info, b);
        return item;
      }),
    );
  };

  // ---- celeiro ----
  const botaoVenderTudo = el('button', 'botao', T.venderTudo);
  painelCeleiro.rodape.append(botaoVenderTudo);
  botaoVenderTudo.onclick = () => jogo.venderTudo();
  const desenharCeleiro = () => {
    const e = jogo.estado;
    const ids = Object.keys(e.celeiro);
    botaoVenderTudo.disabled = ids.length === 0;
    if (!ids.length) {
      painelCeleiro.lista.replaceChildren(el('div', 'vazio', T.vazio));
      return;
    }
    painelCeleiro.lista.replaceChildren(
      ...ids.map((id) => {
        const c = culturaPorId(id)!;
        const qtd = e.celeiro[id] ?? 0;
        const item = el('div', 'item');
        const bola = el('div', 'bolinha');
        bola.style.background = `#${(COR_CULTURA[id] ?? 0xffffff).toString(16).padStart(6, '0')}`;
        const info = el('div', 'info', `<div class="nome">${c.nome} × ${qtd}</div><div class="det">${c.venda} 🪙 cada · total ${num(qtd * c.venda)} 🪙</div>`);
        const b = el('button', 'botao mini azul', `${T.venderUm} 1`);
        b.onclick = () => jogo.vender(id, 1);
        item.append(bola, info, b);
        return item;
      }),
    );
  };

  // ---- abrir e fechar ----
  const abrir = (p: ReturnType<typeof criarPainel>, desenhar: () => void) => {
    som.clique();
    desenhar();
    p.fundo.classList.add('aberto');
  };
  const fechar = (p: ReturnType<typeof criarPainel>) => p.fundo.classList.remove('aberto');
  painelLoja.fechar.onclick = () => fechar(painelLoja);
  painelCeleiro.fechar.onclick = () => fechar(painelCeleiro);
  for (const p of [painelLoja, painelCeleiro]) p.fundo.addEventListener('pointerdown', (ev) => ev.target === p.fundo && fechar(p));

  bLoja.onclick = () => abrir(painelLoja, desenharLoja);
  bSemente.onclick = bLoja.onclick;
  bCeleiro.onclick = () => abrir(painelCeleiro, desenharCeleiro);
  bSom.onclick = () => {
    jogo.alternarSom();
    som.clique();
  };

  jogo.aoMudar((_estado, eventos) => {
    desenharHud();
    for (const ev of eventos) if (ev.tipo === 'nivel') avisar(T.subiuNivel(ev.nivel), 'nivel');
  });
  desenharHud();
  avisar(T.dicaInicial);
}

function criarPainel(titulo: string) {
  const fundo = el('div', 'fundo');
  const painel = el('div', 'painel');
  const cab = el('header');
  const t = el('span', '', titulo);
  const fechar = el('button', 'botao cinza mini', '✕');
  fechar.setAttribute('aria-label', T.fechar);
  cab.append(t, fechar);
  const lista = el('div', 'lista');
  const rodape = el('div', 'rodapep');
  painel.append(cab, lista, rodape);
  fundo.append(painel);
  return { fundo, lista, rodape, fechar };
}
