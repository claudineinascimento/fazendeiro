# Fazenda Feliz: Documento de Design (GDD)

Versão 1.0, Fase 1 (pré-produção). Responsável: Game Designer.
Dados para o código: `data/culturas.json` e `data/animais.json` (fonte da verdade dos números; se este documento e o JSON divergirem, vale o JSON).

## 1. Visão

Jogo de fazenda casual, original, em 2D cartoon isométrico, jogado no navegador do celular. Sessões curtas (1 a 5 minutos) várias vezes ao dia. O jogador ara, planta, colhe, cria animais, decora a fazenda e ajuda os vizinhos. Tom acolhedor, sem punição: nada morre e nada se perde por ficar longe.

Público: adultos e jovens que jogam no celular em pausas curtas. Idioma: português do Brasil.

## 2. Loop principal

```
Arar (5 moedas) → Plantar (custo da semente) → Esperar (timer real, continua offline)
      ↑                                                     ↓
Loja / expansão / decoração  ←  Vender no Celeiro  ←  Colher (vai para o Celeiro + XP)
```

- **Loop curto (minutos):** arar, plantar culturas rápidas, colher, vender.
- **Loop médio (horas):** culturas longas e animais pensados para "plantar antes de sair e colher na volta".
- **Loop longo (dias):** subir de nível, desbloquear culturas e animais, expandir o terreno, completar conquistas, missões diárias e visitas aos vizinhos.

Ações por toque:
| Ação | Gesto | Custo | Ganho |
|---|---|---|---|
| Arar | toque em terreno livre (ferramenta Arar) | 5 moedas | 1 XP |
| Plantar | toque em canteiro arado (semente escolhida) | custo da semente | 0 |
| Colher | toque em cultura pronta | grátis | produto no Celeiro + XP da cultura |
| Coletar animal | toque no animal com ícone de produto | grátis | produto + XP |
| Vender | no Celeiro, item a item ou "Vender tudo" | grátis | moedas |

Ferramenta inteligente: tocar um canteiro já faz a ação óbvia (arar se vazio, plantar a última semente se arado, colher se pronto). Arrastar o dedo sobre vários canteiros repete a ação.

## 3. Economia

### 3.1 Moedas (moeda comum)
- Ganho: venda de produtos, missões, conquistas, subida de nível, ajudar vizinhos.
- Gasto: arar, sementes, animais, decorações, expansões.
- Saldo inicial: **200 moedas**.

### 3.2 XP e níveis
- XP vem de arar (1), colher (ver tabela), coletar animais, colocar decoração (1) e ajudar vizinhos (2 por ação).
- XP para passar do nível *n* ao *n+1*: `round(30 × n^1.4 / 5) × 5`.
- Nível máximo do MVP: **30**.
- Recompensa ao subir de nível: **50 × novo nível moedas + 1 diamante**.

| Nível | XP para o próximo | XP acumulado ao chegar | Desbloqueio |
|---|---|---|---|
| 1 | 30 | 0 | Rabanete, Alface |
| 2 | 80 | 30 | Cenoura |
| 3 | 140 | 110 | Milho, Galinha |
| 4 | 210 | 250 | Tomate, Vizinhos |
| 5 | 285 | 460 | Batata |
| 6 | 370 | 745 | Morango, Vaca |
| 8 | 550 | 1.570 | Abóbora, 1ª expansão |
| 9 | 650 | 2.120 | Ovelha |
| 10 | 755 | 2.770 | Girassol |
| 12 | 975 | 4.385 | Trigo, Porco |
| 14 | 1.205 | 6.450 | Melancia |
| 15 | 1.330 | 7.655 | Cabra, 2ª expansão |
| 16 | 1.455 | 8.985 | Algodão |
| 20 | 1.990 | 15.590 | 3ª expansão |
| 30 | (máximo) | 42.115 | |

### 3.3 Diamantes (moeda premium)
- Ganho **gratuito**: +1 por nível, 1 a 3 por conquista, 1 no bônus diário de missões, até **5 por dia** com anúncios com recompensa (1 por anúncio). Pacotes pagos ficam para depois do MVP (ver Decisões).
- Saldo inicial: **5 diamantes**.
- Usos permitidos:
  - **Acelerar** uma cultura ou animal: 1 diamante por hora restante (arredondada para cima, mínimo 1).
  - **Decorações exclusivas** (apenas cosméticas).
  - **Pular espera** de missão diária (trocar uma missão: 1 diamante, 1 vez por dia).
- Usos **proibidos**: comprar moedas, comprar culturas ou animais exclusivos, aumentar lucro de forma permanente.

## 4. Culturas

Arar custa 5 moedas e dá 1 XP. Culturas **não murcham** (Decisão D2). Quatro estágios visuais: semente, broto (1/3 do tempo), crescendo (2/3), pronto.

| Cultura | Tempo | Semente | Venda | Lucro | XP | Nível | Lucro/hora |
|---|---|---|---|---|---|---|---|
| Rabanete | 1 min | 5 | 10 | 5 | 1 | 1 | 300 |
| Alface | 5 min | 10 | 22 | 12 | 2 | 1 | 144 |
| Cenoura | 15 min | 20 | 45 | 25 | 3 | 2 | 100 |
| Milho | 30 min | 30 | 70 | 40 | 4 | 3 | 80 |
| Tomate | 1 h | 45 | 105 | 60 | 6 | 4 | 60 |
| Batata | 2 h | 60 | 145 | 85 | 8 | 5 | 42,5 |
| Morango | 4 h | 80 | 200 | 120 | 10 | 6 | 30 |
| Abóbora | 6 h | 100 | 250 | 150 | 12 | 8 | 25 |
| Girassol | 8 h | 110 | 280 | 170 | 14 | 10 | 21,2 |
| Trigo | 12 h | 120 | 320 | 200 | 16 | 12 | 16,7 |
| Melancia | 16 h | 150 | 390 | 240 | 18 | 14 | 15 |
| Algodão | 24 h | 180 | 480 | 300 | 22 | 16 | 12,5 |

Lógica do balanceamento: culturas rápidas rendem mais **por hora**, mas exigem o jogador presente; culturas longas rendem mais **por colheita**, recompensando quem volta depois. Assim, jogar muito não é obrigatório e quem joga pouco não fica para trás de forma brusca. O custo de arar (5) torna as culturas de 1 e 5 minutos pouco lucrativas por canteiro, o que é intencional: servem para tutorial e missões.

## 5. Animais e produtos

Animais ficam em qualquer tile livre, não precisam de ração (Decisão D3) e produzem em ciclo contínuo: quando o produto está pronto, aparece um ícone; tocar coleta e reinicia o timer. Limite de **20 animais** no total no MVP.

| Animal | Nível | Preço | Produto | Ciclo | Venda | XP | Paga-se em |
|---|---|---|---|---|---|---|---|
| Galinha | 3 | 150 | Ovo | 30 min | 15 | 2 | 10 coletas (5 h) |
| Vaca | 6 | 600 | Leite | 4 h | 60 | 6 | 10 coletas (40 h) |
| Ovelha | 9 | 900 | Lã | 8 h | 100 | 9 | 9 coletas (72 h) |
| Porco | 12 | 1.200 | Trufa | 12 h | 150 | 12 | 8 coletas (4 dias) |
| Cabra | 15 | 1.500 | Queijo de cabra | 24 h | 260 | 18 | 6 coletas (6 dias) |

Animais são investimento de longo prazo: compram-se com moedas e geram renda passiva sem custo por ciclo.

## 6. Terreno, Celeiro e decoração

- **Grade:** mapa isométrico de 20×20 tiles; área utilizável inicial **10×10**. Expansões (moedas): 12×12 no nível 8 (2.000), 15×15 no nível 15 (8.000), 20×20 no nível 20 (20.000).
- **Celeiro (inventário):** guarda produtos colhidos, produtos de animais e presentes recebidos (sementes não ficam guardadas: ver D6). Capacidade ilimitada no MVP (Decisão D4). Botões "Vender" e "Vender tudo".
- **Decorações:** puramente cosméticas, dão 1 XP ao colocar pela primeira vez cada unidade. Podem ser movidas, giradas e guardadas no inventário.

| Decoração | Preço | Nível |
|---|---|---|
| Cerca de madeira (1 tile) | 10 moedas | 1 |
| Canteiro de flores | 40 moedas | 2 |
| Caminho de pedra | 15 moedas | 3 |
| Espantalho | 120 moedas | 4 |
| Banco de praça | 200 moedas | 6 |
| Poço | 500 moedas | 8 |
| Moinho decorativo | 1.500 moedas | 12 |
| Fonte | 3 diamantes | 1 |
| Coreto colorido | 8 diamantes | 5 |
| Balão de ar quente | 15 diamantes | 10 |

## 7. Missões diárias

- **3 missões por dia**, sorteadas de um banco, ajustadas ao nível do jogador. Renovam à **meia-noite no horário de Brasília (UTC−3)**.
- Completar as 3 dá **bônus diário: 1 diamante + 100 moedas**.
- O jogador pode trocar 1 missão por dia (1 diamante ou 1 anúncio).

Banco inicial (X escala com o nível: `X = base × (1 + nível/10)`, arredondado):

| Missão | Base | Recompensa |
|---|---|---|
| Colha X culturas | 10 | 50 moedas + 10 XP |
| Colha X unidades de [cultura desbloqueada] | 5 | 60 moedas + 10 XP |
| Are X canteiros | 10 | 30 moedas + 5 XP |
| Colete X produtos de animais | 3 | 60 moedas + 10 XP |
| Venda produtos somando X moedas | 200 | 50 moedas + 10 XP |
| Ajude X vizinhos | 2 | 50 moedas + 15 XP |
| Envie X presentes | 1 | 30 moedas + 10 XP |
| Coloque X decorações | 1 | 40 moedas + 5 XP |

## 8. Conquistas

Permanentes, com 3 níveis (bronze, prata, ouro). Recompensa: bronze 1, prata 2, ouro 3 diamantes, mais moedas.

| Conquista | Bronze | Prata | Ouro |
|---|---|---|---|
| Mão na Terra (colheitas) | 50 | 500 | 5.000 |
| Arador Incansável (canteiros arados) | 100 | 1.000 | 10.000 |
| Rico de Verdade (moedas ganhas no total) | 5.000 | 50.000 | 500.000 |
| Criador (produtos de animais) | 20 | 200 | 2.000 |
| Bom Vizinho (ajudas dadas) | 10 | 100 | 1.000 |
| Generoso (presentes enviados) | 10 | 50 | 250 |
| Colecionador (tipos de cultura colhidos) | 4 | 8 | 12 |
| Fazenda Bonita (decorações colocadas) | 10 | 50 | 200 |
| Sempre Presente (dias com as 3 missões) | 3 | 15 | 60 |
| Experiente (nível) | 5 | 15 | 30 |

## 9. Vizinhos

Desbloqueia no nível 4. Vizinhos são adicionados por **código de convite** (6 caracteres) ou link de convite. Limite de 50 vizinhos no MVP.

- **Visitar:** ver a fazenda do vizinho em modo somente leitura (não dá para colher nem mexer em nada).
- **Ajudar:** até **5 ações por vizinho por dia**. Cada ação é "Adubar" um canteiro em crescimento: a próxima colheita daquele canteiro vende por **+10%**. O ajudante ganha **10 moedas + 2 XP por ação**. O dono vê um aviso "Fulano ajudou sua fazenda".
- **Presentes:** **1 presente por vizinho por dia**, gratuito para quem envia. O presente é escolhido de uma lista que cresce com o nível de quem envia (ex.: 3 ovos, 5 cenouras, cerca de madeira, canteiro de flores). Fica numa caixa de entrada até ser aceito; vai para o Celeiro.
- Nenhum recurso do jogador é retirado em visita ou presente. Não há roubo nem competição direta.

## 10. Balanceamento inicial e ritmo esperado

Estado inicial: nível 1, 200 moedas, 5 diamantes, 6 canteiros já arados com alface pronta para colher no tutorial.

Metas de ritmo (jogador típico, 3 a 5 sessões curtas por dia):
| Marco | Meta |
|---|---|
| Nível 2 | 5 a 10 minutos (durante o onboarding) |
| Nível 5 | fim do 1º dia |
| Nível 10 | 5 a 7 dias |
| Nível 16 (todas as culturas) | 3 a 4 semanas |
| Nível 30 | 2 a 3 meses |

Controle de inflação: o custo de arar, o preço de animais e as expansões são os principais ralos de moedas. Se a telemetria mostrar acúmulo exagerado de moedas, ajustar primeiro os preços das expansões e decorações, não o lucro das culturas.

Parâmetros que o QA e a monetização devem acompanhar na Fase 4: tempo até nível 5 e 10, moedas médias por dia por nível, % de jogadores que usam aceleração, uso de anúncios por dia.

## 11. Princípios anti pay-to-win

1. Tudo que dá vantagem produtiva (culturas, animais, expansões) é comprado **só com moedas** e liberado **só por nível**.
2. Diamantes só aceleram tempo ou compram cosméticos. Nunca compram moedas, XP direto, ou itens produtivos exclusivos.
3. Todo diamante pode ser ganho jogando (níveis, conquistas, missões, anúncios opcionais).
4. Anúncios são sempre opcionais e com recompensa; nenhum anúncio forçado no meio do jogo.
5. Nada se perde por ficar longe: sem murchar, sem roubo, sem punição por ausência.
6. Vizinhos ajudam, não competem. Não há ranking de riqueza no MVP.

## 12. Regras técnicas que o design exige

- Timers usam **horário do servidor**: cada canteiro guarda `plantadoEm` (timestamp do servidor) e o tempo da cultura; o estado "pronto" é calculado, não salvo. Mudar o relógio do celular não acelera nada.
- Valores de venda, custo e XP vêm de `data/*.json`; o cliente nunca envia "quanto ganhei", só a ação (ex.: "colhi o canteiro 3,4"), e o backend valida.
- Limites diários (ajudas, presentes, anúncios) são contados no servidor, com dia de Brasília.

## 13. Decisões

Quando houve dúvida, ficou a opção mais simples:

| # | Decisão | Motivo |
|---|---|---|
| D1 | Uma moeda comum (moedas) e uma premium (diamantes). Sem energia/estamina. | Menos sistemas, sem frustração de espera extra. |
| D2 | Culturas não murcham. | Simplifica timers e evita punir ausência. |
| D3 | Animais não precisam de ração. | Evita um segundo inventário e cadeia de produção. |
| D4 | Celeiro com capacidade ilimitada. | Elimina um sistema de upgrade no MVP. |
| D5 | Sem processamento (padaria, laticínio etc.) no MVP. | Fica para pós-MVP. |
| D6 | Não há sementes no inventário: plantar compra a semente na hora. | Menos telas e menos estados. |
| D7 | Vizinhos por código/link de convite, sem lista de amigos de rede social. | Funciona com login anônimo. |
| D8 | Ajuda de vizinho = "Adubar" (+10% na venda da próxima colheita). | Uma ação só, fácil de validar no servidor. |
| D9 | Dia do jogo segue horário de Brasília (UTC−3) para todos. | Público é brasileiro; um só horário de reset. |
| D10 | Sem compras com dinheiro real no MVP; diamantes só por jogo e anúncios. Pacotes pagos são avaliados depois do Beta. | Evita integração de pagamento e risco de pay-to-win no lançamento. |
| D11 | Nível máximo 30 no MVP. | Conteúdo suficiente para 2 a 3 meses; fácil de estender. |
| D12 | Uma cultura por canteiro de 1 tile; animais e decorações também ocupam 1 tile (exceto moinho, coreto e balão: 2×2). | Simplifica a grade e a colisão. |

## 14. Fora do escopo do MVP

Processamento de produtos, pedidos de clientes/caminhão de entregas, eventos sazonais, árvores frutíferas, ranking, chat, compras com dinheiro real, clima.
