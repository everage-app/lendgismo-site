import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'

interface ShowcaseItem { src: string; title?: string; caption?: string; type?: 'image'|'video'; timestamp?: string }

type FeaturedDemosProps = {
  maxVideos?: number
  className?: string
  variant?: 'hero'|'grid'
}

export default function FeaturedDemos({ maxVideos = 2, className = '', variant = 'hero' }: FeaturedDemosProps) {
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  // Track if user explicitly paused to avoid auto-resume fighting user intent
  const userPausedRef = useRef<boolean>(false)
  const lastProgressRef = useRef<{ time: number; timestamp: number }>({ time: 0, timestamp: 0 })
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [isBuffering, setIsBuffering] = useState<boolean>(false)

  useEffect(() => {
    fetch('/assets/showcase/manifest.json')
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((m) => setItems(m.items || []))
      .catch(() => setItems([]))
  }, [])

  const videos = useMemo(() => {
    const vids: ShowcaseItem[] = (items ?? []).filter((it: ShowcaseItem) => (it.type === 'video') || /(\.webm|\.mp4)$/i.test(it.src))
    // Prefer most recent timestamped folders and then by filename desc
    vids.sort((a: ShowcaseItem, b: ShowcaseItem) => {
      const at = a.timestamp || ''
      const bt = b.timestamp || ''
      if (at !== bt) return bt.localeCompare(at)
      return b.src.localeCompare(a.src)
    })
    return vids.slice(0, maxVideos)
  }, [items, maxVideos])

  // Keep hooks order stable regardless of variant by computing prioritization before any conditional returns.
  // Prioritize "full_tour" videos for both primary and secondary to ensure the smaller card is also a full overview.
  const prioritized = useMemo(() => {
    const fullTours = videos.filter(v => /full[_-]?tour/i.test(v.src))
    const others = videos.filter(v => !/full[_-]?tour/i.test(v.src))
    return [...fullTours, ...others].slice(0, maxVideos)
  }, [videos, maxVideos])

  // Compute primary and its webm source UNCONDITIONALLY before any early returns
  // to keep hook order stable across renders (avoid conditional hooks).
  const [primary] = prioritized
  const primarySrc = primary?.src

  useEffect(() => {
    if (!primarySrc) {
      setVideoBlobUrl(null)
      return
    }

    let isActive = true
    const controller = new AbortController()
    setIsBuffering(true)

    fetch(primarySrc, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load video ${primarySrc}`)
        return res.blob()
      })
      .then((blob) => {
        if (!isActive) return
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
        }
        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        setVideoBlobUrl(url)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        console.error('Video fetch error:', err)
        setVideoBlobUrl(primarySrc) // fallback to direct stream
      })
      .finally(() => {
        if (isActive) setIsBuffering(false)
      })

    return () => {
      isActive = false
      controller.abort()
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setVideoBlobUrl(null)
    }
  }, [primarySrc])

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current
      if (!video) return
      if (video.paused || video.ended) return
      const now = Date.now()
      const { time, timestamp } = lastProgressRef.current
      const stagnated = now - timestamp > 3000 && video.currentTime <= time + 0.05
      if (stagnated) {
        console.warn('Video stagnated, nudging playback at', video.currentTime)
        try {
          video.currentTime = Math.max(0, video.currentTime - 0.2)
        } catch {}
        video.play().catch(() => {})
        lastProgressRef.current = { time: video.currentTime, timestamp: Date.now() }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (videos.length === 0) return null

  if (variant === 'grid') {
    return (
      <section className={`py-12 md:py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Product Demos</h2>
            <p className="text-lg text-zinc-300">A quick 40s tour plus onboarding walkthrough — crisp, on-brand, and to the point.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((v: ShowcaseItem, i: number) => (
              <figure key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
                <div className="aspect-[16/9] bg-black/50">
                  <video className="w-full h-full" src={v.src} controls playsInline preload="auto" poster={posterFromVideo(v.src)} onLoadedMetadata={(e) => applyCaptionPlacement(e.currentTarget)}>
                    <track kind="subtitles" src={subtitleFromVideo(v.src)} label="English" srcLang="en" default />
                  </video>
                </div>
                {(v.title || v.caption) && (
                  <figcaption className="p-4 border-t border-white/10">
                    <div className="text-white font-semibold">{prettyVideoTitle(v.src, v.title)}</div>
                    <div className="text-sm text-zinc-400 mt-1">{prettyVideoCaption(v.src, v.caption)}</div>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          <div className="text-center mt-6 text-sm text-zinc-400">
            Prefer seeing it live?{' '}
            <a
              href="https://platform.lendgismo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-300 hover:text-brand-200 underline underline-offset-4"
            >
              Try the App
            </a>
          </div>
        </div>
      </section>
    )
  }

  // Default: hero variant (single main video, full width, STUNNING presentation)

  return (
    <section className={`${className}`}>
      <div className="w-full">
        {/* Premium video player - OPTIMIZED for large MP4 files */}
        <div className="aspect-[16/9] bg-black relative rounded-lg overflow-hidden">
          <video
            key={videoBlobUrl || primarySrc}
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            controls
            preload="auto"
            crossOrigin="anonymous"
            // Force basic HTML5 player, disable fancy browser optimizations that might cause early stops
            controlsList="nodownload"
            disablePictureInPicture={false}
            src={videoBlobUrl || primarySrc || ''}
            poster={posterFromVideo(primarySrc)}
            onLoadedMetadata={(e) => {
              console.log('Video loaded:', e.currentTarget.duration, 'seconds')
              applyCaptionPlacement(e.currentTarget)
              lastProgressRef.current = { time: 0, timestamp: Date.now() }
            }}
            onError={(e) => {
              const video = e.currentTarget
              console.error('Video error:', video.error?.code, video.error?.message)
            }}
            onPause={(e) => {
              // Aggressive auto-resume for early buffering pauses
              const v = e.currentTarget
              // If pause was within first 15s and not user-initiated, force resume
              if (!userPausedRef.current && v.currentTime > 0 && v.currentTime < 15 && v.readyState >= 2) {
                console.log('Auto-resuming from early pause at', v.currentTime)
                setTimeout(() => {
                  if (!userPausedRef.current) {
                    v.play().catch(() => {})
                  }
                }, 50)
              }
            }}
            onPlay={(e) => {
              userPausedRef.current = false
              lastProgressRef.current = { time: e.currentTarget.currentTime, timestamp: Date.now() }
              setIsBuffering(false)
            }}
            onStalled={(e) => {
              const v = e.currentTarget
              console.warn('Video stalled at', v.currentTime)
              // Aggressive recovery: force resume immediately
              setTimeout(() => {
                if (v.paused && !userPausedRef.current) {
                  v.play().catch(() => {})
                }
              }, 100)
              setIsBuffering(true)
            }}
            onWaiting={(e) => {
              const v = e.currentTarget
              console.warn('Video waiting at', v.currentTime)
              // Force playback to continue
              setTimeout(() => {
                if (v.paused && !userPausedRef.current) {
                  v.play().catch(() => {})
                }
              }, 100)
              setIsBuffering(true)
            }}
            onTimeUpdate={(e) => {
              lastProgressRef.current = { time: e.currentTarget.currentTime, timestamp: Date.now() }
              if (!e.currentTarget.paused) {
                setIsBuffering(false)
              }
            }}
            onEnded={() => {
              userPausedRef.current = true
            }}
            onSeeking={() => { userPausedRef.current = false }}
            onVolumeChange={() => { /* noop */ }}
            onClick={(e) => {
              // Let default controls handle play/pause; detect user pause
              const v = e.currentTarget
              userPausedRef.current = v.paused
            }}
          >
            {/* MP4 ONLY - maximum reliability */}
            {videoBlobUrl ? null : primarySrc ? <source src={primarySrc} type="video/mp4" /> : null}
            {/* Subtitles are optional; don't make them blocking if missing */}
            {primarySrc ? (
              <track kind="subtitles" src={subtitleFromVideo(primarySrc)} label="English" srcLang="en" default={false} />
            ) : null}
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Optional: Try live app link */}
        <div className="text-center mt-6 text-sm md:text-base text-zinc-400">
          Want to explore the live app?{' '}
          <a
            href="https://platform.lendgismo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-300 hover:text-brand-200 underline underline-offset-4 transition-colors"
          >
            Try It Now →
          </a>
        </div>
      </div>
    </section>
  )
}

function prettyTitle(t?: string) {
  if (!t) return ''
  return t.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function posterFromVideo(src?: string) {
  if (!src) return undefined
  // Try to find a sibling desktop screenshot as poster by convention
  // e.g. /assets/showcase/20251023-0931/demo_lender_journey.webm -> 01_home_app--desktop.png (fallback none)
  // Best effort: replace .webm/.mp4 with --desktop.png
  const base = src.replace(/\.(webm|mp4)$/i, '')
  return `${base}--desktop.png`
}

function subtitleFromVideo(src?: string) {
  if (!src) return ''
  // By convention, pair a WebVTT file next to the video: demo_full_tour.mp4 -> demo_full_tour_en.vtt
  const base = src.replace(/\.(webm|mp4)$/i, '')
  return `${base}_en.vtt`
}

function prettyVideoTitle(src: string, fallback?: string) {
  if (/full_tour/i.test(src)) return '40-Second Platform Tour'
  if (/onboarding/i.test(src)) return 'Onboarding Flow Overview'
  return prettyTitle(fallback || src.split('/').pop() || '')
}

function prettyVideoCaption(src: string, fallback?: string) {
  if (/full_tour/i.test(src)) return 'Dashboard, analytics, borrowers, applications, and account settings — a comprehensive tour of the core experience.'
  if (/onboarding/i.test(src)) return 'Watch new borrowers navigate the complete onboarding process with ease.'
  return fallback || ''
}

// Nudge captions lower and keep centered for a more cinematic look.
function applyCaptionPlacement(videoEl: HTMLVideoElement) {
  try {
    for (let i = 0; i < videoEl.textTracks.length; i++) {
      const track = videoEl.textTracks[i]
      track.mode = 'showing'

      const styleCues = () => {
        const list = track.cues ? Array.from(track.cues) : []
        list.forEach((cue) => {
          const vcue = cue as any // VTTCue in most browsers
          try {
            if (typeof vcue.snapToLines !== 'undefined') vcue.snapToLines = false
            if (typeof vcue.line !== 'undefined') vcue.line = 98 // closer to bottom (percentage from top)
            if (typeof vcue.position !== 'undefined') vcue.position = 50
            if (typeof vcue.size !== 'undefined') vcue.size = 92
            if (typeof vcue.align !== 'undefined') vcue.align = 'center'
          } catch {}
        })
      }

      styleCues()
      // Ensure dynamically loaded cues also get styled
      track.addEventListener('cuechange', styleCues)
    }
  } catch {}
}
