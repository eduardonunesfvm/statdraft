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
                {p === 'setup' && 'Criação'}
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
