# StatDraft ⚽

Jogo de simulacao de carreira de futebol com mecanica **"Steal-a-Stat"** — monte seu jogador roubando atributos de craques reais e viva uma carreira epica no futebol brasileiro.

## Como Jogar

1. **Crie seu jogador** — nome, posicao, numero e modo (Facil/Expert)
2. **Draft de atributos** — 8 rodadas. A cada rodada, um jogador real aparece. Escolha 1 atributo para "roubar" e compor sua build
3. **Simule sua carreira** — dos 16 aos 40 anos (ou ate uma lesao encerrar tudo). Navegue pelas temporadas, veja seus gols, titulos e premios
4. **Resumo final** — dashboard com todos os numeros, galeria de titulos e premios individuais

## Modos de Jogo

| Modo | Descricao |
|------|-----------|
| **Facil** | Atributos dos jogadores sorteados sao **visiveis** — escolha com informacao |
| **Expert** | Atributos sao **100% ocultos** — escolha baseado apenas no seu conhecimento de futebol |

## Mecanica do Draft

- 8 atributos: Velocidade, Finalizacao, Passe, Drible, Skill (1-5), Perna Ruim (1-5), Fisico, Defesa
- 8 rodadas fixas, 1 atributo por rodada, sem possibilidade de trocar depois
- Craques mundiais (Haaland, Messi, CR7, Vini Jr) aparecem com **5% de chance** cada — valorize quando surgirem!

## Sistema de Premiacoes

Os premios individuais usam probabilidade **cumulativa** — quanto melhor sua temporada, mais chances de ganhar:

| Premio | Min OVR | Destaque |
|--------|---------|----------|
| Bola de Ouro | 85 | +10% se campeao da Libertadores |
| Rei da America | 78 | Exclusivo America do Sul |
| Craque do Brasileirao | 75 | +12% se campeao brasileiro |
| Artilheiro | 70 | Gols no Brasileirao aumentam chance |

## Tecnologias

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Lucide Icons

## Rodando Localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

> **Single-session**: F5 = reset total. Nao ha persistencia de dados.

## Estrutura do Projeto

```
src/
  types/         # Tipos TypeScript (Attributes, SeasonStats, Club, etc.)
  data/          # JSON datasets (15 jogadores, 20 clubes)
  engine/        # Logica pura — draft, simulacao, eventos, premiacoes
  fsm/           # Maquina de estados do fluxo do jogo
  store/         # Zustand store — orquestracao, zero logica de negocio
  components/    # Componentes React — puramente visuais
```
