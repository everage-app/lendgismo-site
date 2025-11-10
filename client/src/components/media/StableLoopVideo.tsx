import { useEffect, useRef, useState } from 'react'
import { useVideoDebugParam } from '@/hooks/useVideoDebugParam'

type StableLoopVideoProps = {
  src: string
  posterSrc?: string
  subtitleSrc?: string
  className?: string
}

/**
 * StableLoopVideo
 * Minimal, idempotent HTML5 video element configured to autoplay, loop, and play inline.
 * No time nudging, no rAF stall logic, no remount triggers. Falls back to a simple
 * click-to-play overlay only when autoplay is blocked by the browser.
 */
export default function StableLoopVideo({ src, posterSrc, subtitleSrc, className = '' }: StableLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const isDebug = useVideoDebugParam()

  const log = (...args: any[]) => { if (isDebug) console.log('[StableLoopVideo]', ...args) }
  const logError = (...args: any[]) => { if (isDebug) console.error('[StableLoopVideo]', ...args) }

  // Try to play on metadata ready; keep it very simple
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const tryPlay = () => {
      v.play().then(() => {
        setIsPlaying(true)
        setAutoplayBlocked(false)
      }).catch((err) => {
        // Autoplay policies often require muted + user gesture; muted is set, but still gracefully handle
        if ((err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) || v.paused) {
          setAutoplayBlocked(true)
          setIsPlaying(false)
          log('Autoplay blocked; awaiting user interaction')
        } else {
          logError('Play error:', err)
        }
      })
    }

    if (v.readyState >= 2) tryPlay()
    else v.addEventListener('loadedmetadata', tryPlay, { once: true })

    return () => v.removeEventListener('loadedmetadata', tryPlay)
  }, [src, isDebug])

  const onPlaying = () => {
    setIsPlaying(true)
    setAutoplayBlocked(false)
    log('playing')
  }
  const onPause = () => { setIsPlaying(false); log('pause') }
  const onCanPlay = () => { log('canplay') }
  const onError = () => {
    const v = videoRef.current
    const err = v?.error
    logError('error', err?.code, err?.message)
  }

  const handleUserPlay = () => {
    const v = videoRef.current
    if (!v) return
    v.play().then(() => {
      setIsPlaying(true)
      setAutoplayBlocked(false)
    }).catch((err) => logError('User play failed:', err))
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={posterSrc}
        onPlaying={onPlaying}
        onPause={onPause}
        onCanPlay={onCanPlay}
        onError={onError}
      >
        <source src={src} type="video/mp4" />
        {subtitleSrc && (
          <track kind="subtitles" src={subtitleSrc} label="English" srcLang="en" />
        )}
        Your browser does not support the video tag.
      </video>

      {/* Minimal overlay shown only if autoplay is blocked */}
      {autoplayBlocked && !isPlaying && (
        <button
          type="button"
          onClick={handleUserPlay}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl"
          aria-label="Play video"
          style={{ width: 80, height: 80 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  )
}
