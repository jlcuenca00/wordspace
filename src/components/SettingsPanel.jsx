import { fontOptions, themes, useSettings } from '../settings'
import { wordLibraries } from '../wordLibrary'
import { testPresets } from '../typingData'
import { playKeySound, preloadSoundPack, soundPacks } from '../keySoundEngine'

const GROUPS = [
  ['test', 'Test setup', 'Mode, duration and wordset'],
  ['typing', 'Typing', 'Rules, caret and pace'],
  ['display', 'Display', 'Text, HUD and training aids'],
  ['sound', 'Sound', 'Keyboard soundpacks'],
  ['theme', 'Themes', 'Color and contrast']
]

const SECTION_ALIAS = {
  behavior: 'typing',
  caret: 'typing',
  typography: 'display',
  appearance: 'display',
  themes: 'theme'
}

const GROUP_COPY = {
  test: ['Build your test', 'Everything that changes what you type.'],
  typing: ['Tune the typing feel', 'Error rules, caret behavior and pace training.'],
  display: ['Choose what stays visible', 'Typography, live metrics and training aids.'],
  sound: ['Make every keypress tactile', 'Three recorded keyboard packs, no synthetic clicks.'],
  theme: ['Set the visual tone', 'A broad theme library inspired by the variety serious typing sites offer.']
}

const soundDescriptions = {
  'eg-oreo': 'Rounded, poppy and clean.',
  'box-jade': 'Sharp tactile click with more attack.',
  'nk-cream': 'Deep linear sound with individual key samples.'
}

const Switch = ({ value, onChange, label }) => (
  <button className={`switchV2 ${value ? 'on' : ''}`} onClick={() => onChange(!value)} aria-pressed={value} aria-label={label}>
    <span className="switchTrackV2"><i /></span>
    <b>{value ? 'On' : 'Off'}</b>
  </button>
)

const Range = ({ value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="rangeV2">
    <input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} />
    <output>{value}{unit}</output>
  </div>
)

const Select = ({ value, onChange, children, ariaLabel }) => (
  <select className="selectV2" aria-label={ariaLabel} value={value} onChange={event => onChange(event.target.value)}>{children}</select>
)

const NumberField = ({ value, min, max, step = 1, onChange, suffix }) => (
  <label className="numberFieldV2">
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={event => {
        const next = Number(event.target.value)
        if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next)))
      }}
    />
    {suffix && <span>{suffix}</span>}
  </label>
)

const Setting = ({ label, hint, children, compact = false }) => (
  <div className={`settingV2 ${compact ? 'compact' : ''}`}>
    <div className="settingCopyV2"><b>{label}</b>{hint && <span>{hint}</span>}</div>
    <div className="settingControlV2">{children}</div>
  </div>
)

const SettingsGroup = ({ title, description, children }) => (
  <section className="settingsGroupV2">
    <header><div><h3>{title}</h3>{description && <p>{description}</p>}</div></header>
    <div className="settingsGroupBodyV2">{children}</div>
  </section>
)

const Segmented = ({ value, options, onChange, ariaLabel }) => (
  <div className="segmentedV2" role="group" aria-label={ariaLabel}>
    {options.map(([id, label]) => (
      <button key={id} className={value === id ? 'active' : ''} onClick={() => onChange(id)} aria-pressed={value === id}>{label}</button>
    ))}
  </div>
)

const ThemeCard = ({ id, theme, active, onClick }) => (
  <button className={`themeCardV2 ${active ? 'active' : ''}`} onClick={onClick} title={theme.name}>
    <span className="themeSwatchV2" style={{ background: theme.bg, color: theme.text, borderColor: theme.faint }}>
      <i style={{ background: theme.accent }} />
      <b>Aa</b>
      <em style={{ background: theme.surface }} />
    </span>
    <span className="themeNameV2"><b>{theme.name}</b>{active && <small>Active</small>}</span>
  </button>
)

export default function SettingsPanel() {
  const { settings, panel, update, setTheme, updateCustomTheme, reset, closeSettings, setSection } = useSettings()
  if (!panel.open) return null

  const group = SECTION_ALIAS[panel.section] || panel.section || 'test'
  const [heroTitle, heroCopy] = GROUP_COPY[group] || GROUP_COPY.test
  const library = wordLibraries.find(item => item.id === settings.test.language) || wordLibraries[0]
  const selectedSoundPack = soundPacks.find(pack => pack.id === settings.sound.profile) || soundPacks[0]
  const currentTheme = settings.theme === 'custom' ? settings.customTheme : (themes[settings.theme] || themes.wordspace)

  const goToGroup = id => setSection(id)
  const chooseSoundPack = id => {
    update('sound', { profile: id })
    preloadSoundPack(id).catch(() => {})
  }
  const previewPack = id => {
    preloadSoundPack(id).then(() => playKeySound(id, 'Space', settings.sound.volume)).catch(() => {})
  }

  const stateSummary = group === 'test'
    ? `${settings.test.mode} · ${settings.test.mode === 'time' ? `${settings.test.time}s` : settings.test.mode === 'words' ? `${settings.test.words} words` : library.label}`
    : group === 'typing'
      ? `${settings.caret.speed} caret · ${settings.behavior.stopOnError === 'off' ? 'free correction' : `stop on ${settings.behavior.stopOnError}`}`
      : group === 'display'
        ? `${fontOptions.find(([id]) => id === settings.typography.font)?.[1] || 'Typeface'} · ${settings.typography.size}px`
        : group === 'sound'
          ? `${settings.sound.enabled ? selectedSoundPack.name : 'Sound off'}`
          : currentTheme.name

  return <>
    <button className="settingsScrim settingsScrimV2" aria-label="Close settings" onClick={closeSettings} />
    <aside className="settingsPanelV2" role="dialog" aria-modal="true" aria-label="Wordspace settings">
      <header className="settingsHeaderV2">
        <div>
          <strong>Settings</strong>
          <span>Changes save automatically</span>
        </div>
        <button onClick={closeSettings} aria-label="Close settings"><kbd>Esc</kbd><span>×</span></button>
      </header>

      <div className="settingsShellV2">
        <nav className="settingsNavV2" aria-label="Settings categories">
          <div className="settingsNavTitleV2">Customize</div>
          {GROUPS.map(([id, title, description]) => (
            <button key={id} className={group === id ? 'active' : ''} onClick={() => goToGroup(id)}>
              <span className="settingsNavDotV2" />
              <span><b>{title}</b><small>{description}</small></span>
            </button>
          ))}
          <div className="settingsNavBottomV2">
            <button onClick={reset}>Reset to defaults</button>
            <span>Ctrl , to toggle</span>
          </div>
        </nav>

        <main className="settingsContentV2">
          <header className="settingsHeroV2">
            <div>
              <span>{String(GROUPS.findIndex(item => item[0] === group) + 1).padStart(2, '0')} / {String(GROUPS.length).padStart(2, '0')}</span>
              <h2>{heroTitle}</h2>
              <p>{heroCopy}</p>
            </div>
            <div className="settingsStateV2"><span>Current</span><b>{stateSummary}</b></div>
          </header>

          {group === 'test' && <>
            <SettingsGroup title="Test type" description="The essentials are here first. Deeper rules stay out of the way until you need them.">
              <Setting label="Mode" hint="Choose what ends the test.">
                <Segmented
                  value={settings.test.mode}
                  onChange={value => update('test', { mode: value })}
                  ariaLabel="Test mode"
                  options={[["time","Time"],["words","Words"],["quote","Quote"],["custom","Custom"],["practice","Weakness"]]}
                />
              </Setting>

              {settings.test.mode === 'time' && <Setting label="Duration" hint="Quick pick or enter any value up to one hour.">
                <div className="quickValueRowV2">
                  <div className="quickButtonsV2">{[15,30,60,120].map(value => <button key={value} className={settings.test.time === value ? 'active' : ''} onClick={() => update('test', { time: value })}>{value}s</button>)}</div>
                  <NumberField value={settings.test.time} min={5} max={3600} step={5} suffix="sec" onChange={value => update('test', { time: value })} />
                </div>
              </Setting>}

              {settings.test.mode === 'words' && <Setting label="Word count" hint="Quick pick or use your own count.">
                <div className="quickValueRowV2">
                  <div className="quickButtonsV2">{[10,25,50,100].map(value => <button key={value} className={settings.test.words === value ? 'active' : ''} onClick={() => update('test', { words: value })}>{value}</button>)}</div>
                  <NumberField value={settings.test.words} min={5} max={1000} step={5} suffix="words" onChange={value => update('test', { words: value })} />
                </div>
              </Setting>}

              {settings.test.mode === 'quote' && <Setting label="Quote length" hint="Controls the range of quotes that can appear.">
                <Segmented value={settings.test.quoteLength} onChange={value => update('test', { quoteLength: value })} ariaLabel="Quote length" options={[["short","Short"],["medium","Medium"],["long","Long"],["all","Any"]]} />
              </Setting>}

              {settings.test.mode === 'custom' && <div className="customTextV2">
                <div><b>Custom text</b><span>{settings.test.customText.trim() ? `${settings.test.customText.trim().split(/\s+/).length} words` : 'Paste anything you want to practice.'}</span></div>
                <textarea value={settings.test.customText} onChange={event => update('test', { customText: event.target.value })} placeholder="Paste or write your practice text…" />
              </div>}

              <Setting label="Word library" hint="Uses Monkeytype language assets.">
                <Select ariaLabel="Word library" value={settings.test.language} onChange={value => update('test', { language: value })}>
                  {wordLibraries.map(item => <option key={item.id} value={item.id}>{item.label} · {item.detail}</option>)}
                </Select>
              </Setting>

              <Setting label="Include" hint="Add punctuation or numbers to generated word tests.">
                <div className="switchPairV2">
                  <label><span>Punctuation</span><Switch label="Punctuation" value={settings.test.punctuation} onChange={value => update('test', { punctuation: value })} /></label>
                  <label><span>Numbers</span><Switch label="Numbers" value={settings.test.numbers} onChange={value => update('test', { numbers: value })} /></label>
                </div>
              </Setting>
            </SettingsGroup>

            <details className="settingsDisclosureV2">
              <summary><div><b>Quick presets</b><span>Six one-click setups for common practice goals.</span></div><i>+</i></summary>
              <div className="disclosureBodyV2 presetGridV2">{testPresets.map(preset => <button key={preset.id} onClick={() => update('test', preset.patch)}><b>{preset.name}</b><span>{preset.detail}</span></button>)}</div>
            </details>

            <details className="settingsDisclosureV2">
              <summary><div><b>Advanced test rules</b><span>Difficulty and restart behavior.</span></div><i>+</i></summary>
              <div className="disclosureBodyV2">
                <Setting label="Difficulty"><Select value={settings.test.difficulty} onChange={value => update('test', { difficulty: value })}><option value="normal">Normal</option><option value="expert">Expert · stop on word</option><option value="master">Master · stop on letter</option></Select></Setting>
                <Setting label="Quick restart"><Select value={settings.test.quickRestart} onChange={value => update('test', { quickRestart: value })}><option value="tab">Tab</option><option value="escape">Escape</option><option value="enter">Enter</option></Select></Setting>
              </div>
            </details>
          </>}

          {group === 'typing' && <>
            <SettingsGroup title="Correction rules" description="Decide how strict the test should be when you make a mistake.">
              <Setting label="Stop on error" hint="Off lets you continue. Word or letter blocks progress until corrected.">
                <Segmented value={settings.behavior.stopOnError} onChange={value => update('behavior', { stopOnError: value })} options={[["off","Off"],["word","Word"],["letter","Letter"]]} />
              </Setting>
              <Setting label="Confidence mode" hint="Disables Backspace completely."><Switch label="Confidence mode" value={settings.behavior.confidence} onChange={value => update('behavior', { confidence: value })} /></Setting>
              <Setting label="Strict spaces" hint="Only accepts Space when the target is actually a space."><Switch label="Strict spaces" value={settings.behavior.strictSpace} onChange={value => update('behavior', { strictSpace: value })} /></Setting>
              <Setting label="Typed text" hint="What happens to characters after you type them."><Segmented value={settings.behavior.typedText} onChange={value => update('behavior', { typedText: value })} options={[["keep","Keep"],["fade","Fade"],["hide","Hide"]]} /></Setting>
              <Setting label="Line movement"><Segmented value={settings.behavior.lineScroll} onChange={value => update('behavior', { lineScroll: value })} options={[["smooth","Smooth"],["instant","Instant"]]} /></Setting>
            </SettingsGroup>

            <SettingsGroup title="Caret" description="The part of the interface your eyes follow every keystroke.">
              <Setting label="Style"><Segmented value={settings.caret.style} onChange={value => update('caret', { style: value })} options={[["beam","│"],["block","█"],["underscore","_"],["outline","▯"]]} /></Setting>
              <Setting label="Smooth motion" hint="Medium is the recommended default."><Segmented value={settings.caret.speed} onChange={value => update('caret', { speed: value })} options={[["off","Off"],["slow","Slow"],["medium","Medium"],["fast","Fast"]]} /></Setting>
              <Setting label="Blink"><Switch label="Caret blink" value={settings.caret.blink} onChange={value => update('caret', { blink: value })} /></Setting>
              <Setting label="Width"><Range value={settings.caret.width} min={1} max={5} onChange={value => update('caret', { width: value })} unit="px" /></Setting>
            </SettingsGroup>

            <SettingsGroup title="Pace training" description="Add a second caret to race against a target speed.">
              <Setting label="Pace caret"><Switch label="Pace caret" value={settings.caret.paceEnabled} onChange={value => update('caret', { paceEnabled: value })} /></Setting>
              {settings.caret.paceEnabled && <Setting label="Target pace"><Range value={settings.caret.paceWpm} min={20} max={250} step={5} onChange={value => update('caret', { paceWpm: value })} unit=" wpm" /></Setting>}
            </SettingsGroup>

            <details className="settingsDisclosureV2">
              <summary><div><b>Challenge limits & warnings</b><span>Optional failure conditions and focus warnings.</span></div><i>+</i></summary>
              <div className="disclosureBodyV2">
                <Setting label="Minimum WPM" hint="0 disables this rule."><Range value={settings.behavior.minWpm} min={0} max={250} step={5} onChange={value => update('behavior', { minWpm: value })} unit=" wpm" /></Setting>
                <Setting label="Minimum accuracy" hint="0 disables this rule."><Range value={settings.behavior.minAccuracy} min={0} max={100} onChange={value => update('behavior', { minAccuracy: value })} unit="%" /></Setting>
                <Setting label="Caps Lock warning"><Switch label="Caps Lock warning" value={settings.behavior.capsLockWarning} onChange={value => update('behavior', { capsLockWarning: value })} /></Setting>
                <Setting label="Focus warning"><Switch label="Focus warning" value={settings.behavior.focusWarning} onChange={value => update('behavior', { focusWarning: value })} /></Setting>
              </div>
            </details>
          </>}

          {group === 'display' && <>
            <SettingsGroup title="Live HUD" description="Choose the information that remains around the test while you type.">
              <div className="hudToggleGridV2">
                <button className={settings.appearance.liveWpm ? 'active' : ''} onClick={() => update('appearance', { liveWpm: !settings.appearance.liveWpm })}><strong>104</strong><span>WPM</span><i>{settings.appearance.liveWpm ? 'On' : 'Off'}</i></button>
                <button className={settings.appearance.liveAccuracy ? 'active' : ''} onClick={() => update('appearance', { liveAccuracy: !settings.appearance.liveAccuracy })}><strong>98%</strong><span>Accuracy</span><i>{settings.appearance.liveAccuracy ? 'On' : 'Off'}</i></button>
                <button className={settings.appearance.showPb ? 'active' : ''} onClick={() => update('appearance', { showPb: !settings.appearance.showPb })}><strong>117</strong><span>Personal best</span><i>{settings.appearance.showPb ? 'On' : 'Off'}</i></button>
              </div>
              <Setting label="Timer"><Segmented value={settings.appearance.timer} onChange={value => update('appearance', { timer: value })} options={[["minimal","Minimal"],["bar","Bar"],["hidden","Hidden"]]} /></Setting>
              <Setting label="Controls while typing" hint="Hide is the cleanest, Monkeytype-like focus mode."><Segmented value={settings.appearance.controls} onChange={value => update('appearance', { controls: value })} options={[["hide","Hide"],["fade","Fade"],["show","Show"]]} /></Setting>
            </SettingsGroup>

            <SettingsGroup title="Typography" description="Tune the actual reading surface, not the surrounding chrome.">
              <Setting label="Typeface"><Select value={settings.typography.font} onChange={value => update('typography', { font: value })}>{fontOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select></Setting>
              <Setting label="Text size"><Range value={settings.typography.size} min={24} max={64} onChange={value => update('typography', { size: value })} unit="px" /></Setting>
              <Setting label="Line height"><Range value={settings.typography.lineHeight} min={1.1} max={2} step={0.05} onChange={value => update('typography', { lineHeight: value })} /></Setting>
              <Setting label="Letter spacing"><Range value={settings.typography.letterSpacing} min={-0.06} max={0.08} step={0.005} onChange={value => update('typography', { letterSpacing: value })} unit="em" /></Setting>
              <Setting label="Text width"><Range value={settings.typography.width} min={520} max={1300} step={20} onChange={value => update('typography', { width: value })} unit="px" /></Setting>
            </SettingsGroup>

            <SettingsGroup title="Training aids" description="Optional visual helpers for touch-typing practice.">
              <Setting label="Visible lines"><Segmented value={String(settings.appearance.lines)} onChange={value => update('appearance', { lines: Number(value) })} options={[["2","2"],["3","3"],["4","4"],["5","5"]]} /></Setting>
              <Setting label="Live keymap" hint="Shows the next key and builds an error heatmap."><Switch label="Live keymap" value={settings.appearance.keymap} onChange={value => update('appearance', { keymap: value })} /></Setting>
              {settings.appearance.keymap && <Setting label="Keyboard layout"><Segmented value={settings.appearance.keymapLayout} onChange={value => update('appearance', { keymapLayout: value })} options={[["qwerty","QWERTY"],["colemak","Colemak"],["dvorak","Dvorak"]]} /></Setting>}
              <Setting label="Motion"><Segmented value={settings.appearance.motion} onChange={value => update('appearance', { motion: value })} options={[["reduced","Reduced"],["subtle","Subtle"],["full","Full"]]} /></Setting>
            </SettingsGroup>
          </>}

          {group === 'sound' && <>
            <div className={`soundMasterV2 ${settings.sound.enabled ? 'active' : ''}`}>
              <div><span>Keyboard audio</span><h3>{settings.sound.enabled ? 'Sound is on.' : 'Sound is off.'}</h3><p>Recorded samples only. No generated beeps or fake keyboard clicks.</p></div>
              <Switch label="Keyboard audio" value={settings.sound.enabled} onChange={value => {
                update('sound', { enabled: value })
                if (value) preloadSoundPack(settings.sound.profile).catch(() => {})
              }} />
              <div className="soundWaveV2" aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <i key={index} />)}</div>
            </div>

            <SettingsGroup title="Choose a soundpack" description="Each pack keeps its own Space, Enter, Shift, Backspace and supported key samples.">
              <div className="soundPackGridV2">
                {soundPacks.map(pack => (
                  <article key={pack.id} className={`soundPackCardV2 ${settings.sound.profile === pack.id ? 'active' : ''}`}>
                    <button className="soundPackSelectV2" onClick={() => chooseSoundPack(pack.id)}>
                      <span>{settings.sound.profile === pack.id ? 'Selected' : 'Soundpack'}</span>
                      <h4>{pack.name}</h4>
                      <p>{soundDescriptions[pack.id]}</p>
                    </button>
                    <button className="soundPackPreviewV2" onClick={() => previewPack(pack.id)}>▶ Preview space</button>
                  </article>
                ))}
              </div>
              <Setting label="Volume" hint={`${Math.round(settings.sound.volume * 100)}% output level.`}><Range value={settings.sound.volume} min={0} max={1} step={0.05} onChange={value => update('sound', { volume: value })} /></Setting>
            </SettingsGroup>
          </>}

          {group === 'theme' && <>
            <SettingsGroup title={`All themes · ${Object.keys(themes).length + 1}`} description="Nothing hidden. Scroll the full collection and switch instantly.">
              <div className="themeGridV2 themeGridAllV2">
                {Object.entries(themes).map(([id, theme]) => <ThemeCard key={id} id={id} theme={theme} active={settings.theme === id} onClick={() => setTheme(id)} />)}
                <ThemeCard id="custom" theme={settings.customTheme} active={settings.theme === 'custom'} onClick={() => setTheme('custom')} />
              </div>
            </SettingsGroup>

            <details className="settingsDisclosureV2" defaultOpen={settings.theme === 'custom'}>
              <summary><div><b>Custom color lab</b><span>Build your own theme from eight core colors.</span></div><i>+</i></summary>
              <div className="disclosureBodyV2 customColorsV2">
                {[["Background","bg"],["Surface","surface"],["Text","text"],["Muted text","muted"],["Borders","faint"],["Errors","error"],["Caret","caret"],["Accent","accent"]].map(([label, key]) => (
                  <label key={key}>
                    <span><b>{label}</b><small>{settings.customTheme[key].toUpperCase()}</small></span>
                    <input type="color" value={settings.customTheme[key]} onChange={event => updateCustomTheme({ [key]: event.target.value })} />
                  </label>
                ))}
              </div>
            </details>
          </>}
        </main>
      </div>
    </aside>
  </>
}
