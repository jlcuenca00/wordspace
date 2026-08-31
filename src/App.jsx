import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Type from './pages/Type'
import Write from './pages/Write'
import Library from './pages/Library'
import SettingsPanel from './components/SettingsPanel'
import { SettingsProvider, useSettings } from './settings'

function Shell({children}){
 const {openSettings}=useSettings(); const location=useLocation()
 const page=location.pathname==='/'?'00':location.pathname.startsWith('/type')?'01':location.pathname.startsWith('/write')?'02':'03'
 return <div className="appShell"><header className="siteHeader"><NavLink to="/" className="brand"><b>WORDSPACE</b><span>{page} / 2026</span></NavLink><nav><NavLink to="/type"><i>01</i>TYPE</NavLink><NavLink to="/write"><i>02</i>WRITE</NavLink><NavLink to="/library"><i>03</i>LIBRARY</NavLink></nav><button className="settingsTrigger" onClick={()=>openSettings('test')}>SET / 06</button></header>{children}<footer>WORDSPACE / WORDS IN MOTION <span>CTRL , SETTINGS</span></footer><SettingsPanel/></div>
}
export default function App(){return <SettingsProvider><Shell><Routes><Route path="/" element={<Home/>}/><Route path="/type" element={<Type/>}/><Route path="/write" element={<Write/>}/><Route path="/library" element={<Library/>}/></Routes></Shell></SettingsProvider>}
