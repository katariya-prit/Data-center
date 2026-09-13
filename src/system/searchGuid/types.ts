import type { ReactNode } from "react";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  category: string; // "Apps", "Actions", etc.
  keywords?: string[];
  onSelect: () => void;
}

export interface SearchSource {
  id: string;
  label: string;
  getItems: () => SearchResultItem[];
}