/**
 * useOffline — Service worker registration + content download manager.
 *
 * Features:
 *   - Registers SW on mount
 *   - Download content bundles for offline access
 *   - Track download progress
 *   - Check what's cached
 *   - Get cache size
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api/client";

interface DownloadProgress {
  contentId: string;
  status: "pending" | "downloading" | "complete" | "error";
  cached: number;
  total: number;
  error?: string;
}

interface CacheInfo {
  usedMB: number;
  quotaMB: number;
  percentUsed: number;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swReady, setSwReady] = useState(false);
  const [downloads, setDownloads] = useState<Map<string, DownloadProgress>>(new Map());
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({ usedMB: 0, quotaMB: 0, percentUsed: 0 });
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  // ── Register service worker ─────────────────────────

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        swRef.current = reg;
        setSwReady(true);
      })
      .catch((err) => console.warn("SW registration failed:", err));

    // Listen for messages from SW
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};

      if (type === "CACHE_COMPLETE") {
        setDownloads((prev) => {
          const next = new Map(prev);
          next.set(payload.contentId, {
            contentId: payload.contentId,
            status: payload.failed > 0 ? "error" : "complete",
            cached: payload.cached,
            total: payload.cached + payload.failed,
            error: payload.errors?.join(", "),
          });
          return next;
        });
      }

      if (type === "CACHE_SIZE") {
        const { size } = payload;
        setCacheInfo({
          usedMB: Math.round((size.used / 1024 / 1024) * 10) / 10,
          quotaMB: Math.round((size.quota / 1024 / 1024) * 10) / 10,
          percentUsed: size.quota ? Math.round((size.used / size.quota) * 100) : 0,
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  // ── Online/offline status ────────────────────────────

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // ── Download content for offline ─────────────────────

  const downloadContent = useCallback(
    async (contentId: string, contentType: string) => {
      if (!swReady) return;

      setDownloads((prev) => {
        const next = new Map(prev);
        next.set(contentId, {
          contentId,
          status: "downloading",
          cached: 0,
          total: 0,
        });
        return next;
      });

      try {
        // Fetch the content to build URL list
        const content = await api.findById(contentType, contentId, 2);
        const urls = buildContentUrls(content, contentType);

        // Tell SW to cache these URLs
        navigator.serviceWorker.controller?.postMessage({
          type: "CACHE_CONTENT",
          payload: { urls, id: contentId },
        });
      } catch (err: any) {
        setDownloads((prev) => {
          const next = new Map(prev);
          next.set(contentId, {
            contentId,
            status: "error",
            cached: 0,
            total: 0,
            error: err.message,
          });
          return next;
        });
      }
    },
    [swReady]
  );

  // ── Remove cached content ────────────────────────────

  const removeDownload = useCallback(
    (contentId: string) => {
      navigator.serviceWorker.controller?.postMessage({
        type: "CLEAR_CACHE",
        payload: { id: contentId },
      });
      setDownloads((prev) => {
        const next = new Map(prev);
        next.delete(contentId);
        return next;
      });
    },
    []
  );

  // ── Check cache size ─────────────────────────────────

  const refreshCacheInfo = useCallback(() => {
    navigator.serviceWorker.controller?.postMessage({ type: "GET_CACHE_SIZE" });
  }, []);

  return {
    isOnline,
    swReady,
    downloads: Array.from(downloads.values()),
    cacheInfo,
    downloadContent,
    removeDownload,
    refreshCacheInfo,
    getDownloadStatus: (id: string) => downloads.get(id),
  };
}

// ── Build URL list for a content item ────────────────────

function buildContentUrls(content: any, contentType: string): string[] {
  const urls: string[] = [];
  const apiBase = "/api";

  // Cache the content JSON itself
  urls.push(`${apiBase}/${contentType}/${content.id}?depth=2`);

  // Cache images
  const imageFields = ["coverImage", "thumbnailImage", "image", "avatar", "heroImage"];
  for (const field of imageFields) {
    const img = content[field];
    if (img?.url) urls.push(img.url);
    if (img?.sizes) {
      Object.values(img.sizes).forEach((size: any) => {
        if (size?.url) urls.push(size.url);
      });
    }
  }

  // Cache audio files
  if (content.audioUrl) urls.push(content.audioUrl);
  if (content.narrationUrl) urls.push(content.narrationUrl);

  // Cache story blocks media
  const blocks = content.storyBlocks || content.blocks || [];
  for (const block of blocks) {
    if (block.image?.url) urls.push(block.image.url);
    if (block.audioUrl) urls.push(block.audioUrl);
    if (block.videoUrl) urls.push(block.videoUrl);
  }

  // Cache documentary chapters
  const chapters = content.chapters || [];
  for (const ch of chapters) {
    if (ch.thumbnailUrl) urls.push(ch.thumbnailUrl);
  }

  // Cache route stop images
  const stops = content.stops || [];
  for (const stop of stops) {
    if (stop.image?.url) urls.push(stop.image.url);
  }

  return [...new Set(urls)]; // Deduplicate
}
