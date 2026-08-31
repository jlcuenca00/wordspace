import { Link } from 'react-router-dom'
import { loadSessions, summarizeSessions } from '../sessionStore'

export default function Home(){
 const summary=summarizeSessions(loadSessions())
 return <main className="homePageV5">
  <section className="homeHeroV5">
   <div className="heroCopy">
    <span className="eyebrow">A TYPING STUDIO FOR PEOPLE WHO CARE ABOUT FEEL</span>
    <h1>Type faster.<br/><em>Write better.</em></h1>
    <p>Monkeytype-level control, a calmer writing room, and a visual system designed to disappear when your hands start moving.</p>
    <div className="heroActions"><Link className="primaryCta" to="/type">Start typing <span>→</span></Link><Link className="secondaryCta" to="/write">Open writing room</Link></div>
   </div>
   <div className="heroVisual" aria-hidden="true"><div className="heroKey keyA">A</div><div className="heroKey keyS">S</div><div className="heroKey keyD">D</div><div className="heroKey keyF">F</div><span className="homeCaret"/><div className="heroLine">words become motion</div></div>
  </section>

  <section className="homeStatsV5">
   <div><span>PERSONAL BEST</span><strong>{summary.pb||'—'}</strong><small>WPM</small></div>
   <div><span>AVERAGE ACCURACY</span><strong>{summary.avgAccuracy||'—'}</strong><small>%</small></div>
   <div><span>SESSIONS</span><strong>{summary.tests||'—'}</strong><small>LOCAL</small></div>
   <div className="statStatement"><p>Practice speed. Find weak keys. Build rhythm. Then take that rhythm into a real writing space.</p></div>
  </section>

  <section className="spacesV5">
   <Link to="/type" className="productCard featuredCard"><span className="cardNo">01</span><div className="productCardCopy"><span>TEST / TRAIN / REFINE</span><h2>Type</h2><p>Time, words, quotes, custom text, adaptive practice, pace caret, languages, deep test behavior, and detailed results.</p></div><div className="cardAction">Enter typing studio <b>↗</b></div></Link>
   <Link to="/write" className="productCard"><span className="cardNo">02</span><div className="productCardCopy"><span>DRAFT / FOCUS / SAVE</span><h2>Write</h2><p>A distraction-free writing room with autosave, document management, export, typography control, and typewriter mode.</p></div><div className="cardAction">Open writing room <b>↗</b></div></Link>
   <Link to="/stats" className="productCard"><span className="cardNo">03</span><div className="productCardCopy"><span>MEASURE / UNDERSTAND</span><h2>History</h2><p>Personal bests, consistency, activity, weak keys, confusion patterns, and adaptive practice generated from your own mistakes.</p></div><div className="cardAction">See your progress <b>↗</b></div></Link>
  </section>

  <section className="homeManifesto"><span>WORDSPACE / 2026</span><h2>Complex underneath.<br/><em>Quiet when it matters.</em></h2><p>Customize almost everything. Then let all of it disappear the moment you start typing.</p></section>
 </main>
}
