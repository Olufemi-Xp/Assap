"use client";

import React, { useEffect, useRef } from "react";

interface BackgroundShowcaseVideoProps {
  src: string;
  poster?: string;
}

/**
 * Silent, control-free, continuously looping background video layer.
 * Enforces muted state and resumes playback if paused externally.
 */
export function BackgroundShowcaseVideo({ src, poster }: BackgroundShowcaseVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const enforceSilentPlayback = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
    };

    const ensurePlaying = () => {
      enforceSilentPlayback();
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    ensurePlaying();

    video.addEventListener("canplay", ensurePlaying);
    video.addEventListener("pause", ensurePlaying);
    video.addEventListener("volumechange", enforceSilentPlayback);

    return () => {
      video.removeEventListener("canplay", ensurePlaying);
      video.removeEventListener("pause", ensurePlaying);
      video.removeEventListener("volumechange", enforceSilentPlayback);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none select-none"
      autoPlay
      loop
      muted
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      preload="auto"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
