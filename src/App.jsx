import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Type from './pages/Type'
import Write from './pages/Write'
import Library from './pages/Library'
import SettingsPanel from './components/SettingsPanel'
import { SettingsProvider, useSettings } from './settings'

function Shell({children}){
 const {openSettings}=useSettings()
 const location=useLocation()
 const page=location.pathname==='/'?'00':location.pathname.startsWith('/type')?'01':location.pathname.startsWith('/write')?'02':'03'
 return <div className="appShell">
  <div className="ambientGrid" aria-hidden="true"/>
  <div className="cornerMark cornerMarkA" aria-hidden="true">W</div>
  <div className="cornerMark cornerMarkB" aria-hidden="true">S</div>
  <header className="siteHeader">
   <NavLink to="/" className="brand"><b>WORDSPACE</b><span>{page} / 2026</span></NavLink>
   <nav><NavLink to="/type"><i>01</i>TYPE</NavLink><NavLink to="/write"><i>02</i>WRITE</NavLink><NavLink to="/library"><i>03</i>LIBRARY</NavLink></nav>
   <button className="settingsTrigger" onClick={()=>openSettings('test')} aria-label="Open customization settings">
    <span className="settingsGlyph"><i/><i/><i/></span>
    <span className="settingsTriggerCopy"><b>CUSTOMIZE</b><small>CTRL ,</small></span>
   </button>
  </header>
  <div className="pageRail" aria-hidden="true"><span>{page}</span><i/><span>WORDSPACE</span></div>
  {children}
  <footer>WORDSPACE / WORDS IN MOTION <span>PERSONALIZE THE EXPERIENCE · CTRL ,</span></footer>
  <SettingsPanel/>
 </div>
}
export default function App(){return <SettingsProvider><Shell><Routes><Route path="/" element={<Home/>}/><Route path="/type" element={<Type/>}/><Route path="/write" element={<Write/>}/><Route path="/library" element={<Library/>}/></Routes></Shell></SettingsProvider>}
