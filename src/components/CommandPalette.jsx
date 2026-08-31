import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { themes, useSettings } from '../settings'

export default function CommandPalette() {
  const navigate = useNavigate()
  const { settings, openSettings, setTheme, update } = useSettings()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const onKey = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(value => !value)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('wordspace:command', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wordspace:command', onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  const actions = useMemo(() => [
    ['Start typing test', 'Go to the test', () => navigate('/')],
    ['Restart test', 'Generate a fresh test', () => window.dispatchEvent(new CustomEvent('wordspace:restart'))],
    ['Time mode', 'Switch to timed tests', () => { update('test', { mode: 'time' }); navigate('/') }],
    ['Words mode', 'Switch to word-count tests', () => { update('test', { mode: 'words' }); navigate('/') }],
    ['Quote mode', 'Practice natural sentences', () => { update('test', { mode: 'quote' }); navigate('/') }],
    ['Weakness practice', 'Generate text from your mistakes', () => { update('test', { mode: 'practice' }); navigate('/') }],
    ['History', 'Open local typing analytics', () => navigate('/history')],
    ['Test settings', 'Modes, wordsets, difficulty', () => openSettings('test')],
    ['Caret settings', 'Smooth motion, style, pace', () => openSettings('caret')],
    ['Typography settings', 'Font, size, spacing', () => openSettings('typography')],
    ['Appearance settings', 'Metrics, keymap, visibility', () => openSettings('appearance')],
    ['Theme settings', 'Curated and custom themes', () => openSettings('theme')],
    ['Toggle keymap', 'Show or hide the live keyboard', () => update('appearance', { keymap: !settings.appearance.keymap })],
    ['Random theme', 'Apply a random curated theme', () => {
      const ids = Object.keys(themes)
      setTheme(ids[Math.floor(Math.random() * ids.length)])
    }]
  ], [navigate, openSettings, setTheme, update, settings.appearance.keymap])

  const filtered = actions.filter(action => `${action[0]} ${action[1]}`.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
  const run = action => {
    action()
    setOpen(false)
    setQuery('')
  }

  if (!open) return null

  return (
    <div className="commandLayer" role="dialog" aria-modal="true" aria-label="Wordspace command palette">
      <button className="commandScrim" onClick={() => setOpen(false)} aria-label="Close command palette"/>
      <section className="commandPalette">
        <header><strong>Command</strong><kbd>Esc</kbd></header>
        <label className="commandSearch"><span>⌘</span><input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search commands…"/></label>
        <div className="commandResults">
          {filtered.map(([name, detail, action]) => <button key={name} onClick={() => run(action)}><span><b>{name}</b><small>{detail}</small></span><em>↵</em></button>)}
          {!filtered.length && <p>No matching commands.</p>}
        </div>
      </section>
    </div>
  )
}
