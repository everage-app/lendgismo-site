// FILE: components/media/HeroVideo.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string | null;
  className?: string;
};

export default function HeroVideo({ src, poster = null, className }: Props) {
  const vref = useRef<HTMLVideoElement | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [status, setStatus] = useState('loading');
  const attemptedRef = useRef(false);

  useEffect(() => {
    const v = vref.current;
    if (!v || attemptedRef.current) return;
    
    attemptedRef.current = true;
    v.muted = true;
    v.playsInline = true;

    const tryPlay = async () => {
      try {
        console.log('[HeroVideo] Attempting play, readyState:', v.readyState, 'paused:', v.paused);
        await v.play();
        console.log('[HeroVideo] Play succeeded');
        setShowOverlay(false);
        setStatus('playing');
      } catch (err) {
        console.error('[HeroVideo] Play failed:', err);
        setShowOverlay(true);
        setStatus('blocked');
      }
    };

    const onLoadStart = () => {
      console.log('[HeroVideo] loadstart');
      setStatus('loading');
    };

    const onLoadedMetadata = () => {
      console.log('[HeroVideo] loadedmetadata, duration:', v.duration);
      setStatus('metadata');
    };

    const onCanPlay = () => {
      console.log('[HeroVideo] canplay');
      setStatus('canplay');
      tryPlay();
    };

    const onCanPlayThrough = () => {
      console.log('[HeroVideo] canplaythrough');
      setStatus('ready');
      tryPlay();
    };

    const onLoadedData = () => {
      console.log('[HeroVideo] loadeddata');
      tryPlay();
    };

    const onPlaying = () => {
      console.log('[HeroVideo] playing event');
      setShowOverlay(false);
      setStatus('playing');
    };

    const onWaiting = () => {
      console.log('[HeroVideo] waiting/buffering');
      setStatus('buffering');
    };

    const onError = (e: any) => {
      console.error('[HeroVideo] error:', e, v.error);
      setStatus('error');
      setShowOverlay(true);
    };
    
    v.addEventListener('loadstart', onLoadStart);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('canplaythrough', onCanPlayThrough);
    v.addEventListener('loadeddata', onLoadedData);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('error', onError);

    // Aggressive retries
    tryPlay();
    const t1 = setTimeout(tryPlay, 200);
    const t2 = setTimeout(tryPlay, 600);
    const t3 = setTimeout(tryPlay, 1200);
    const t4 = setTimeout(tryPlay, 2500);
    const t5 = setTimeout(tryPlay, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      v.removeEventListener('loadstart', onLoadStart);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('canplaythrough', onCanPlayThrough);
      v.removeEventListener('loadeddata', onLoadedData);
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('error', onError);
    };
  }, [src]);

  const handleOverlayClick = () => {
    const v = vref.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.play().then(() => setShowOverlay(false)).catch(() => {});
  };

  return (
    <div className={className} style={{ position: "relative" }}>
      <video
        ref={vref}
        playsInline
        muted
        loop
        autoPlay
        preload="auto"
        poster={poster || undefined}
        style={{ width: '100%', height: '100%', display: 'block', borderRadius: 'inherit' }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {showOverlay && (
        <button
          aria-label="Play video"
          onClick={handleOverlayClick}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            background: "rgba(0,0,0,0.5)",
            cursor: "pointer",
            border: "none",
            zIndex: 10
          }}
        >
          <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "20px 32px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.9)",
            color: "#fff",
            fontSize: 20,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            {status === 'error' ? 'Video Error - Click to Retry' : 
             status === 'blocked' ? 'Click to Play Video' :
             status === 'loading' || status === 'buffering' ? 'Loading Video...' :
             'Play Video'}
          </div>
          <div style={{
            marginTop: 12,
            fontSize: 12,
            color: "rgba(255,255,255,0.6)"
          }}>
            Status: {status}
          </div>
        </button>
      )}
    </div>
  );
}
