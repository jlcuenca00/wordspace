import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activityByDay, clearSessions, exportSessions, loadSessions, summarizeSessions, weaknessReport } from '../sessionStore'
import { useSettings } from '../settings'

const fmtTime=s=>{const m=Math.floor(s/60),sec=s%60;return m?`${m}m ${sec}s`:`${sec}s`}

export default function Stats(){
 const[version,setVersion]=useState(0),navigate=useNavigate(),{update}=useSettings()
 const sessions=useMemo(()=>loadSessions(),[version]),summary=useMemo(()=>summarizeSessions(sessions),[sessions]),weak=useMemo(()=>weaknessReport(sessions),[sessions]),activity=useMemo(()=>activityByDay(sessions),[sessions]),max=Math.max(1,...activity.map(x=>x.count))
 const practice=()=>{update('test',{mode:'practice'});navigate('/type')}
 const exportData=()=>{const blob=new Blob([exportSessions()],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='wordspace-typing-history.json';a.click();URL.revokeObjectURL(url)}
 const wipe=()=>{if(confirm('Delete all locally saved typing history?')){clearSessions();setVersion(v=>v+1)}}
 return <main className="statsPage">
  <div className="statsIntro"><span>04 / HISTORY</span><h1>MEASURE<br/><i>THE RHYTHM.</i></h1><p>Your tests stay local on this browser. The point is not only speed, but whether your speed is becoming easier to repeat.</p></div>
  <section className="statHero">
   <div><small>PERSONAL BEST</small><strong>{summary.pb}</strong><span>WPM</span></div>
   <div><small>AVERAGE</small><strong>{summary.avgWpm}</strong><span>WPM</span></div>
   <div><small>ACCURACY</small><strong>{summary.avgAccuracy || 0}</strong><span>%</span></div>
   <div><small>SESSIONS</small><strong>{summary.tests}</strong><span>LOCAL</span></div>
  </section>
  <section className="activityPanel"><div className="sectionHead"><span>ACTIVITY / 28 DAYS</span><b>{fmtTime(summary.time)} PRACTICED</b></div><div className="activityBars">{activity.map(x=><i key={x.key} style={{'--level':Math.max(.08,x.count/max)}} title={`${x.label}: ${x.count} test${x.count===1?'':'s'}`}/>)}</div></section>
  <div className="statsGrid">
   <section className="weakPanel"><div className="sectionHead"><span>WEAK KEYS</span><button onClick={practice}>PRACTICE THEM ↗</button></div>{weak.chars.length?<div className="weakKeys">{weak.chars.map(([c,n],i)=><div key={c}><i>{String(i+1).padStart(2,'0')}</i><strong>{c.toUpperCase()}</strong><span>{n} ERRORS</span></div>)}</div>:<p className="emptyState">Finish a few tests and Wordspace will build a weakness profile from your actual mistakes.</p>}</section>
   <section className="confusions"><div className="sectionHead"><span>COMMON CONFUSIONS</span></div>{weak.pairs.length?<div>{weak.pairs.map(([pair,n])=><p key={pair}><b>{pair}</b><span>{n}</span></p>)}</div>:<p className="emptyState">No repeated confusion patterns yet.</p>}</section>
  </div>
  <section className="historyPanel"><div className="sectionHead"><span>RECENT SESSIONS</span><div><button onClick={exportData}>EXPORT JSON</button><button onClick={wipe}>CLEAR</button></div></div>{sessions.length?<div className="historyTable"><div className="historyHeader"><span>DATE</span><span>MODE</span><span>WPM</span><span>ACC</span><span>CONSISTENCY</span><span>WORDSET</span></div>{sessions.slice(0,30).map(s=><div className="historyRow" key={s.id}><span>{new Date(s.date).toLocaleDateString([],{month:'short',day:'numeric'})}</span><span>{String(s.mode).toUpperCase()}{s.failed?' / FAILED':''}</span><strong>{s.wpm}</strong><span>{s.accuracy}%</span><span>{s.consistency}%</span><span>{String(s.language||'english').replaceAll('_',' ').toUpperCase()}</span></div>)}</div>:<p className="emptyState historyEmpty">No sessions yet. Your first completed TYPE test will appear here.</p>}</section>
 </main>
}
