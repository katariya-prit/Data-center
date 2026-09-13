"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchGuid } from "./SearchContext";
import { useDefaultSearchSources } from "./useDefaultSearchSources";
import { useSearchResults } from "./useSearchResults";
import "./SpotlightSearch.css";

const RECENTS_KEY = "spotlight-recent-searches";
const MAX_RECENTS = 8;

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  if (!query.trim()) return;
  try {
    const existing = loadRecents().filter((q) => q !== query);
    localStorage.setItem(RECENTS_KEY, JSON.stringify([query, ...existing].slice(0, MAX_RECENTS)));
  } catch {
    // ignore
  }
}

export default function SpotlightSearch() {
  const { isOpen, close } = useSearchGuid();
  const allItems = useDefaultSearchSources();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(allItems.map((i) => i.category))),
    [allItems]
  );

  const scoped = useMemo(
    () => (activeCategory ? allItems.filter((i) => i.category === activeCategory) : allItems),
    [allItems, activeCategory]
  );

  const results = useSearchResults(scoped, query);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveCategory(null);
      setSelectedIndex(0);
      setHistoryIndex(-1);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  if (!isOpen) return null;

  const runSelected = () => {
    const item = results[selectedIndex];
    if (!item) return;
    saveRecent(query);
    item.onSelect();
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      const idx = Number(e.key) - 1;
      setActiveCategory(idx >= categories.length ? null : categories[idx]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (query === "") {
        const recents = loadRecents();
        if (recents.length) {
          const nextIndex = Math.min(historyIndex + 1, recents.length - 1);
          setHistoryIndex(nextIndex);
          setQuery(recents[nextIndex]);
        }
      } else {
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      runSelected();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    // બેકગ્રાઉન્ડ (સાઇડમાં) ક્લિક કરવાથી બંધ થશે
    <div className="spotlight-backdrop" onMouseDown={close}>
      <div className="spotlight-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="spotlight-input-row">
          <img
            className="spotlight-glass-icon"
            src="https://unpkg.com/lucide-static@latest/icons/search.svg"
            alt=""
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHistoryIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search (Ctrl+K)"
            className="spotlight-input"
            spellCheck={false}
          />
        </div>

        {categories.length > 0 && (
          <div className="spotlight-tabs">
            <button
              className={`spotlight-tab ${activeCategory === null ? "active" : ""}`}
              onClick={() => setActiveCategory(null)}
            >
              All
            </button>
            {categories.map((cat, idx) => (
              <button
                key={cat}
                className={`spotlight-tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                <span className="spotlight-tab-key">Ctrl+{idx + 1}</span>
              </button>
            ))}
          </div>
        )}

        <div className="spotlight-results">
          {results.length === 0 ? (
            <div className="spotlight-empty">No results for "{query}"</div>
          ) : (
            results.map((item, index) => (
              <div
                key={item.id}
                className={`spotlight-result ${index === selectedIndex ? "selected" : ""}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  saveRecent(query);
                  item.onSelect();
                  close();
                }}
              >
                <div className="spotlight-result-icon">{item.icon}</div>
                <div className="spotlight-result-text">
                  <div className="spotlight-result-title">{item.title}</div>
                  {item.subtitle && (
                    <div className="spotlight-result-subtitle">{item.subtitle}</div>
                  )}
                </div>
                <div className="spotlight-result-category">{item.category}</div>
              </div>
            ))
          )}
        </div>

        <div className="spotlight-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}