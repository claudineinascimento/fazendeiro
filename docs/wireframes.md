# Fazenda Feliz — Wireframes e UX (Fase 1)

> Responsável: UI/UX Designer · Versão 0.1 · 21/11/2026
> Arquivos: [`wireframes/`](wireframes/) (SVG, abrem em qualquer navegador). Cores e fontes vêm do [Guia de Arte](guia-de-arte.md).

## 1. Princípios

1. **Polegar primeiro**: ações frequentes (ferramentas, Loja) ficam no terço inferior; informação (moedas, XP) no topo.
2. **Alvos de toque ≥ 48 × 48 px** (CSS). Botões principais 56 px de altura; botões de compra 40 px de altura × 82 de largura; espaço mínimo de 8 px entre alvos.
3. **Um toque = uma ação** sempre que possível. Confirmação só para gastar diamantes ou apagar progresso.
4. **Painéis modais centrais** sobre a fazenda escurecida (45%). Fechar: botão ✕ vermelho (48 px), toque fora do painel ou botão "voltar" do Android.
5. **Feedback imediato**: todo toque tem resposta em < 100 ms (som + escala 0,95 → 1,0 no botão).
6. **Texto curto**, em pt-BR, linguagem simples; números com separador de milhar brasileiro (`1.250`).

## 2. Resolução e orientação

- **Decisão (escopo mais simples):** orientação **retrato** é a principal; base de layout **360 × 640** (CSS px). O jogo usa `Phaser.Scale.RESIZE`: a fazenda ocupa toda a tela e a UI é ancorada nas bordas.
- Paisagem e tablet funcionam com a mesma UI ancorada (mais área de fazenda visível); painéis ficam com largura máxima de 480 px, centralizados.
- Área segura: respeitar `env(safe-area-inset-*)` (entalhe do iPhone e barra de gestos).
- **UI em DOM**, conforme a [arquitetura](arquitetura.md) (decisão D4): HUD e painéis são HTML/CSS por cima do canvas; o Phaser desenha só a fazenda. Os tamanhos abaixo estão em px CSS e valem direto no CSS. Os ícones do atlas `ui` são exportados também como SVG/PNG avulsos para uso no DOM.

## 3. Mapa de navegação

```
                    ┌──────────── HUD (fazenda) ────────────┐
   Onboarding ──►   │  topo: nível/XP · moedas · diamantes   │
   (1ª sessão)      │  esq.: Missões · Presentes             │
                    │  dir.: Config · Amigos · Inventário    │
                    │  base: ferramentas · LOJA               │
                    └──┬──────┬──────┬───────┬────────┬───────┘
                       ▼      ▼      ▼       ▼        ▼
                     Loja  Inventário Missões Amigos  Configurações
                                       │       │
                                       │       └─► Fazenda do vizinho (modo visita)
                                       └─► "Ir" fecha e destaca o alvo na fazenda
```

## 4. Telas

### 01 · HUD — [`01-hud.svg`](wireframes/01-hud.svg)
- **Topo**: selo de nível com barra de XP (toque mostra "faltam X XP"), moedas, diamantes com botão "+" (abre Loja › Diamantes).
- **Esquerda**: Missões (com bolinha "!" quando há recompensa a pegar) e Presentes (contador).
- **Direita**: Configurações (topo), Amigos e Inventário (acima da barra).
- **Barra inferior (92 px)**: ferramentas Mão (colher/interagir — padrão), Arar, Plantar (abre seletor de semente), Mover; e o botão **Loja** grande (68 px) no canto do polegar.
- **Gestos na fazenda**: arrastar com 1 dedo = mover câmera; pinça = zoom (0,5× a 2×); toque = ação da ferramenta atual; **arrastar com ferramenta Arar/Plantar/Mão ativa sobre canteiros = ação em série** (pintar vários canteiros, essencial no celular). Toque longo em objeto = informações.
- **Balão de canteiro**: mostra nome e tempo restante; some após 2 s.
- Ao colher: moedas e XP "voam" do canteiro até o contador do topo.

### 02 · Loja — [`02-loja.svg`](wireframes/02-loja.svg)
- Abas: **Sementes · Animais · Decoração · Diamantes**.
- Grade 3 colunas de cards (98 × 184): ícone, nome, tempo de crescimento (ou produto do animal), botão de preço.
- Item travado: cinza + cadeado + "Nível N".
- Comprar semente → fecha a loja e entra no modo Plantar com aquela semente. Comprar animal/decoração → modo de posicionamento (losango verde/vermelho, botões ✓ e ✕ de 56 px flutuando ao lado do objeto).
- Rodapé: anúncio com recompensa opcional (limite diário).

### 03 · Inventário (Celeiro) — [`03-inventario.svg`](wireframes/03-inventario.svg)
- Abas: **Colheitas · Produtos · Decorações** (decorações guardadas).
- Capacidade ilimitada no MVP (GDD D4): mostra só o total de itens e o botão **Vender tudo** (com confirmação simples).
- Presentes aceitos de vizinhos entram aqui.
- Toque num item → painel de detalhe: vender (– / quantidade / +, botão "Vender 🪙 N"), ou "Colocar na fazenda" para decorações.

### 04 · Missões e conquistas — [`04-missoes.svg`](wireframes/04-missoes.svg)
- Aba **Diárias**: 3 missões com barra de progresso, recompensa e botão. "Pegar!" (verde) quando completa; "Ir" (azul) leva ao lugar certo (ex.: abre a Loja ou destaca canteiros).
- Contador até a renovação (meia-noite de Brasília, UTC−3, conforme o GDD).
- Bônus por completar as 3: baú com 1 diamante + 100 moedas.
- Botão "↻ Trocar" em cada missão não concluída (1 por dia, custa 1 diamante ou 1 anúncio).
- Aba **Conquistas**: mesma lista, com níveis bronze/prata/ouro e troféu.

### 05 · Amigos / vizinhos — [`05-amigos.svg`](wireframes/05-amigos.svg)
- Desbloqueia no nível 4; antes disso o botão Amigos mostra cadeado e "Nível 4".
- Abas: **Vizinhos · Presentes (N) · Convidar**.
- Cada vizinho: avatar, nível, adubos feitos hoje (máx. 5), botões **Visitar** e **🎁 Enviar presente** (cinza quando já enviado hoje).
- **Modo visita**: fazenda só leitura, HUD reduzido (nome e nível do vizinho no topo, contador "Adubos 2/5", botão "Voltar para casa" 56 px). Tocar num canteiro em crescimento = **Adubar** (+10% na venda para o dono; 10 moedas + 2 XP para quem ajuda).
- Aba Presentes: lista com "Aceitar" (vai para o Celeiro) e "Aceitar todos".
- Aba Convidar: mostra **meu código de 6 caracteres**, botão Compartilhar link (`navigator.share` quando disponível, senão copia) e campo "Digite o código do vizinho" + botão Adicionar.

### 06 · Configurações — [`06-configuracoes.svg`](wireframes/06-configuracoes.svg)
- Toggles: Música, Efeitos sonoros, Vibração, Notificações de colheita (pós-MVP; aparece desabilitado se não suportado).
- Conta: "Convidado" + botão "Entrar com Google" (vincula a conta anônima, sem perder progresso).
- Ajuda, Privacidade, Apagar progresso (confirmação dupla), versão e ID do jogador (para suporte).

### 07 · Onboarding de 60 s — [`07-onboarding.svg`](wireframes/07-onboarding.svg)
Conforme o GDD: a fazenda inicial já vem com **6 canteiros arados com alface pronta**, para o jogador colher logo de cara. Começa com 200 moedas e 5 diamantes.

| Tempo | Passo | O jogador faz | Destaque |
|---|---|---|---|
| 0–10 s | Boas-vindas | Toca no balão da Dona Flor | Tela escurecida, mascote acenando |
| 10–25 s | Colher | Toca (ou arrasta) nas alfaces prontas | Spot de luz + dedo animado no canteiro |
| 25–40 s | Plantar | Toca no canteiro (ara se precisar) → escolhe Rabanete (1 min) | Spot no canteiro; seletor com só uma semente liberada |
| 40–50 s | Moedas e loja | Vê moedas e XP voarem; toca na Loja e fecha | Spot no botão Loja |
| 50–60 s | Nível 2 | A XP das colheitas fecha o nível 2; toca em "Bora plantar!" | Recompensa de nível do GDD: 🪙 100 + 💎 1 |

Depois do tutorial, o rabanete fica pronto em ~1 min: o jogador já vê o ciclo completo na primeira sessão.

Regras: botão **"Pular"** discreto no canto superior direito a partir do 2º passo; só bloqueia toques fora do destaque; progresso do tutorial salvo (se fechar no meio, retoma no passo seguinte). Nada de leitura longa: no máximo 2 linhas por balão.

## 5. Componentes reutilizáveis
| Componente | Tamanho (CSS px) | Notas |
|---|---|---|
| Botão primário | altura 48–56, largura ≥ 120 | 9-slice `ui_botao_verde` |
| Botão ícone redondo | Ø 48–52 | HUD lateral |
| Botão Loja | Ø 68 | Destaque principal |
| Card de item | 98 × 184 (loja), 98 × 88 (inventário) | 3 colunas em 360 px |
| Aba | altura 40 | Ativa em ouro |
| Toggle | 68 × 36 | Linha inteira tocável |
| Painel modal | 336 × até 556, máx. 480 de largura | 9-slice `ui_painel` |
| Toast | altura 40, topo abaixo do HUD | "Celeiro cheio!", "Sem moedas" |
| Contador | badge Ø 20 vermelho | Novidades em Missões/Presentes |

## 6. Acessibilidade
- Contraste mínimo AA em todo texto (ver paleta).
- Nada depende só de cor: estado "pronto" tem brilho + ícone; travado tem cadeado.
- Fonte escalável: opção pós-MVP "texto grande" (+20%).
- Vibração curta (10–20 ms) ao colher/comprar, desativável.
