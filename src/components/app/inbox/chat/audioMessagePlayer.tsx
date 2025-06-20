'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  blob: Blob | string | null;
  type?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ blob }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Create/revoke blob URL
  useEffect(() => {
    if (blob instanceof Blob) {
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof blob === 'string') {
      setBlobUrl(blob);
    } else {
      setBlobUrl(null);
    }
  }, [blob]);

  // Load metadata & duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [blobUrl]);

  // Update progress in sync
  const updateProgress = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } catch (err) {
        console.error('Play failed:', err);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!blobUrl) return null;

  return (
    <div className="w-full max-w-md rounded-xl border border-neutral-600 bg-neutral-900/60 p-4 shadow-md">
      <audio ref={audioRef} src={blobUrl} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex size-10 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600"
        >
          {isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5" />
          )}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            className="h-2 w-full appearance-none rounded-lg bg-neutral-700 accent-green-500"
          />
          <div className="mt-1 flex justify-between text-sm text-neutral-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
