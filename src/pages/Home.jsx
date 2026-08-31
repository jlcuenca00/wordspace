import { Link } from 'react-router-dom'
import { loadSessions, summarizeSessions } from '../sessionStore'

export default function Home(){
 const summary=summarizeSessions(loadSessions())
 return <main className="homeV6">
  <section className="homeHeroV6">
   <div className="homeHeroLead">
    <span className="homeKickerV6">Typing, writing, repetition</span>
    <h1>WORDS<br/><em>IN MOTION.</em></h1>
   </div>
   <div className="homeHeroAside">
    <p>A serious typing environment with the depth touch typists expect, and a writing room built to keep the interface out of the way.</p>
    <div className="homeHeroActions"><Link to="/type">Start typing <span>→</span></Link><Link to="/write">Open writing room <span>→</span></Link></div>
   </div>
  </section>

  <section className="homeMetricsV6">
   <div><span>Personal best</span><strong>{summary.pb||'—'}</strong><small>WPM</small></div>
   <div><span>Average speed</span><strong>{summary.avgWpm||'—'}</strong><small>WPM</small></div>
   <div><span>Average accuracy</span><strong>{summary.avgAccuracy||'—'}</strong><small>%</small></div>
   <div><span>Sessions</span><strong>{summary.tests||'—'}</strong><small>LOCAL</small></div>
  </section>

  <section className="homeSpacesV6">
   <Link to="/type" className="homeSpaceRow"><span className="homeSpaceNo">01</span><strong className="homeSpaceTitle">Type</strong><span className="homeSpaceDesc">Time, words, quotes, custom text, adaptive practice, official Monkeytype wordsets, pace caret, keymaps, sounds, themes, and detailed results.</span><span className="homeSpaceArrow">↗</span></Link>
   <Link to="/write" className="homeSpaceRow"><span className="homeSpaceNo">02</span><strong className="homeSpaceTitle">Write</strong><span className="homeSpaceDesc">A focused writing room with autosave, local documents, export, typography controls, typewriter mode, and less chrome once you start writing.</span><span className="homeSpaceArrow">↗</span></Link>
   <Link to="/stats" className="homeSpaceRow"><span className="homeSpaceNo">03</span><strong className="homeSpaceTitle">History</strong><span className="homeSpaceDesc">Track speed, accuracy, consistency, activity, weak keys, recurring confusions, and practice generated from your own mistakes.</span><span className="homeSpaceArrow">↗</span></Link>
  </section>

  <section className="homeStatementV6"><span>WORDSPACE / 2026</span><h2>Deep enough for power users.<br/><em>Quiet enough to forget it is there.</em></h2></section>
 </main>
}
