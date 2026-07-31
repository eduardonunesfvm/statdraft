import { useState, useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import { ALL_ATTRIBUTES, ATTRIBUTE_LABELS, ATTRIBUTE_ABBR, type DraftAttributeName } from '../types/game'
import { Eye, EyeOff, Sparkles } from 'lucide-react'

function formatAttributeValue(attr: DraftAttributeName, value: number): string {
  if (attr === 'skill' || attr === 'pernaRuim') {
    return '\u2605'.repeat(value) + '\u2606'.repeat(5 - value)
  }
  return String(value)
}

const SPINNER_NAMES = [
  'Neymar', 'Messi', 'Haaland', 'Vini Jr', 'Arrascaeta',
  'Pedro', 'Cristiano Ronaldo', 'Estêvão', 'Raphael Veiga',
  'Gerson', 'Rodrigo Garro', 'Wesley', 'Breno Bidon',
  'Luiz Henrique', 'Léo Ortiz',
]

export default function DraftCard() {
  const draftState = useGameStore(s => s.draftState)
  const profile = useGameStore(s => s.profile)
  const stealStat = useGameStore(s => s.stealStat)
  const [stealing, setStealing] = useState<DraftAttributeName | null>(null)
  const [spinnerName, setSpinnerName] = useState('???')
  const [isSpinning, setIsSpinning] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  if (!draftState || !profile) return null

  const currentRound = draftState.rounds[draftState.currentRound - 1]
  if (!currentRound) return null

  const isExpert = profile.mode === 'expert'

  useEffect(() => {
    setIsSpinning(true)
    setShowPlayer(false)
    let count = 0
    const maxSpins = 15
    const interval = setInterval(() => {
      const randomName = SPINNER_NAMES[Math.floor(Math.random() * SPINNER_NAMES.length)]
      setSpinnerName(randomName)
      count++
      if (count >= maxSpins) {
        clearInterval(interval)
        setSpinnerName(currentRound.realPlayer.name)
        setIsSpinning(false)
        setTimeout(() => setShowPlayer(true), 200)
      }
    }, 80)

    return () => clearInterval(interval)
  }, [currentRound.round])

  const handleSteal = (attr: DraftAttributeName) => {
    if (draftState.filledAttributes[attr] !== undefined) return
    setStealing(attr)
    setTimeout(() => {
      stealStat(attr)
      setStealing(null)
      setShowPlayer(false)
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

      <div className={`bg-gray-800/80 rounded-xl border border-gray-700 p-5 mb-6 transition-all duration-300 ${stealing ? 'opacity-40 scale-95' : ''}`}>
        {!showPlayer ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className={`text-3xl font-black transition-all ${isSpinning ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
              {spinnerName}
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {isSpinning ? 'Sorteando...' : ''}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                {currentRound.realPlayer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white">{currentRound.realPlayer.name}</h3>
                <p className="text-sm text-gray-400">
                  {currentRound.realPlayer.position}
                  <span className="text-gray-600 mx-1">|</span>
                  <span className="text-gray-300">{currentRound.realPlayer.club}</span>
                  <span className="text-gray-600 mx-1">|</span>
                  {currentRound.realPlayer.nationality}
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
          </>
        )}
      </div>

      <p className="text-center text-sm text-gray-400 mb-3">
        Escolha um atributo para roubar:
      </p>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {ALL_ATTRIBUTES.map(attr => {
          const filled = draftState.filledAttributes[attr] !== undefined
          return (
            <button
              key={attr}
              onClick={() => handleSteal(attr)}
              disabled={filled || stealing !== null || !showPlayer}
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

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Sua Build</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {ALL_ATTRIBUTES.map(attr => {
            const filled = draftState.filledAttributes[attr]
            return (
              <div
                key={attr}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                  filled !== undefined
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-gray-800/40 border-gray-700'
                }`}
              >
                <span className={`text-xs w-8 ${filled !== undefined ? 'text-green-300' : 'text-gray-500'}`}>
                  {ATTRIBUTE_ABBR[attr]}
                </span>
                <span className={`font-bold tabular-nums ${filled !== undefined ? 'text-green-300' : 'text-gray-600'}`}>
                  {filled !== undefined ? formatAttributeValue(attr, filled) : '---'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
