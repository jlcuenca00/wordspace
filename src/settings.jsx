import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE = 'wordspace_settings_v2'

export const themes = {
  mono: { name: 'MONO', bg: '#090908', surface: '#10100f', text: '#e9e9e2', muted: '#50504b', faint: '#252522', error: '#b65d56', caret: '#f4f4ed' },
  paper: { name: 'PAPER', bg: '#e8e4d8', surface: '#ded9cc', text: '#1b1b18', muted: '#858077', faint: '#c8c2b5', error: '#9d463d', caret: '#171714' },
  ink: { name: 'INK', bg: '#111319', surface: '#161922', text: '#dfe3ea', muted: '#626a78', faint: '#272c38', error: '#be6d71', caret: '#f1f4fa' },
  void: { name: 'VOID', bg: '#000000', surface: '#080808', text: '#ffffff', muted: '#3d3d3d', faint: '#181818', error: '#d45f5f', caret: '#ffffff' },
  warm: { name: 'WARM', bg: '#17130f', surface: '#201a15', text: '#eadfce', muted: '#75695a', faint: '#322a22', error: '#c46b59', caret: '#f4e7d2' },
  terminal: { name: 'TERMINAL', bg: '#07100b', surface: '#0b1710', text: '#a8d8b1', muted: '#42634a', faint: '#17301f', error: '#d36b6b', caret: '#baf9c6' }
}

export const defaults = {
  theme: 'mono',
  test: { mode: 'time', time: 30, words: 25, punctuation: false, numbers: false, language: 'english', difficulty: 'normal' },
  behavior: { stopOnError: 'off', confidence: false, strictSpace: false, typedText: 'keep', lineScroll: 'smooth' },
  caret: { style: 'beam', speed: 'medium', blink: true, width: 2 },
  typography: { font: 'inter', size: 42, lineHeight: 1.5, letterSpacing: -0.03, width: 1000 },
  sound: { enabled: false, volume: 0.22, profile: 'soft', error: true },
  appearance: { liveWpm: true, liveAccuracy: true, timer: 'minimal', controls: 'fade', lines: 3, motion: 'full' },
  writing: { editorWidth: 760, font: 'serif', fontSize: 30, lineHeight: 1.75, autosave: true, autosaveDelay: 1200, typewriter: false }
}

const Ctx = createContext(null)
const merge = (a,b) => ({...a,...b,test:{...a.test,...b?.test},behavior:{...a.behavior,...b?.behavior},caret:{...a.caret,...b?.caret},typography:{...a.typography,...b?.typography},sound:{...a.sound,...b?.sound},appearance:{...a.appearance,...b?.appearance},writing:{...a.writing,...b?.writing}})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => { try { return merge(defaults, JSON.parse(localStorage.getItem(STORAGE) || '{}')) } catch { return defaults } })
  const [panel, setPanel] = useState({ open: false, section: 'test' })

  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(settings)) }, [settings])
  useEffect(() => {
    const t = themes[settings.theme] || themes.mono
    const root = document.documentElement
    Object.entries({ '--bg':t.bg,'--surface':t.surface,'--text':t.text,'--muted':t.muted,'--faint':t.faint,'--error':t.error,'--caret':t.caret,'--typing-size':`${settings.typography.size}px`,'--typing-line':settings.typography.lineHeight,'--typing-spacing':`${settings.typography.letterSpacing}em`,'--typing-width':`${settings.typography.width}px`,'--writing-width':`${settings.writing.editorWidth}px`,'--writing-size':`${settings.writing.fontSize}px`,'--writing-line':settings.writing.lineHeight }).forEach(([k,v])=>root.style.setProperty(k,v))
    root.dataset.theme = settings.theme
    root.dataset.motion = settings.appearance.motion
  }, [settings])

  useEffect(() => {
    const key = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); setPanel(p => ({...p, open: !p.open})) }
      if (e.key === 'Escape') setPanel(p => ({...p, open:false}))
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  const api = useMemo(() => ({
    settings,
    panel,
    update(section, patch) { setSettings(s => section ? ({...s,[section]:{...s[section],...patch}}) : ({...s,...patch})) },
    setTheme(theme) { setSettings(s=>({...s,theme})) },
    reset() { setSettings(defaults) },
    openSettings(section='test') { setPanel({open:true,section}) },
    closeSettings() { setPanel(p=>({...p,open:false})) },
    setSection(section) { setPanel(p=>({...p,section})) }
  }), [settings,panel])
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useSettings = () => useContext(Ctx)
