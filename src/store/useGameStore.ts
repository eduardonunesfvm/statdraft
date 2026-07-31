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
    createInitialDraftState()
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
