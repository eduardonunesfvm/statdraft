import { useGameStore } from '../store/useGameStore'
import type { SeasonStats } from '../types/game'
import { Trophy, Award, Target, Footprints, Zap, RotateCcw } from 'lucide-react'

function aggregateStats(seasons: SeasonStats[]) {
  return {
    totalSeasons: seasons.length,
    totalGames: seasons.reduce((s, x) => s + x.appearances, 0),
    totalGoals: seasons.reduce((s, x) => s + x.goals, 0),
    totalAssists: seasons.reduce((s, x) => s + x.assists, 0),
    peakOverall: Math.max(...seasons.map(x => x.overall)),
    allTitles: seasons.flatMap(x => x.titlesWon.map(t => ({ title: t, season: x.season }))),
    allAwards: seasons.flatMap(x => x.awardsWon.map(a => ({ award: a, season: x.season }))),
    clubHistory: seasons.reduce<string[]>((acc, x) => {
      if (acc.length === 0 || acc[acc.length - 1] !== x.club.name) {
        acc.push(x.club.name)
      }
      return acc
    }, []),
  }
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export default function SummaryView() {
  const career = useGameStore(s => s.career)
  const profile = useGameStore(s => s.profile)
  const restart = useGameStore(s => s.restart)

  if (!career || !profile) return null

  const stats = aggregateStats(career)
  const titleGroups = groupBy(stats.allTitles, t => t.title)
  const awardGroups = groupBy(stats.allAwards, a => a.award)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
        <p className="text-gray-400">
          {profile.position} · Camisa {profile.shirtNumber} · {stats.totalSeasons} temporadas
        </p>
      </div>

      <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-400 mb-3">Números da Carreira</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.totalGames}</p>
              <p className="text-xs text-gray-500">Jogos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.totalGoals}</p>
              <p className="text-xs text-gray-500">Gols</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.totalAssists}</p>
              <p className="text-xs text-gray-500">Assistências</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.peakOverall}</p>
              <p className="text-xs text-gray-500">Overall Máximo</p>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(titleGroups).length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Galeria de Títulos
          </h2>
          <div className="space-y-2">
            {Object.entries(titleGroups).map(([title, items]) => (
              <div key={title} className="flex items-center justify-between">
                <span className="text-yellow-200/80 text-sm">{title}</span>
                <span className="text-yellow-400 font-bold text-sm">x{items.length}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(awardGroups).length > 0 && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" /> Prêmios Individuais
          </h2>
          <div className="space-y-2">
            {Object.entries(awardGroups).map(([award, items]) => (
              <div key={award} className="flex items-center justify-between">
                <span className="text-purple-200/80 text-sm">{award}</span>
                <span className="text-purple-400 font-bold text-sm">x{items.length}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">Clubes</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {stats.clubHistory.map((club, i) => (
            <span key={i} className="flex items-center">
              <span className="px-2 py-1 bg-gray-700 rounded text-xs text-white">{club}</span>
              {i < stats.clubHistory.length - 1 && (
                <span className="text-gray-600 mx-0.5">→</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={restart}
        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        JOGAR NOVAMENTE
      </button>
    </div>
  )
}
