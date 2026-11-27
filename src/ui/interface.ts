import './estilos.css';
import { ANIMAIS, CULTURAS, DECORACOES, itemVendavel } from '../dados';
import { COR_ANIMAL, COR_CULTURA, COR_DECORACAO } from '../mundo/texturas';
import { jogo } from '../jogo';
import { som } from '../audio';
import { T } from '../textos/pt-BR';
import { xpAcumuladoNivel, NIVEL_MAXIMO } from '../nucleo/economia';
import { formatarDuracao } from '../nucleo/tempo';
import { culturaPorId } from '../dados';
import { CONQUISTAS, NOME_GRAU, RECOMPENSA_GRAU, grauAtingido, temConquistaPendente } from '../nucleo/conquistas';
import { textoMissao, BONUS_DIARIO } from '../nucleo/missoes';

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
  const bMissoes = el('button', 'botao mini', '📋');
  bMissoes.title = T.missoes;
  const bConq = el('button', 'botao mini', '🏆');
  bConq.title = T.conquistas;
  const bGuardar = el('button', 'botao cinza mini', '🧹');
  bGuardar.title = T.guardar;
  const bSom = el('button', 'botao cinza mini');
  rodape.append(bSemente, bLoja, bCeleiro, bMissoes, bConq, bGuardar, bSom);

  const toast = el('div', 'toast');
  const painelLoja = criarPainel(`🌱 ${T.loja}`);
  const painelCeleiro = criarPainel(`🏠 ${T.celeiro}`);
  const painelMissoes = criarPainel(`📋 ${T.missoes}`);
  const painelConq = criarPainel(`🏆 ${T.conquistas}`);
  raiz.append(topo, rodape, toast, painelLoja.fundo, painelCeleiro.fundo, painelMissoes.fundo, painelConq.fundo);

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
    if (painelMissoes.fundo.classList.contains('aberto')) desenharMissoes();
    if (painelConq.fundo.classList.contains('aberto')) desenharConquistas();
    bConq.classList.toggle('alerta', temConquistaPendente(e));
    bMissoes.classList.toggle('alerta', (e.missoes?.lista ?? []).some((m) => m.progresso >= m.alvo && !m.resgatada));
  };

  // ---- loja ----
  let aba: 'sementes' | 'animais' | 'decoracao' = 'sementes';
  const abas = el('div', 'abas');
  const bAbaS = el('button', 'botao mini azul', T.sementes);
  const bAbaA = el('button', 'botao mini cinza', T.animais);
  const bAbaD = el('button', 'botao mini cinza', T.decoracoes);
  abas.append(bAbaS, bAbaA, bAbaD);
  painelLoja.lista.before(abas);
  const trocarAba = (nova: 'sementes' | 'animais' | 'decoracao') => {
    aba = nova;
    bAbaS.className = `botao mini ${nova === 'sementes' ? 'azul' : 'cinza'}`;
    bAbaA.className = `botao mini ${nova === 'animais' ? 'azul' : 'cinza'}`;
    bAbaD.className = `botao mini ${nova === 'decoracao' ? 'azul' : 'cinza'}`;
    desenharLoja();
  };
  bAbaS.onclick = () => trocarAba('sementes');
  bAbaA.onclick = () => trocarAba('animais');
  bAbaD.onclick = () => trocarAba('decoracao');

  const desenharDecoracoes = () => {
    const e = jogo.estado;
    painelLoja.lista.replaceChildren(
      ...DECORACOES.map((d) => {
        const guardadas = e.guardadas?.[d.id] ?? 0;
        const livre = e.nivel >= d.nivel || guardadas > 0;
        const item = el('div', `item${livre ? '' : ' trava'}`);
        const bola = el('div', 'bolinha');
        bola.style.background = `#${(COR_DECORACAO[d.id] ?? 0xcccccc).toString(16).padStart(6, '0')}`;
        const preco = `${d.preco} ${d.moeda === 'moedas' ? '🪙' : '💎'}`;
        const info = el('div', 'info', `<div class="nome">${d.nome}</div><div class="det">${guardadas ? `${guardadas} guardada(s) · grátis` : preco}</div>`);
        const b = el('button', 'botao mini', guardadas ? `${T.colocar} (${guardadas})` : livre ? preco : `🔒 ${T.bloqueado(d.nivel)}`);
        b.disabled = !livre;
        b.onclick = () => {
          som.clique();
          jogo.cancelarModo();
          jogo.decorando = d.id;
          avisar(T.toqueParaColocar(d.nome));
          fechar(painelLoja);
        };
        item.append(bola, info, b);
        return item;
      }),
    );
  };

  const desenharAnimais = () => {
    const e = jogo.estado;
    painelLoja.lista.replaceChildren(
      ...ANIMAIS.map((a) => {
        const livre = e.nivel >= a.nivelDesbloqueio;
        const item = el('div', `item${livre ? '' : ' trava'}`);
        const bola = el('div', 'bolinha');
        bola.style.background = `#${(COR_ANIMAL[a.id] ?? 0xffffff).toString(16).padStart(6, '0')}`;
        const info = el('div', 'info', `<div class="nome">${a.nome}</div><div class="det">${a.produtoNome} a cada ${formatarDuracao(a.tempoProducaoSegundos * 1000)} · vale ${a.vendaProduto} 🪙 · ${a.xpColeta} XP</div>`);
        const b = el('button', 'botao mini', livre ? `${a.custo} 🪙` : `🔒 ${T.bloqueado(a.nivelDesbloqueio)}`);
        b.disabled = !livre;
        b.onclick = () => {
          som.clique();
          jogo.colocando = a.id;
          avisar(T.toqueParaColocar(a.nome));
          fechar(painelLoja);
        };
        item.append(bola, info, b);
        return item;
      }),
    );
  };

  const desenharLoja = () => {
    if (aba === 'animais') return desenharAnimais();
    if (aba === 'decoracao') return desenharDecoracoes();
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
        const c = itemVendavel(id)!;
        const qtd = e.celeiro[id] ?? 0;
        const item = el('div', 'item');
        const bola = el('div', 'bolinha');
        bola.style.background = `#${(COR_CULTURA[id] ?? 0xe8d8a8).toString(16).padStart(6, '0')}`;
        const info = el('div', 'info', `<div class="nome">${c.nome} × ${qtd}</div><div class="det">${c.venda} 🪙 cada · total ${num(qtd * c.venda)} 🪙</div>`);
        const b = el('button', 'botao mini azul', `${T.venderUm} 1`);
        b.onclick = () => jogo.vender(id, 1);
        item.append(bola, info, b);
        return item;
      }),
    );
  };

  // ---- missões diárias ----
  const desenharMissoes = () => {
    const ms = jogo.estado.missoes;
    const itens = (ms?.lista ?? []).map((m, i) => {
      const pronta = m.progresso >= m.alvo;
      const item = el('div', `item${m.resgatada ? ' trava' : pronta ? ' ativo' : ''}`);
      const info = el('div', 'info', `<div class="nome">${textoMissao(m)}</div><div class="det">${num(m.progresso)}/${num(m.alvo)} · ${m.moedas} 🪙 + ${m.xp} XP</div><div class="barra"><i style="width:${Math.min(100, (m.progresso / m.alvo) * 100)}%"></i></div>`);
      const b = el('button', 'botao mini', m.resgatada ? '✔' : T.resgatar);
      b.disabled = m.resgatada || !pronta;
      b.onclick = () => {
        if (jogo.resgatar(i)) som.moeda();
      };
      item.append(info, b);
      return item;
    });
    const todas = !!ms && ms.lista.length > 0 && ms.lista.every((m) => m.resgatada);
    const bonus = el('div', `item${todas && !ms.bonusResgatado ? ' ativo' : ' trava'}`);
    const bb = el('button', 'botao mini', ms?.bonusResgatado ? '✔' : T.resgatar);
    bb.disabled = !todas || !!ms?.bonusResgatado;
    bb.onclick = () => {
      if (jogo.resgatar(-1)) som.nivel();
    };
    bonus.append(el('div', 'info', `<div class="nome">${T.bonusDiario}</div><div class="det">${BONUS_DIARIO.moedas} 🪙 + ${BONUS_DIARIO.diamantes} 💎</div>`), bb);
    painelMissoes.lista.replaceChildren(...itens, bonus);
  };

  // ---- conquistas ----
  const desenharConquistas = () => {
    const e = jogo.estado;
    painelConq.lista.replaceChildren(
      ...CONQUISTAS.map((c) => {
        const feito = e.conquistas?.[c.id] ?? 0;
        const atingido = grauAtingido(c, e);
        const proxima = c.metas[Math.min(feito, 2)]!;
        const valor = Math.min(c.valor(e), c.metas[2]);
        const pendente = atingido > feito;
        const item = el('div', `item${pendente ? ' ativo' : feito === 3 ? ' trava' : ''}`);
        const grau = feito === 0 ? 'Sem medalha' : NOME_GRAU[feito - 1]!;
        const alvo = feito >= 3 ? c.metas[2] : proxima;
        const info = el('div', 'info', `<div class="nome">${c.nome} · ${grau}</div><div class="det">${c.descricao}: ${num(valor)}/${num(alvo)}</div><div class="barra"><i style="width:${Math.min(100, (valor / alvo) * 100)}%"></i></div>`);
        const r = RECOMPENSA_GRAU[Math.min(feito, 2)]!;
        const b = el('button', 'botao mini', feito >= 3 ? '✔' : pendente ? `${T.resgatar} ${r.diamantes}💎` : `${r.diamantes}💎`);
        b.disabled = !pendente;
        b.onclick = () => {
          if (jogo.resgatarConquista(c.id)) som.nivel();
        };
        item.append(info, b);
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
  painelMissoes.fechar.onclick = () => fechar(painelMissoes);
  painelConq.fechar.onclick = () => fechar(painelConq);
  for (const p of [painelLoja, painelCeleiro, painelMissoes, painelConq]) p.fundo.addEventListener('pointerdown', (ev) => ev.target === p.fundo && fechar(p));

  bLoja.onclick = () => abrir(painelLoja, desenharLoja);
  bSemente.onclick = bLoja.onclick;
  bCeleiro.onclick = () => abrir(painelCeleiro, desenharCeleiro);
  bGuardar.onclick = () => {
    som.clique();
    const ativo = jogo.decorando === 'guardar';
    jogo.cancelarModo();
    if (!ativo) {
      jogo.decorando = 'guardar';
      avisar(T.toqueParaGuardar);
    }
    bGuardar.classList.toggle('alerta', !ativo);
  };
  bConq.onclick = () => abrir(painelConq, desenharConquistas);
  bMissoes.onclick = () => abrir(painelMissoes, desenharMissoes);
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
