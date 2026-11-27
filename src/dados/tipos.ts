// Tipos dos dados de design (fonte da verdade: data/*.json, vindos do GDD).

export interface Cultura {
  id: string;
  nome: string;
  tempoSegundos: number;
  custo: number;
  venda: number;
  lucro: number;
  xp: number;
  nivelDesbloqueio: number;
}

export interface Decoracao {
  id: string;
  nome: string;
  preco: number;
  moeda: 'moedas' | 'diamantes';
  nivel: number;
}

export interface Animal {
  id: string;
  nome: string;
  produtoId: string;
  produtoNome: string;
  nivelDesbloqueio: number;
  custo: number;
  tempoProducaoSegundos: number;
  vendaProduto: number;
  xpColeta: number;
}
