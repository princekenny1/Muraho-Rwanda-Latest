/**
 * useSearch — Global search hook with debounce.
 *
 * Usage:
 *   const { query, setQuery, results, isSearching } = useSearch();
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api/client";

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  score: number;
}

interface SearchState {
  results: SearchResult[];
  total: number;
  isSearching: boolean;
}

export function useSearch(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({
    results: [],
    total: 0,
    isSearching: false,
  });
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setState({ results: [], total: 0, isSearching: false });
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState(prev => ({ ...prev, isSearching: true }));

    try {
      const data = await api.search(q, undefined, 20);
      setState({
        results: data.results || [],
        total: data.total || 0,
        isSearching: false,
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState(prev => ({ ...prev, isSearching: false }));
      }
    }
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setState({ results: [], total: 0, isSearching: false });
      return;
    }

    timerRef.current = setTimeout(() => search(query), debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs, search]);

  const clear = useCallback(() => {
    setQuery("");
    setState({ results: [], total: 0, isSearching: false });
  }, []);

  return {
    query,
    setQuery,
    results: state.results,
    total: state.total,
    isSearching: state.isSearching,
    clear,
  };
}
