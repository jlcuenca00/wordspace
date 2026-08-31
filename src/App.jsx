import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Type from './pages/Type'
import Write from './pages/Write'
import Library from './pages/Library'
import Stats from './pages/Stats'
import SettingsPanel from './components/SettingsPanel'
import CommandPalette from './components/CommandPalette'
import { SettingsProvider, useSettings } from './settings'

function Shell({children}){
 const {openSettings}=useSettings()
 const location=useLocation()
 const isType=location.pathname.startsWith('/type')
 return <div className={`appShell newShell ${isType?'shellTyping':''}`}>
  <div className="siteGlow" aria-hidden="true"/>
  <header className="siteHeader newHeader">
   <NavLink to="/" className="brand newBrand" aria-label="Wordspace home"><span className="brandMark">W</span><span><b>wordspace</b><small>words in motion</small></span></NavLink>
   <nav className="mainNav"><NavLink to="/type">Type</NavLink><NavLink to="/write">Write</NavLink><NavLink to="/library">Library</NavLink><NavLink to="/stats">History</NavLink></nav>
   <div className="headerActions">
    <button className="commandTrigger newCommand" onClick={()=>window.dispatchEvent(new CustomEvent('wordspace:command'))} aria-label="Open command palette"><span>⌘</span><b>Command</b><kbd>Ctrl K</kbd></button>
    <button className="settingsTrigger newCustomize" onClick={()=>openSettings('test')} aria-label="Open customization settings"><span className="settingsGlyph"><i/><i/><i/></span><b>Customize</b></button>
   </div>
  </header>
  {children}
  {!isType&&<footer className="siteFooter"><span>WORDSPACE © 2026</span><span>TYPE · WRITE · IMPROVE</span><span>CTRL K COMMAND · CTRL , CUSTOMIZE</span></footer>}
  <SettingsPanel/><CommandPalette/>
 </div>
}

export default function App(){return <SettingsProvider><Shell><Routes><Route path="/" element={<Home/>}/><Route path="/type" element={<Type/>}/><Route path="/write" element={<Write/>}/><Route path="/library" element={<Library/>}/><Route path="/stats" element={<Stats/>}/></Routes></Shell></SettingsProvider>}
