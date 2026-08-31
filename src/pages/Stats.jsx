import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activityByDay, clearSessions, exportSessions, loadSessions, summarizeSessions, weaknessReport } from '../sessionStore'
import { useSettings } from '../settings'

const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return minutes ? `${minutes}m ${rest}s` : `${rest}s`
}

export default function Stats() {
  const [version, setVersion] = useState(0)
  const navigate = useNavigate()
  const { update } = useSettings()
  const sessions = useMemo(() => loadSessions(), [version])
  const summary = useMemo(() => summarizeSessions(sessions), [sessions])
  const weak = useMemo(() => weaknessReport(sessions), [sessions])
  const activity = useMemo(() => activityByDay(sessions), [sessions])
  const max = Math.max(1, ...activity.map(item => item.count))

  const practice = () => {
    update('test', { mode: 'practice' })
    navigate('/')
  }

  const exportData = () => {
    const blob = new Blob([exportSessions()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'wordspace-typing-history.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const wipe = () => {
    if (!confirm('Delete all locally saved typing history?')) return
    clearSessions()
    setVersion(value => value + 1)
  }

  return (
    <main className="historyPage">
      <header className="historyHeader">
        <div><span>local analytics</span><h1>History</h1></div>
        <button onClick={() => navigate('/')}>back to test</button>
      </header>

      <section className="summaryStats">
        <div><strong>{summary.pb || 0}</strong><span>personal best</span><small>wpm</small></div>
        <div><strong>{summary.avgWpm || 0}</strong><span>average speed</span><small>wpm</small></div>
        <div><strong>{summary.avgAccuracy || 0}%</strong><span>average accuracy</span><small>{summary.tests || 0} sessions</small></div>
        <div><strong>{formatTime(summary.time)}</strong><span>practice time</span><small>{summary.chars.toLocaleString()} chars</small></div>
      </section>

      <section className="activitySection">
        <header><div><span>last 28 days</span><h2>Practice activity</h2></div><b>{summary.tests || 0} total sessions</b></header>
        <div className="activityBars">
          {activity.map(item => <div key={item.key} title={`${item.label}: ${item.count} test${item.count === 1 ? '' : 's'}`}><i style={{ height: `${Math.max(6, (item.count / max) * 100)}%` }}/><span>{item.label.slice(0, 3)}</span></div>)}
        </div>
      </section>

      <div className="analysisGrid">
        <section>
          <header><div><span>adaptive practice</span><h2>Weak keys</h2></div><button onClick={practice}>practice them</button></header>
          {weak.chars.length ? <div className="weakKeyList">{weak.chars.map(([char, count], index) => <div key={char}><span>{String(index + 1).padStart(2, '0')}</span><strong>{char.toUpperCase()}</strong><small>{count} errors</small></div>)}</div> : <p className="emptyMessage">Complete a few tests and Wordspace will build this from your actual mistakes.</p>}
        </section>

        <section>
          <header><div><span>mistake patterns</span><h2>Confusions</h2></div></header>
          {weak.pairs.length ? <div className="confusionList">{weak.pairs.map(([pair, count]) => <div key={pair}><strong>{pair}</strong><span>{count}</span></div>)}</div> : <p className="emptyMessage">No repeated confusion patterns yet.</p>}
        </section>
      </div>

      <section className="sessionSection">
        <header><div><span>recent tests</span><h2>Sessions</h2></div><div><button onClick={exportData}>export json</button><button className="danger" onClick={wipe}>clear</button></div></header>
        {sessions.length ? <div className="sessionTable"><div className="sessionTableHead"><span>date</span><span>mode</span><span>wpm</span><span>accuracy</span><span>consistency</span><span>wordset</span></div>{sessions.slice(0, 40).map(session => <div className="sessionRow" key={session.id}><span>{new Date(session.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span><span>{String(session.mode)}{session.failed ? ' · failed' : ''}</span><strong>{session.wpm}</strong><span>{session.accuracy}%</span><span>{session.consistency}%</span><span>{String(session.language || 'english').replaceAll('_', ' ')}</span></div>)}</div> : <div className="emptyHistory"><p>No sessions yet.</p><button onClick={() => navigate('/')}>start typing</button></div>}
      </section>
    </main>
  )
}
