export type Position = 'GOL' | 'ZAG' | 'LAT' | 'VOL' | 'MEI' | 'PE' | 'PD' | 'ATA'

export type GameMode = 'easy' | 'expert'

export interface Attributes {
  velocidade: number
  finalizacao: number
  passe: number
  drible: number
  skill: number
  pernaRuim: number
  fisico: number
  defesa: number
}

export interface RealPlayer {
  id: string
  name: string
  position: Position
  attributes: Attributes
  nationality: string
  era: string
  rarity: 'rare' | 'common'
}

export type ClubTier = 'world-class' | 'continental' | 'domestic-top' | 'mid-table' | 'lower'

export interface Club {
  id: string
  name: string
  league: string
  country: string
  tier: ClubTier
}

export interface PlayerProfile {
  name: string
  position: Position
  shirtNumber: number
  mode: GameMode
}

export type DraftAttributeName = keyof Attributes

export interface DraftRound {
  round: number
  realPlayer: RealPlayer
  chosenAttribute: DraftAttributeName | null
  chosenValue: number | null
}

export interface DraftState {
  rounds: DraftRound[]
  currentRound: number
  filledAttributes: Partial<Attributes>
}

export type CareerEventType =
  | 'transfer_up'
  | 'transfer_down'
  | 'injury_light'
  | 'injury_severe'
  | 'injury_career_end'
  | 'call_up'
  | 'title_won'
  | 'individual_award'
  | 'record_broken'
  | 'rivalry'
  | 'teammate_retirement'
  | 'career_choice'

export interface CareerEvent {
  id: string
  type: CareerEventType
  season: number
  age: number
  title: string
  description: string
  effects?: {
    overallChange?: number
    attributeChange?: Partial<Attributes>
  }
}

export interface SeasonStats {
  season: number
  age: number
  overall: number
  club: Club
  appearances: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  events: CareerEvent[]
  titlesWon: string[]
  awardsWon: string[]
}

export type GamePhase = 'setup' | 'draft' | 'simulation' | 'summary'

export interface AwardBonus {
  condition: string
  label: string
  bonusPercent: number
}

export interface AwardFormula {
  id: string
  name: string
  minOverall: number
  baseMultiplier: number
  bonuses: AwardBonus[]
  requiresSouthAmerica?: boolean
  requiresBrazil?: boolean
  positions?: Position[]
}

export const POSITION_LABELS: Record<Position, string> = {
  GOL: 'Goleiro',
  ZAG: 'Zagueiro',
  LAT: 'Lateral',
  VOL: 'Volante',
  MEI: 'Meia',
  PE: 'Ponta Esquerda',
  PD: 'Ponta Direita',
  ATA: 'Atacante',
}

export const ALL_POSITIONS: Position[] = ['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'PE', 'PD', 'ATA']

export const ALL_ATTRIBUTES: DraftAttributeName[] = [
  'velocidade', 'finalizacao', 'passe', 'drible',
  'skill', 'pernaRuim', 'fisico', 'defesa',
]

export const ATTRIBUTE_LABELS: Record<DraftAttributeName, string> = {
  velocidade: 'Velocidade',
  finalizacao: 'Finalizacao',
  passe: 'Passe',
  drible: 'Drible',
  skill: 'Skill',
  pernaRuim: 'Perna Ruim',
  fisico: 'Fisico',
  defesa: 'Defesa',
}
