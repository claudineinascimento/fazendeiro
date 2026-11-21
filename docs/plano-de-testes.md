# Fazenda Feliz — Plano de Testes

Responsável: QA
Status: proposta para aprovação do produtor
Última atualização: 21/11/2026

## 1. Objetivo
Garantir que o jogo roda bem no navegador de celulares e tablets comuns, que o progresso nunca se perde e que os timers continuam corretos com o jogo fechado ou offline.

## 2. Níveis de teste

| Nível | Ferramenta | O que cobre | Quando roda |
|-------|-----------|-------------|-------------|
| Unitário | Vitest | `src/nucleo/` (ações, economia, tempo, missões, validação) | a cada commit / PR |
| Regras | Vitest + Firebase Emulator | `firestore.rules`: acessos permitidos e trapaças bloqueadas | a cada PR que muda regras ou save |
| Fumaça e2e | Playwright (Chromium, WebKit; viewport de celular) | abrir, onboarding, plantar, colher, comprar, recarregar | a cada PR e antes de cada deploy |
| Manual | aparelhos reais | toque, desempenho, áudio, instalação, offline | fim de cada fase |

Na e2e, o tempo é controlado com um relógio falso (`page.clock` do Playwright), sem esperar minutos reais.

## 3. Matriz de aparelhos e navegadores

| Categoria | Aparelho de referência | Navegador | Tela | Prioridade |
|-----------|-----------------------|-----------|------|-----------|
| Android médio | Samsung Galaxy A-series (2–3 anos) ou Motorola Moto G | Chrome | ~6,5", 1080×2400 | **Alta (alvo de 60 fps)** |
| Android fraco | aparelho com 3 GB RAM | Chrome | 720p | Alta (mínimo 30 fps) |
| Android | qualquer | Samsung Internet | — | Média |
| iPhone | iPhone 11 ou SE (2ª/3ª geração) | Safari | 4,7" e 6,1" | **Alta** |
| iPhone | qualquer | PWA instalado (tela de início) | — | Alta |
| Tablet | iPad 9ª geração ou superior | Safari | 10,2" | Média |
| Tablet Android | Galaxy Tab A | Chrome | 10" | Média |
| Desktop | Windows/macOS | Chrome, Edge, Firefox, Safari | 1366×768 a 1920×1080 | Baixa (deve funcionar com mouse) |

Tamanhos para o modo responsivo do DevTools e do Playwright: 360×640, 390×844, 412×915, 768×1024, 1024×768, 1280×800.
Orientações: retrato e paisagem nos celulares e tablets; girar a tela durante o jogo não pode quebrar a câmera nem a UI.

## 4. Critérios gerais de aceite
- Carregamento no 1º acesso em 4G: < 5 s até poder tocar. Acessos seguintes: < 2 s.
- FPS médio ≥ 55 no Android médio e ≥ 30 no fraco, com a fazenda cheia (20×20, 40 decorações, 10 animais).
- Nenhum alvo de toque menor que 44×44 px; botões principais ≥ 48 px.
- Nenhum texto cortado ou fora do português do Brasil.
- Zero erros no console durante o roteiro de fumaça.

## 5. Casos de teste por sistema

### 5.1 Fazenda e câmera
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-CAM-01 | Arrastar com 1 dedo | Câmera move, nada é plantado |
| T-CAM-02 | Pinça com 2 dedos | Zoom entre 0,5× e 2× centrado nos dedos |
| T-CAM-03 | Tocar um tile em zoom 0,5×, 1× e 2× | O tile certo é selecionado |
| T-CAM-04 | Arrastar até a borda | Câmera para no limite |
| T-CAM-05 | Girar o aparelho | Fazenda e UI se reajustam sem recarregar |

### 5.2 Plantar e colher
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-PLA-01 | Arar tile de grama | Vira terra arada; custo debitado |
| T-PLA-02 | Plantar sem moedas suficientes | Botão desabilitado e aviso claro |
| T-PLA-03 | Plantar cultura acima do nível | Item com cadeado e nível necessário |
| T-PLA-04 | Passar 50% do tempo | Muda para o estágio 2 |
| T-PLA-05 | Passar 100% do tempo | Estágio 3 com indicador "pronto" |
| T-PLA-06 | Colher | Moedas e XP somados conforme o GDD; tile volta a arado |
| T-PLA-07 | Tocar várias vezes muito rápido em colher | Colhe uma vez só |

### 5.3 Economia, loja e inventário
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-ECO-01 | Subir de nível | Efeito, som, desbloqueios mostrados |
| T-ECO-02 | Comprar item na loja | Moedas debitadas; item no inventário |
| T-ECO-03 | Vender produto | Moedas creditadas pelo preço do GDD |
| T-ECO-04 | Colocar, mover e guardar decoração | Ocupação de tiles correta; nada sobreposto |
| T-ECO-05 | Animal: alimentar e coletar após o tempo | Produto no inventário |
| T-ECO-06 | Acelerar com diamantes | Diamantes debitados; cultura pronta |

### 5.4 Missões e conquistas
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-MIS-01 | Virar o dia (meia-noite no fuso do jogador) | Novas missões; antigas somem |
| T-MIS-02 | Concluir missão e resgatar | Recompensa uma única vez |
| T-MIS-03 | Conquista atingida offline | Concluída e salva ao reconectar |

### 5.5 Salvamento
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-SAV-01 | Jogar 2 min e recarregar a página | Estado idêntico |
| T-SAV-02 | Fechar a aba logo após colher | Colheita salva (save no `pagehide`) |
| T-SAV-03 | Matar o navegador pelo gerenciador de tarefas | Perde no máximo 30 s de progresso |
| T-SAV-04 | Entrar com Google em outro aparelho | Mesmo progresso |
| T-SAV-05 | Conta anônima → "Salvar com Google" | Mesmo `uid`, nada perdido |
| T-SAV-06 | Google já com outro progresso | Pergunta qual manter; nada some sem escolha |
| T-SAV-07 | Dois aparelhos abertos ao mesmo tempo | O mais recente vence; o outro recarrega com aviso |
| T-SAV-08 | Save de versão antiga do formato | Migração automática sem erro |
| T-SAV-09 | Ícone de nuvem | Mostra salvando, salvo e offline corretamente |

### 5.6 Timers com jogo fechado e offline
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-TMP-01 | Plantar cultura de 5 min, fechar o jogo por 10 min, abrir | Cultura pronta |
| T-TMP-02 | Plantar cultura de 4 h, fechar por 2 h | Estágio 2, tempo restante ≈ 2 h |
| T-TMP-03 | Jogo em segundo plano (outra aba / outro app) por 10 min | Ao voltar, estágios atualizados sem recarregar |
| T-TMP-04 | Celular bloqueado por 1 h com o jogo aberto | Mesmo que T-TMP-03 |
| T-TMP-05 | Modo avião: abrir o jogo (já aberto antes) | Jogo carrega do cache; social desativado com aviso |
| T-TMP-06 | Modo avião: plantar, colher, comprar; religar internet | Tudo sincroniza; nada duplicado |
| T-TMP-07 | Adiantar o relógio do celular em 1 dia, abrir com internet | Tempo do servidor é usado; culturas não ficam prontas antes da hora |
| T-TMP-08 | Adiantar o relógio offline, colher, reconectar | Ganho limitado pelas regras; save recusado é tratado sem travar o jogo |
| T-TMP-09 | Trocar fuso horário | Timers corretos (timestamps são UTC); missões viram no novo fuso |

### 5.7 Vizinhos
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-VIZ-01 | Adicionar amigo por código | Convite chega; ao aceitar, aparece para os dois |
| T-VIZ-02 | Visitar fazenda | Vê a fazenda do amigo; não consegue alterar nada além de ajudar |
| T-VIZ-03 | Ajudar 2 vezes no mesmo dia | Segunda vez bloqueada com aviso |
| T-VIZ-04 | Enviar presente | Destinatário recebe ao abrir; 1 por dia por amigo |
| T-VIZ-05 | Visitar sem internet | Botão desativado com aviso |

### 5.8 Segurança (testes de regras no emulador)
| ID | Tentativa | Esperado |
|----|-----------|----------|
| T-SEG-01 | Ler `saves/` de outro jogador | Negado |
| T-SEG-02 | Escrever na fazenda pública de outro | Negado |
| T-SEG-03 | Somar 1.000.000 de moedas num save | Negado |
| T-SEG-04 | Subir 5 níveis numa escrita | Negado |
| T-SEG-05 | Reenviar um save antigo (`seq` menor) | Negado |
| T-SEG-06 | `atualizadoEm` diferente da hora do servidor | Negado |
| T-SEG-07 | 6º anúncio recompensado no dia | Negado |
| T-SEG-08 | Presente com item fora da lista | Negado |
| T-SEG-09 | Ajudar quem não é amigo | Negado |
| T-SEG-10 | Save válido de jogo normal | Permitido (evita falso positivo) |

### 5.9 PWA, áudio e acessibilidade
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-PWA-01 | Instalar no Android (Chrome) | Ícone na tela, abre em tela cheia |
| T-PWA-02 | Adicionar à Tela de Início no iPhone | Idem; login Google funciona (redirect) |
| T-PWA-03 | Publicar nova versão | Aviso "Nova versão"; atualiza sem perder progresso |
| T-AUD-01 | Som antes do 1º toque | Nenhum erro; som começa após o toque |
| T-AUD-02 | Botões de som e música | Silenciam na hora e lembram a escolha |
| T-AUD-03 | Receber ligação ou trocar de app | Áudio pausa e volta |
| T-ACE-01 | Contraste de textos | ≥ 4,5:1 |
| T-ACE-02 | Fonte grande do sistema | Layout não quebra |

### 5.10 Monetização
| ID | Caso | Resultado esperado |
|----|------|-------------------|
| T-MON-01 | Ver anúncio até o fim | Recompensa concedida uma vez |
| T-MON-02 | Fechar anúncio antes do fim | Sem recompensa, mensagem gentil |
| T-MON-03 | Sem anúncio disponível | Botão oculto ou "Volte mais tarde"; jogo não trava |
| T-MON-04 | Eventos de analytics | Aparecem no DebugView do Firebase |

## 6. Roteiro de fumaça (5 minutos, antes de todo deploy)
1. Abrir o link em aba anônima no celular.
2. Concluir o onboarding.
3. Plantar, acelerar e colher; comprar uma semente.
4. Recarregar: estado igual.
5. Modo avião: recarregar, plantar; religar: sincronizou.
6. Visitar um amigo de teste e ajudar.
7. Console sem erros.

## 7. Checklist de bugs (modelo de relato)
Cada bug vira uma *issue* no repositório com:
- **Título** curto: "[Área] o que acontece"
- **Aparelho / navegador / versão / orientação**
- **Passos para reproduzir** (numerados)
- **Esperado** e **obtido**
- **Gravidade**: Bloqueante (perde progresso, trava, não abre) · Alta (sistema não funciona) · Média (funciona com erro) · Baixa (visual ou texto)
- **Print ou vídeo** e o `uid` de teste

Critério de saída de cada fase: zero bloqueantes, zero altas abertas nos sistemas da fase.

## 8. Riscos de teste
- Não ter aparelhos reais de todas as categorias: usar BrowserStack (plano gratuito/trial) ou aparelhos de pessoas do beta.
- Testes de timers longos (horas): cobertos por relógio falso na e2e e pelo emulador; um teste real de 4 h por fase.
