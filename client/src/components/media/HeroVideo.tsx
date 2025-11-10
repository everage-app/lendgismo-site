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
  const [showOverlay, setShowOverlay] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    const v = vref.current;
    if (!v || attemptedRef.current) return;
    
    attemptedRef.current = true;
    v.muted = true;
    v.playsInline = true;

    const tryPlay = async () => {
      try {
        await v.play();
        setShowOverlay(false);
      } catch {
        setShowOverlay(true);
      }
    };

    tryPlay();

    const t1 = setTimeout(tryPlay, 100);
    const t2 = setTimeout(tryPlay, 500);
    const t3 = setTimeout(tryPlay, 1000);
    const t4 = setTimeout(tryPlay, 2000);

    const onCanPlay = () => tryPlay();
    const onLoadedData = () => tryPlay();
    const onPlaying = () => setShowOverlay(false);
    
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('loadeddata', onLoadedData);
    v.addEventListener('playing', onPlaying);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('loadeddata', onLoadedData);
      v.removeEventListener('playing', onPlaying);
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
            background: "rgba(0,0,0,0.3)",
            cursor: "pointer",
            border: "none"
          }}
        >
          <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "16px 24px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 600
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Play Video
          </div>
        </button>
      )}
    </div>
  );
}
