import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoIcon } from '../components/common/Icons'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'
import { ArrowRight, Check, Clapperboard, Sparkles, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'

export const LandingPage = () => {
  const { user } = useAuth()
  const primaryCtaHref = user ? '/generator' : '/signup'
  const primaryCtaText = user ? 'Create New Video' : 'Start Building Free'

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 80%)',
          }}
        />
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[140px]" />
        <div className="absolute left-[10%] top-[30%] h-[300px] w-[300px] rounded-full bg-violet-400/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur">
          <div className="flex items-center gap-3 font-semibold">
            <LogoIcon />
            <span>Launchframe</span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            <a href="#features" className="hover:text-zinc-100">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-100">How it works</a>
            <a href="#pricing" className="hover:text-zinc-100">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button variant="secondary" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <section className="py-16 md:py-24">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Badge className="mb-6" variant="secondary">V1.0 Live • Ship fast. Launch louder.</Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Turn any product URL into a
              <span className="block bg-gradient-to-r from-white via-zinc-200 to-violet-300 bg-clip-text text-transparent">
                cinematic launch video.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              Built for solo builders and startups that need premium product videos without hiring a motion studio.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={primaryCtaHref}>
                <Button size="lg">
                  {primaryCtaText}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="secondary">See how it works</Button>
              </a>
            </div>
          </motion.div>
        </section>

        <section id="features" className="py-12 md:py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Everything you need to launch</h2>
            <p className="mt-3 text-zinc-400">Crawl → script → voice → render. One clean pipeline.</p>
          </div>

          <motion.div
            className="grid gap-4 md:grid-cols-3"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Clapperboard className="h-5 w-5 text-violet-300" /> URL to Storyboard</CardTitle>
                <CardDescription>Crawl your product page and extract visuals, metadata, and hooks automatically.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Wand2 className="h-5 w-5 text-violet-300" /> AI Script Director</CardTitle>
                <CardDescription>Generate punchy scenes, overlays, voice lines, and transitions tuned to your product.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5 text-violet-300" /> One-click Render</CardTitle>
                <CardDescription>Render studio-grade output with ready templates and a polished visual style.</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </section>

        <section id="how-it-works" className="py-12 md:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['1. Paste URL', 'Drop your landing page URL and your creative prompt.'],
              ['2. Choose style', 'Pick a template and duration that fits your launch vibe.'],
              ['3. Generate video', 'Track live pipeline progress and download your final MP4.'],
            ].map(([title, description]) => (
              <Card key={title} className="bg-zinc-900/40">
                <CardHeader>
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="py-12 md:py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Simple pricing</h2>
            <p className="mt-3 text-zinc-400">Start free, then scale when your launches grow.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For new builders validating their first product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-bold">$0<span className="text-base font-normal text-zinc-400">/mo</span></p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />2 videos / month</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />Up to 30s</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />Watermark included</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/signup" className="w-full"><Button className="w-full" variant="secondary">Start Free</Button></Link>
              </CardFooter>
            </Card>

            <Card className="border-violet-500/40 bg-zinc-900/60 shadow-[0_0_80px_-45px_rgba(139,92,246,0.6)]">
              <CardHeader>
                <Badge className="w-fit">Most Popular</Badge>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For indie hackers shipping consistently.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-bold">$29<span className="text-base font-normal text-zinc-400">/mo</span></p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />15 videos / month</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />Up to 60s</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />No watermark</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to={primaryCtaHref} className="w-full"><Button className="w-full">Choose Pro</Button></Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Studio</CardTitle>
                <CardDescription>For teams and agencies running many launches.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-bold">$149<span className="text-base font-normal text-zinc-400">/mo</span></p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />Unlimited videos</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />Priority render queue</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet-300" />Advanced branding controls</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-3xl font-semibold tracking-tight">FAQ</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger value="item-1">What is Launchframe exactly?</AccordionTrigger>
                <AccordionContent value="item-1">
                  Launchframe turns your product URL into a polished launch video with a full AI + rendering pipeline.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger value="item-2">Do I need editing skills?</AccordionTrigger>
                <AccordionContent value="item-2">
                  No. You provide the URL and direction. Launchframe handles scripting, voiceover, and rendering.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger value="item-3">Can I remove the watermark?</AccordionTrigger>
                <AccordionContent value="item-3">
                  Yes. Pro and Studio plans support outputs without the Launchframe watermark.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <footer className="border-t border-zinc-900 py-8 text-sm text-zinc-400">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p>© 2026 Launchframe. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-zinc-200">Privacy</a>
              <a href="#" className="hover:text-zinc-200">Terms</a>
              <a href="#" className="hover:text-zinc-200">Twitter</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
