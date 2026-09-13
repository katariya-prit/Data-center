import { useMemo } from "react";
import type { SearchResultItem } from "./types";

function score(item: SearchResultItem, query: string): number {
  const q = query.toLowerCase();
  const haystacks = [item.title, item.subtitle ?? "", ...(item.keywords ?? [])].map((s) =>
    s.toLowerCase()
  );
  let best = -1;
  haystacks.forEach((h) => {
    if (h === q) best = Math.max(best, 100);
    else if (h.startsWith(q)) best = Math.max(best, 80);
    else if (h.includes(q)) best = Math.max(best, 50);
  });
  return best;
}

export function useSearchResults(items: SearchResultItem[], query: string) {
  return useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return items;

    return items
      .map((item) => ({ item, s: score(item, trimmed) }))
      .filter(({ s }) => s > -1)
      .sort((a, b) => b.s - a.s)
      .map(({ item }) => item);
  }, [items, query]);
}