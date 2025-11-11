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
  const [isMuted, setIsMuted] = useState(true)
  const [isWaiting, setIsWaiting] = useState(false)
  const isDebug = useVideoDebugParam()

  // Only log in debug mode (?videodebug=1)
  const log = (...args: any[]) => { if (isDebug) console.log('[StableLoopVideo]', ...args) }
  const logError = (...args: any[]) => { if (isDebug) console.error('[StableLoopVideo]', ...args) }

  // Try to play automatically and recover from buffering stalls
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    log('Video mounted, src:', src)
    log('Initial readyState:', video.readyState, 'networkState:', video.networkState)

    let destroyed = false

    const attemptPlay = async (label: string) => {
      if (!video || destroyed) return
      log(label, '→ play attempt (readyState', video.readyState, 'paused', video.paused, ')')
      setIsWaiting(true)
      try {
        await video.play()
        if (destroyed) return
        log('Play success → readyState:', video.readyState, 'currentTime:', video.currentTime)
        setIsPlaying(true)
        setAutoplayBlocked(false)
        setIsWaiting(false)
      } catch (err: any) {
        if (destroyed) return
        logError('Play failed:', err?.name, err?.message)
        if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
          setAutoplayBlocked(true)
          setIsPlaying(false)
          setIsWaiting(false)
        } else {
          // Reload source to recover from network decode issues
          const currentTime = video.currentTime
          video.load()
          video.addEventListener('loadeddata', () => {
            if (destroyed) return
            try { video.currentTime = currentTime }
            catch {}
            attemptPlay('recover-after-load')
          }, { once: true })
        }
      }
    }

    const onLoadedMetadata = () => {
      if (destroyed) return
      log('loadedmetadata → readyState:', video.readyState)
      attemptPlay('loadedmetadata')
    }

    const onWaiting = () => {
      if (destroyed) return
      log('waiting event → readyState:', video.readyState)
      setIsWaiting(true)
      attemptPlay('waiting')
    }

    const onStalled = () => {
      if (destroyed) return
      logError('stalled event → networkState:', video.networkState, 'readyState:', video.readyState)
      setIsWaiting(true)
      const currentTime = video.currentTime
      video.load()
      video.addEventListener('loadeddata', () => {
        if (destroyed) return
        try { video.currentTime = currentTime }
        catch {}
        attemptPlay('stalled-recover')
      }, { once: true })
    }

    const onPlaying = () => {
      if (destroyed) return
      log('playing event → readyState:', video.readyState, 'currentTime:', video.currentTime)
      setIsPlaying(true)
      setAutoplayBlocked(false)
      setIsWaiting(false)
    }

    const onError = () => {
      if (destroyed) return
      const err = video.error
      logError('error event → code:', err?.code, 'message:', err?.message)
      setIsWaiting(false)
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('stalled', onStalled)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('error', onError)

    if (video.readyState >= 2) {
      attemptPlay('readyState>=2')
    } else {
      attemptPlay('initial')
    }

    return () => {
      destroyed = true
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('stalled', onStalled)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('error', onError)
    }
  }, [src])

  const onPlaying = () => {
    const v = videoRef.current
    log('PLAYING EVENT - currentTime:', v?.currentTime, 'readyState:', v?.readyState)
    setIsPlaying(true)
    setAutoplayBlocked(false)
    setIsWaiting(false)
  }
  const onPause = () => { 
    const v = videoRef.current
    log('PAUSE EVENT - currentTime:', v?.currentTime)
    setIsPlaying(false)
  }
  const onCanPlay = () => { 
    const v = videoRef.current
    log('CANPLAY EVENT - readyState:', v?.readyState) 
  }
  const onError = () => {
    const v = videoRef.current
    const err = v?.error
    logError('ERROR EVENT - code:', err?.code, 'message:', err?.message, 'src:', src)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    const next = !isMuted
    setIsMuted(next)
    v.muted = next
    // On first unmute, ensure playback resumes with sound
    if (!next) {
      if (v.paused) {
        v.play().catch(() => {})
      }
      smoothFadeIn(v)
    }
    try { localStorage.setItem('demoVideoMuted', String(next)) } catch {}
  }

  const handleUserPlay = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = isMuted
    v.play().then(() => {
      setIsPlaying(true)
      setAutoplayBlocked(false)
      setIsWaiting(false)
    }).catch((err) => logError('User play failed:', err))
  }

  // Persisted mute preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem('demoVideoMuted')
      if (stored === 'false') {
        setIsMuted(false)
        const v = videoRef.current
        if (v) {
          v.muted = false
          v.volume = 1.0
        }
      }
    } catch {}
  }, [])

  function smoothFadeIn(video: HTMLVideoElement) {
    video.volume = 0
    const steps = 8
    const increment = 1 / steps
    let currentStep = 0
    const tick = () => {
      currentStep += 1
      video.volume = Math.min(1, increment * currentStep)
      if (currentStep < steps) {
        window.setTimeout(tick, 90)
      }
    }
    tick()
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        loop
        muted={isMuted}
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

      {/* Spinner overlay while buffering */}
      {isWaiting && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" aria-label="Loading" />
        </div>
      )}

      {/* Lightweight mute toggle - always available */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/55 backdrop-blur px-3 py-2 text-white text-sm hover:bg-black/70"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M5 10v4h3l4 4V6L8 10H5zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.06A4.49 4.49 0 0016.5 12z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M5 10v4h3l4 4V6L8 10H5zM19 12c0-2.76-1.6-5.12-3.93-6.22l-.57.82A5.99 5.99 0 0118 12a5.99 5.99 0 01-3.5 5.4l.57.82C17.4 17.12 19 14.76 19 12z" />
          </svg>
        )}
        <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound on'}</span>
      </button>
    </div>
  )
}
