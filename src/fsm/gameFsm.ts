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
