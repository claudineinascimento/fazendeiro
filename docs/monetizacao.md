# Fazenda Feliz — Monetização, Métricas e Lançamento

Responsável: Monetização/Marketing
Status: proposta para aprovação do produtor
Última atualização: 21/11/2026

## 1. Princípios
1. **Ninguém precisa pagar para se divertir nem para avançar.** Tudo que se compra com dinheiro também se consegue jogando.
2. **Anúncios só quando o jogador escolhe** (com recompensa). Nada de anúncio que interrompe, em tela cheia forçada ou em banner sobre a fazenda.
3. **Moeda premium compra tempo e estilo, nunca poder.** Nenhuma cultura, animal ou construção exclusiva dá mais lucro que as comuns.
4. Público inclui crianças e famílias: sem caixas de sorte pagas, sem contagem regressiva de pressão para comprar, sem anúncios de categorias sensíveis.

## 2. Moedas
| Moeda | Nome no jogo | Como ganha | Para que serve |
|-------|-------------|-----------|----------------|
| Comum | **Moedas** | colher, vender produtos, missões | sementes, animais, construções, decorações, expansão |
| Premium | **Diamantes** | subir de nível (+2), conquistas (+1 a +5), missão diária completa (+1), anúncio com recompensa (+1, até 2 por dia), presente de boas-vindas (+10) | acelerar timers, decorações exclusivas (só visuais), 1 canteiro extra de "estufa" (conveniência, mesmo lucro) |

Valores finais vêm do GDD; os acima são o ponto de partida para o balanceamento.

### Limites contra pay-to-win
- Acelerar custa 1 diamante a cada 30 min restantes (mín. 1). Dá conveniência, não vantagem sobre outros jogadores (não há ranking no MVP).
- Itens exclusivos por diamante: só decoração.
- Missões, conquistas e expansão nunca exigem diamantes.
- Meta: um jogador que nunca vê anúncio e nunca paga chega ao nível 10 em ~5 dias de jogo casual (2–3 sessões curtas por dia).

### Compra com dinheiro real
**Fora do MVP** (decisão mais simples). Requer Cloud Functions (plano Blaze) e um gateway de pagamento (Stripe ou Mercado Pago com Pix). A arquitetura já reserva o ponto de entrada. Reavaliar após o Beta com base no D7. Pacotes sugeridos para depois: R$ 4,90 (50 💎), R$ 9,90 (110 💎), R$ 19,90 (240 💎) e um "Pacote do Fazendeiro" único de R$ 7,90 (decoração exclusiva + 60 💎).

## 3. Anúncios com recompensa

### Onde aparecem (sempre opcional, botão com ícone de vídeo)
| Lugar | Recompensa | Limite diário |
|------|-----------|---------------|
| Canteiro em crescimento | "Assistir e acelerar 1 hora" | 3 |
| Fim da missão diária | dobrar as moedas da missão | 1 |
| Loja | +1 diamante | 2 |

Limite global: **5 anúncios por dia por jogador** (também validado nas regras do Firestore). Nenhum anúncio durante os primeiros 10 minutos de jogo, para não estragar a primeira impressão.

### Tecnologia
- MVP e Fase 3: implementação **simulada** (tela "Anúncio de teste", 5 s) atrás da interface `servicos/anuncios.ts`, para testar o fluxo sem conta de anúncios.
- Beta: **Google H5 Games Ads (Ad Placement API)**, a solução oficial do Google para anúncios com recompensa em jogos HTML5. Exige conta AdSense aprovada e domínio próprio; o cadastro deve começar no início da Fase 3 porque a aprovação pode levar semanas.
- Plano B: se a aprovação não sair, lançar o Beta sem anúncios reais (a recompensa por anúncio é desligada por configuração). O jogo não depende disso.

## 4. Métricas

### 4.1 Ferramenta
Google Analytics for Firebase (GA4), gratuito, com o DebugView para validar na Fase 3. Consentimento: aviso simples na primeira abertura e opção em Configurações para desativar a coleta (LGPD).

### 4.2 Metas
| Métrica | Definição | Meta Beta | Alerta se abaixo |
|--------|-----------|-----------|-----------------|
| **D1** | % de jogadores novos que voltam no dia seguinte | **≥ 35%** | 25% |
| **D7** | % que voltam no 7º dia | **≥ 12%** | 8% |
| D30 | % que voltam no 30º dia | ≥ 5% | — |
| Onboarding concluído | % que termina o tutorial | ≥ 80% | 65% |
| Sessões por dia (ativos) | média | ≥ 2,5 | 1,5 |
| Duração da sessão | mediana | 4–8 min | < 2 min |
| Conta Google vinculada | % de jogadores nível 5+ | ≥ 30% | — |
| Anúncios por ativo/dia | média entre quem vê ≥ 1 | 2–3 | — |
| Amigo adicionado | % de jogadores em 7 dias | ≥ 20% | — |

### 4.3 Eventos registrados
| Evento | Parâmetros |
|-------|-----------|
| `tutorial_begin` / `tutorial_complete` | `passo` |
| `level_up` | `nivel` |
| `plantar` / `colher` | `cultura` |
| `compra_loja` | `item`, `moeda`, `preco` |
| `gasto_diamante` | `uso` (acelerar/decoracao), `valor` |
| `anuncio_oferecido` / `anuncio_iniciado` / `anuncio_concluido` / `anuncio_falhou` | `lugar` |
| `missao_concluida` | `id` |
| `conquista` | `id`, `grau` |
| `amigo_adicionado` / `visita` / `ajuda` / `presente_enviado` | — |
| `login_google_vinculado` | — |
| `pwa_instalado` | `plataforma` |
| `save_recusado` | `motivo` (para detectar falsos positivos e trapaça) |

Retenção D1/D7 sai pronta no relatório de Coortes do GA4; não é preciso calcular manualmente.

### 4.4 Funil a acompanhar no Beta
abrir → tutorial completo → 1ª colheita → nível 3 → voltar no D1 → adicionar amigo → nível 10 → voltar no D7.

## 5. Texto da página de lançamento (pt-BR)

**Título:** Fazenda Feliz
**Subtítulo:** Sua fazenda cabe no bolso. Plante, colha e cresça, direto do navegador.

**Chamada principal (botão):** Jogar agora, é grátis

**Texto de apoio:**
> Arou, plantou, colheu! Em Fazenda Feliz você cuida da sua própria fazenda: planta morangos, milho e girassóis, cria galinhas e vacas, decora tudo do seu jeito e visita a fazenda dos amigos para dar uma mãozinha.
>
> Não precisa baixar nada. Abra no celular, no tablet ou no computador e comece em segundos. Suas plantações continuam crescendo mesmo com o jogo fechado, e seu progresso fica salvo na nuvem.

**Destaques (com ícones):**
- 🌱 **Plante e colha** dezenas de culturas, cada uma no seu tempo.
- 🐔 **Crie animais** e venda ovos, leite e lã.
- 🏡 **Decore** sua fazenda com cercas, flores e enfeites.
- 👩‍🌾 **Visite os vizinhos**, ajude nas plantações e troque presentes.
- 🎯 **Missões diárias** e conquistas para quem gosta de desafios.
- 📱 **Sem download**: funciona no navegador e pode ser instalado na tela inicial.

**Bloco de confiança:**
> Grátis para jogar. Nada de anúncio pulando na sua frente: você só assiste a um vídeo se quiser ganhar um bônus.

**Rodapé:** Política de privacidade · Termos de uso · Contato

**Texto para compartilhar (WhatsApp/redes):**
> Tô cuidando da minha fazenda no Fazenda Feliz 🌻 Entra lá e vira meu vizinho! Meu código é {CODIGO}. {LINK}

**Meta descrição (SEO, até 155 caracteres):**
> Fazenda Feliz: jogo de fazenda grátis no navegador. Plante, colha, crie animais e visite amigos. Sem download, no celular ou computador.

## 6. Riscos
| Risco | Mitigação |
|------|-----------|
| Aprovação do H5 Games Ads demorar ou ser negada | Começar o cadastro na Fase 3; Beta funciona sem anúncios |
| Receita baixa sem compra real | Aceito no MVP; foco em retenção; compras após o Beta |
| LGPD e público infantil | Coleta mínima, consentimento, sem anúncios personalizados para menores (configuração do AdSense) |
| D1 abaixo da meta | Revisar onboarding e primeira sessão (colheita rápida nos 2 primeiros minutos) |
