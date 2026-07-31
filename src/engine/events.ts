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

export function getTitlesForSeason(club: Club): string[] {
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
