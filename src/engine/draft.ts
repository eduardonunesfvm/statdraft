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
