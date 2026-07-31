import { useState, useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import { ALL_ATTRIBUTES, ATTRIBUTE_LABELS, ATTRIBUTE_ABBR, type DraftAttributeName } from '../types/game'
import { EyeOff, Sparkles } from 'lucide-react'

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
  const isRare = currentRound.realPlayer.rarity === 'rare'

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

  const topAttrs = ALL_ATTRIBUTES.filter(a => a !== 'skill' && a !== 'pernaRuim')
  const starAttrs: DraftAttributeName[] = ['skill', 'pernaRuim']

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

      {!showPlayer ? (
        <div className="bg-gray-800/80 rounded-2xl border border-gray-700 p-8 mb-6 flex flex-col items-center justify-center min-h-[280px]">
          <div className={`text-4xl font-black transition-all ${isSpinning ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
            {spinnerName}
          </div>
          <p className="text-gray-500 text-sm mt-3">
            {isSpinning ? 'Sorteando...' : ''}
          </p>
        </div>
      ) : (
        <div className={`mb-6 transition-all duration-300 ${stealing ? 'opacity-40 scale-95' : ''}`}>
          <div className={`relative rounded-2xl overflow-hidden border-2 ${
            isRare ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-gray-600'
          }`}>
            <div className={`absolute inset-0 ${
              isRare
                ? 'bg-gradient-to-br from-yellow-600/40 via-yellow-900/30 to-yellow-800/50'
                : 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900'
            }`} />

            <div className="relative z-10 px-5 pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isRare
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {currentRound.realPlayer.position}
                </span>

                {!isExpert && (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white drop-shadow-lg">
                      {currentRound.realPlayer.attributes.skill}
                    </span>
                    <span className="text-yellow-400 text-xs -mt-1">OVR</span>
                  </div>
                )}
                {isExpert && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <EyeOff className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-6 mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black border-4 flex-shrink-0 ${
                  isRare
                    ? 'border-yellow-400 bg-yellow-600/30 text-yellow-200'
                    : 'border-gray-500 bg-gray-700 text-white'
                }`}>
                  {currentRound.realPlayer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white drop-shadow-md">
                    {currentRound.realPlayer.name}
                  </h3>
                  <p className="text-sm text-gray-300 mt-0.5">
                    {currentRound.realPlayer.club}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentRound.realPlayer.nationality}
                  </p>
                  {isRare && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-yellow-500/30 border border-yellow-400/50 text-yellow-200 rounded text-xs font-bold">
                      <Sparkles className="w-3 h-3" /> RARO
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                {topAttrs.map(attr => (
                  <div key={attr} className="text-center">
                    <p className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider">
                      {ATTRIBUTE_ABBR[attr]}
                    </p>
                    <p className={`text-lg font-black tabular-nums ${
                      isExpert ? 'text-gray-600' : 'text-white'
                    }`}>
                      {isExpert ? '??' : formatAttributeValue(attr, currentRound.realPlayer.attributes[attr])}
                    </p>
                  </div>
                ))}
                {starAttrs.map(attr => (
                  <div key={attr} className="text-center">
                    <p className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider">
                      {ATTRIBUTE_ABBR[attr]}
                    </p>
                    <p className={`text-xs font-black tabular-nums ${
                      isExpert ? 'text-gray-600' : 'text-yellow-400'
                    }`}>
                      {isExpert ? '?' : formatAttributeValue(attr, currentRound.realPlayer.attributes[attr])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
