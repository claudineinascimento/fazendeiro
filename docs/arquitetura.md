# Fazenda Feliz — Arquitetura Técnica (Fase 1)

Responsável: Dev Front-end + Dev Backend
Status: proposta para aprovação do produtor
Última atualização: 21/11/2026

Este documento define como o jogo será construído. Não contém código de jogo, apenas as decisões, estruturas e contratos que as Fases 2 a 4 vão seguir. Os números de economia (preços, tempos, XP) vêm do GDD e moram em arquivos de dados, nunca no código.

---

## 1. Resumo das decisões

| # | Decisão | Escolha | Por quê |
|---|---------|---------|---------|
| D1 | Linguagem | **TypeScript** (modo `strict`) | O mesmo formato de dados (save, culturas, animais) é usado por jogo, nuvem e testes. Tipos pegam erros de economia em tempo de compilação. O Vite compila TS sem configuração extra, então o custo é quase zero. |
| D2 | Motor | **Phaser 3** (última 3.x estável), renderizador WebGL com fallback Canvas | Pedido do produtor; maduro em celular. |
| D3 | Build | **Vite** + `vite-plugin-pwa` (Workbox) | Build rápido, PWA pronto. |
| D4 | Interface (HUD, loja, inventário, missões, amigos) | **HTML/CSS por cima do canvas** (camada DOM) | Texto em português nítido, rolagem nativa de listas, botões grandes acessíveis e fáceis de testar. O Phaser fica só com o mundo (fazenda, animais, efeitos). |
| D5 | Framework de UI | **Nenhum** (DOM puro com pequenos componentes TS) | Opção mais simples; poucas telas; evita mais um bundle. |
| D6 | Estado do jogo | **Um único objeto `EstadoJogo`** em memória, alterado só por *ações* puras | Fácil de salvar, testar e validar. |
| D7 | Timers | **Por timestamp** (hora de início + duração), nunca contadores | Continuam com o jogo fechado sem nada rodando. |
| D8 | Relógio | **Hora do servidor** (offset calculado no login) | Dificulta trapaça mudando o relógio do celular. |
| D9 | Save | **Um documento Firestore por jogador** + cópia local (IndexedDB do Firestore) | Simples, barato (1 escrita a cada ~30 s), funciona offline. |
| D10 | Backend | **Somente Firebase** (Auth, Firestore, Hosting, Analytics). **Sem Cloud Functions no MVP** | Plano gratuito (Spark) basta. Antitrapaça fica nas regras do Firestore. Functions entram só se houver compra real (plano Blaze). |
| D11 | Login | Anônimo automático na 1ª abertura; botão "Salvar com Google" faz *link* da conta anônima | Joga em 1 toque; não perde progresso ao entrar com Google. |
| D12 | Amigos | Por **código de amigo** (6 caracteres) e por link de convite | Não depende de lista de contatos nem de rede social. |
| D13 | Presentes | Presentes **gerados** (não saem do inventário de quem envia), 1 por amigo por dia | Elimina duplicação de itens como vetor de trapaça. |
| D14 | Notificações push | **Fora do MVP** | Web Push no iOS só funciona com o PWA instalado; custo alto para o MVP. Reavaliar após o Beta. |
| D15 | Compra real de moeda premium | **Fora do MVP** (diamantes só por jogo e anúncios) | Exige Cloud Functions + gateway de pagamento. Arquitetura já prevê o ponto de entrada. |
| D16 | Testes | **Vitest** (lógica pura) + **Playwright** (fumaça em navegador) | Lógica separada do Phaser é testável sem navegador. |

---

## 2. Estrutura de pastas do repositório

```
fazenda-feliz/
├─ index.html                 # página única; contém <canvas> e a camada #ui
├─ vite.config.ts             # Vite + PWA
├─ tsconfig.json
├─ firebase.json              # Hosting + regras + emuladores
├─ firestore.rules            # regras de segurança (seção 7)
├─ firestore.indexes.json
├─ .env.example               # chaves públicas do Firebase (VITE_FIREBASE_*)
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/                  # 192, 512, maskable
│  └─ audio/                  # .ogg + .m4a (fallback iOS)
├─ assets-src/                # arte fonte (SVG/PNG) do Artista; não vai pro build
├─ src/
│  ├─ main.ts                 # inicia Phaser, UI e serviços
│  ├─ config.ts               # constantes técnicas (tamanho do tile, intervalo de save)
│  ├─ dados/                  # dados de design, gerados a partir do GDD (JSON tipado)
│  │  ├─ culturas.json
│  │  ├─ animais.json
│  │  ├─ construcoes.json
│  │  ├─ decoracoes.json
│  │  ├─ niveis.json          # XP necessário por nível e desbloqueios
│  │  ├─ missoes.json
│  │  ├─ conquistas.json
│  │  └─ tipos.ts             # interfaces dos JSON acima
│  ├─ nucleo/                 # LÓGICA PURA: sem Phaser, sem Firebase, sem DOM
│  │  ├─ estado.ts            # tipo EstadoJogo + estado inicial + migrações de versão
│  │  ├─ acoes.ts             # arar, plantar, colher, comprar, vender, alimentar...
│  │  ├─ tempo.ts             # agora(), estágio de crescimento, tempo restante
│  │  ├─ economia.ts          # moedas, diamantes, XP, subida de nível
│  │  ├─ missoes.ts           # sorteio diário e progresso
│  │  ├─ conquistas.ts
│  │  └─ validacao.ts         # mesmos limites das regras do Firestore (seção 8)
│  ├─ cenas/                  # cenas Phaser
│  │  ├─ CenaBoot.ts          # carrega o mínimo e mostra a barra de progresso
│  │  ├─ CenaCarregamento.ts  # atlas, áudio
│  │  ├─ CenaFazenda.ts       # fazenda do jogador
│  │  └─ CenaVisita.ts        # fazenda do vizinho (somente leitura + ajudar)
│  ├─ mundo/                  # objetos visuais do Phaser
│  │  ├─ isometrico.ts        # conversões grade <-> tela (seção 3)
│  │  ├─ GradeFazenda.ts      # desenha tiles, ordena profundidade
│  │  ├─ SpriteCanteiro.ts
│  │  ├─ SpriteAnimal.ts
│  │  ├─ SpriteDecoracao.ts
│  │  └─ camera.ts            # arrastar + pinça + limites
│  ├─ ui/                     # camada DOM
│  │  ├─ hud.ts
│  │  ├─ loja.ts
│  │  ├─ inventario.ts
│  │  ├─ missoes.ts
│  │  ├─ amigos.ts
│  │  ├─ configuracoes.ts
│  │  ├─ onboarding.ts
│  │  ├─ componentes/         # botão, modal, toast, contador
│  │  └─ estilos.css
│  ├─ servicos/
│  │  ├─ firebase.ts          # inicialização única
│  │  ├─ auth.ts              # anônimo, Google, link de contas
│  │  ├─ salvamento.ts        # fila de save, debounce, offline
│  │  ├─ relogio.ts           # offset com a hora do servidor
│  │  ├─ vizinhos.ts          # amigos, visita, ajuda, presentes
│  │  ├─ anuncios.ts          # interface + implementação "simulada" e H5 Ads
│  │  ├─ analytics.ts         # eventos (ver monetizacao.md)
│  │  └─ audio.ts             # música/efeitos + mudo persistido
│  └─ textos/
│     └─ pt-BR.ts             # TODOS os textos visíveis do jogo
├─ tests/
│  ├─ unit/                   # Vitest sobre src/nucleo
│  ├─ regras/                 # testes das regras com o emulador do Firestore
│  └─ e2e/                    # Playwright (fumaça, celular emulado)
└─ docs/                      # estes documentos
```

Regra de dependência (verificada no code review): `nucleo/` não importa nada de `cenas/`, `mundo/`, `ui/` ou `servicos/`. As cenas e a UI leem o estado e disparam ações; os serviços salvam e carregam o estado.

---

## 3. Grade isométrica

### 3.1 Parâmetros
- Tile em losango 2:1: **128 × 64 px** na arte (escala 1). Constantes em `config.ts`: `TILE_L = 128`, `TILE_A = 64`.
- Fazenda inicial **12 × 12** tiles; expansões de +2 em cada eixo até **20 × 20** (valores finais no GDD).
- Cada objeto ocupa um retângulo de tiles: canteiro 1×1, animal 1×1 (anda dentro de um cercado 2×2), construções 2×2 ou 3×3, decorações 1×1 ou 2×1.

### 3.2 Conversões
```
tela.x = (gx - gy) * TILE_L / 2 + origemX
tela.y = (gx + gy) * TILE_A / 2 + origemY

gx = floor( ((tx - origemX) / (TILE_L/2) + (ty - origemY) / (TILE_A/2)) / 2 )
gy = floor( ((ty - origemY) / (TILE_A/2) - (tx - origemX) / (TILE_L/2)) / 2 )
```
`tx, ty` são as coordenadas do toque já convertidas para o mundo pela câmera (`camera.getWorldPoint`).

### 3.3 Ocupação e profundidade
- Mapa de ocupação `ocupacao[gy][gx] = idObjeto | null`, reconstruído do estado ao carregar. Mover ou colocar um objeto checa todos os tiles do retângulo.
- Profundidade (`setDepth`) = `(gx + gy) * 10 + camada` usando o tile mais à frente do objeto (`gx+largura-1`, `gy+altura-1`). Camadas: 0 chão, 1 cultura, 2 objeto, 3 efeito.
- O chão é desenhado **uma vez** numa `RenderTexture` (ou `Blitter`) e só é redesenhado quando o terreno muda (arar/expandir). Isso mantém os 60 fps.

### 3.4 Câmera
- Arrastar com 1 dedo move a câmera; pinça com 2 dedos dá zoom entre **0,5× e 2×**, centrado no ponto médio dos dedos. Roda do mouse no desktop.
- Limites da câmera = retângulo da fazenda + margem de 1 tile.
- **Toque vs. arrasto:** só conta como toque se o dedo se moveu menos de 10 px e ficou menos de 300 ms. Isso evita plantar sem querer ao arrastar.

### 3.5 Desempenho (meta 60 fps em celular médio)
- Tudo num **atlas de texturas** (TexturePacker ou `free-tex-packer`), máximo 2048×2048 por página, PNG otimizado ou WebP.
- Resolução: `pixelArt: false`, `resolution: min(devicePixelRatio, 2)`.
- Culturas atualizam o sprite só quando muda o estágio (verificação a cada 1 s, não a cada quadro).
- Sem física; animais andam por *tweens* simples.
- Pausar a renderização quando a aba fica oculta (`visibilitychange`).

---

## 4. Estado do jogo e ações

### 4.1 Formato do `EstadoJogo` (resumo)
```ts
interface EstadoJogo {
  versao: number;            // versão do formato, para migrações
  seq: number;               // incrementa a cada save (detecção de conflito)
  moedas: number;
  diamantes: number;         // moeda premium
  xp: number;
  nivel: number;
  fazenda: {
    largura: number; altura: number;
    tiles: Record<string, Tile>;        // chave "gx,gy" -> só tiles não-grama
    objetos: Record<string, Objeto>;    // animais, construções, decorações
  };
  inventario: Record<string, number>;   // idItem -> quantidade
  missoes: { dia: string; lista: MissaoAtiva[] };    // dia = "2026-11-21"
  conquistas: Record<string, { progresso: number; concluida: boolean }>;
  anuncios: { dia: string; vistos: number };
  presentes: { dia: string; enviadosPara: string[] };
  config: { som: boolean; musica: boolean };
  tutorialConcluido: boolean;
  atualizadoEm: Timestamp;   // preenchido pelo servidor
}

interface Tile {
  tipo: 'arado' | 'plantado';
  cultura?: string;          // id em culturas.json
  plantadoEm?: number;       // ms, hora do servidor
  adubado?: boolean;         // ajuda de vizinho
}
```

### 4.2 Ações
Cada ação é uma função pura `(estado, parametros, agora) => estado novo | erro` em `nucleo/acoes.ts`: `arar`, `plantar`, `colher`, `comprar`, `vender`, `colocarObjeto`, `moverObjeto`, `guardarObjeto`, `alimentarAnimal`, `coletarProduto`, `expandirFazenda`, `resgatarMissao`, `aplicarAjuda`, `receberPresente`, `recompensaAnuncio`.

Toda ação valida pré-condições (moedas suficientes, nível mínimo, tile livre, cultura pronta). As cenas e a UI **nunca** alteram o estado diretamente. Isso dá três ganhos: testes unitários simples, um único ponto para acionar save/analytics/som, e as mesmas regras do servidor aplicadas localmente.

---

## 5. Timers por timestamp

Nenhum timer "conta" no aparelho. Guardamos **quando começou** e calculamos tudo a partir da hora atual:

```
decorrido = agora() - plantadoEm
pronto    = decorrido >= cultura.tempoCrescimentoMs
estagio   = pronto ? 3 : (decorrido < 1/2 do tempo ? 1 : 2)   // 3 estágios do Artista
restante  = max(0, cultura.tempoCrescimentoMs - decorrido)
```

- O mesmo vale para animais (`alimentadoEm` + `tempoProducaoMs`) e construções.
- Ao abrir o jogo depois de horas fechado, basta desenhar: tudo que passou do tempo aparece pronto. Nada precisa "rodar" em segundo plano.
- **Culturas não murcham no MVP** (decisão mais simples; reduz frustração; registrada também para o Game Designer).
- `agora()` vem de `servicos/relogio.ts`:
  1. No login, o cliente grava `users/{uid}.ultimoAcesso = serverTimestamp()` e lê de volta.
  2. `offset = horaServidor - Date.now()` (corrigido pela metade do tempo de ida e volta).
  3. `agora() = Date.now() + offset`. Recalculado a cada volta ao primeiro plano.
  4. Offline sem offset conhecido: usa o último offset salvo em `localStorage`; sem nenhum, usa `Date.now()`. A validação do servidor (seção 8) corrige abusos na sincronização.
- Para pular o tempo com diamantes, a ação apenas recua `plantadoEm`; o servidor aceita porque o custo em diamantes é debitado na mesma escrita.

---

## 6. Modelo de dados no Firestore

Coleções (ids sempre = `uid` do Firebase Auth quando for documento do jogador):

| Caminho | Quem lê | Quem escreve | Conteúdo |
|---------|---------|--------------|----------|
| `saves/{uid}` | só o dono | só o dono, validado | `EstadoJogo` completo (seção 4.1). Tamanho alvo < 100 KB (limite 1 MB). |
| `perfis/{uid}` | qualquer jogador logado | só o dono | `nome`, `avatar`, `nivel`, `codigoAmigo`, `ultimoAcesso`. |
| `fazendasPublicas/{uid}` | qualquer jogador logado | só o dono | Cópia "de vitrine" da fazenda para visitas: `largura`, `altura`, `tiles`, `objetos`, `nivel`, `atualizadoEm`. Atualizada junto com o save, no máximo 1 vez a cada 5 min. |
| `codigosAmigo/{codigo}` | qualquer logado | criado 1 vez pelo dono | `{ uid }`. Permite achar o jogador pelo código. |
| `perfis/{uid}/amigos/{amigoUid}` | só o dono | só o dono | `{ desde }`. Amizade é registrada dos dois lados: cada um grava no próprio documento ao aceitar o convite. |
| `convites/{deUid_paraUid}` | os dois envolvidos | criado por `de`, apagado por qualquer um | Pedido de amizade pendente. |
| `ajudas/{donoUid}/itens/{ajudanteUid_AAAAMMDD}` | dono e ajudante | criado pelo ajudante, apagado pelo dono | 1 ajuda por amigo por dia: `{ tipo: 'adubar', tile: "gx,gy", criadoEm }`. O dono aplica ao abrir o jogo. |
| `presentes/{deUid_paraUid_AAAAMMDD}` | remetente e destinatário | criado pelo remetente, apagado pelo destinatário | `{ de, para, item, criadoEm }`. Item só da lista de presentes do GDD. |

Por que separar `saves` de `fazendasPublicas`: o save tem inventário, diamantes e missões, que não devem ser visíveis nem baixados por outros jogadores; e a vitrine é pequena e barata de ler.

**Estimativa de custo (plano gratuito: 50 mil leituras e 20 mil escritas por dia):** sessão média de 8 min com save a cada 30 s ≈ 16 escritas + ~10 leituras. Cabe com folga até ~1.000 jogadores ativos por dia. Acima disso, migrar para o plano Blaze (pago por uso).

---

## 7. Salvamento automático e offline

### 7.1 Fluxo de save
1. Toda ação bem-sucedida marca o estado como "sujo".
2. `salvamento.ts` grava **no máximo a cada 30 s**, e imediatamente em: subida de nível, compra com diamantes, `visibilitychange` para oculto e `pagehide`.
3. Escrita com `setDoc(saves/{uid}, estado)`, com `seq + 1` e `atualizadoEm: serverTimestamp()`.
4. A UI mostra um ícone discreto de nuvem: ok, salvando ou offline.

### 7.2 Offline
- Firestore com **cache persistente em IndexedDB** (`persistentLocalCache`). Escritas offline ficam na fila e são enviadas sozinhas ao voltar a conexão.
- Abrir o jogo offline funciona se o jogador já abriu antes: o service worker serve o app e o Firestore serve o último estado do cache.
- **Primeira abertura exige internet** (para criar a conta anônima). Mensagem clara se não houver.
- Recursos sociais (visitar, presentes, ajudar) ficam desativados offline, com aviso.

### 7.3 Conflito entre aparelhos
Decisão mais simples: **o save com maior `seq` vence**. Ao carregar, se o `seq` da nuvem for maior que o do cache local, usa-se a nuvem. Se uma escrita for recusada porque outro aparelho já salvou um `seq` maior, o jogo recarrega o estado da nuvem e avisa "Seu progresso foi atualizado de outro aparelho". Jogar em dois aparelhos ao mesmo tempo pode perder alguns segundos de progresso; registrado como risco aceito no MVP.

### 7.4 Migrações
`estado.versao` sobe quando o formato muda; `nucleo/estado.ts` tem uma função de migração por versão. Saves antigos nunca quebram.

---

## 8. Regras de segurança e antitrapaça

### 8.1 Princípios
- O cliente é **autoritativo** sobre o próprio save (sem servidor de jogo no MVP), mas o Firestore **rejeita** escritas fisicamente impossíveis.
- Ninguém lê nem escreve o save de outro jogador.
- Escritas sociais têm ids determinísticos (`de_para_dia`), o que limita naturalmente a 1 por dia sem precisar de contador.

### 8.2 Validações no save (`saves/{uid}`)
Com `d = request.resource.data`, `a = resource.data` e `seg = segundos desde a.atualizadoEm`:

| Regra | Bloqueia |
|-------|----------|
| `d.atualizadoEm == request.time` | data de save falsa |
| `d.seq > a.seq` | reenvio de saves antigos (replay) e save atrasado de outro aparelho |
| `d.versao >= a.versao` | rebaixar o formato |
| moedas, diamantes, xp e nível ≥ 0 e numéricos | valores negativos ou texto |
| `d.moedas - a.moedas <= LIMITE_MOEDAS_FIXO + seg * LIMITE_MOEDAS_POR_SEG` | moedas infinitas |
| `d.xp - a.xp <= LIMITE_XP_FIXO + seg * LIMITE_XP_POR_SEG` | XP infinito |
| `d.diamantes - a.diamantes <= LIMITE_DIAMANTES_POR_SAVE` (ex.: 10) | diamantes infinitos |
| `d.nivel <= a.nivel + 1` | pular vários níveis numa escrita |
| `d.anuncios.vistos <= MAX_ANUNCIOS_DIA` (ex.: 5) | recompensa de anúncio infinita |
| `d.fazenda.largura <= 20 && d.fazenda.altura <= 20` | fazenda gigante |
| tamanho do documento: `d.keys().size()` e número de tiles limitados | inchar o documento |

As constantes `LIMITE_*` são calculadas a partir da tabela do GDD (maior lucro possível por segundo × 3 de margem). O mesmo valor fica em `nucleo/validacao.ts` e o cliente **também** valida antes de enviar, evitando que um jogador honesto tenha o save recusado.

**Tempo de crescimento:** a regra não consegue percorrer todos os tiles; então a defesa é em camadas: (a) o relógio do servidor no cliente (seção 5), (b) o limite de moedas/XP por segundo acima, que torna inútil colher mais rápido do que o possível, (c) eventos de analytics marcam saves com ganho próximo ao limite para revisão manual.

### 8.3 Esboço das regras (`firestore.rules`)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function logado() { return request.auth != null; }
    function eu(uid)  { return logado() && request.auth.uid == uid; }
    function hoje()   { /* "AAAAMMDD" a partir de request.time */ }

    match /saves/{uid} {
      allow read: if eu(uid);
      allow create: if eu(uid) && saveInicialValido();
      allow update: if eu(uid) && saveValido(request.resource.data, resource.data);
      allow delete: if false;
    }
    match /perfis/{uid} {
      allow read: if logado();
      allow write: if eu(uid) && perfilValido();
      match /amigos/{amigo} { allow read, write: if eu(uid); }
    }
    match /fazendasPublicas/{uid} {
      allow read: if logado();
      allow write: if eu(uid) && vitrineValida();
    }
    match /codigosAmigo/{codigo} {
      allow read: if logado();
      allow create: if logado() && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
    match /convites/{id} {
      allow read, delete: if logado() && (resource.data.de == request.auth.uid
                                       || resource.data.para == request.auth.uid);
      allow create: if logado() && request.resource.data.de == request.auth.uid
                    && id == request.auth.uid + '_' + request.resource.data.para;
    }
    match /ajudas/{dono}/itens/{id} {
      allow read: if eu(dono) || (logado() && resource.data.ajudante == request.auth.uid);
      allow create: if logado() && id == request.auth.uid + '_' + hoje()
                    && exists(/databases/$(db)/documents/perfis/$(dono)/amigos/$(request.auth.uid));
      allow delete: if eu(dono);
    }
    match /presentes/{id} {
      allow read: if logado() && (resource.data.de == request.auth.uid
                               || resource.data.para == request.auth.uid);
      allow create: if logado() && request.resource.data.de == request.auth.uid
                    && id == request.auth.uid + '_' + request.resource.data.para + '_' + hoje()
                    && request.resource.data.item in ['semente_morango', 'racao', 'adubo', 'cerca_branca'];
      allow delete: if logado() && resource.data.para == request.auth.uid;
    }
  }
}
```
A lista de itens de presente é provisória; a final vem do GDD. As regras são testadas com o emulador (`tests/regras/`) antes de cada deploy.

### 8.4 Outras proteções
- **App Check** (reCAPTCHA Enterprise, gratuito até a cota) ligado no Beta, para dificultar scripts fora do navegador.
- Chaves do Firebase são públicas por natureza; a segurança vem das regras, não de esconder chaves.
- Recompensa de anúncio só é concedida quando o SDK confirma o fim do vídeo e respeita o limite diário (regra acima).

---

## 9. Login

1. 1ª abertura: `signInAnonymously`. Cria `saves/{uid}` com o estado inicial e `perfis/{uid}` com um nome automático ("Fazendeiro 4821").
2. Em Configurações e após o nível 3, convite discreto: "Salve seu progresso com o Google". Usa `linkWithPopup(GoogleAuthProvider)` (redirect no iOS standalone, onde popups falham). O `uid` não muda, então nada precisa ser copiado.
3. Se a conta Google já existir com outro progresso: perguntar qual manter ("Usar progresso deste aparelho" ou "Usar progresso salvo no Google"). Opção mais simples de implementar e de entender.
4. Sair da conta anônima apaga o progresso local; por isso o botão "Sair" só aparece para contas Google.

---

## 10. PWA

- `manifest.webmanifest`: `name: "Fazenda Feliz"`, `display: "standalone"`, `orientation: "any"`, `theme_color` e `background_color` da paleta do Artista, ícones 192/512 e maskable.
- Service worker via `vite-plugin-pwa` (estratégia `generateSW`):
  - **Precache:** HTML, JS, CSS, atlas, fontes e sons curtos (alvo total < 5 MB).
  - **Runtime:** música em `CacheFirst` (baixada na primeira vez que toca).
  - Firebase fica fora do service worker; quem cuida do offline dele é o próprio SDK.
- Atualização: `registerType: 'prompt'`. Aparece um aviso "Nova versão disponível. Atualizar" e o jogo salva antes de recarregar.
- Botão "Instalar" na tela de Configurações (evento `beforeinstallprompt` no Android; instruções "Compartilhar → Adicionar à Tela de Início" no iOS).
- Meta de carregamento: jogável em < 5 s numa conexão 4G no primeiro acesso, < 2 s nos seguintes.

---

## 11. Áudio
- Formatos: **.ogg** (Android/desktop) e **.m4a** (Safari). Efeitos < 30 KB; música em loop < 1 MB.
- O áudio só inicia depois do primeiro toque (exigência dos navegadores).
- Botões separados para som e música, salvos em `estado.config` e em `localStorage`.

---

## 12. Ambientes e deploy
- Dois projetos Firebase: `fazenda-feliz-dev` e `fazenda-feliz-prod`.
- Desenvolvimento local com **Firebase Emulator Suite** (Auth + Firestore). Ninguém precisa de conta na nuvem para programar.
- `npm run dev`, `npm run test`, `npm run test:regras`, `npm run build`, `npm run deploy` (`firebase deploy --only hosting,firestore`).
- Canais de pré-visualização do Firebase Hosting para testar cada fase com um link: `firebase hosting:channel:deploy fase2`.
- CI (GitHub Actions, se houver repositório no GitHub): lint, testes unitários, testes de regras e build a cada PR.

---

## 13. Riscos técnicos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Antitrapaça só por regras não cobre tudo | Médio (sem ranking competitivo no MVP, quem trapaceia só afeta a si mesmo) | Limites por segundo; App Check; Cloud Functions na pós-MVP se houver ranking ou compras. |
| iOS Safari: limites de armazenamento e áudio | Médio | Testes em iPhone real (plano de testes); pedir instalação do PWA; áudio após toque. |
| Popup do Google bloqueado no PWA iOS | Baixo | Usar `signInWithRedirect` quando em modo standalone. |
| Save de 2 aparelhos ao mesmo tempo | Baixo | Último vence + `seq`; documentado. |
| Desempenho em celular fraco | Médio | Atlas, chão em RenderTexture, limite de objetos animados, perfil "gráficos leves" se cair de 30 fps. |
| Cota gratuita do Firestore | Baixo no início | Save a cada 30 s, vitrine a cada 5 min; alarme de uso no console. |
