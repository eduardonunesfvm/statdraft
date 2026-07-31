# Tasks 6-8: Simulator + FSM + Store

Create 3 files: `src/engine/simulator.ts`, `src/fsm/gameFsm.ts`, `src/store/useGameStore.ts`

Work from: C:\Users\du\Downloads\statdraft

## File 1: src/engine/simulator.ts

```typescript
import type { Attributes, PlayerProfile, Club, SeasonStats, CareerEvent, Position } from '../types/game'
import { calculateOverall } from './draft'
import {
  generateSeasonEvents,
  determineClubForSeason,
  pickStartingClub,
  getTitlesForSeason,
  type GenerateEventsParams,
} from './events'
import { rollForAwards } from './awards'
import clubsData from '../data/clubs.json'

const clubs: Club[] = clubsData as Club[]

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

export function ageEffect(age: number): number {
  if (age <= 21) return randomBetween(1, 3)
  if (age <= 27) return randomBetween(0, 1)
  if (age <= 31) return randomBetween(-1, 0)
  if (age <= 35) return randomBetween(-2, -1)
  return randomBetween(-3, -2)
}

export function calculateSeasonStats(
  overall: number,
  position: string
): { goals: number; assists: number; appearances: number; yellowCards: number; redCards: number } {
  const baseGoals = overall * 0.3
  const baseAssists = overall * 0.2
  const appearances = 38 + Math.floor(overall / 10)

  let goals: number
  let assists: number

  switch (position) {
    case 'ATA':
      goals = Math.round(baseGoals * 1.8 + randomBetween(-5, 10))
      assists = Math.round(baseAssists * 0.6 + randomBetween(-3, 5))
      break
    case 'PE':
    case 'PD':
      goals = Math.round(baseGoals * 1.2 + randomBetween(-5, 8))
      assists = Math.round(baseAssists * 1.5 + randomBetween(-3, 8))
      break
    case 'MEI':
      goals = Math.round(baseGoals * 0.8 + randomBetween(-3, 6))
      assists = Math.round(baseAssists * 1.8 + randomBetween(-3, 10))
      break
    case 'VOL':
      goals = Math.round(baseGoals * 0.3 + randomBetween(-2, 3))
      assists = Math.round(baseAssists * 0.8 + randomBetween(-2, 5))
      break
    case 'LAT':
      goals = Math.round(baseGoals * 0.15 + randomBetween(-1, 2))
      assists = Math.round(baseAssists * 0.9 + randomBetween(-2, 6))
      break
    case 'ZAG':
      goals = Math.round(baseGoals * 0.1 + randomBetween(-1, 2))
      assists = Math.round(baseAssists * 0.1 + randomBetween(0, 1))
      break
    case 'GOL':
      goals = 0
      assists = Math.round(baseAssists * 0.05 + randomBetween(0, 1))
      break
    default:
      goals = Math.round(baseGoals * 0.8 + randomBetween(-3, 6))
      assists = Math.round(baseAssists * 0.8 + randomBetween(-3, 6))
  }

  goals = Math.max(0, goals)
  assists = Math.max(0, assists)
  const yellowCards = Math.max(0, randomBetween(2, 8) - Math.floor(overall / 20))
  const redCards = Math.random() < 0.08 ? 1 : 0

  return { goals, assists, appearances, yellowCards, redCards }
}

export interface SimulateSeasonParams {
  season: number
  age: number
  attributes: Attributes
  currentClub: Club
  position: Position
}

export interface SimulateSeasonResult {
  seasonStats: SeasonStats
  newClub: Club
  careerEnded: boolean
  newAttributes: Attributes
}

export function simulateSeason(params: SimulateSeasonParams): SimulateSeasonResult {
  const { season, age, attributes, currentClub, position } = params
  const overall = calculateOverall(attributes)
  const ageBoost = ageEffect(age)
  const adjustedOverall = Math.min(99, Math.max(1, overall + ageBoost))

  const { goals, assists, appearances, yellowCards, redCards } = calculateSeasonStats(adjustedOverall, position)
  const seasonWentWell = goals + assists >= 25 || adjustedOverall >= 80

  const eventParams: GenerateEventsParams = {
    season, age, overall: adjustedOverall, club: currentClub, goals, assists, seasonWentWell,
  }
  const events: CareerEvent[] = generateSeasonEvents(eventParams)
  const careerEnded = events.some(e => e.type === 'injury_career_end')

  const newClub = determineClubForSeason(currentClub, clubs, adjustedOverall, seasonWentWell)
  const titlesWon = getTitlesForSeason(currentClub, adjustedOverall)

  if (titlesWon.length > 0) {
    events.push({
      id: `title_${season}`,
      type: 'title_won',
      season,
      age,
      title: `Titulo${titlesWon.length > 1 ? 's' : ''}: ${titlesWon.join(', ')}`,
      description: `Voce conquistou: ${titlesWon.join(', ')}. Uma temporada historica!`,
    })
  }

  const isSouthAmerica = ['Brasil', 'Argentina'].includes(currentClub.country)
  const isBrazil = currentClub.country === 'Brasil'

  const pseudoSeason: SeasonStats = {
    season, age, overall: adjustedOverall, club: currentClub,
    appearances, goals, assists, yellowCards, redCards,
    events, titlesWon, awardsWon: [],
  }

  const awardsWon = rollForAwards({
    overall: adjustedOverall,
    season: pseudoSeason,
    position,
    isSouthAmerica,
    isBrazil,
    goalsInLeague: goals,
    assistsInLeague: assists,
  })

  for (const award of awardsWon) {
    events.push({
      id: `award_${season}_${award}`,
      type: 'individual_award',
      season,
      age,
      title: award,
      description: `Voce venceu o premio ${award}! Um reconhecimento historico ao seu talento.`,
    })
  }

  let effectiveOverall = adjustedOverall
  let effectiveAttributes = { ...attributes }

  events.forEach(e => {
    if (e.effects?.overallChange) {
      effectiveOverall += e.effects.overallChange
    }
    if (e.effects?.attributeChange) {
      for (const key of Object.keys(e.effects.attributeChange) as Array<keyof Attributes>) {
        const val = e.effects.attributeChange[key]
        if (val !== undefined) {
          effectiveAttributes[key] = Math.min(99, Math.max(1, effectiveAttributes[key] + val))
        }
      }
    }
  })

  const seasonStats: SeasonStats = {
    season,
    age,
    overall: Math.min(99, Math.max(1, effectiveOverall)),
    club: currentClub,
    appearances,
    goals,
    assists,
    yellowCards,
    redCards,
    events,
    titlesWon,
    awardsWon,
  }

  return { seasonStats, newClub, careerEnded, newAttributes: effectiveAttributes }
}

export interface SimulateCareerResult {
  seasons: SeasonStats[]
  careerEndedByInjury: boolean
}

export function simulateCareer(attributes: Attributes, profile: PlayerProfile): SimulateCareerResult {
  const seasons: SeasonStats[] = []
  const startAge = 16
  const maxAge = 40
  let careerEndedByInjury = false
  let currentClub = pickStartingClub(clubs, calculateOverall(attributes))
  let currentAttributes = { ...attributes }

  for (let age = startAge; age <= maxAge; age++) {
    const season = age - startAge + 1
    const result = simulateSeason({
      season,
      age,
      attributes: currentAttributes,
      currentClub,
      position: profile.position,
    })

    seasons.push(result.seasonStats)
    currentClub = result.newClub
    currentAttributes = result.newAttributes

    if (result.careerEnded) {
      careerEndedByInjury = true
      break
    }
  }

  return { seasons, careerEndedByInjury }
}
```

## File 2: src/fsm/gameFsm.ts

```typescript
import type { GamePhase } from '../types/game'

const VALID_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  setup: ['draft'],
  draft: ['simulation'],
  simulation: ['summary'],
  summary: ['setup'],
}

export class GameFSM {
  private phase: GamePhase = 'setup'

  get currentPhase(): GamePhase {
    return this.phase
  }

  canTransition(to: GamePhase): boolean {
    return VALID_TRANSITIONS[this.phase].includes(to)
  }

  transition(to: GamePhase): void {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid transition: ${this.phase} -> ${to}. ` +
        `Valid transitions from ${this.phase}: ${VALID_TRANSITIONS[this.phase].join(', ')}`
      )
    }
    this.phase = to
  }

  forceSet(phase: GamePhase): void {
    this.phase = phase
  }

  reset(): void {
    this.phase = 'setup'
  }
}
```

## File 3: src/store/useGameStore.ts

```typescript
import { create } from 'zustand'
import type { GamePhase, PlayerProfile, DraftState, Attributes, SeasonStats, DraftAttributeName, RealPlayer } from '../types/game'
import { GameFSM } from '../fsm/gameFsm'
import { createInitialDraftState, pickRandomPlayer, stealAttribute, isDraftComplete } from '../engine/draft'
import { simulateCareer } from '../engine/simulator'
import playersData from '../data/players.json'

const allPlayers: RealPlayer[] = playersData as RealPlayer[]

interface GameStore {
  phase: GamePhase
  profile: PlayerProfile | null
  draftState: DraftState | null
  finalAttributes: Attributes | null
  career: SeasonStats[] | null
  currentSeasonIndex: number
  isSimulationComplete: boolean

  startDraft: (profile: PlayerProfile) => void
  stealStat: (attribute: DraftAttributeName) => void
  advanceSeason: () => void
  retire: () => void
  restart: () => void

  currentSeason: () => SeasonStats | null
  canAdvance: () => boolean
}

const fsm = new GameFSM()

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'setup',
  profile: null,
  draftState: null,
  finalAttributes: null,
  career: null,
  currentSeasonIndex: 0,
  isSimulationComplete: false,

  startDraft: (profile: PlayerProfile) => {
    fsm.transition('draft')
    const state = createInitialDraftState()
    const firstPlayer = pickRandomPlayer(allPlayers, [])
    const firstRound = {
      round: 1,
      realPlayer: firstPlayer,
      chosenAttribute: null as DraftAttributeName | null,
      chosenValue: null as number | null,
    }
    set({
      phase: fsm.currentPhase,
      profile,
      draftState: {
        rounds: [firstRound],
        currentRound: 1,
        filledAttributes: {},
      },
    })
  },

  stealStat: (attribute: DraftAttributeName) => {
    const { draftState } = get()
    if (!draftState) return

    const updated = stealAttribute(draftState, attribute)

    if (isDraftComplete(updated)) {
      fsm.transition('simulation')
      const attrs = updated.filledAttributes as Attributes
      const { profile } = get()
      if (!profile) return

      const career = simulateCareer(attrs, profile)

      set({
        phase: fsm.currentPhase,
        draftState: null,
        finalAttributes: attrs,
        career: career.seasons,
        currentSeasonIndex: 0,
        isSimulationComplete: false,
      })
      return
    }

    const pickedIds = updated.rounds.map(r => r.realPlayer.id)
    const nextPlayer = pickRandomPlayer(allPlayers, pickedIds)
    const nextRound = {
      round: updated.currentRound,
      realPlayer: nextPlayer,
      chosenAttribute: null as DraftAttributeName | null,
      chosenValue: null as number | null,
    }

    set({
      draftState: {
        rounds: [...updated.rounds, nextRound],
        currentRound: updated.currentRound,
        filledAttributes: updated.filledAttributes,
      },
    })
  },

  advanceSeason: () => {
    const { career, currentSeasonIndex } = get()
    if (!career) return
    const nextIndex = currentSeasonIndex + 1
    if (nextIndex >= career.length) {
      set({ isSimulationComplete: true })
      return
    }
    set({ currentSeasonIndex: nextIndex })
  },

  retire: () => {
    fsm.transition('summary')
    set({ phase: fsm.currentPhase, isSimulationComplete: true })
  },

  restart: () => {
    fsm.reset()
    set({
      phase: 'setup',
      profile: null,
      draftState: null,
      finalAttributes: null,
      career: null,
      currentSeasonIndex: 0,
      isSimulationComplete: false,
    })
  },

  currentSeason: () => {
    const { career, currentSeasonIndex } = get()
    if (!career || currentSeasonIndex >= career.length) return null
    return career[currentSeasonIndex]
  },

  canAdvance: () => {
    const { career, currentSeasonIndex, isSimulationComplete } = get()
    if (!career || isSimulationComplete) return false
    return currentSeasonIndex < career.length - 1
  },
}))
```

## Verification

1. Run `npx tsc --noEmit` and confirm no errors
2. If any type errors, fix them by adjusting imports or type assertions

## Commit

```bash
git add -A
git commit -m "feat: add simulation engine, FSM, and Zustand store"
```
