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
 return <main className="statsPageV5">
  <section className="statsHeroV5"><div><span>Your progress</span><h1>See what your<br/>hands are learning.</h1><p>Speed matters. Repeatability, accuracy, and the mistakes you keep making matter more.</p></div><button onClick={practice}>Practice weak keys <span>→</span></button></section>
  <section className="statCardsV5"><article><span>Personal best</span><strong>{summary.pb||0}</strong><small>WPM</small></article><article><span>Average speed</span><strong>{summary.avgWpm||0}</strong><small>WPM</small></article><article><span>Average accuracy</span><strong>{summary.avgAccuracy||0}</strong><small>%</small></article><article><span>Practice time</span><strong>{fmtTime(summary.time)}</strong><small>{summary.tests||0} sessions</small></article></section>
  <section className="activityCardV5"><header><div><span>Last 28 days</span><h2>Practice activity</h2></div><strong>{summary.tests||0} total sessions</strong></header><div className="activityBarsV5">{activity.map(x=><div key={x.key} title={`${x.label}: ${x.count} test${x.count===1?'':'s'}`}><i style={{height:`${Math.max(10,(x.count/max)*100)}%`}}/><span>{x.label.slice(0,3)}</span></div>)}</div></section>
  <section className="insightGridV5">
   <article className="weakKeysV5"><header><div><span>Personal practice</span><h2>Weak keys</h2></div><button onClick={practice}>Practice them</button></header>{weak.chars.length?<div className="weakKeyGridV5">{weak.chars.map(([c,n],i)=><div key={c}><span>#{i+1}</span><strong>{c.toUpperCase()}</strong><small>{n} errors</small></div>)}</div>:<div className="analyticsEmptyV5"><strong>No weakness profile yet.</strong><p>Complete a few typing tests and Wordspace will build one from your real mistakes.</p></div>}</article>
   <article className="confusionsV5"><header><span>Common confusions</span><h2>What gets swapped?</h2></header>{weak.pairs.length?<div>{weak.pairs.map(([pair,n])=><p key={pair}><strong>{pair}</strong><span>{n} times</span></p>)}</div>:<div className="analyticsEmptyV5"><strong>Nothing repeated yet.</strong><p>Your recurring key confusions will appear here.</p></div>}</article>
  </section>
  <section className="historyCardV5"><header><div><span>Recent sessions</span><h2>Your last tests</h2></div><div><button onClick={exportData}>Export JSON</button><button className="dangerText" onClick={wipe}>Clear history</button></div></header>{sessions.length?<div className="historyTableV5"><div className="historyHeaderV5"><span>Date</span><span>Mode</span><span>WPM</span><span>Accuracy</span><span>Consistency</span><span>Wordset</span></div>{sessions.slice(0,30).map(s=><div className="historyRowV5" key={s.id}><span>{new Date(s.date).toLocaleDateString([],{month:'short',day:'numeric'})}</span><span>{String(s.mode).toUpperCase()}{s.failed?' · FAILED':''}</span><strong>{s.wpm}</strong><span>{s.accuracy}%</span><span>{s.consistency}%</span><span>{String(s.language||'english').replaceAll('_',' ')}</span></div>)}</div>:<div className="analyticsEmptyV5 historyEmptyV5"><strong>No sessions yet.</strong><p>Finish your first TYPE test and it will appear here.</p><button onClick={()=>navigate('/type')}>Start a test</button></div>}</section>
 </main>
}
