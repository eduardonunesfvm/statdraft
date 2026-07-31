import { useGameStore } from '../store/useGameStore'
import type { SeasonStats } from '../types/game'
import { ChevronLeft, ChevronRight, Award, Trophy, Goal, Swords, Crosshair, ArrowRight } from 'lucide-react'

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
  const pendingTransfer = useGameStore(s => s.pendingTransfer)
  const selectTransferClub = useGameStore(s => s.selectTransferClub)
  const declineTransfer = useGameStore(s => s.declineTransfer)

  if (!career || career.length === 0) return null

  const season: SeasonStats = career[currentSeasonIndex]
  if (!season) return null

  const handlePrev = () => {
    const state = useGameStore.getState()
    if (state.currentSeasonIndex > 0) {
      useGameStore.setState({ currentSeasonIndex: state.currentSeasonIndex - 1, pendingTransfer: null })
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {pendingTransfer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-1">Propostas de Transferência</h3>
            <p className="text-xs text-gray-400 mb-4">
              Após uma {pendingTransfer.proposals.length > 3 ? 'ótima' : 'boa'} temporada no {pendingTransfer.fromClub.name}, clubes enviaram propostas:
            </p>
            <div className="space-y-2 mb-4">
              {pendingTransfer.proposals.map((club) => (
                <button
                  key={club.id}
                  onClick={() => selectTransferClub(club)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    club.id === pendingTransfer.fromClub.id
                      ? 'border-gray-500 bg-gray-800 hover:bg-gray-700'
                      : 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {club.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{club.name}</p>
                    <p className="text-gray-500 text-xs">{club.league} · {club.country}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
            <button
              onClick={declineTransfer}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Recusar todas e continuar no {season.club.name}
            </button>
          </div>
        </div>
      )}

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
            <p className="text-xs text-gray-500">{season.club.league} · {season.club.country}</p>
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
            <span className="text-sm font-semibold text-yellow-300">Títulos</span>
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
            <span className="text-sm font-semibold text-purple-300">Prêmios</span>
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
