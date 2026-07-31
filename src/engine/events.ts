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
      title: 'Lesão Grave — Fim de Carreira',
      description: 'Uma lesão devastadora no joelho forçou sua aposentadoria precoce. O estádio inteiro ficou em silêncio enquanto você deixava o campo de maca.',
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
      title: 'Lesão Grave',
      description: 'Uma lesão muscular grave tirou você dos gramados por vários meses. A recuperação foi dolorosa, mas você voltou mais forte.',
      effects: { overallChange: -5 },
    })
  } else if (roll(8)) {
    events.push({
      id: nextEventId(),
      type: 'injury_light',
      season,
      age,
      title: 'Lesão Leve',
      description: 'Uma pequena contusão no tornozelo deixou você fora por algumas semanas, mas nada que comprometesse a temporada.',
      effects: { overallChange: -2 },
    })
  }

  if (overall >= 75 && roll(15)) {
    events.push({
      id: nextEventId(),
      type: 'call_up',
      season,
      age,
      title: 'Convocação para a Seleção!',
      description: 'Sua grande fase foi recompensada com uma convocação para a Seleção Brasileira! Um sonho de infância realizado.',
    })
  }

  if (roll(5)) {
    const rivalries = [
      { title: 'Clássico Inesquecível', description: 'Um clássico eletrizante contra o maior rival. Você foi decisivo e a torcida foi ao delírio!' },
      { title: 'Noite de Herói', description: 'Em um jogo tenso contra o rival histórico, você calou o estádio adversário com uma atuação de gala.' },
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
      description: 'Um grande companheiro de equipe pendurou as chuteiras nesta temporada. O vestiário não será o mesmo sem ele.',
    })
  }

  if (age >= 28 && roll(10)) {
    events.push({
      id: nextEventId(),
      type: 'career_choice',
      season,
      age,
      title: 'Encruzilhada na Carreira',
      description: 'Propostas tentadoras chegaram de outros clubes. Depois de muito refletir, você decidiu permanecer fiel ao seu clube do coração.',
    })
  }

  if (goals >= 35 && roll(50)) {
    events.push({
      id: nextEventId(),
      type: 'record_broken',
      season,
      age,
      title: 'Recorde Histórico!',
      description: `Com ${goals} gols na temporada, você quebrou o recorde de gols do clube em uma única temporada! Seu nome está gravado na história.`,
    })
  }

  return events
}

type CompetitionMap = Record<ClubTier, Record<string, number>>

const SA_TITLES: CompetitionMap = {
  'world-class':  { 'Brasileirão': 12, 'Libertadores': 8,  'Mundial de Clubes': 3, 'Copa do Brasil': 10, 'Estadual': 20 },
  'continental':  { 'Brasileirão': 8,  'Libertadores': 5,  'Mundial de Clubes': 1, 'Copa do Brasil': 8,  'Estadual': 15 },
  'domestic-top': { 'Brasileirão': 5,  'Libertadores': 3,  'Copa do Brasil': 5,  'Estadual': 10 },
  'mid-table':    { 'Copa do Brasil': 3,  'Estadual': 5 },
  'lower':        { 'Estadual': 3 },
}

const EU_TITLES: CompetitionMap = {
  'world-class':  { 'Premier League': 12, 'LaLiga': 12, 'Champions League': 8, 'Mundial de Clubes': 3, 'Copa Nacional': 10 },
  'continental':  { 'Premier League': 8,  'LaLiga': 8, 'Europa League': 5, 'Copa Nacional': 8 },
  'domestic-top': { 'Liga Nacional': 5, 'Copa Nacional': 5 },
  'mid-table':    { 'Copa Nacional': 3 },
  'lower':        {},
}

function getCompetitionMap(club: Club): CompetitionMap {
  if (club.continent === 'south-america') {
    const map = { ...SA_TITLES }
    if (club.country === 'Argentina') {
      for (const tierKey of Object.keys(map) as ClubTier[]) {
        const tier = map[tierKey]
        ;(tier as Record<string, number>)['Campeonato Argentino'] = (tier as Record<string, number>)['Brasileirão'] ?? 0
        delete (tier as Record<string, number>)['Brasileirão']
        ;(tier as Record<string, number>)['Copa Argentina'] = (tier as Record<string, number>)['Copa do Brasil'] ?? 0
        delete (tier as Record<string, number>)['Copa do Brasil']
      }
    }
    return map
  }
  return EU_TITLES
}

export function getTitlesForSeason(club: Club): string[] {
  const titles: string[] = []
  const map = getCompetitionMap(club)
  const chances = map[club.tier] || {}
  for (const [title, chance] of Object.entries(chances)) {
    if (roll(chance)) titles.push(title)
  }
  return titles
}

export function generateTransferProposals(
  currentClub: Club,
  allClubs: Club[],
  overall: number,
  seasonWentWell: boolean,
  _season: number
): Club[] {
  const proposals: Club[] = []

  const availableClubs = allClubs.filter(c => c.id !== currentClub.id)

  if (seasonWentWell && overall >= 70 && roll(35)) {
    const higherClubs = availableClubs.filter(c => {
      const tiers: ClubTier[] = ['lower', 'mid-table', 'domestic-top', 'continental', 'world-class']
      return tiers.indexOf(c.tier) >= tiers.indexOf(currentClub.tier)
    })
    const shuffled = [...higherClubs].sort(() => Math.random() - 0.5)
    proposals.push(...shuffled.slice(0, 4))
  } else if (!seasonWentWell && roll(15)) {
    const shuffled = [...availableClubs].sort(() => Math.random() - 0.5)
    proposals.push(...shuffled.slice(0, 3))
  }

  if (proposals.length > 0) {
    proposals.push(currentClub)
  }

  return proposals.slice(0, 5)
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
