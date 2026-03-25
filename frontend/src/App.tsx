import { useEffect, useState } from 'react'

// ─── SVG Icons ───────────────────────────────────────────
const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.91 5.8a2 2 0 0 0 1.29 1.29L21 12l-5.8 1.91a2 2 0 0 0-1.29 1.29L12 21l-1.91-5.8a2 2 0 0 0-1.29-1.29L3 12l5.8-1.91a2 2 0 0 0 1.29-1.29L12 3z" />
  </svg>
)

const LayoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
)

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
  </svg>
)

const CreditCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
)

const CodeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
)

const MonitorPlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polygon points="10 8 15 10.5 10 13 10 8" />
  </svg>
)

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const PlusIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// ─── FAQ Component ───────────────────────────────────────
function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item" onClick={() => setOpen(!open)}>
      <div className="faq-q">
        <h4 style={{ fontSize: '18px', fontWeight: 500 }}>{question}</h4>
        <PlusIcon open={open} />
      </div>
      <div className="faq-a" style={{ maxHeight: open ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s var(--ease-out)', opacity: open ? 1 : 0 }}>
        <p style={{ paddingBottom: '24px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{answer}</p>
      </div>
    </div>
  )
}

// ─── Main App Component ──────────────────────────────────
export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'generator' | 'processing'>('landing')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ─── Landing Page View ──────────────────────────────────
  if (view === 'landing') {
    return (
      <div className="landing-page">
        <nav className="nav" style={{
          background: scrolled ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
          borderBottomColor: scrolled ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
        }}>
          <div className="nav-logo">
            <LogoIcon />
            <span>Launchframe</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={() => setView('dashboard')}>Log in</button>
            <button className="btn btn-sm btn-primary" onClick={() => setView('generator')}>Start Building</button>
          </div>
        </nav>

        <main>
          <section className="hero">
            <div className="hero-announcement animate-slide-up">
              <span className="hero-announcement-badge">Story</span>
              <span>Built by solo devs, for solo devs →</span>
            </div>
            <h1 className="animate-slide-up delay-1">
              Ship fast. <br />
              <span className="hero-highlight">Launch louder.</span>
            </h1>
            <p className="animate-slide-up delay-2">
              You can build a great product, but can you market it? Paste your URL, write a prompt, and Launchframe generates an agency-grade 60fps launch video so you can get the traction you deserve.
            </p>
            <div className="hero-actions animate-slide-up delay-3">
              <button className="btn btn-lg btn-primary" onClick={() => setView('generator')}>Generate Video Free</button>
              <button className="btn btn-lg btn-secondary">
                View Templates
              </button>
            </div>

            <div className="hero-visual animate-slide-up delay-3">
              <div className="hero-window">
                <div className="window-header">
                  <div className="window-dot" style={{ backgroundColor: '#ff5f56' }} />
                  <div className="window-dot" style={{ backgroundColor: '#ffbd2e' }} />
                  <div className="window-dot" style={{ backgroundColor: '#27c93f' }} />
                  <div className="window-title">launchframe/render-engine</div>
                </div>
                <div className="window-body">
                  <div className="render-grid" />
                  <div className="render-box">
                    <div className="render-box-title">RENDERING FRAME 1,420 <span>94%</span></div>
                    <div className="render-bar"><div className="render-progress" /></div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {'>'} init playwright_crawler... [OK]<br/>
                      {'>'} fetching Llama-3_70b script... [OK]<br/>
                      {'>'} compiling Kokoro_voiceover.wav... [OK]<br/>
                      {'>'} React Remotion rendering...<br/>
                      <span style={{ color: 'var(--text-primary)' }}>{'>'} encoding output.mp4 -speed veryfast</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="clients">
            <div className="clients-label">Built by the creator of U-Improve & Memantic</div>
            <div className="clients-grid">
              <div className="client-logo">U-IMPROVE</div>
              <div className="client-logo">MEMANTIC</div>
              <div className="client-logo">KOMET</div>
              <div className="client-logo" style={{ fontFamily: 'var(--font-mono)', letterSpacing: 0 }}>1337_NETWORK</div>
            </div>
          </section>

          <section className="features" id="features" style={{ padding: '120px 32px', maxWidth: '1240px', margin: '0 auto' }}>
            <div className="section-header">
              <span className="section-tag">Infrastructure</span>
              <h2 className="section-title">An entire agency in one API.</h2>
              <p className="section-desc">We abstracted away headless browsers, LLMs, and motion graphics into a single, elegant backend pipeline.</p>
            </div>

            <div className="bento-grid">
              {/* Box 1 (Large) */}
              <div className="bento-card bento-card-large">
                <div className="bento-icon"><MonitorPlayIcon /></div>
                <h3 className="bento-title">Playwright Crawler Engine</h3>
                <p className="bento-desc">
                  Provide a URL. We spin up a headless Chromium instance to auto-navigate your web app, extracting DOM metadata, capturing high-res 4K screenshots, and identifying your exact brand color palette.
                </p>
                <div className="bento-visual" style={{ background: 'radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent)'}}>
                  <div style={{ color: 'var(--success)' }}>✔ launchframe-crawler connection established</div>
                </div>
              </div>

              {/* Box 2 */}
              <div className="bento-card">
                <div className="bento-icon"><SparklesIcon /></div>
                <h3 className="bento-title">Llama 3 Scriptwriter</h3>
                <p className="bento-desc">
                  We feed your site's HTML to Llama-3-70B. It writes a high-converting, agency-style VSL script tailored to your product.
                </p>
                <div className="bento-visual">
                  "Here is why you need..."
                </div>
              </div>

              {/* Box 3 */}
              <div className="bento-card">
                <div className="bento-icon"><MicIcon /></div>
                <h3 className="bento-title">On-Device TTS</h3>
                <p className="bento-desc">
                  Say goodbye to robotic AI voices. We use the local Kokoro TTS engine to generate ultra-realistic human voiceovers.
                </p>
                <div className="bento-visual">
                  Audio Waveform
                </div>
              </div>

              {/* Box 4 (Large) */}
              <div className="bento-card bento-card-large">
                <div className="bento-icon"><CodeIcon /></div>
                <h3 className="bento-title">React-based Rendering (Remotion)</h3>
                <p className="bento-desc">
                  Your video isn't built in Premiere. It's written in React. We inject your colors, screenshots, and script into our Remotion templates, then FFmpeg compiles the timeline into a pristine 60fps MP4.
                </p>
                <div className="bento-visual" style={{ alignItems: 'flex-start', justifyContent: 'flex-start', padding: 20 }}>
                  <pre style={{ margin: 0 }}>
                    <span style={{ color: '#c678dd' }}>export const</span> <span style={{ color: '#e5c07b' }}>Composition</span> = () {'=>'} {'{\n'}
                    {'  '}return {'(\n'}
                    {'    '}{'<Sequence'}{' '}from={'{0}'}{'>\n'}
                    {'      '}{'<Voiceover'} src={'{script.audioUrl}'} {'/>\n'}
                    {'      '}{'<DOMScreenshot'} src={'{crawl.img}'} {'/>\n'}
                    {'    '}{'</Sequence>\n'}
                    {'  )\n'}
                    {'}'}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section className="pricing" id="pricing" style={{ padding: '120px 32px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-header">
              <span className="section-tag">Pricing</span>
              <h2 className="section-title">Simple, transparent pricing.</h2>
              <p className="section-desc">
                Start for free. Upgrade when you need more videos or custom branding.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Free */}
              <div className="bento-card" style={{ padding: '40px', borderColor: 'var(--border-dim)' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Free</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>For solo devs testing the waters.</p>
                <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '32px' }}>$0<span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 400 }}> / mo</span></div>
                
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> 2 Videos per month</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> Up to 30 second duration</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> 720p Resolution</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> Launchframe Watermark</li>
                </ul>
                
                <button className="btn btn-lg btn-secondary" style={{ width: '100%' }} onClick={() => setView('generator')}>Start for free</button>
              </div>

              {/* Pro */}
              <div className="bento-card" style={{ padding: '40px', borderColor: 'var(--border-active)', backgroundImage: 'radial-gradient(ellipse at top right, rgba(94, 106, 210, 0.1), transparent)' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '8px', color: '#A8B1FF' }}>Pro</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>For shipping multiple products.</p>
                <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '32px' }}>$29<span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 400 }}> / mo</span></div>
                
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> 15 Videos per month</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> Up to 60 second duration</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> 1080p 60fps Resolution</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> No Watermark</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> Custom Voice Cloning</li>
                </ul>
                
                <button className="btn btn-lg btn-primary" style={{ width: '100%' }} onClick={() => setView('dashboard')}>Upgrade to Pro</button>
              </div>

              {/* Studio */}
              <div className="bento-card" style={{ padding: '40px', borderColor: 'var(--border-dim)' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Studio</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>For agencies and marketing teams.</p>
                <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '32px' }}>$149<span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 400 }}> / mo</span></div>
                
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> Unlimited Videos</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> Custom Brand Books</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> 4K Resolution</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><CheckIcon /> API Access</li>
                </ul>
                
                <button className="btn btn-lg btn-secondary" style={{ width: '100%' }}>Contact Sales</button>
              </div>
            </div>
          </section>

          <section className="faq" id="faq" style={{ padding: '80px 32px 140px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-header" style={{ marginBottom: '48px' }}>
              <h2 className="section-title" style={{ fontSize: '36px' }}>Frequently Asked Questions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-base)' }}>
              <FaqItem 
                question="What is Launchframe?" 
                answer="Launchframe is an AI-powered pipeline that turns any product URL into a high-converting, agency-grade launch video. We handle the web crawling, the Llama-3 scriptwriting, the Kokoro voiceover, and the final 60fps MP4 render using React Remotion." 
              />
              <FaqItem 
                question="Why was this built?" 
                answer="It was built by Iron (Abdelali Jabri), a 1337 Network student, because solo devs struggle to market their products visually. Code is cheap, motion design is expensive. Launchframe fixes that." 
              />
              <FaqItem 
                question="Do I need to write the script myself?" 
                answer="No. You just paste your URL. Our Playwright crawler extracts your site's copy, screenshots, and brand colors, and feeds it to Llama-3-70B to write a punchy, professional script automatically. You can always provide a custom prompt if you want specific edits." 
              />
              <FaqItem 
                question="How are the videos rendered?" 
                answer="We don't use fake AI video generation. Your video is rendered using React Remotion — meaning it's composed of real React components, exact CSS animations, crisp Typography, and perfect timing. FFmpeg then compiles it into a flawless MP4." 
              />
              <FaqItem 
                question="Can I remove the watermark?" 
                answer="Yes, the Launchframe watermark is removed when you upgrade to the Pro plan ($29/mo), which also grants you 1080p 60fps exports and up to 15 videos a month." 
              />
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo">
                <LogoIcon /> Launchframe
              </div>
              <p className="footer-desc">
                Ship fast. Launch louder.
              </p>
              <p className="footer-desc" style={{ marginTop: '12px', fontSize: '12px' }}>
                Built by Abdelali Jabri (Iron) at 1337 Network.
              </p>
            </div>
            
            <div className="footer-nav">
              <span className="footer-nav-title">Product</span>
              <a href="#features" className="footer-nav-link">Features</a>
              <a href="#templates" className="footer-nav-link">Templates</a>
              <a href="#pricing" className="footer-nav-link">Pricing</a>
            </div>

            <div className="footer-nav">
              <span className="footer-nav-title">Ecosystem</span>
              <a href="https://um6p.app" className="footer-nav-link">U-Improve</a>
              <a href="#" className="footer-nav-link">Memantic SDK</a>
              <a href="#" className="footer-nav-link">Komet CLI</a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Launchframe Inc. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // ─── App Shell Components ──────────────────────────────
  const Sidebar = () => (
    <div className="sidebar">
      <div className="nav-logo" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
        <LogoIcon />
        <span>Launchframe</span>
      </div>
      <div className="sidebar-nav">
        <div className={`sidebar-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
          <LayoutIcon /> <span>Dashboard</span>
        </div>
        <div className={`sidebar-item ${view === 'generator' ? 'active' : ''}`} onClick={() => setView('generator')}>
          <SparklesIcon /> <span>Create New</span>
        </div>
        <div className="sidebar-item">
          <VideoIcon /> <span>Templates</span>
        </div>
        <div className="sidebar-item">
          <CreditCardIcon /> <span>Billing</span>
        </div>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div className="sidebar-item" onClick={() => setView('landing')}>
          <span>Log out</span>
        </div>
      </div>
    </div>
  )

  const AppHeader = ({ title }: { title: string }) => (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
        <span style={{ color: 'var(--text-tertiary)' }}>Projects</span>
        <ChevronRightIcon />
        <span>{title}</span>
      </div>
      <div className="nav-actions">
        <button className="btn btn-sm btn-primary" onClick={() => setView('generator')}>+ New Video</button>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', border: '1px solid var(--border-dim)' }} />
      </div>
    </header>
  )

  // ─── Dashboard View ────────────────────────────────────
  if (view === 'dashboard') {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <AppHeader title="Overview" />
          <div className="app-content fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>My Videos</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>You have used 2 of 15 videos this month.</p>
            </div>
            
            <div className="video-grid">
              {[
                { title: 'U-Improve Launch Promo', status: 'done', date: '2 hours ago' },
                { title: 'Memantic SDK Demo', status: 'processing', date: 'Just now' },
                { title: 'Komet CLI Integration', status: 'done', date: '1 day ago' },
              ].map((video, i) => (
                <div key={i} className="video-card" onClick={() => video.status === 'processing' && setView('processing')}>
                  <div className="video-thumb">
                    {video.status === 'processing' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                        <div className="status-pill status-processing">Processing...</div>
                      </div>
                    )}
                  </div>
                  <div className="video-info">
                    <div className="video-title">{video.title}</div>
                    <div className="video-meta">
                      <span className={`status-pill status-${video.status}`}>{video.status}</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ─── Generator View ────────────────────────────────────
  if (view === 'generator') {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <AppHeader title="Create New Video" />
          <div className="app-content fade-in">
            <div className="generator-container">
              <div className="input-group">
                <label className="input-label">Product URL</label>
                <input type="text" className="input-control" placeholder="https://your-shiny-app.com" />
              </div>

              <div className="input-group">
                <label className="input-label">Select a Template</label>
                <div className="template-grid">
                  {['Cinematic Dark', 'Minimal Clean', 'Terminal Hacker', 'Bold Agency'].map((t, i) => (
                    <div key={i} className={`template-card ${i === 0 ? 'active' : ''}`}>
                      <div className="template-preview" />
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Prompt (Optional)</label>
                <textarea className="input-control" rows={4} placeholder="e.g. Focus on the performance aspect and use an energetic voiceover." />
              </div>

              <button className="btn btn-lg btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setView('processing')}>
                Generate Launch Video
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ─── Processing View ───────────────────────────────────
  if (view === 'processing') {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <AppHeader title="Rendering Pipeline" />
          <div className="app-content fade-in">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', position: 'relative' }}>
                <div className="render-bar" style={{ height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                  <div className="render-progress" style={{ height: '100%', width: '100%', animation: 'shimmer 2s infinite' }} />
                </div>
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Building your video...</h2>
              <p style={{ color: 'var(--text-secondary)' }}>This usually takes about 2-3 minutes.</p>
            </div>

            <div className="log-container">
              <div className="log-line">
                <span className="log-time">11:42:01 AM</span>
                <span className="log-message success">✓ Playwright crawler initialized</span>
              </div>
              <div className="log-line">
                <span className="log-time">11:42:05 AM</span>
                <span className="log-message success">✓ Extracted meta tags and screenshots</span>
              </div>
              <div className="log-line">
                <span className="log-time">11:42:12 AM</span>
                <span className="log-message success">✓ Llama-3-70B generated video script</span>
              </div>
              <div className="log-line">
                <span className="log-time">11:42:15 AM</span>
                <span className="log-message success">✓ Kokoro TTS audio compilation complete</span>
              </div>
              <div className="log-line">
                <span className="log-time">11:42:16 AM</span>
                <span className="log-message active">{'➜'} Spawning Remotion render worker...</span>
              </div>
              <div className="log-line">
                <span className="log-time">11:42:20 AM</span>
                <span className="log-message">{'➜'} Encoding frames (145/2100)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
               <button className="btn btn-md btn-secondary" onClick={() => setView('dashboard')}>Run in background</button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return null
}
