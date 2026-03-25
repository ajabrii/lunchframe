import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { API_BASE } from '../services/api'

interface LogEntry {
  time: string
  message: string
  status: 'success' | 'active' | 'error'
}

export const ProcessingPage = () => {
  const { videoId } = useParams<{ videoId: string }>()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [complete, setComplete] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (!videoId) return

    let evtSource: EventSource | null = null
    const token = localStorage.getItem('token')
    const url = `${API_BASE}/videos/${videoId}/status?token_query=${token}`

    evtSource = new EventSource(url)

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const isDoneStage = data.stage === 'done' || data.stage === 'complete'
      const newLog: LogEntry = {
        time: new Date().toLocaleTimeString(),
        message: data.message || `Stage: ${data.stage}`,
        status: isDoneStage ? 'success' : 'active'
      }

      setLogs(prev => [...prev.slice(-15), newLog])

      if (isDoneStage) {
        setComplete(true)
        if (data.video_url) {
          setVideoUrl(data.video_url)
        }
        evtSource?.close()
      }
    }

    evtSource.onerror = () => {
      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: 'Lost connection to pipeline. Retrying...',
        status: 'error'
      }])
      evtSource?.close()
    }

    return () => evtSource?.close()
  }, [videoId])

  return (
    <AppShell title="Generation Pipeline">
      <div className="processing-page animate-scale-in">
        <div className="pipeline-container">
          <div className="pipeline-logs">
            <div className="logs-header">
              <h3>Live Status Logs</h3>
              {!complete && <div className="pulse-dot" />}
            </div>
            <div className="logs-content">
              {logs.map((log, i) => (
                <div key={i} className={`log-entry ${log.status}`}>
                  <span className="log-time">[{log.time}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
              {logs.length === 0 && <div className="log-entry active">Connecting to pipeline server...</div>}
            </div>
          </div>

          <div className="pipeline-result">
            {complete && videoUrl ? (
              <div className="success-state">
                <div className="success-icon">✨</div>
                <h2>Video Ready!</h2>
                <video controls className="final-video">
                  <source src={videoUrl} type="video/mp4" />
                </video>
                <div className="success-actions">
                  <a href={videoUrl} download className="btn btn-primary">Download MP4</a>
                  <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                </div>
              </div>
            ) : (
              <div className="waiting-state">
                <div className="pipeline-spinner" />
                <h2>Building your ad...</h2>
                <p>We are currently crawling your URL and generating the cinematic assets. This usually takes 1-2 minutes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
