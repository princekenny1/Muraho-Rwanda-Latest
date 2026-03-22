import { useState, useRef, useCallback } from "react";
import { api } from "@/lib/api/client";

interface UseNarrationOptions {
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: string) => void;
}

export function useNarration(options: UseNarrationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const generateNarration = useCallback(
    async (text: string, voiceId?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Call Next.js API route (replaces legacy query)
        const response = await fetch(`${api.baseURL}/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text, voiceId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate narration");
        }

        const audioBlob = await response.blob();

        // Clean up previous audio URL
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        // Create or update audio element
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        audioRef.current.src = audioUrl;

        audioRef.current.onloadedmetadata = () => {
          setDuration(audioRef.current?.duration || 0);
        };

        audioRef.current.ontimeupdate = () => {
          const time = audioRef.current?.currentTime || 0;
          setCurrentTime(time);
          options.onTimeUpdate?.(time);
        };

        audioRef.current.onended = () => {
          setIsPlaying(false);
          options.onPlayStateChange?.(false);
        };

        audioRef.current.onerror = () => {
          const errMsg = "Audio playback error";
          setError(errMsg);
          options.onError?.(errMsg);
        };

        return audioUrl;
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to generate narration";
        setError(errMsg);
        options.onError?.(errMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options],
  );

  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        options.onPlayStateChange?.(true);
      } catch (err) {
        console.error("Playback failed:", err);
      }
    }
  }, [options]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      options.onPlayStateChange?.(false);
    }
  }, [options]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, []);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  return {
    isLoading,
    isPlaying,
    currentTime,
    duration,
    error,
    generateNarration,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    cleanup,
  };
}
