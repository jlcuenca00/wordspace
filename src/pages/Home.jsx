import { Link } from 'react-router-dom'

export default function Home(){
 return <main className="home">
  <p className="label">WORDSPACE / 2026</p>
  <h1>A PLACE FOR<br/><i>WORDS</i> IN MOTION.</h1>
  <section className="choices">
   <Link to="/type" className="choiceCard"><b className="choiceIndex">01</b><div className="choiceBody"><h2>TYPE</h2><p>Measure speed, accuracy<br/>and rhythm.</p></div><span className="choiceCta">BEGIN <i>↗</i></span></Link>
   <Link to="/write" className="choiceCard"><b className="choiceIndex">02</b><div className="choiceBody"><h2>WRITE</h2><p>Remove everything<br/>except the thought.</p></div><span className="choiceCta">ENTER <i>↗</i></span></Link>
  </section>
 </main>
}
