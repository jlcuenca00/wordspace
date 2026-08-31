import { Link } from 'react-router-dom'
import { loadSessions, summarizeSessions } from '../sessionStore'

export default function Home(){
 const summary=summarizeSessions(loadSessions())
 return <main className="home homeV3">
  <section className="homeHero"><div className="homeKicker"><span>WORDSPACE / 2026</span><i>TYPE AS A CRAFT</i></div><h1>WORDS<br/><i>IN MOTION.</i></h1><p>A typing studio and writing room built for speed, rhythm, focus, and the people who care about how a keyboard feels.</p><div className="homeNumbers"><span><b>{summary.pb||'—'}</b>PB / WPM</span><span><b>{summary.tests||'—'}</b>SESSIONS</span><span><b>{summary.avgAccuracy||'—'}</b>AVG / ACC</span></div></section>
  <section className="homeSpaces">
   <Link to="/type" className="spaceCard primarySpace"><span className="spaceNo">01</span><div><small>PRACTICE / MEASURE</small><h2>TYPE</h2><p>Time, words, quotes, custom text, adaptive weakness practice, pace caret, keymaps, deep themes, and session analytics.</p></div><b>ENTER TYPE ↗</b><i className="spaceGlyph">T</i></Link>
   <Link to="/write" className="spaceCard"><span className="spaceNo">02</span><div><small>THINK / DRAFT</small><h2>WRITE</h2><p>A quiet writing room with local documents, autosave, export, typography controls, and typewriter mode.</p></div><b>ENTER WRITE ↗</b><i className="spaceGlyph">W</i></Link>
   <Link to="/stats" className="spaceCard statSpace"><span className="spaceNo">04</span><div><small>REVIEW / REFINE</small><h2>HISTORY</h2><p>Personal bests, consistency, weak keys, confusion patterns, activity, and your last 300 local sessions.</p></div><b>SEE THE DATA ↗</b><i className="spaceGlyph">↗</i></Link>
  </section>
  <div className="homeTicker"><div>TYPE / WRITE / MEASURE / REFINE / REPEAT / CUSTOMIZE / FOCUS / <span>WORDS IN MOTION</span> / TYPE / WRITE / MEASURE / REFINE / REPEAT</div></div>
 </main>
}
