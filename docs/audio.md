# Fazenda Feliz — Áudio (Fase 1)

> Responsável: Sound Designer · Versão 0.1 · 21/11/2026

## 1. Direção sonora
Alegre, acústica e leve: violão, ukulele, xilofone, sanfona suave e percussão de madeira, com um toque brasileiro (baião/xote bem leve, sem ficar repetitivo). Efeitos curtos, "redondinhos", sem agudos agressivos — o jogo é tocado muitas vezes por dia e precisa cansar pouco.

## 2. Formatos e peso
- **Efeitos**: um único **sprite de áudio** (`sfx.webm` + `sfx.m4a` de fallback para Safari/iOS) com JSON de marcações (`audiosprite`), mono, 44,1 kHz, **Opus 64 kbps** / **AAC 64 kbps**.
- **Músicas**: arquivos separados, estéreo, **Opus 80 kbps** (webm) + **AAC 96 kbps** (m4a), com laço perfeito (loop points sem clique).
- Phaser carrega `[ 'x.webm', 'x.m4a' ]` e escolhe o suportado.
- **Metas**: efeitos ≤ 250 KB no total; cada música ≤ 450 KB; **áudio total ≤ 1,5 MB**. Música do jogo carrega no 2º lote (não atrasa a entrada).
- Normalização: efeitos −16 LUFS, música −20 LUFS (música sempre atrás dos efeitos).
- Fontes: produção própria ou bibliotecas CC0 (ex.: freesound com licença CC0, Kenney). Registrar origem e licença de cada arquivo em `assets/audio/CREDITOS.md`.

## 3. Lista de efeitos (SFX)
| ID | Momento | Descrição | Duração |
|---|---|---|---|
| `ui_toque` | Qualquer botão | "Pop" de madeira suave | 0,1 s |
| `ui_abrir` | Abrir painel | Whoosh curto + sininho | 0,3 s |
| `ui_fechar` | Fechar painel | Whoosh reverso | 0,25 s |
| `ui_erro` | Ação inválida / sem moedas | "Bonk" grave e simpático | 0,3 s |
| `arar` | Arar canteiro | Enxada na terra | 0,35 s |
| `plantar` | Plantar semente | Semente caindo + "puf" de terra | 0,3 s |
| `colher` | Colher cultura | "Pluc!" + farfalhar (3 variações de tom, sorteadas) | 0,35 s |
| `crescer_pronto` | Cultura fica pronta (com a câmera vendo) | Brilho/cintilar discreto | 0,4 s |
| `moeda` | Ganhar moedas (cada moeda que chega) | "Tlim" metálico (tom sobe em sequência) | 0,15 s |
| `moedas_muitas` | Venda grande | Cascata de moedas | 0,8 s |
| `diamante` | Ganhar diamante | Cristal brilhante | 0,4 s |
| `xp` | Estrela de XP chega | Sininho agudo | 0,2 s |
| `level_up` | Subir de nível | Fanfarra curta (sanfona + xilofone) | 2,0 s |
| `comprar` | Compra na loja | Caixa registradora fofa | 0,5 s |
| `vender` | Venda no celeiro | Moedas + "ka-ching" | 0,6 s |
| `colocar` | Posicionar objeto | Batida de madeira no chão | 0,3 s |
| `galinha` / `vaca` / `ovelha` / `porco` / `cabra` | Tocar no animal / coletar | Vocalização curta e fofa (1 cada) | 0,5 s |
| `coletar_produto` | Coletar ovo/leite/etc. | "Pop" + brilho | 0,3 s |
| `missao_ok` | Missão concluída | Jingle de 3 notas | 0,9 s |
| `conquista` | Conquista desbloqueada | Jingle + aplauso curto | 1,5 s |
| `bau` | Abrir baú/presente | Tampa abrindo + cintilar | 1,0 s |
| `ajudar` | Ajudar vizinho | Coração "plim" | 0,4 s |
| `presente_enviar` | Enviar presente | Papel de presente + whoosh | 0,5 s |
| `expandir` | Comprar expansão | Martelo + serrote rápido | 1,0 s |

**28 efeitos.** Limite de 4 sons simultâneos do mesmo tipo (ex.: colheita em série) para não estourar volume nem CPU.

## 4. Lista de músicas
| ID | Uso | Clima | Duração do laço |
|---|---|---|---|
| `musica_fazenda` | Fazenda (principal) | Ukulele + violão, tranquilo, 95 BPM | 60–90 s |
| `musica_visita` | Visitando vizinho | Variação da principal, mais leve (assobio) | 45–60 s |
| `musica_menu` | Tela de carregamento/título e onboarding | Tema curto e animado | 30 s |

Transição entre músicas: fade de 1 s. Música pausa quando a aba perde o foco (`visibilitychange`) e retoma ao voltar.

## 5. Opção de silenciar
- Dois controles independentes em Configurações: **Música** e **Efeitos sonoros** (liga/desliga; volume em slider fica pós-MVP).
- Atalho: o **ícone de som** no painel de Configurações; nenhum botão de mudo fixo no HUD (economiza espaço). *Decisão simples registrada.*
- Preferência salva em `localStorage` (vale antes do login) e sincronizada no perfil da nuvem.
- **Autoplay**: navegadores bloqueiam som antes de um toque. O áudio só é desbloqueado no primeiro toque do jogador (o "Toque para começar" já resolve isso).
- Respeitar o modo silencioso do iPhone (comportamento padrão do Web Audio em iOS).
- Vibração (`navigator.vibrate`) tem toggle próprio; não existe no iOS Safari — o toggle some quando não suportado.

## 6. Implementação (dica para o Dev Front-end)
```js
// Exemplo: tocar efeito respeitando a preferência do jogador
function tocarEfeito(cena, id) {
  if (!Preferencias.efeitosLigados) return; // jogador silenciou os efeitos
  cena.sound.playAudioSprite('sfx', id);
}
```
