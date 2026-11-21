# Fazenda Feliz — Guia de Arte (Fase 1)

> Responsável: Artista 2D · Versão 0.1 · 21/11/2026
> Este guia vale para arte final **e** para placeholders. Todo asset entregue deve seguir os nomes, tamanhos e âncoras daqui, para que trocar o placeholder pela arte final não exija mudar código.

## 1. Estilo visual

- **Cartoon 2D isométrico**, leitura imediata em tela de 5".
- **Formas arredondadas e "fofas"**: cantos suaves, proporções exageradas (frutos grandes, animais com cabeça grande).
- **Contorno escuro de 2–3 px** (cor `#3B2A1A`, nunca preto puro) em objetos; terreno sem contorno.
- **Sombreamento em 2 tons** (base + sombra a ~20% mais escura), sem gradientes complexos. Um brilho branco opcional em frutos e moedas.
- **Luz vem do canto superior esquerdo**. Sombra de contato: elipse `#000000` a 20% de opacidade sob cada objeto.
- **Silhueta primeiro**: cada cultura e animal tem de ser reconhecível só pela silhueta (teste em 48 px).
- **Nada de texto dentro das imagens** (textos ficam no código, em pt-BR, para facilitar tradução e nitidez).
- Tom alegre e diurno. Sem ciclo dia/noite no MVP (decisão de escopo: mais simples).

## 2. Paleta

### 2.1 Mundo
| Uso | Nome | Hex |
|---|---|---|
| Grama clara | Grama 1 | `#8BCB4A` |
| Grama sombra | Grama 2 | `#6FAE3A` |
| Terra seca | Terra 1 | `#C68A4E` |
| Terra arada | Terra 2 | `#9A6232` |
| Terra molhada/sombra | Terra 3 | `#6E4322` |
| Água | Água | `#4FB3E8` |
| Céu/fundo fora do mapa | Céu | `#BFE7F7` |
| Madeira clara | Madeira 1 | `#D9A066` |
| Madeira escura | Madeira 2 | `#8F5A2E` |
| Telhado | Telhado | `#D9483B` |
| Pedra | Pedra | `#A7A9AC` |
| Contorno | Contorno | `#3B2A1A` |

### 2.2 Interface
| Uso | Nome | Hex |
|---|---|---|
| Painel (fundo) | Creme | `#FFF6E0` |
| Borda de painel | Madeira UI | `#B5773A` |
| Texto principal | Texto | `#3B2A1A` |
| Texto secundário | Texto 2 | `#7A6146` |
| Botão primário (ação) | Verde | `#3FAE49` (sombra `#2C8A35`) |
| Botão secundário | Azul | `#3D8DDB` (sombra `#2A6DAF`) |
| Botão perigo / cancelar | Vermelho | `#E5534B` (sombra `#B83A33`) |
| Moedas | Ouro | `#F7C531` (sombra `#D99A12`) |
| Moeda premium (Diamantes) | Turquesa | `#2EC4C9` (sombra `#1E979B`) |
| XP / nível | Roxo | `#8E5BD9` |
| Energia/tempo / destaque | Laranja | `#F59A23` |
| Desabilitado | Cinza | `#BDB6AA` |

Contraste: texto `#3B2A1A` sobre `#FFF6E0` ≈ 12:1 (passa AA/AAA). Texto branco só sobre Verde, Azul, Vermelho e Roxo, sempre em **negrito ≥ 16 px** com contorno de 2 px na cor de sombra do botão.

### 2.3 Tipografia
- **Títulos e números**: "Baloo 2" (Google Fonts, OFL), peso 700/800.
- **Texto corrido**: "Nunito" (OFL), peso 600/700.
- Tamanhos mínimos (em px CSS, tela base 360×640): corpo 16, rótulo de botão 18, título de tela 24, números do HUD 18.
- Fontes embutidas no build (woff2, só subconjunto latino) para funcionar offline.

## 3. Grade isométrica e proporções

- **Projeção 2:1** (isométrica "de jogo"): tile do chão = **128 × 64 px** (losango) na resolução @2x. Em @1x, 64 × 32.
- Arte é produzida em **@2x** e o jogo escala conforme o `devicePixelRatio` (≤ 2 carrega @2x; > 2 também usa @2x — ganho visual não compensa o peso).
- **Mapa de 20 × 20 tiles**, área utilizável inicial **10 × 10**; expansões para 12×12, 15×15 e 20×20 (GDD, seção 6). Tiles fora da área usam `terreno_bloqueado`.
- **Canteiro (plot) de cultura = 1 tile.** Animais ocupam 1 tile (GDD: ficam em qualquer tile livre). Construções: 1×1 (quadro de missões, caixa de correio) ou 3×3 (casa, celeiro).
- **Altura máxima de sprite**: 1 tile = até 128 px de altura; 2×2 = até 256 × 220; 3×3 = até 384 × 320.
- **Âncora (origin)** de todo objeto: centro do losango da base → no Phaser `setOrigin(0.5, 1 - (alturaDoLosango/2)/alturaDoSprite)`. Para facilitar, todo sprite de 1 tile é exportado em canvas **128 × 128** com o losango encostado no fundo; origin = `(0.5, 0.75)`.
- **Ordenação de profundidade**: `depth = (x + y) * 10 + camada`, onde camada 0 = chão, 1 = objeto, 2 = efeitos.
- **Área de toque**: o polígono do losango, não o retângulo do sprite (evita tocar no vizinho errado).

```
        128 px
   ┌──────────────┐
   │      /\      │ ← parte "em pé" do objeto (até 64 px acima do losango)
   │     /  \     │
   │    /    \    │ 128 px
   │   <  ●   >   │ ← ● = âncora (0.5, 0.75)
   │    \    /    │
   │     \  /     │  losango 128×64
   └──────────────┘
```

## 4. Lista completa de assets do MVP

Convenção de nome: `categoria_nome_variante.png` (minúsculas, sem acento, `_` como separador). Exemplo: `cultura_milho_3.png`.

Estágios de cultura (o GDD define 4 estágios visuais): **0 = semente** usa um tile genérico compartilhado (`terreno_terra_semeada`, terra arada com pontinhos); **1 = broto** (1/3 do tempo), **2 = crescendo** (2/3), **3 = pronto para colher** (com leve brilho/pulso feito por código, não por arte). Culturas não murcham (GDD D2), então não há sprite de murcha.

### 4.1 Terreno (atlas `terreno`)
| Arquivo | Descrição |
|---|---|
| `terreno_grama_1..3` | 3 variações de grama (quebrar repetição) |
| `terreno_terra_seca` | Canteiro não arado |
| `terreno_terra_arada` | Canteiro arado, pronto para plantar |
| `terreno_terra_semeada` | Estágio 0 de qualquer cultura |
| `terreno_adubado` | Sobreposição (brilho verde) para canteiro adubado por vizinho (+10%) |
| `terreno_caminho_pedra` | Caminho decorativo (também vendido como decoração) |
| `terreno_agua` | Tile de lago (decorativo, bloqueado) |
| `terreno_borda_n/s/l/o` | Bordas do mapa (cerca baixa/arbustos) |
| `terreno_bloqueado` | Área ainda não expandida (grama com névoa + placa "à venda") |
| `terreno_destaque_ok` | Losango verde translúcido (posição válida) |
| `terreno_destaque_erro` | Losango vermelho translúcido (posição inválida) |

### 4.2 Culturas (atlas `culturas`) — 3 estágios + ícone + semente
Cada cultura = `cultura_<nome>_1`, `_2`, `_3` (128×128) + `icone_<nome>` (64×64, produto colhido) + `semente_<nome>` (64×64, saquinho de sementes). Lista e níveis conforme o [GDD](GDD.md), seção 4.

| # | Cultura | Nível | Silhueta do estágio 3 |
|---|---|---|---|
| 1 | Rabanete | 1 | Folhas baixas + bolinha rosa aparecendo |
| 2 | Alface | 1 | Roseta verde-clara redonda |
| 3 | Cenoura | 2 | Folhas finas altas + topo laranja |
| 4 | Milho | 3 | Pé alto com espigas amarelas |
| 5 | Tomate | 4 | Pé com estaca e tomates vermelhos |
| 6 | Batata | 5 | Moita com flores lilás + batatas no chão |
| 7 | Morango | 6 | Moitinha baixa com frutos vermelhos |
| 8 | Abóbora | 8 | Abóbora grande laranja no chão |
| 9 | Girassol | 10 | Flor alta amarela |
| 10 | Trigo | 12 | Feixe dourado |
| 11 | Melancia | 14 | Melancia listrada no chão |
| 12 | Algodão | 16 | Arbusto com chumaços brancos |

Ordem de produção da arte = ordem de nível (o que o jogador vê primeiro é feito primeiro). Total: 12 culturas × (3 estágios + ícone + semente) = **60 imagens**.

### 4.3 Animais (atlas `animais`)
Cada animal: `animal_<nome>_idle` (2 quadros), `animal_<nome>_pronto` (1 quadro, com balão do produto), `icone_<produto>` (64×64).

| Animal | Produto | Ícone do produto |
|---|---|---|
| Galinha | Ovo | `icone_ovo` |
| Vaca | Leite | `icone_leite` |
| Ovelha | Lã | `icone_la` |
| Porco | Trufa | `icone_trufa` |
| Cabra | Queijo de cabra | `icone_queijo` |

Animação mínima: 2 quadros de "respirar/piscar" a 2 fps (leve e barato). Total: 5 × 3 sprites + 5 ícones = **20 imagens**.

### 4.4 Construções (atlas `construcoes`)
| Arquivo | Tamanho | Função |
|---|---|---|
| `construcao_casa` | 3×3 | Casa do fazendeiro (fixa, decorativa) |
| `construcao_celeiro` | 3×3 | Abre o inventário ao tocar |
| `construcao_quadro_missoes` | 1×1 | Quadro de avisos: abre missões diárias |
| `construcao_caixa_correio` | 1×1 | Presentes recebidos de vizinhos |
| `construcao_obra` | 1×1, 2×2, 3×3 | Andaime genérico durante construção |

### 4.5 Decorações (atlas `decoracoes`) — conforme GDD, seção 6
| Arquivo | Tamanho | Preço (GDD) |
|---|---|---|
| `deco_cerca_madeira_h` / `_v` | 1×1 | 10 moedas |
| `deco_canteiro_flores` | 1×1 | 40 moedas |
| `deco_caminho_pedra` (= `terreno_caminho_pedra`) | 1×1 | 15 moedas |
| `deco_espantalho` | 1×1 | 120 moedas |
| `deco_banco` | 2×1 (2 rotações) | 200 moedas |
| `deco_poco` | 1×1 | 500 moedas |
| `deco_moinho` | 2×2 | 1.500 moedas |
| `deco_fonte` | 2×2 | 3 diamantes |
| `deco_coreto` | 2×2 | 8 diamantes |
| `deco_balao_ar_quente` | 2×2 (alto, até 300 px) | 15 diamantes |

Decorações que giram (GDD: "podem ser giradas") precisam de 2 vistas: `_a` e `_b` (espelhamento horizontal resolve quando o objeto é simétrico; o banco e a cerca usam espelho). **~12 imagens.**
Cenário fixo, não vendável: `cenario_arvore_1..2`, `cenario_arbusto` (enfeitam a borda do mapa).

### 4.6 Ícones de interface (atlas `ui`) — 64×64 @2x, salvo indicação
- **Moedas/recursos**: `ui_moeda`, `ui_diamante`, `ui_xp_estrela`, `ui_nivel` (selo), `ui_relogio`.
- **Ferramentas (barra inferior)**: `ui_ferramenta_mao` (mover/colher), `ui_ferramenta_enxada` (arar), `ui_ferramenta_semente`, `ui_ferramenta_mover`, `ui_ferramenta_vender`, `ui_girar`, `ui_guardar`, `ui_acelerar` (diamante + relógio).
- **Navegação**: `ui_loja`, `ui_inventario`, `ui_missoes`, `ui_amigos`, `ui_config`, `ui_fechar`, `ui_voltar`, `ui_confirmar`, `ui_cancelar`, `ui_mais`, `ui_menos`.
- **Estados**: `ui_cadeado`, `ui_check`, `ui_exclamacao` (alerta/novidade), `ui_presente`, `ui_adubo` (ajudar vizinho = adubar), `ui_anuncio_video`, `ui_som_on`, `ui_som_off`, `ui_musica_on`, `ui_musica_off`, `ui_trofeu`, `ui_bau` (recompensa).
- **Painéis em 9-slice**: `ui_painel` (96×96, cantos de 24), `ui_botao_verde/azul/vermelho/cinza` (96×96, cantos de 24), `ui_aba_ativa`, `ui_aba_inativa`, `ui_barra_fundo`, `ui_barra_xp` (preenchimento roxo).
- **Avatares**: `avatar_1..8` (128×128, rostos de fazendeiros variados) + `avatar_moldura`.
- **Mascote do onboarding**: `mascote_dona_flor` (personagem original: senhora fazendeira de chapéu de palha), 3 poses — `aceno`, `apontando`, `comemorando` (256×256).

### 4.7 Efeitos (atlas `efeitos`)
`fx_poeira` (4 quadros, arar), `fx_brilho` (4 quadros, colher/pronto), `fx_moeda_voando` (1 quadro, animado por tween), `fx_estrela_xp`, `fx_confete` (6 partículas coloridas), `fx_coracao` e `fx_adubo` (ajudar vizinho), `fx_nivel_raio` (level up).

### 4.8 Contagem
| Atlas | Imagens aprox. |
|---|---|
| terreno | 16 |
| culturas | 60 |
| animais | 20 |
| construcoes | 7 |
| decoracoes | 15 |
| ui | ~55 |
| efeitos | ~20 quadros |
| avatares + mascote | 12 |
| **Total** | **~210** |

## 5. Formato técnico e meta de peso

- Arte-fonte: vetor (SVG) para facilitar placeholders e reexportação.
- Exportação: PNG @2x → empacotado em **sprite atlas** (TexturePacker ou `free-tex-packer`, formato JSON Hash do Phaser), máx. **2048 × 2048** por atlas (compatível com GPUs antigas).
- Compressão: **WebP com fallback PNG** (`pngquant` 256 cores para o PNG). Phaser carrega o atlas por `this.load.atlas`.
- Placeholders: **SVG simples** (formas geométricas na paleta oficial + nome do asset), rasterizados no build no mesmo tamanho final, com o mesmo nome — trocar pela arte final é só substituir o arquivo.

| Item | Meta |
|---|---|
| Todos os atlas de imagem | **≤ 2,5 MB** (WebP) |
| Primeiro carregamento (o que bloqueia a tela de jogo: terreno + 2 culturas iniciais + ui) | **≤ 800 KB** |
| Fontes (2 famílias, subset latino) | ≤ 120 KB |
| Áudio (ver `audio.md`) | ≤ 1,5 MB |
| **Pacote total do jogo (JS + arte + áudio)** | **≤ 5 MB** |
| Textura em memória de GPU | ≤ 64 MB |

Carregamento em dois lotes: lote 1 (boot) = terreno, ui, culturas de nível 1–2 (rabanete, alface, cenoura) e mascote; lote 2 (em segundo plano) = resto. Isso mantém a tela inicial rápida em 3G/4G.

## 6. Checklist de entrega de um asset
1. Nome segue a convenção e está na lista acima.
2. Tamanho de canvas e âncora corretos (losango encostado no fundo).
3. Só cores da paleta (+ variações de sombra a −20%).
4. Contorno `#3B2A1A` 2–3 px, sombra de contato presente.
5. Legível em 48 px; silhueta distinta das outras culturas.
6. Sem texto embutido.
7. Exportado @2x, transparente, sem borda vazia sobrando além do canvas padrão.
