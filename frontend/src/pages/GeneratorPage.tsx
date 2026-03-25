import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AppShell } from '../components/layout/AppShell'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Clapperboard, Loader2, Sparkles, Wand2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  preview_url: string
}

export const GeneratorPage = () => {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('Create a cinematic product launch video focusing on speed and premium design.')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [duration, setDuration] = useState<15 | 30 | 60>(30)
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true)
      try {
        const { data } = await api.get('/templates')
        setTemplates(data.templates)
        if (data.templates.length > 0) setSelectedTemplate(data.templates[0].id)
      } catch (e) {
        setError('Unable to load templates. Please refresh and try again.')
      } finally {
        setTemplatesLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selectedTemplate) {
      setError('Please choose a template before generating.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/videos/generate', {
        url,
        prompt,
        template_id: selectedTemplate,
        target_duration: duration
      })
      navigate(`/processing/${data.video_id}`)
    } catch (err) {
      setError('Generation failed. Please check your URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedTemplateMeta = templates.find((t) => t.id === selectedTemplate)

  return (
    <AppShell title="Create Video">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="grid gap-6 xl:grid-cols-[1fr_340px]"
      >
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wand2 className="h-5 w-5 text-violet-300" />
              Generate a new video
            </CardTitle>
            <CardDescription>Paste your product URL, choose a template, and launch.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Product URL</label>
                <input
                  type="url"
                  placeholder="https://yourproduct.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-400/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Creative prompt</label>
                <textarea
                  rows={4}
                  placeholder="Describe the vibe, features to highlight, and brand tone..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-400/60"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-200">Duration</label>
                  <Badge variant="secondary">{duration}s</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d as 15 | 30 | 60)}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${duration === d
                        ? 'border-violet-500/60 bg-violet-500/15 text-violet-100'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-200">Template</label>
                {templatesLoading ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-32 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
                    ))}
                  </div>
                ) : templates.length === 0 ? (
                  <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
                    No templates available yet.
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {templates.map((tmpl) => {
                      const active = selectedTemplate === tmpl.id
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`overflow-hidden rounded-xl border text-left transition ${active
                            ? 'border-violet-500/60 bg-violet-500/10'
                            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                          }`}
                        >
                          <div className="aspect-video w-full bg-zinc-950">
                            {tmpl.preview_url ? (
                              <img src={tmpl.preview_url} alt={tmpl.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                                <Clapperboard className="mr-1 h-3.5 w-3.5" /> No preview
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-semibold text-zinc-100">{tmpl.name}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{tmpl.description || 'No description provided.'}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {error ? (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={loading || !url || !selectedTemplate}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Initializing pipeline...</> : 'Generate video'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
          className="space-y-4"
        >
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Live configuration</CardTitle>
              <CardDescription>What will be sent to the generation pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                <span className="text-zinc-400">Template</span>
                <span className="max-w-[180px] truncate text-zinc-200">{selectedTemplateMeta?.name || 'Not selected'}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                <span className="text-zinc-400">Duration</span>
                <span className="text-zinc-200">{duration}s</span>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                <p className="mb-1 text-zinc-400">URL</p>
                <p className="line-clamp-2 text-xs text-zinc-300">{url || 'No URL yet'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-500/30 bg-violet-500/10">
            <CardContent className="p-4 text-sm text-violet-100">
              <p className="font-medium">Pro tip</p>
              <p className="mt-1 text-violet-200/90">
                Mention target audience and tone in your prompt. Example: “for indie hackers, concise, premium, confident.”
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
