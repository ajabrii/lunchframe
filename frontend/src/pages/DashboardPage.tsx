import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AppShell } from '../components/layout/AppShell'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Clapperboard, Loader2, Sparkles } from 'lucide-react'

interface Video {
  id: string
  title: string
  status: string
  thumbnail_url: string
  video_url?: string
  created_at: string
}

export const DashboardPage = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const navigate = useNavigate()

  const processingCount = videos.filter((video) => video.status !== 'done').length

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await api.get('/videos')
        setVideos(data.videos)
      } catch (e) {
        console.error('Failed to fetch videos')
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [])

  const deleteVideo = async (videoId: string) => {
    const ok = window.confirm('Delete this video from your library?')
    if (!ok) return

    try {
      setActionLoadingId(videoId)
      await api.delete(`/videos/${videoId}`)
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
    } catch (e) {
      console.error('Failed to delete video')
      window.alert('Could not delete video. Try again.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const editVideo = async (video: Video) => {
    const nextTitle = window.prompt('Edit video title', video.title || 'Untitled Video')
    if (nextTitle === null) return

    try {
      setActionLoadingId(video.id)
      const { data } = await api.patch(`/videos/${video.id}`, { title: nextTitle })
      setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, title: data.title || 'Untitled Video' } : v)))
    } catch (e) {
      console.error('Failed to edit video')
      window.alert('Could not edit video. Try again.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const watchVideo = async (video: Video) => {
    try {
      setActionLoadingId(video.id)
      const { data } = await api.get(`/videos/${video.id}/play-url`)
      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      }
    } catch (e) {
      console.error('Failed to open video')
      window.alert('Could not open video. Try again.')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Card className="bg-zinc-900/60">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-400">Total videos</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-zinc-100">{videos.length}</CardContent>
          </Card>
          <Card className="bg-zinc-900/60">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-400">In progress</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-zinc-100">{processingCount}</CardContent>
          </Card>
          <Card className="border-violet-500/30 bg-violet-500/10">
            <CardHeader>
              <CardTitle className="text-sm text-violet-200">Quick action</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/generator')} className="w-full" variant="outline">
                <Sparkles className="h-4 w-4" /> Create new video
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Your video library</h2>
              <p className="mt-1 text-sm text-zinc-400">Manage and review your generated content.</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/generator')}>New video</Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="h-48 animate-pulse bg-zinc-900/40" />
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden border-zinc-800 bg-zinc-900/50 transition hover:border-zinc-700">
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                        <Clapperboard className="mr-2 h-4 w-4" /> No thumbnail yet
                      </div>
                    )}
                    <div className="absolute right-3 top-3 rounded-full border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[11px] uppercase tracking-wide text-zinc-300">
                      {video.status}
                    </div>
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <h3 className="line-clamp-1 text-sm font-semibold text-zinc-100">{video.title || 'Untitled Video'}</h3>
                    <p className="text-xs text-zinc-500">{new Date(video.created_at).toLocaleDateString()}</p>
                    {video.status !== 'done' && (
                      <p className="inline-flex items-center gap-2 text-xs text-violet-300">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      {video.status === 'done' && (
                        <Button
                          size="sm"
                          disabled={actionLoadingId === video.id}
                          onClick={() => watchVideo(video)}
                        >
                          Watch
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={actionLoadingId === video.id}
                        onClick={() => editVideo(video)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoadingId === video.id}
                        onClick={() => deleteVideo(video.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-zinc-800 bg-zinc-900/40 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
                <Clapperboard className="h-5 w-5 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">No videos yet</h3>
              <p className="mt-2 text-sm text-zinc-400">Create your first launch video and start converting visitors into users.</p>
              <Button className="mt-4" onClick={() => navigate('/generator')}>Create your first video</Button>
            </Card>
          )}
        </motion.div>
      </div>
    </AppShell>
  )
}
