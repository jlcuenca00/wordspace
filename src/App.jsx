import { Routes, Route, NavLink } from 'react-router-dom'
import Type from './pages/Type'
import Stats from './pages/Stats'
import SettingsPanel from './components/SettingsPanel'
import CommandPalette from './components/CommandPalette'
import { SettingsProvider, useSettings } from './settings'

function Shell({ children }) {
  const { openSettings } = useSettings()

  return (
    <div className="appShell">
      <header className="siteHeader">
        <NavLink to="/" className="brand" aria-label="Wordspace typing test">
          wordspace<span>.</span>
        </NavLink>

        <div className="headerTag">typing, without the noise</div>

        <nav className="headerActions" aria-label="Wordspace navigation">
          <NavLink to="/history" className="headerLink">History</NavLink>
          <button
            className="headerIconButton"
            onClick={() => window.dispatchEvent(new CustomEvent('wordspace:command'))}
            aria-label="Open command palette"
            title="Command palette · Ctrl K"
          >
            ⌘
          </button>
          <button
            className="headerSettings"
            onClick={() => openSettings('test')}
            aria-label="Open settings"
          >
            <span className="sliders" aria-hidden="true"><i/><i/><i/></span>
            Settings
          </button>
        </nav>
      </header>

      {children}
      <SettingsPanel />
      <CommandPalette />
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Type />} />
          <Route path="/type" element={<Type />} />
          <Route path="/history" element={<Stats />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<Type />} />
        </Routes>
      </Shell>
    </SettingsProvider>
  )
}
