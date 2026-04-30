"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

interface GlobalSearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  savedFilters: SavedFilter[];
  saveFilter: (name: string, filters: Record<string, any>) => void;
  deleteFilter: (id: string) => void;
  applyFilter: (filter: SavedFilter) => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("savedFilters");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const saveFilter = useCallback((name: string, filters: Record<string, any>) => {
    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    setSavedFilters(prev => {
      const updated = [...prev, newFilter];
      localStorage.setItem("savedFilters", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => {
      const updated = prev.filter(f => f.id !== id);
      localStorage.setItem("savedFilters", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const applyFilter = useCallback((filter: SavedFilter) => {
    setQuery(filter.filters.query || "");
  }, []);

  return (
    <GlobalSearchContext.Provider value={{ query, setQuery, savedFilters, saveFilter, deleteFilter, applyFilter }}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const ctx = useContext(GlobalSearchContext);
  if (!ctx) throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
  return ctx;
}