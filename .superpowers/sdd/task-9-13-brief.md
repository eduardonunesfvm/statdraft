# Tasks 9-13: UI Components + App Integration

Create 5 files: `src/components/SetupForm.tsx`, `src/components/DraftCard.tsx`, `src/components/SeasonView.tsx`, `src/components/SummaryView.tsx`, and replace `src/App.tsx`.

Work from: C:\Users\du\Downloads\statdraft

IMPORTANT: Use `Write` tool to create each file. After creating all files, run `npx tsc --noEmit`. Fix any type errors. Then commit.

## File 1: src/components/SetupForm.tsx

```tsx
import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { ALL_POSITIONS, POSITION_LABELS, type Position, type GameMode } from '../types/game'
import { Swords, Trophy } from 'lucide-react'

export default function SetupForm() {
  const startDraft = useGameStore(s => s.startDraft)

  const [name, setName] = useState('')
  const [shirtNumber, setShirtNumber] = useState('')
  const [position, setPosition] = useState<Position>('ATA')
  const [mode, setMode] = useState<GameMode>('easy')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Nome obrigatorio'
    const num = parseInt(shirtNumber)
    if (!shirtNumber || num < 1 || num > 99) errs.shirtNumber = 'Numero entre 1 e 99'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    startDraft({
      name: name.trim(),
      position,
      shirtNumber: parseInt(shirtNumber),
      mode,
    })
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
        <h1 className="text-3xl font-bold text-green-400">StatDraft</h1>
        <p className="text-gray-400 mt-1">Monte sua build e viva sua carreira</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Jogador</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            placeholder="Seu nome..."
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Numero da Camisa</label>
          <input
            type="number"
            min={1}
            max={99}
            value={shirtNumber}
            onChange={e => { setShirtNumber(e.target.value); setErrors(p => ({ ...p, shirtNumber: '' })) }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            placeholder="1-99"
          />
          {errors.shirtNumber && <p className="text-red-400 text-xs mt-1">{errors.shirtNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Posicao</label>
          <select
            value={position}
            onChange={e => setPosition(e.target.value as Position)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 cursor-pointer"
          >
            {ALL_POSITIONS.map(pos => (
              <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Modo de Jogo</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('easy')}
              className={`p-3 rounded-lg border text-left transition-all ${
                mode === 'easy'
                  ? 'border-green-500 bg-green-500/10 text-green-300'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold">Facil</div>
              <div className="text-xs mt-1 opacity-80">Atributos visiveis</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('expert')}
              className={`p-3 rounded-lg border text-left transition-all ${
                mode === 'expert'
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                <Swords className="w-4 h-4" /> Expert
              </div>
              <div className="text-xs mt-1 opacity-80">Atributos ocultos</div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors text-lg"
        >
          COMECAR DRAFT
        </button>
      </form>
    </div>
  )
}
```

## File 2: src/components/DraftCard.tsx

```tsx
import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { ALL_ATTRIBUTES, ATTRIBUTE_LABELS, type DraftAttributeName } from '../types/game'
import { Eye, EyeOff, Sparkles } from 'lucide-react'

function formatAttributeValue(attr: DraftAttributeName, value: number): string {
  if (attr === 'skill' || attr === 'pernaRuim') {
    return '\u2605'.repeat(value) + '\u2606'.repeat(5 - value)
  }
  return String(value)
}

export default function DraftCard() {
  const draftState = useGameStore(s => s.draftState)
  const profile = useGameStore(s => s.profile)
  const stealStat = useGameStore(s => s.stealStat)
  const [stealing, setStealing] = useState<DraftAttributeName | null>(null)

  if (!draftState || !profile) return null

  const currentRound = draftState.rounds[draftState.currentRound - 1]
  if (!currentRound) return null

  const isExpert = profile.mode === 'expert'

  const handleSteal = (attr: DraftAttributeName) => {
    if (draftState.filledAttributes[attr] !== undefined) return
    setStealing(attr)
    setTimeout(() => {
      stealStat(attr)
      setStealing(null)
    }, 400)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < draftState.currentRound
                ? 'bg-green-500 text-white'
                : i === draftState.currentRound
                ? 'bg-yellow-500 text-black ring-2 ring-yellow-300'
                : 'bg-gray-700 text-gray-500'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <p className="text-center text-gray-400 mb-4">
        Rodada {draftState.currentRound} de 8
      </p>

      <div className={`bg-gray-800/80 rounded-xl border border-gray-700 p-5 mb-6 ${stealing ? 'opacity-50 scale-95 transition-all' : ''}`}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
            {currentRound.realPlayer.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white">{currentRound.realPlayer.name}</h3>
            <p className="text-sm text-gray-400">
              {currentRound.realPlayer.position} | {currentRound.realPlayer.nationality}
            </p>
            {currentRound.realPlayer.rarity === 'rare' && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                <Sparkles className="w-3 h-3" /> RARO
              </span>
            )}
          </div>
          <div className="text-gray-500">
            {isExpert ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1">
          {ALL_ATTRIBUTES.map(attr => (
            <div key={attr} className="flex justify-between text-sm">
              <span className="text-gray-400">{ATTRIBUTE_LABELS[attr]}</span>
              <span className={isExpert ? 'text-gray-600 font-mono' : 'text-white font-semibold'}>
                {isExpert
                  ? '???'
                  : formatAttributeValue(attr, currentRound.realPlayer.attributes[attr])
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Sua Build</h3>
        <div className="grid grid-cols-2 gap-1 text-sm">
          {ALL_ATTRIBUTES.map(attr => {
            const filled = draftState.filledAttributes[attr]
            return (
              <div key={attr} className="flex justify-between">
                <span className={filled ? 'text-green-400' : 'text-gray-500'}>
                  {ATTRIBUTE_LABELS[attr]}
                </span>
                <span className={filled ? 'text-green-300 font-semibold' : 'text-gray-600'}>
                  {filled !== undefined ? formatAttributeValue(attr, filled) : '---'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mb-3">
        Escolha um atributo para roubar:
      </p>

      <div className="grid grid-cols-4 gap-2">
        {ALL_ATTRIBUTES.map(attr => {
          const filled = draftState.filledAttributes[attr] !== undefined
          return (
            <button
              key={attr}
              onClick={() => handleSteal(attr)}
              disabled={filled || stealing !== null}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                filled
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                  : 'bg-green-600 hover:bg-green-500 text-white border border-green-400 hover:scale-105'
              } ${stealing === attr ? 'ring-2 ring-yellow-400 scale-110' : ''}`}
            >
              {filled ? `${ATTRIBUTE_LABELS[attr]} ✓` : ATTRIBUTE_LABELS[attr]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

## File 3: src/components/SeasonView.tsx

```tsx
import { useGameStore } from '../store/useGameStore'
import type { SeasonStats } from '../types/game'
import { ChevronLeft, ChevronRight, Award, Trophy, Goal, Swords, Crosshair } from 'lucide-react'

function StatBadge({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-800/60 px-2.5 py-1.5 rounded-lg">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-bold text-white ml-auto">{value}</span>
    </div>
  )
}

export default function SeasonView() {
  const career = useGameStore(s => s.career)
  const currentSeasonIndex = useGameStore(s => s.currentSeasonIndex)
  const advanceSeason = useGameStore(s => s.advanceSeason)
  const retire = useGameStore(s => s.retire)
  const canAdvance = useGameStore(s => s.canAdvance())
  const isSimulationComplete = useGameStore(s => s.isSimulationComplete)

  if (!career || career.length === 0) return null

  const season: SeasonStats = career[currentSeasonIndex]
  if (!season) return null

  const handlePrev = () => {
    const state = useGameStore.getState()
    if (state.currentSeasonIndex > 0) {
      useGameStore.setState({ currentSeasonIndex: state.currentSeasonIndex - 1 })
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrev}
          disabled={currentSeasonIndex === 0}
          className={`p-2 rounded-lg ${currentSeasonIndex === 0 ? 'text-gray-600' : 'text-white hover:bg-gray-800'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Temporada {season.season}</h2>
          <p className="text-sm text-gray-400">Idade: {season.age} anos</p>
        </div>

        <button
          onClick={() => advanceSeason()}
          disabled={!canAdvance}
          className={`p-2 rounded-lg ${!canAdvance ? 'text-gray-600' : 'text-white hover:bg-gray-800'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-5">
        <span className="text-4xl font-black text-green-400">{season.overall}</span>
        <span className="text-sm text-gray-500 ml-1">OVR</span>
      </div>

      <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
            {season.club.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">{season.club.name}</p>
            <p className="text-xs text-gray-500">{season.club.league} | {season.club.country}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatBadge icon={Goal} label="Jogos" value={season.appearances} />
          <StatBadge icon={Crosshair} label="Gols" value={season.goals} />
          <StatBadge icon={Swords} label="Assists" value={season.assists} />
        </div>

        <div className="flex gap-1 mt-2 text-xs text-gray-500">
          <span>{season.yellowCards} amarelos</span>
          <span>·</span>
          <span>{season.redCards} vermelhos</span>
        </div>
      </div>

      {season.titlesWon.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-300">Titulos</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {season.titlesWon.map(title => (
              <span key={title} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">
                {title}
              </span>
            ))}
          </div>
        </div>
      )}

      {season.awardsWon.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Premios</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {season.awardsWon.map(award => (
              <span key={award} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                {award}
              </span>
            ))}
          </div>
        </div>
      )}

      {season.events.length > 0 && (
        <div className="bg-gray-800/40 rounded-xl border border-gray-700 p-3 mb-6 max-h-48 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-400 mb-2">Eventos da Temporada</h3>
          <div className="space-y-2">
            {season.events.map((evt, i) => (
              <div key={i} className="text-sm border-l-2 border-gray-600 pl-3">
                <p className="text-white font-medium">{evt.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{evt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3">
        {isSimulationComplete ? (
          <button
            onClick={() => retire()}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            VER RESUMO DA CARREIRA
          </button>
        ) : (
          <button
            onClick={() => retire()}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            Aposentar Agora
          </button>
        )}
      </div>
    </div>
  )
}
```

## File 4: src/components/SummaryView.tsx

```tsx
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
        <h2 className="text-sm font-semibold text-gray-400 mb-3">Numeros da Carreira</h2>
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
              <p className="text-xs text-gray-500">Assistencias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.peakOverall}</p>
              <p className="text-xs text-gray-500">Overall Maximo</p>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(titleGroups).length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Galeria de Titulos
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
            <Award className="w-4 h-4" /> Premios Individuais
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
```

## File 5: src/App.tsx (REPLACE existing file)

```tsx
import { useGameStore } from './store/useGameStore'
import SetupForm from './components/SetupForm'
import DraftCard from './components/DraftCard'
import SeasonView from './components/SeasonView'
import SummaryView from './components/SummaryView'

function App() {
  const phase = useGameStore(s => s.phase)

  const PhaseComponent = {
    setup: SetupForm,
    draft: DraftCard,
    simulation: SeasonView,
    summary: SummaryView,
  }[phase]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {(['setup', 'draft', 'simulation', 'summary'] as const).map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              <span className={`${p === phase ? 'text-green-400 font-semibold' : ''}`}>
                {p === 'setup' && 'Criacao'}
                {p === 'draft' && 'Draft'}
                {p === 'simulation' && 'Carreira'}
                {p === 'summary' && 'Resumo'}
              </span>
              {i < 3 && <span className="text-gray-700">/</span>}
            </span>
          ))}
        </div>
      </header>

      <main className="flex-1">
        <PhaseComponent />
      </main>
    </div>
  )
}

export default App
```

## Verification

1. Run `npx tsc --noEmit` 
2. Fix any type errors
3. Run `npm run build` to verify production build

## Commit

```bash
git add -A
git commit -m "feat: add all UI components and wire App with phase routing"
```
