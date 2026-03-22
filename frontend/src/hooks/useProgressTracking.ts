import { useCallback, useRef, useEffect } from "react";
import { usePersonalDashboard, ContentType } from "./usePersonalDashboard";
import { useAuth } from "./useAuth";

interface ProgressTrackingParams {
  contentId: string;
  contentType: ContentType;
  title: string;
  imageUrl?: string;
  totalDurationSeconds?: number;
}

export function useProgressTracking({
  contentId,
  contentType,
  title,
  imageUrl,
  totalDurationSeconds = 600, // Default 10 minutes
}: ProgressTrackingParams) {
  const { user } = useAuth();
  const { updateProgress } = usePersonalDashboard();
  const lastSaveRef = useRef<number>(0);
  const currentPositionRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save function - saves at most every 5 seconds
  const saveProgress = useCallback(
    (positionSeconds: number, forceImmediate = false) => {
      if (!user || !contentId) return;

      currentPositionRef.current = positionSeconds;
      const progressPercent = Math.min(
        Math.round((positionSeconds / totalDurationSeconds) * 100),
        100
      );

      // Skip if progress hasn't changed significantly (less than 2%)
      const timeSinceLastSave = Date.now() - lastSaveRef.current;
      if (!forceImmediate && timeSinceLastSave < 5000) {
        // Schedule a save for later
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveProgress(currentPositionRef.current, true);
        }, 5000 - timeSinceLastSave);
        return;
      }

      lastSaveRef.current = Date.now();
      updateProgress({
        content_id: contentId,
        content_type: contentType,
        title,
        image_url: imageUrl,
        progress_percent: progressPercent,
        last_position_seconds: Math.round(positionSeconds),
      });
    },
    [user, contentId, contentType, title, imageUrl, totalDurationSeconds, updateProgress]
  );

  // Save progress when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentPositionRef.current > 0) {
        saveProgress(currentPositionRef.current, true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save on unmount
      if (currentPositionRef.current > 0 && user) {
        handleBeforeUnload();
      }
    };
  }, [saveProgress, user]);

  // Mark content as complete
  const markComplete = useCallback(() => {
    if (!user || !contentId) return;
    updateProgress({
      content_id: contentId,
      content_type: contentType,
      title,
      image_url: imageUrl,
      progress_percent: 100,
      last_position_seconds: totalDurationSeconds,
    });
  }, [user, contentId, contentType, title, imageUrl, totalDurationSeconds, updateProgress]);

  return {
    saveProgress,
    markComplete,
    isTracking: !!user,
  };
}
