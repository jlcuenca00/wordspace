import { fontOptions, themes, useSettings } from '../settings'
import { wordLibraries } from '../wordLibrary'
import { testPresets } from '../typingData'

const SECTIONS = [
  ['test', 'Test'],
  ['behavior', 'Behavior'],
  ['caret', 'Caret'],
  ['typography', 'Typography'],
  ['sound', 'Sound'],
  ['appearance', 'Appearance'],
  ['theme', 'Theme']
]

const Toggle = ({ value, onChange }) => (
  <button className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
    <i/><span>{value ? 'on' : 'off'}</span>
  </button>
)

const Range = ({ value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="range">
    <input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))}/>
    <b>{value}{unit}</b>
  </div>
)

const Select = ({ value, onChange, children }) => <select value={value} onChange={event => onChange(event.target.value)}>{children}</select>
const Row = ({ label, hint, children }) => <div className="settingRow"><div><b>{label}</b>{hint && <small>{hint}</small>}</div>{children}</div>
const FontSelect = ({ value, onChange }) => <Select value={value} onChange={onChange}>{fontOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select>

export default function SettingsPanel() {
  const { settings, panel, update, setTheme, updateCustomTheme, reset, closeSettings, setSection } = useSettings()
  if (!panel.open) return null
  const section = panel.section
  const index = Math.max(0, SECTIONS.findIndex(item => item[0] === section))

  return <>
    <button className="settingsScrim" aria-label="Close settings" onClick={closeSettings}/>
    <aside className="settingsPanel" role="dialog" aria-modal="true" aria-label="Wordspace settings">
      <header className="settingsHeader">
        <div><strong>Settings</strong><span>Ctrl ,</span></div>
        <button onClick={closeSettings}>×</button>
      </header>

      <div className="settingsLayout">
        <nav className="settingsNav">
          {SECTIONS.map(([id, label]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>{label}</button>)}
          <button className="resetLink" onClick={reset}>Reset all</button>
        </nav>

        <section className="settingsContent">
          <div className="settingsSectionTitle"><span>{String(index + 1).padStart(2, '0')}</span><h2>{SECTIONS[index][1]}</h2></div>

          {section === 'test' && <>
            <div className="presetGrid">{testPresets.map(preset => <button key={preset.id} onClick={() => update('test', preset.patch)}><b>{preset.name}</b><span>{preset.detail}</span></button>)}</div>
            <Row label="Mode"><Select value={settings.test.mode} onChange={value => update('test', { mode: value })}><option value="time">time</option><option value="words">words</option><option value="quote">quote</option><option value="custom">custom</option><option value="practice">weakness practice</option></Select></Row>
            {settings.test.mode === 'time' && <Row label="Seconds"><Range value={settings.test.time} min={5} max={3600} step={5} onChange={value => update('test', { time: value })}/></Row>}
            {settings.test.mode === 'words' && <Row label="Words"><Range value={settings.test.words} min={5} max={1000} step={5} onChange={value => update('test', { words: value })}/></Row>}
            {settings.test.mode === 'quote' && <Row label="Quote length"><Select value={settings.test.quoteLength} onChange={value => update('test', { quoteLength: value })}><option value="short">short</option><option value="medium">medium</option><option value="long">long</option><option value="all">all</option></Select></Row>}
            <Row label="Word library" hint="Uses Monkeytype language assets."><Select value={settings.test.language} onChange={value => update('test', { language: value })}>{wordLibraries.map(item => <option key={item.id} value={item.id}>{item.label} · {item.detail}</option>)}</Select></Row>
            <Row label="Punctuation"><Toggle value={settings.test.punctuation} onChange={value => update('test', { punctuation: value })}/></Row>
            <Row label="Numbers"><Toggle value={settings.test.numbers} onChange={value => update('test', { numbers: value })}/></Row>
            <Row label="Difficulty"><Select value={settings.test.difficulty} onChange={value => update('test', { difficulty: value })}><option value="normal">normal</option><option value="expert">expert · stop on word</option><option value="master">master · stop on letter</option></Select></Row>
            <Row label="Quick restart"><Select value={settings.test.quickRestart} onChange={value => update('test', { quickRestart: value })}><option value="tab">Tab</option><option value="escape">Escape</option><option value="enter">Enter</option></Select></Row>
          </>}

          {section === 'behavior' && <>
            <Row label="Stop on error"><Select value={settings.behavior.stopOnError} onChange={value => update('behavior', { stopOnError: value })}><option value="off">off</option><option value="word">word</option><option value="letter">letter</option></Select></Row>
            <Row label="Confidence mode" hint="Disables backspace."><Toggle value={settings.behavior.confidence} onChange={value => update('behavior', { confidence: value })}/></Row>
            <Row label="Strict spaces"><Toggle value={settings.behavior.strictSpace} onChange={value => update('behavior', { strictSpace: value })}/></Row>
            <Row label="Typed text"><Select value={settings.behavior.typedText} onChange={value => update('behavior', { typedText: value })}><option value="keep">keep</option><option value="fade">fade</option><option value="hide">hide</option></Select></Row>
            <Row label="Line movement"><Select value={settings.behavior.lineScroll} onChange={value => update('behavior', { lineScroll: value })}><option value="smooth">smooth</option><option value="instant">instant</option></Select></Row>
            <Row label="Minimum WPM" hint="0 disables the limit."><Range value={settings.behavior.minWpm} min={0} max={250} step={5} onChange={value => update('behavior', { minWpm: value })} unit=" wpm"/></Row>
            <Row label="Minimum accuracy" hint="0 disables the limit."><Range value={settings.behavior.minAccuracy} min={0} max={100} onChange={value => update('behavior', { minAccuracy: value })} unit="%"/></Row>
            <Row label="Caps Lock warning"><Toggle value={settings.behavior.capsLockWarning} onChange={value => update('behavior', { capsLockWarning: value })}/></Row>
            <Row label="Focus warning"><Toggle value={settings.behavior.focusWarning} onChange={value => update('behavior', { focusWarning: value })}/></Row>
          </>}

          {section === 'caret' && <>
            <Row label="Style"><div className="segmented">{[['beam','│'],['block','█'],['underscore','_'],['outline','▯']].map(([value, glyph]) => <button key={value} className={settings.caret.style === value ? 'active' : ''} onClick={() => update('caret', { style: value })}>{glyph}</button>)}</div></Row>
            <Row label="Smooth motion"><Select value={settings.caret.speed} onChange={value => update('caret', { speed: value })}><option value="off">off</option><option value="slow">slow</option><option value="medium">medium</option><option value="fast">fast</option></Select></Row>
            <Row label="Blink"><Toggle value={settings.caret.blink} onChange={value => update('caret', { blink: value })}/></Row>
            <Row label="Width"><Range value={settings.caret.width} min={1} max={5} onChange={value => update('caret', { width: value })} unit="px"/></Row>
            <Row label="Pace caret" hint="Race a second caret at a target speed."><Toggle value={settings.caret.paceEnabled} onChange={value => update('caret', { paceEnabled: value })}/></Row>
            {settings.caret.paceEnabled && <Row label="Pace"><Range value={settings.caret.paceWpm} min={20} max={250} step={5} onChange={value => update('caret', { paceWpm: value })} unit=" wpm"/></Row>}
          </>}

          {section === 'typography' && <>
            <Row label="Typeface"><FontSelect value={settings.typography.font} onChange={value => update('typography', { font: value })}/></Row>
            <Row label="Size"><Range value={settings.typography.size} min={24} max={64} onChange={value => update('typography', { size: value })} unit="px"/></Row>
            <Row label="Line height"><Range value={settings.typography.lineHeight} min={1.1} max={2} step={0.05} onChange={value => update('typography', { lineHeight: value })}/></Row>
            <Row label="Letter spacing"><Range value={settings.typography.letterSpacing} min={-0.06} max={0.08} step={0.005} onChange={value => update('typography', { letterSpacing: value })} unit="em"/></Row>
            <Row label="Text width"><Range value={settings.typography.width} min={520} max={1300} step={20} onChange={value => update('typography', { width: value })} unit="px"/></Row>
          </>}

          {section === 'sound' && <>
            <Row label="Key sound"><Toggle value={settings.sound.enabled} onChange={value => update('sound', { enabled: value })}/></Row>
            <Row label="Profile"><Select value={settings.sound.profile} onChange={value => update('sound', { profile: value })}><option value="soft">soft</option><option value="mechanical">mechanical</option><option value="typewriter">typewriter</option><option value="minimal">minimal</option></Select></Row>
            <Row label="Volume"><Range value={settings.sound.volume} min={0} max={1} step={0.05} onChange={value => update('sound', { volume: value })}/></Row>
            <Row label="Error sound"><Toggle value={settings.sound.error} onChange={value => update('sound', { error: value })}/></Row>
          </>}

          {section === 'appearance' && <>
            <Row label="Live WPM"><Toggle value={settings.appearance.liveWpm} onChange={value => update('appearance', { liveWpm: value })}/></Row>
            <Row label="Live accuracy"><Toggle value={settings.appearance.liveAccuracy} onChange={value => update('appearance', { liveAccuracy: value })}/></Row>
            <Row label="Personal best"><Toggle value={settings.appearance.showPb} onChange={value => update('appearance', { showPb: value })}/></Row>
            <Row label="Timer"><Select value={settings.appearance.timer} onChange={value => update('appearance', { timer: value })}><option value="minimal">minimal</option><option value="bar">progress bar</option><option value="hidden">hidden</option></Select></Row>
            <Row label="Controls while typing"><Select value={settings.appearance.controls} onChange={value => update('appearance', { controls: value })}><option value="hide">hide</option><option value="fade">fade</option><option value="show">show</option></Select></Row>
            <Row label="Visible lines"><div className="segmented">{[2,3,4,5].map(value => <button key={value} className={settings.appearance.lines === value ? 'active' : ''} onClick={() => update('appearance', { lines: value })}>{value}</button>)}</div></Row>
            <Row label="Live keymap" hint="Shows the next key and an error heatmap."><Toggle value={settings.appearance.keymap} onChange={value => update('appearance', { keymap: value })}/></Row>
            {settings.appearance.keymap && <Row label="Keyboard layout"><Select value={settings.appearance.keymapLayout} onChange={value => update('appearance', { keymapLayout: value })}><option value="qwerty">QWERTY</option><option value="colemak">Colemak</option><option value="dvorak">Dvorak</option></Select></Row>}
            <Row label="Motion"><Select value={settings.appearance.motion} onChange={value => update('appearance', { motion: value })}><option value="reduced">reduced</option><option value="subtle">subtle</option><option value="full">full</option></Select></Row>
          </>}

          {section === 'theme' && <>
            <div className="themeGrid">{Object.entries(themes).map(([id, theme]) => <button key={id} className={settings.theme === id ? 'active' : ''} onClick={() => setTheme(id)}><span style={{ background: theme.bg, color: theme.text, borderColor: theme.faint }}><i style={{ background: theme.accent }}/><b>Aa</b></span><em>{theme.name}</em></button>)}<button className={settings.theme === 'custom' ? 'active' : ''} onClick={() => setTheme('custom')}><span style={{ background: settings.customTheme.bg, color: settings.customTheme.text, borderColor: settings.customTheme.faint }}><i style={{ background: settings.customTheme.accent }}/><b>Aa</b></span><em>CUSTOM</em></button></div>
            <div className="customColors">{[['Background','bg'],['Surface','surface'],['Text','text'],['Muted','muted'],['Border','faint'],['Error','error'],['Caret','caret'],['Accent','accent']].map(([label, key]) => <label key={key}><span>{label}</span><input type="color" value={settings.customTheme[key]} onChange={event => updateCustomTheme({ [key]: event.target.value })}/><b>{settings.customTheme[key]}</b></label>)}</div>
          </>}
        </section>
      </div>
    </aside>
  </>
}
