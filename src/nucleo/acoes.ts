import { CUSTO_ARAR, LIMITE_ANIMAIS, XP_ARAR, animalPorId, culturaPorId, itemVendavel } from '../dados';
import { chave, dentroDaArea, type EstadoJogo } from './estado';
import { ganharXp } from './economia';
import { progresso, progressoCiclo } from './tempo';

// Ações puras: recebem o estado e devolvem um estado novo (ou um erro).
// A interface e as cenas NUNCA alteram o estado diretamente.

export type Evento =
  | { tipo: 'arou'; x: number; y: number; custo: number; xp: number }
  | { tipo: 'plantou'; x: number; y: number; cultura: string; custo: number }
  | { tipo: 'colheu'; x: number; y: number; cultura: string; xp: number }
  | { tipo: 'comprouAnimal'; x: number; y: number; animal: string; custo: number }
  | { tipo: 'coletou'; x: number; y: number; produto: string; xp: number }
  | { tipo: 'vendeu'; moedas: number }
  | { tipo: 'nivel'; nivel: number; moedas: number };

export type Resultado =
  | { ok: true; estado: EstadoJogo; eventos: Evento[] }
  | { ok: false; erro: string };

const erro = (mensagem: string): Resultado => ({ ok: false, erro: mensagem });

function concluir(estado: EstadoJogo, eventos: Evento[], xp: number): Resultado {
  const { niveisGanhos } = ganharXp(estado, xp);
  for (const nivel of niveisGanhos) eventos.push({ tipo: 'nivel', nivel, moedas: 50 * nivel });
  return { ok: true, estado, eventos };
}

export function arar(antigo: EstadoJogo, x: number, y: number): Resultado {
  if (!dentroDaArea(antigo, x, y)) return erro('Esse terreno ainda está bloqueado.');
  if (antigo.animais[chave(x, y)]) return erro('Tem um animal aqui.');
  if (antigo.canteiros[chave(x, y)]) return erro('Esse canteiro já está arado.');
  if (antigo.moedas < CUSTO_ARAR) return erro('Moedas insuficientes para arar.');
  const estado = structuredClone(antigo);
  estado.moedas -= CUSTO_ARAR;
  estado.canteiros[chave(x, y)] = { cultura: null, plantadoEm: null };
  return concluir(estado, [{ tipo: 'arou', x, y, custo: CUSTO_ARAR, xp: XP_ARAR }], XP_ARAR);
}

export function plantar(antigo: EstadoJogo, x: number, y: number, culturaId: string, agoraMs: number): Resultado {
  const cultura = culturaPorId(culturaId);
  const canteiro = antigo.canteiros[chave(x, y)];
  if (!cultura) return erro('Cultura desconhecida.');
  if (!canteiro) return erro('Are o terreno antes de plantar.');
  if (canteiro.cultura) return erro('Já tem uma planta aqui.');
  if (antigo.nivel < cultura.nivelDesbloqueio) return erro(`Disponível no nível ${cultura.nivelDesbloqueio}.`);
  if (antigo.moedas < cultura.custo) return erro('Moedas insuficientes para a semente.');
  const estado = structuredClone(antigo);
  estado.moedas -= cultura.custo;
  estado.canteiros[chave(x, y)] = { cultura: cultura.id, plantadoEm: agoraMs };
  estado.ultimaCultura = cultura.id;
  return { ok: true, estado, eventos: [{ tipo: 'plantou', x, y, cultura: cultura.id, custo: cultura.custo }] };
}

export function colher(antigo: EstadoJogo, x: number, y: number, agoraMs: number): Resultado {
  const canteiro = antigo.canteiros[chave(x, y)];
  if (!canteiro || !canteiro.cultura) return erro('Não há nada para colher aqui.');
  const cultura = culturaPorId(canteiro.cultura);
  if (!cultura) return erro('Cultura desconhecida.');
  if (progresso(canteiro, cultura, agoraMs) < 1) return erro('Ainda não está pronto.');
  const estado = structuredClone(antigo);
  estado.canteiros[chave(x, y)] = { cultura: null, plantadoEm: null }; // volta a ficar arado
  estado.celeiro[cultura.id] = (estado.celeiro[cultura.id] ?? 0) + 1;
  return concluir(estado, [{ tipo: 'colheu', x, y, cultura: cultura.id, xp: cultura.xp }], cultura.xp);
}

/** Vende `quantidade` unidades de uma cultura (ou tudo, se omitida). */
export function vender(antigo: EstadoJogo, culturaId: string, quantidade?: number): Resultado {
  const item = itemVendavel(culturaId);
  const tem = antigo.celeiro[culturaId] ?? 0;
  if (!item || tem <= 0) return erro('Não há nada para vender.');
  const qtd = Math.min(quantidade ?? tem, tem);
  const estado = structuredClone(antigo);
  const total = qtd * item.venda;
  estado.celeiro[culturaId] = tem - qtd;
  if (estado.celeiro[culturaId] === 0) delete estado.celeiro[culturaId];
  estado.moedas += total;
  return { ok: true, estado, eventos: [{ tipo: 'vendeu', moedas: total }] };
}

export function venderTudo(antigo: EstadoJogo): Resultado {
  let estado = antigo;
  const eventos: Evento[] = [];
  for (const id of Object.keys(antigo.celeiro)) {
    const r = vender(estado, id);
    if (r.ok) {
      estado = r.estado;
      eventos.push(...r.eventos);
    }
  }
  if (!eventos.length) return erro('O celeiro está vazio.');
  const moedas = eventos.reduce((s, e) => s + (e.tipo === 'vendeu' ? e.moedas : 0), 0);
  return { ok: true, estado, eventos: [{ tipo: 'vendeu', moedas }] };
}

export function comprarAnimal(antigo: EstadoJogo, x: number, y: number, tipo: string, agoraMs: number): Resultado {
  const animal = animalPorId(tipo);
  if (!animal) return erro('Animal desconhecido.');
  if (!dentroDaArea(antigo, x, y)) return erro('Esse terreno ainda está bloqueado.');
  if (antigo.canteiros[chave(x, y)] || antigo.animais[chave(x, y)]) return erro('Esse espaço está ocupado.');
  if (antigo.nivel < animal.nivelDesbloqueio) return erro(`Disponível no nível ${animal.nivelDesbloqueio}.`);
  if (Object.keys(antigo.animais).length >= LIMITE_ANIMAIS) return erro(`Limite de ${LIMITE_ANIMAIS} animais.`);
  if (antigo.moedas < animal.custo) return erro('Moedas insuficientes.');
  const estado = structuredClone(antigo);
  estado.moedas -= animal.custo;
  estado.animais[chave(x, y)] = { tipo, x, y, cicloDesde: agoraMs };
  return { ok: true, estado, eventos: [{ tipo: 'comprouAnimal', x, y, animal: tipo, custo: animal.custo }] };
}

/** Coleta o produto de um animal pronto e reinicia o ciclo (sem ração, GDD D3). */
export function coletar(antigo: EstadoJogo, x: number, y: number, agoraMs: number): Resultado {
  const a = antigo.animais[chave(x, y)];
  const animal = a && animalPorId(a.tipo);
  if (!a || !animal) return erro('Não há animal aqui.');
  if (progressoCiclo(a.cicloDesde, animal.tempoProducaoSegundos, agoraMs) < 1) return erro('Ainda está produzindo.');
  const estado = structuredClone(antigo);
  estado.animais[chave(x, y)] = { ...a, cicloDesde: agoraMs };
  estado.celeiro[animal.produtoId] = (estado.celeiro[animal.produtoId] ?? 0) + 1;
  return concluir(estado, [{ tipo: 'coletou', x, y, produto: animal.produtoId, xp: animal.xpColeta }], animal.xpColeta);
}

/** Ferramenta inteligente (GDD seção 2): arar se vazio, plantar se arado, colher se pronto. */
export function tocar(estado: EstadoJogo, x: number, y: number, agoraMs: number): Resultado {
  if (estado.animais[chave(x, y)]) return coletar(estado, x, y, agoraMs);
  const c = estado.canteiros[chave(x, y)];
  if (!c) return arar(estado, x, y);
  if (!c.cultura) {
    return plantar(estado, x, y, estado.ultimaCultura ?? 'rabanete', agoraMs);
  }
  const cultura = culturaPorId(c.cultura);
  if (cultura && progresso(c, cultura, agoraMs) >= 1) return colher(estado, x, y, agoraMs);
  return erro('Ainda está crescendo.');
}
