import type { SeasonStats, Position } from '../types/game'
import type { AwardFormula } from '../types/game'

export const AWARD_CATALOG: AwardFormula[] = [
  {
    id: 'ballon_dor', name: 'Bola de Ouro', minOverall: 85, baseMultiplier: 0.10,
    bonuses: [
      { condition: 'libertadores', label: 'Campeão da Libertadores', bonusPercent: 10 },
      { condition: 'mundial', label: 'Campeão do Mundial de Clubes', bonusPercent: 8 },
      { condition: 'goals_40', label: '40+ gols na temporada', bonusPercent: 5 },
      { condition: 'assists_25', label: '25+ assistências', bonusPercent: 5 },
      { condition: 'apps_50', label: '50+ jogos na temporada', bonusPercent: 3 },
    ],
  },
  {
    id: 'rei_da_america', name: 'Rei da América', minOverall: 78, baseMultiplier: 0.15,
    requiresSouthAmerica: true,
    bonuses: [
      { condition: 'libertadores', label: 'Campeão da Libertadores', bonusPercent: 15 },
      { condition: 'goals_30', label: '30+ gols na temporada', bonusPercent: 5 },
      { condition: 'assists_15', label: '15+ assistências', bonusPercent: 3 },
    ],
  },
  {
    id: 'craque_brasileirao', name: 'Craque do Brasileirão', minOverall: 75, baseMultiplier: 0.12,
    requiresBrazil: true,
    bonuses: [
      { condition: 'brasileirao', label: 'Campeão Brasileiro', bonusPercent: 12 },
      { condition: 'goals_br_25', label: '25+ gols no Brasileirão', bonusPercent: 8 },
      { condition: 'assists_br_10', label: '10+ assistências no Brasileirão', bonusPercent: 5 },
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
    id: 'artilheiro_brasileirao', name: 'Artilheiro do Brasileirão', minOverall: 70, baseMultiplier: 0.01,
    requiresBrazil: true, positions: ['ATA', 'PE', 'PD', 'MEI'],
    bonuses: [
      { condition: 'goals_br_25', label: '25+ gols no Brasileirão', bonusPercent: 15 },
      { condition: 'goals_br_20', label: '20+ gols no Brasileirão', bonusPercent: 5 },
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
        if (season.titlesWon.includes('Brasileirão')) chance += bonus.bonusPercent
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
