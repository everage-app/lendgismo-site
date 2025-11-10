import { useEffect, useRef, useState } from 'react'
import { useVideoDebugParam } from '@/hooks/useVideoDebugParam'

interface AutoLoopVideoProps {
  webmSrc?: string
  mp4Src: string
  posterSrc?: string
  subtitleSrc?: string
  className?: string
  onError?: (error: MediaError | null) => void
  showControlsOverlay?: boolean
  preferMp4?: boolean
}

/**
 * AutoLoopVideo - Resilient video component that autoplays, loops, and self-heals
 * 
 * Designed to handle common video playback issues across Chrome/Safari/iOS:
 * - Autoplay with proper muted/playsInline attributes
 * - Automatic retry on network stalls
 * - Loop without manual intervention
 * - Debug mode via ?videodebug=1
 */
export default function AutoLoopVideo({
  webmSrc,
  mp4Src,
  posterSrc,
  subtitleSrc,
  className = '',
  onError,
  showControlsOverlay = true,
  preferMp4 = true
}: AutoLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showNativeControls, setShowNativeControls] = useState(false)
  const retryCountRef = useRef(0)
  const stallCountRef = useRef(0)
  const isDebug = useVideoDebugParam()
  
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000

  const log = (...args: any[]) => {
    if (isDebug) console.log('[AutoLoopVideo]', ...args)
  }

  const logError = (...args: any[]) => {
    if (isDebug) console.error('[AutoLoopVideo]', ...args)
  }

  // Auto-play on mount
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Ensure video is ready to play
    const tryPlay = () => {
      if (video.readyState >= 2) {
        video.play().then(() => {
          setIsPlaying(true)
          setIsWaiting(false)
        }).catch((err) => {
          logError('Play failed:', err)
          // Common autoplay issues - handle gracefully
          if (err.name === 'NotAllowedError') {
            log('Autoplay blocked - user interaction required')
            setIsPlaying(false)
            setIsWaiting(false)
          }
        })
      }
    }

    // Try playing once metadata is loaded
    if (video.readyState >= 2) {
      tryPlay()
    } else {
      video.addEventListener('loadedmetadata', tryPlay, { once: true })
    }

    // Startup watchdog: if not playing within 4s, show play button instead of spinner
    const watchdog = setTimeout(() => {
      if (!video.paused && video.currentTime > 0) return
      setIsWaiting(false)
      setIsPlaying(false)
    }, 4000)

    return () => {
      video.removeEventListener('loadedmetadata', tryPlay)
      clearTimeout(watchdog)
    }
  }, [isDebug])

  // Self-healing stall detection using rAF while playing
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let rafId = 0
    let lastT = video.currentTime
    let lastTs = performance.now()

    const tick = () => {
      const v = videoRef.current
      if (!v) return
      const now = performance.now()
      const t = v.currentTime

      // Only watch when should be playing
      if (!v.paused && !v.ended) {
        // If time hasn't progressed for > 1200ms consider stalled
        const progressed = Math.abs(t - lastT) > 0.001
        const elapsed = now - lastTs
        if (!progressed && elapsed > 1200) {
          setIsWaiting(true)
          stallCountRef.current += 1
          log(`rAF stall detected at ${t.toFixed(2)}s (x${stallCountRef.current})`)
          // escalate recovery
          if (v.readyState >= 2) {
            v.play().catch(() => {})
          } else {
            v.load(); v.play().catch(() => {})
          }
          // after multiple stalls, suggest native controls to user
          if (stallCountRef.current >= 2) {
            setShowNativeControls(true)
          }
          lastTs = now
        } else if (progressed) {
          setIsWaiting(false)
          stallCountRef.current = 0
          lastT = t
          lastTs = now
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isDebug])

  // Error recovery
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const error = video.error

    logError('Video error:', error?.code, error?.message)
    
    if (onError) onError(error)

    // Don't retry if it's a decode error (wrong format)
    if (error && error.code === 4) {
      setHasError(true)
      return
    }

    // Retry loading
    if (retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current++
      log(`Retrying load (${retryCountRef.current}/${MAX_RETRIES})...`)
      
      setTimeout(() => {
        video.load()
        video.play().catch(() => {})
      }, RETRY_DELAY * retryCountRef.current)
    } else {
      setHasError(true)
    }
  }

  // Log key events in debug mode
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    log('Metadata loaded:', {
      duration: video.duration,
      readyState: video.readyState,
      networkState: video.networkState
    })
  }

  const handleCanPlay = () => {
    log('Can play - ready to start')
    setIsWaiting(false)
  }

  const handlePlaying = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    log('Playing at', e.currentTarget.currentTime)
    retryCountRef.current = 0 // Reset retry count on successful play
    setIsPlaying(true)
    setIsWaiting(false)
  }

  const handleWaiting = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    log('Buffering at', e.currentTarget.currentTime)
    setIsWaiting(true)
  }

  const handleStalled = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    log('Stalled at', video.currentTime)
    
    // Try to recover immediately
    if (!video.paused && video.readyState < 3) {
      video.load()
      video.play().catch(() => {})
    }
  }

  const handleEnded = () => {
    log('Video ended - loop should restart automatically')
  }

  const handleLoadedData = () => {
    // First frame available
    setIsWaiting(false)
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const t = e.currentTarget.currentTime
    if (t > 0.05) setIsPlaying(true)
  }

  // User interactions
  const handleUserPlay = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = isMuted
    v.play().then(() => {
      setIsPlaying(true)
      setIsWaiting(false)
    }).catch((err) => {
      logError('User play failed:', err)
    })
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    const next = !isMuted
    setIsMuted(next)
    v.muted = next
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-black text-white ${className}`}>
        <div className="text-center p-8">
          <p className="mb-4">Unable to load video</p>
          <a
            href={mp4Src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-300 hover:text-brand-200 underline"
          >
            Open video in new tab →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        poster={posterSrc}
        crossOrigin="anonymous"
        controls={showNativeControls}
        onError={handleError}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onStalled={handleStalled}
        onEnded={handleEnded}
      onLoadedData={handleLoadedData}
      onTimeUpdate={handleTimeUpdate}
      >
        {/* Order sources based on reliability for browser */}
        {preferMp4 ? (
          <>
            <source src={mp4Src} type="video/mp4" />
            {webmSrc && <source src={webmSrc} type="video/webm" />}
          </>
        ) : (
          <>
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            <source src={mp4Src} type="video/mp4" />
          </>
        )}
        {subtitleSrc && (
          <track kind="subtitles" src={subtitleSrc} label="English" srcLang="en" />
        )}
        Your browser does not support the video tag.
      </video>

      {showControlsOverlay && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* Play button overlay */}
          {!isPlaying && !isWaiting && (
            <button
              type="button"
              onClick={handleUserPlay}
              className="pointer-events-auto inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/90 text-black shadow-xl hover:scale-105 transition transform"
              aria-label="Play video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          {/* Spinner while waiting/buffering */}
          {isWaiting && (
            <div className="pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" aria-label="Loading" />
            </div>
          )}

          {/* Mute toggle in corner */}
          <button
            type="button"
            onClick={toggleMute}
            className="pointer-events-auto absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-3 py-2 text-white text-sm hover:bg-black/60"
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

          {/* Show native controls toggle */}
          {!showNativeControls && (stallCountRef.current >= 2 || isDebug) && (
            <button
              type="button"
              onClick={() => setShowNativeControls(true)}
              className="pointer-events-auto absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-3 py-2 text-white text-sm hover:bg-black/60"
            >
              Show controls
            </button>
          )}
        </div>
      )}
    </div>
  )
}
