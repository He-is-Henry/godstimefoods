"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface QueryOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  initialData?: T;
  pollInterval?: number;
  enabled?: boolean;
  revalidate?: boolean;
  onError?: (error: unknown) => void;
}

// SSR-safe localStorage helpers
const getCache = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (e) {
    console.error(`[useQuery] Cache read error for key "${key}":`, e);
    return null;
  }
};

const setCache = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[useQuery] Cache write error for key "${key}":`, e);
  }
};

export function useQuery<T extends object>({
  key,
  fetcher,
  initialData,
  pollInterval,
  enabled = true,
  revalidate = true,
  onError,
}: QueryOptions<T>) {
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Keep refs for callbacks & data so `getFreshData` stays reference-stable
  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(onError);
  const dataRef = useRef(data);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    dataRef.current = data;
  });

  // Derived state: prevents `react-hooks/set-state-in-effect` ESLint warnings
  const isLoading = enabled && !isInitialized && data === null && error === null;

  // Manual state mutator (updates state + localStorage cache)
  const updateData = useCallback(
    (newDataOrFn: T | ((prev: T | null) => T)) => {
      setData((prev) => {
        const updated =
          typeof newDataOrFn === "function"
            ? (newDataOrFn as (prev: T | null) => T)(prev)
            : newDataOrFn;

        setCache(key, updated);
        return updated;
      });
    },
    [key]
  );

  const getFreshData = useCallback(async () => {
    if (!enabled) return;

    // Skip fetch if revalidation is off and cached data exists
    if (!revalidate && dataRef.current !== null) {
      setIsInitialized(true);
      return;
    }

    if (typeof window !== "undefined" && !navigator.onLine) {
      setIsInitialized(true);
      return;
    }

    const requestId = ++fetchCountRef.current;
    setIsFetching(true);

    try {
      const freshData = await fetcherRef.current();

      if (requestId !== fetchCountRef.current) return;

      setData(freshData);
      setError(null);
      setCache(key, freshData);
    } catch (e: unknown) {
      const err = e as Error;
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      if (requestId !== fetchCountRef.current) return;

      setError(err);
      onErrorRef.current?.(err);
    } finally {
      if (requestId === fetchCountRef.current) {
        setIsInitialized(true);
        setIsFetching(false);
      }
    }
  }, [enabled, revalidate, key]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const initQuery = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      const cached = getCache<T>(key);
      if (cached !== null && isMounted) {
        setData(cached);
      }

      if (isMounted) {
        await getFreshData();
      }
    };

    initQuery();

    if (pollInterval && pollInterval > 0 && typeof window !== "undefined") {
      const intervalId = setInterval(() => {
        getFreshData();
      }, pollInterval);

      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [key, enabled, pollInterval, getFreshData]);

  return {
    data,
    setData: updateData,
    isLoading, // Derived state (false on cache hit or after request finishes)
    isFetching, // Active network request indicator
    error,
    refreshData: getFreshData,
  };
}