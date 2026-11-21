# Fazenda Feliz — Plano de Tarefas (Fases 2 a 4)

Status: proposta para aprovação do produtor
Última atualização: 21/11/2026

Siglas dos responsáveis:
**GD** Game Designer · **FE** Dev Front-end · **BE** Dev Backend · **ART** Artista 2D · **UX** UI/UX Designer · **SOM** Sound Designer · **QA** Qualidade · **MKT** Monetização/Marketing · **PROD** Produtor

Cada tarefa entrega arquivos reais no repositório. "Pronto" significa: código ou arquivo no repositório, revisado, com os testes da tarefa passando e o item correspondente do [plano de testes](plano-de-testes.md) verificado.

Pré-requisito antes da Fase 2: **um repositório no GitHub** para o projeto (o produtor cria e me passa o nome; eu conecto e configuro). Até lá, os arquivos ficam na pasta compartilhada do projeto.

---

## Fase 2 — Protótipo jogável (plantar, colher, moedas e loja)

Objetivo: abrir um link no celular, arar, plantar 3 culturas, esperar, colher, ganhar moedas e comprar sementes. Salvamento só local nesta fase.

| ID | Tarefa | Resp. | Depende de | Pronto quando |
|----|--------|-------|-----------|---------------|
| F2-01 | Criar projeto Vite + TS + Phaser, ESLint, Prettier, Vitest; estrutura de pastas da arquitetura | FE | repositório | `npm run dev` abre um canvas vazio; `npm test` roda |
| F2-02 | Converter tabelas do GDD em `src/dados/*.json` + `tipos.ts` (culturas, níveis, loja) | GD + FE | GDD aprovado | JSON validado por teste de esquema |
| F2-03 | `nucleo/`: estado, ações `arar/plantar/colher/comprar/vender`, `tempo.ts`, `economia.ts` | FE | F2-02 | ≥ 90% de cobertura de testes no `nucleo/` |
| F2-04 | Grade isométrica 12×12, conversão toque → tile, ordenação de profundidade | FE | F2-01 | toque acerta o tile certo em 3 níveis de zoom |
| F2-05 | Câmera: arrastar, pinça, limites, toque vs. arrasto | FE | F2-04 | teste manual em Android e iPhone |
| F2-06 | Placeholders SVG/PNG: grama, terra arada, 3 culturas × 3 estágios, ícones de moeda/XP, atlas | ART | guia de arte | atlas carregado no jogo |
| F2-07 | HUD (moedas, XP, nível) e loja de sementes em DOM, botões ≥ 48 px | UX + FE | wireframes | loja abre, compra e fecha com uma mão |
| F2-08 | Timers por timestamp: estágios visuais e "pronto para colher" após reabrir o jogo | FE | F2-03 | fechar 10 min e reabrir mostra cultura pronta |
| F2-09 | Save local (`localStorage`) a cada ação, com versão de formato | FE | F2-03 | recarregar a página mantém tudo |
| F2-10 | 4 sons placeholder (plantar, colher, moeda, clique) + botão mudo | SOM + FE | — | som após primeiro toque; mudo persiste |
| F2-11 | Projeto Firebase dev, emuladores e deploy em canal de pré-visualização | BE | F2-01 | link de teste funcionando no celular |
| F2-12 | Rodar os testes da Fase 2 (seção 5 do plano de testes) e relatar bugs | QA | F2-01 a F2-11 | relatório com bugs bloqueantes resolvidos |
| F2-13 | Revisão da economia jogando o protótipo (ritmo das 3 culturas) | GD | F2-12 | ajustes registrados nos JSON |

Entrega para aprovação: link do canal de pré-visualização + resumo + riscos.

---

## Fase 3 — MVP completo (todos os sistemas)

### 3A. Progresso e conteúdo
| ID | Tarefa | Resp. | Depende de |
|----|--------|-------|-----------|
| F3-01 | Todas as culturas do GDD, níveis 1–20 com desbloqueios, subida de nível com efeito | GD + FE | Fase 2 |
| F3-02 | Inventário (sementes, produtos, decorações guardadas), vender produtos | FE + UX | F3-01 |
| F3-03 | Decoração: colocar, mover, girar (se houver), guardar; modo edição | FE + UX | F3-02 |
| F3-04 | Animais e construções: alimentar, produzir, coletar produto (timer por timestamp) | FE | F3-01 |
| F3-05 | Expansão da fazenda (12×12 → 20×20) | FE | F3-03 |
| F3-06 | Missões diárias: sorteio por dia (fuso do jogador), progresso, recompensa | GD + FE | F3-01 |
| F3-07 | Conquistas com níveis (bronze/prata/ouro) e tela própria | GD + FE + UX | F3-01 |
| F3-08 | Onboarding de 60 s (arar → plantar → acelerar 1ª colheita → colher → comprar) | UX + FE | F3-01 |
| F3-09 | Arte placeholder completa: todas as culturas, animais, construções, decorações, ícones | ART | lista de assets |
| F3-10 | Primeira leva de arte final (terreno, 5 culturas, 3 animais, HUD) | ART | guia de arte |
| F3-11 | Sons completos (lista do Sound Designer) e música em loop | SOM | — |

### 3B. Nuvem e social
| ID | Tarefa | Resp. | Depende de |
|----|--------|-------|-----------|
| F3-12 | Auth anônima automática + "Salvar com Google" (link de contas, redirect no iOS) | BE | Fase 2 |
| F3-13 | `salvamento.ts`: save na nuvem a cada 30 s e ao ocultar a aba, cache offline, `seq`, migrações | BE | F3-12 |
| F3-14 | `relogio.ts`: hora do servidor e offset | BE | F3-12 |
| F3-15 | `firestore.rules` completo + testes no emulador (casos de trapaça da seção 8) | BE + QA | F3-13 |
| F3-16 | Perfis, código de amigo, convites, lista de amigos | BE + FE | F3-12 |
| F3-17 | Visitar fazenda (`CenaVisita`), ajudar (adubar 1 canteiro), presente diário | BE + FE + UX | F3-16 |
| F3-18 | Tela de Configurações: som, música, conta, instalar app, créditos | UX + FE | F3-12 |

### 3C. Monetização e métricas (sem compra real)
| ID | Tarefa | Resp. | Depende de |
|----|--------|-------|-----------|
| F3-19 | Moeda premium (diamantes): ganhos por nível, conquista e anúncio; usos (acelerar, decorações exclusivas) | GD + MKT + FE | F3-01 |
| F3-20 | `anuncios.ts` com interface única e implementação "simulada" (vídeo falso de 5 s) | FE + MKT | — |
| F3-21 | `analytics.ts` com os eventos de `monetizacao.md` | BE + MKT | F3-12 |

### 3D. PWA e qualidade
| ID | Tarefa | Resp. | Depende de |
|----|--------|-------|-----------|
| F3-22 | Manifest, ícones, service worker, aviso de nova versão, botão instalar | FE | F3-09 |
| F3-23 | Testes unitários de missões, conquistas, animais e validação | FE | 3A |
| F3-24 | Testes e2e de fumaça (Playwright, viewport de celular) | QA | 3A + 3B |
| F3-25 | Rodada completa do plano de testes (seções 5 e 6) em aparelhos reais | QA | todas |

Entrega para aprovação: link de pré-visualização com nuvem ligada + resumo + riscos.

---

## Fase 4 — Beta (testes, balanceamento, otimização, deploy)

| ID | Tarefa | Resp. | Depende de |
|----|--------|-------|-----------|
| F4-01 | Arte final completa substituindo todos os placeholders; atlas otimizado | ART | Fase 3 |
| F4-02 | Sons finais mixados e normalizados | SOM | Fase 3 |
| F4-03 | Otimização: perfil de fps em celular médio, tamanho do bundle, tempo até jogar | FE | F4-01 |
| F4-04 | Balanceamento com dados do beta fechado (tempo por nível, sobra de moedas) | GD + MKT | F4-08 |
| F4-05 | App Check (reCAPTCHA) e revisão final das regras | BE | Fase 3 |
| F4-06 | Projeto Firebase de produção, domínio, Hosting, alertas de cota | BE | F4-05 |
| F4-07 | Integração real de anúncios com recompensa (Google H5 Games Ads), se aprovada a conta | FE + MKT | F4-06 |
| F4-08 | Beta fechado com 20–50 jogadores por 7 dias, coleta de D1/D7 e feedback | MKT + QA | F4-06 |
| F4-09 | Rodada final do plano de testes + regressão de save e timers | QA | F4-01 a F4-07 |
| F4-10 | Página de lançamento, textos de compartilhamento, política de privacidade | MKT + UX | F4-06 |
| F4-11 | Deploy de produção (`firebase deploy`), com aprovação explícita do produtor | BE + PROD | F4-09 |

Entrega final: URL pública do jogo + relatório do beta + lista de riscos e próximos passos.

---

## Decisões de escopo registradas (opção mais simples)
1. Sem compra real de diamantes até depois do Beta.
2. Sem notificações push no MVP.
3. Culturas não murcham.
4. Amigos por código e link, sem integração com redes sociais.
5. Presentes são gerados, 1 por amigo por dia, de uma lista fixa.
6. Ajuda de vizinho = adubar 1 canteiro (acelera 10% ou valor do GDD), 1 por amigo por dia.
7. Sem ranking global no MVP (reduz o incentivo à trapaça).
8. Um idioma: português do Brasil, todos os textos em `src/textos/pt-BR.ts`.
