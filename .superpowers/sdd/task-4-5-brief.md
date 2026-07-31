# Tasks 4-5: Draft Engine + Events & Awards Engines

Create 3 files: `src/engine/draft.ts`, `src/engine/events.ts`, `src/engine/awards.ts`

Work from: C:\Users\du\Downloads\statdraft

## File 1: src/engine/draft.ts

```typescript
import type { RealPlayer, Attributes, DraftState, DraftRound, DraftAttributeName } from '../types/game'
import { ATTRIBUTE_LABELS } from '../types/game'

export function createInitialDraftState(): DraftState {
  return {
    rounds: [],
    currentRound: 1,
    filledAttributes: {},
  }
}

export function pickRandomPlayer(pool: RealPlayer[], alreadyPickedIds: string[]): RealPlayer {
  const available = pool.filter(p => !alreadyPickedIds.includes(p.id))
  if (available.length === 0) {
    throw new Error('No available players left in pool')
  }

  const rarePlayers = available.filter(p => p.rarity === 'rare')
  const commonPlayers = available.filter(p => p.rarity === 'common')

  const rand = Math.random() * 100

  if (rarePlayers.length > 0 && rand < 20) {
    const idx = Math.floor(Math.random() * rarePlayers.length)
    return rarePlayers[idx]
  }

  if (commonPlayers.length > 0) {
    const idx = Math.floor(Math.random() * commonPlayers.length)
    return commonPlayers[idx]
  }

  return available[Math.floor(Math.random() * available.length)]
}

export function stealAttribute(
  state: DraftState,
  attribute: DraftAttributeName
): DraftState {
  if (isDraftComplete(state)) {
    throw new Error('Draft is already complete')
  }

  const currentRound = state.rounds[state.currentRound - 1]
  if (!currentRound) {
    throw new Error('No current round. Call pickRandomPlayer first.')
  }

  if (state.filledAttributes[attribute] !== undefined) {
    throw new Error(`Attribute ${ATTRIBUTE_LABELS[attribute]} is already filled`)
  }

  const value = currentRound.realPlayer.attributes[attribute]

  const updatedRound: DraftRound = {
    ...currentRound,
    chosenAttribute: attribute,
    chosenValue: value,
  }

  const newRounds = [...state.rounds]
  newRounds[state.currentRound - 1] = updatedRound

  const newFilled: Partial<Attributes> = {
    ...state.filledAttributes,
    [attribute]: value,
  }

  return {
    rounds: newRounds,
    currentRound: state.currentRound + 1,
    filledAttributes: newFilled,
  }
}

export function isDraftComplete(state: DraftState): boolean {
  return state.currentRound > 8
}

export function calculateOverall(attributes: Attributes): number {
  const normalizeStar = (v: number) => v * 20

  const weightedSum =
    attributes.velocidade * 0.15 +
    attributes.finalizacao * 0.20 +
    attributes.passe * 0.15 +
    attributes.drible * 0.15 +
    normalizeStar(attributes.skill) * 0.10 +
    normalizeStar(attributes.pernaRuim) * 0.05 +
    attributes.fisico * 0.10 +
    attributes.defesa * 0.10

  return Math.round(Math.min(99, Math.max(1, weightedSum)))
}

export const OVERALL_WEIGHTS: Record<DraftAttributeName, number> = {
  velocidade: 0.15,
  finalizacao: 0.20,
  passe: 0.15,
  drible: 0.15,
  skill: 0.10,
  pernaRuim: 0.05,
  fisico: 0.10,
  defesa: 0.10,
}
```

## File 2: src/engine/events.ts

```typescript
import type { CareerEvent, Club, ClubTier } from '../types/game'

let eventCounter = 0

function nextEventId(): string {
  return `evt_${++eventCounter}`
}

function roll(chance: number): boolean {
  return Math.random() * 100 < chance
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export interface GenerateEventsParams {
  season: number
  age: number
  overall: number
  club: Club
  goals: number
  assists: number
  seasonWentWell: boolean
}

export function generateSeasonEvents(params: GenerateEventsParams): CareerEvent[] {
  const { season, age, overall, goals } = params
  const events: CareerEvent[] = []

  if (age > 30 && roll(0.3)) {
    events.push({
      id: nextEventId(),
      type: 'injury_career_end',
      season,
      age,
      title: 'Lesao Grave - Fim de Carreira',
      description: 'Uma lesao devastadora no joelho forcou sua aposentadoria precoce. O estadio inteiro ficou em silencio enquanto voce deixava o campo de maca.',
      effects: { overallChange: -50 },
    })
    return events
  }

  if (roll(2)) {
    events.push({
      id: nextEventId(),
      type: 'injury_severe',
      season,
      age,
      title: 'Lesao Grave',
      description: `Uma lesao muscular grave tirou voce dos gramados por varios meses. A recuperacao foi dolorosa, mas voce voltou mais forte.`,
      effects: { overallChange: -5 },
    })
  } else if (roll(8)) {
    events.push({
      id: nextEventId(),
      type: 'injury_light',
      season,
      age,
      title: 'Lesao Leve',
      description: `Uma pequena contusao no tornozelo deixou voce fora por algumas semanas, mas nada que comprometesse a temporada.`,
      effects: { overallChange: -2 },
    })
  }

  if (overall >= 75 && roll(15)) {
    events.push({
      id: nextEventId(),
      type: 'call_up',
      season,
      age,
      title: 'Convocacao para a Selecao!',
      description: `Sua grande fase foi recompensada com uma convocacao para a Selecao Brasileira! Um sonho de infancia realizado.`,
    })
  }

  if (roll(5)) {
    const rivalries = [
      { title: 'Classico Inesquecivel', description: `Um classico eletrizante contra o maior rival. Voce foi decisivo e a torcida foi ao delirio!` },
      { title: 'Noite de Heroi', description: `Em um jogo tenso contra o rival historico, voce calou o estadio adversario com uma atuacao de gala.` },
    ]
    const rivalry = pickRandom(rivalries)
    events.push({ id: nextEventId(), type: 'rivalry', season, age, title: rivalry.title, description: rivalry.description })
  }

  if (age >= 25 && roll(3)) {
    events.push({
      id: nextEventId(),
      type: 'teammate_retirement',
      season,
      age,
      title: 'Adeus ao Companheiro',
      description: `Um grande companheiro de equipe pendurou as chuteiras nesta temporada. O vestiario nao sera o mesmo sem ele.`,
    })
  }

  if (age >= 28 && roll(10)) {
    events.push({
      id: nextEventId(),
      type: 'career_choice',
      season,
      age,
      title: 'Encruzilhada na Carreira',
      description: `Propostas tentadoras chegaram de outros clubes. Depois de muito refletir, voce decidiu permanecer fiel ao seu clube do coracao.`,
    })
  }

  if (goals >= 35 && roll(50)) {
    events.push({
      id: nextEventId(),
      type: 'record_broken',
      season,
      age,
      title: 'Recorde Historico!',
      description: `Com ${goals} gols na temporada, voce quebrou o recorde de gols do clube em uma unica temporada! Seu nome esta gravado na historia.`,
    })
  }

  return events
}

export function determineClubForSeason(
  currentClub: Club,
  allClubs: Club[],
  overall: number,
  seasonWentWell: boolean
): Club {
  if (seasonWentWell && overall >= 75 && roll(30)) {
    const higherTierClubs = getClubsByTierUp(currentClub.tier, allClubs)
    if (higherTierClubs.length > 0) return pickRandom(higherTierClubs)
  }
  if (!seasonWentWell && roll(10)) {
    const lowerTierClubs = getClubsByTierDown(currentClub.tier, allClubs)
    if (lowerTierClubs.length > 0) return pickRandom(lowerTierClubs)
  }
  return currentClub
}

export function pickStartingClub(clubs: Club[], overall: number): Club {
  if (overall >= 75) {
    const pool = clubs.filter(c => c.tier === 'domestic-top' || c.tier === 'continental')
    if (pool.length > 0) return pickRandom(pool)
  }
  if (overall >= 65) {
    const pool = clubs.filter(c => c.tier === 'mid-table' || c.tier === 'domestic-top')
    if (pool.length > 0) return pickRandom(pool)
  }
  const pool = clubs.filter(c => c.tier === 'lower' || c.tier === 'mid-table')
  return pool.length > 0 ? pickRandom(pool) : pickRandom(clubs)
}

const TIER_ORDER: ClubTier[] = ['lower', 'mid-table', 'domestic-top', 'continental', 'world-class']

function getClubsByTierUp(tier: ClubTier, clubs: Club[]): Club[] {
  const currentIdx = TIER_ORDER.indexOf(tier)
  if (currentIdx >= TIER_ORDER.length - 1) return []
  const nextTier = TIER_ORDER[currentIdx + 1]
  return clubs.filter(c => c.tier === nextTier)
}

function getClubsByTierDown(tier: ClubTier, clubs: Club[]): Club[] {
  const currentIdx = TIER_ORDER.indexOf(tier)
  if (currentIdx <= 0) return []
  const prevTier = TIER_ORDER[currentIdx - 1]
  return clubs.filter(c => c.tier === prevTier)
}

export function getTitlesForSeason(club: Club, overall: number): string[] {
  const titles: string[] = []
  const tierChances: Record<ClubTier, Record<string, number>> = {
    'world-class':  { 'Brasileirao': 40, 'Libertadores': 25, 'Mundial de Clubes': 10, 'Copa do Brasil': 15, 'Estadual': 40 },
    'continental':  { 'Brasileirao': 20, 'Libertadores': 10, 'Mundial de Clubes': 5,  'Copa do Brasil': 15, 'Estadual': 35 },
    'domestic-top': { 'Brasileirao': 10, 'Libertadores': 5,  'Copa do Brasil': 10, 'Estadual': 25 },
    'mid-table':    { 'Copa do Brasil': 5,  'Estadual': 15 },
    'lower':        { 'Estadual': 5 },
  }
  const chances = tierChances[club.tier] || {}
  for (const [title, chance] of Object.entries(chances)) {
    if (roll(chance)) titles.push(title)
  }
  return titles
}
```

## File 3: src/engine/awards.ts

```typescript
import type { SeasonStats, Position } from '../types/game'
import type { AwardFormula } from '../types/game'

export const AWARD_CATALOG: AwardFormula[] = [
  {
    id: 'ballon_dor', name: 'Bola de Ouro', minOverall: 85, baseMultiplier: 0.10,
    bonuses: [
      { condition: 'libertadores', label: 'Campeao da Libertadores', bonusPercent: 10 },
      { condition: 'mundial', label: 'Campeao do Mundial de Clubes', bonusPercent: 8 },
      { condition: 'goals_40', label: '40+ gols na temporada', bonusPercent: 5 },
      { condition: 'assists_25', label: '25+ assistencias', bonusPercent: 5 },
      { condition: 'apps_50', label: '50+ jogos na temporada', bonusPercent: 3 },
    ],
  },
  {
    id: 'rei_da_america', name: 'Rei da America', minOverall: 78, baseMultiplier: 0.15,
    requiresSouthAmerica: true,
    bonuses: [
      { condition: 'libertadores', label: 'Campeao da Libertadores', bonusPercent: 15 },
      { condition: 'goals_30', label: '30+ gols na temporada', bonusPercent: 5 },
      { condition: 'assists_15', label: '15+ assistencias', bonusPercent: 3 },
    ],
  },
  {
    id: 'craque_brasileirao', name: 'Craque do Brasileirao', minOverall: 75, baseMultiplier: 0.12,
    requiresBrazil: true,
    bonuses: [
      { condition: 'brasileirao', label: 'Campeao Brasileiro', bonusPercent: 12 },
      { condition: 'goals_br_25', label: '25+ gols no Brasileirao', bonusPercent: 8 },
      { condition: 'assists_br_10', label: '10+ assistencias no Brasileirao', bonusPercent: 5 },
    ],
  },
  {
    id: 'bola_de_prata', name: 'Bola de Prata', minOverall: 72, baseMultiplier: 0.08,
    requiresBrazil: true,
    bonuses: [
      { condition: 'top4_brasileirao', label: 'Clube entre os 4 primeiros', bonusPercent: 8 },
    ],
  },
  {
    id: 'artilheiro_brasileirao', name: 'Artilheiro do Brasileirao', minOverall: 70, baseMultiplier: 0.01,
    requiresBrazil: true, positions: ['ATA', 'PE', 'PD', 'MEI'],
    bonuses: [
      { condition: 'goals_br_25', label: '25+ gols no Brasileirao', bonusPercent: 15 },
      { condition: 'goals_br_20', label: '20+ gols no Brasileirao', bonusPercent: 5 },
    ],
  },
]

export function calculateAwardChance(
  award: AwardFormula,
  overall: number,
  season: SeasonStats,
  isSouthAmerica: boolean,
  isBrazil: boolean,
  goalsInLeague: number,
  assistsInLeague: number
): number {
  if (overall < award.minOverall) return 0
  if (award.requiresSouthAmerica && !isSouthAmerica) return 0
  if (award.requiresBrazil && !isBrazil) return 0

  let chance = overall * award.baseMultiplier

  for (const bonus of award.bonuses) {
    switch (bonus.condition) {
      case 'libertadores':
        if (season.titlesWon.includes('Libertadores')) chance += bonus.bonusPercent
        break
      case 'mundial':
        if (season.titlesWon.includes('Mundial de Clubes')) chance += bonus.bonusPercent
        break
      case 'brasileirao':
        if (season.titlesWon.includes('Brasileirao')) chance += bonus.bonusPercent
        break
      case 'goals_40':
        if (season.goals >= 40) chance += bonus.bonusPercent
        break
      case 'goals_30':
        if (season.goals >= 30) chance += bonus.bonusPercent
        break
      case 'goals_br_25':
        if (goalsInLeague >= 25) chance += bonus.bonusPercent
        break
      case 'goals_br_20':
        if (goalsInLeague >= 20) chance += bonus.bonusPercent
        break
      case 'assists_25':
        if (season.assists >= 25) chance += bonus.bonusPercent
        break
      case 'assists_15':
        if (season.assists >= 15) chance += bonus.bonusPercent
        break
      case 'assists_br_10':
        if (assistsInLeague >= 10) chance += bonus.bonusPercent
        break
      case 'apps_50':
        if (season.appearances >= 50) chance += bonus.bonusPercent
        break
      case 'top4_brasileirao':
        chance += bonus.bonusPercent
        break
    }
  }

  return Math.min(95, chance)
}

function roll(chance: number): boolean {
  return Math.random() * 100 < chance
}

export interface RollAwardsParams {
  overall: number
  season: SeasonStats
  position: Position
  isSouthAmerica: boolean
  isBrazil: boolean
  goalsInLeague: number
  assistsInLeague: number
}

export function rollForAwards(params: RollAwardsParams): string[] {
  const { overall, season, position, isSouthAmerica, isBrazil, goalsInLeague, assistsInLeague } = params
  const awards: string[] = []
  let hasBallonDor = false
  let hasReiDaAmerica = false

  for (const award of AWARD_CATALOG) {
    if (award.id === 'ballon_dor' && hasReiDaAmerica) continue
    if (award.id === 'rei_da_america' && hasBallonDor) continue
    if (award.positions && !award.positions.includes(position)) continue

    const chance = calculateAwardChance(award, overall, season, isSouthAmerica, isBrazil, goalsInLeague, assistsInLeague)
    if (roll(chance)) {
      awards.push(award.name)
      if (award.id === 'ballon_dor') hasBallonDor = true
      if (award.id === 'rei_da_america') hasReiDaAmerica = true
    }
  }

  return awards
}
```

## Verification

After creating all 3 files, run:
```bash
npx tsc --noEmit
```
Expected: No errors.

## Commit

```bash
git add -A
git commit -m "feat: add draft engine, events engine, and awards system"
```
