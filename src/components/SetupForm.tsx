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
    if (!name.trim()) errs.name = 'Nome obrigatório'
    const num = parseInt(shirtNumber)
    if (!shirtNumber || num < 1 || num > 99) errs.shirtNumber = 'Número entre 1 e 99'
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
          <label className="block text-sm font-medium text-gray-300 mb-1">Número da Camisa</label>
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
          <label className="block text-sm font-medium text-gray-300 mb-1">Posição</label>
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
              <div className="text-xs mt-1 opacity-80">Atributos visíveis</div>
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
          COMEÇAR DRAFT
        </button>
      </form>
    </div>
  )
}
