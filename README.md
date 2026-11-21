# Fazenda Feliz

Jogo de fazenda isométrico em HTML5 (Phaser 3 + TypeScript + Vite), feito para o navegador do celular.

## Como rodar

```bash
npm install
npm run dev      # abre o jogo (acessível na rede local para testar no celular)
npm test         # testes da lógica do jogo
npm run build    # build de produção em dist/
```

## Estado atual: Fase 2 (protótipo jogável)

Arar, plantar, colher (as 12 culturas do GDD), moedas, XP e níveis, loja de sementes, celeiro com venda,
timers por timestamp (continuam com o jogo fechado), save local, câmera com arrastar e pinça.
A arte é placeholder gerada por código; o save é local (a nuvem entra na Fase 3).

Documentação: `docs/` (GDD, arquitetura, plano de tarefas, plano de testes, monetização, guia de arte, áudio, wireframes).
Dados de design (fonte da verdade): `src/dados/*.json`, cópia de `data/*.json`.
