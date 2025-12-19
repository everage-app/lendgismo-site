const YT_ID = 'ZNm2RdUxRpc'
const YT_PARAMS = 'rel=0&modestbranding=1&playsinline=1&controls=1'

import { useEffect, useMemo, useState } from 'react'
import type React from 'react'

// Declare YouTube iframe API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface ShowcaseItem { src: string; title?: string; caption?: string; type?: 'image'|'video'; timestamp?: string }

type FeaturedDemosProps = {
  maxVideos?: number
  className?: string
  variant?: 'hero'|'grid'
}

const HERO_VIDEO_SRC = new URL('../../../attached_assets/Lendgismo_Demo_720_optimized.mp4', import.meta.url).href

export default function FeaturedDemos({ maxVideos = 2, className = '', variant = 'hero' }: FeaturedDemosProps) {
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [player, setPlayer] = useState<'mp4'|'youtube'>('mp4')

  useEffect(() => {
    // Only needed for the grid variant. Avoid updating state during hero playback,
    // which can cause the video element to re-render/reload mid-play.
    if (variant !== 'grid') return

    fetch('/assets/showcase/manifest.json')
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((m) => setItems(m.items || []))
      .catch(() => setItems([]))
  }, [variant])

  const videos = useMemo(() => {
    const vids: ShowcaseItem[] = (items ?? []).filter((it: ShowcaseItem) => (it.type === 'video') || /(\.webm|\.mp4)$/i.test(it.src))
    vids.sort((a: ShowcaseItem, b: ShowcaseItem) => {
      const at = a.timestamp || ''
      const bt = b.timestamp || ''
      if (at !== bt) return bt.localeCompare(at)
      return b.src.localeCompare(a.src)
    })
    return vids.slice(0, maxVideos)
  }, [items, maxVideos])

  const prioritized = useMemo(() => {
    const fullTours = videos.filter(v => /full[_-]?tour/i.test(v.src))
    const others = videos.filter(v => !/full[_-]?tour/i.test(v.src))
    return [...fullTours, ...others].slice(0, maxVideos)
  }, [videos, maxVideos])

  const [primary] = prioritized
  const primarySrc = primary?.src

  // GRID VARIANT - show multiple videos
  if (variant === 'grid') {
    if (videos.length === 0) return null
    
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

  // HERO VARIANT - single large video (default)
  // Simplified hero video: plain YouTube iframe (no JS API)
  
  // No JS API initialization needed

  return (
    <section className={`${className}`}>
      <div className="w-full">
        {/* Player container */}
        <div className="aspect-[16/9] bg-black relative rounded-lg overflow-hidden">
          {player === 'mp4' ? (
            <video
              className="w-full h-full"
              controls
              playsInline
              preload="auto"
              poster="/assets/lendgismo-logo-white-transparent-Ch-zZoVt.svg"
            >
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
            </video>
          ) : (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${YT_ID}?start=4&${YT_PARAMS}`}
              title="Lendgismo Platform Demo"
              loading="lazy"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Secondary actions */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs md:text-sm">
          <a
            href={HERO_VIDEO_SRC}
            download
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 transition-colors"
          >Download MP4</a>
          <button
            type="button"
            onClick={() => setPlayer(player === 'mp4' ? 'youtube' : 'mp4')}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
          >
            Switch to {player === 'mp4' ? 'YouTube Player' : 'MP4 Player'}
          </button>
          <a
            href={`https://youtu.be/${YT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors"
          >Open on YouTube</a>
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

// Extract version hint from showcase directory (e.g., /assets/showcase/20251030-0830/...) => v=20251030-0830
function versionFromSrc(src?: string) {
  if (!src) return 'v1'
  const m = src.match(/showcase\/(.*?)\//)
  return m?.[1] || 'v1'
}

function withVersion(url?: string) {
  if (!url) return ''
  const v = versionFromSrc(url)
  return url.includes('?') ? `${url}&v=${v}` : `${url}?v=${v}`
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
