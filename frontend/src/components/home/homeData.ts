import { useCallback } from "react";
import { useHomeSections } from "@/hooks/useCatalog";
import type { Category, HeroSlide, Reel } from "@/types";

/** Shape the Admin > Homepage Builder writes (backend/models/HomeSection.js). */
export interface ConfigItem {
  icon?: string;
  title?: string;
  description?: string;
  value?: number;
  suffix?: string;
  label?: string;
}

export interface HomeSectionData {
  _id?: string;
  type: string;
  isActive?: boolean;
  sortOrder?: number;
  title?: string;
  subtitle?: string;
  content?: string;
  button?: { label?: string; link?: string };
  image?: { url: string; publicId?: string };
  gallery?: { url: string; publicId?: string }[];
  videos?: { url: string; publicId?: string }[];
  slides?: HeroSlide[];
  reels?: Reel[];
  config?: {
    items?: ConfigItem[];
    secondaryButton?: { label?: string; link?: string };
    [k: string]: unknown;
  };
}

/** Finds the first active admin home section of a given type (exact `type` strings from the admin builder). */
export function useHomeContent() {
  const { data, isLoading } = useHomeSections();
  const sections = data as HomeSectionData[] | undefined;
  const find = useCallback(
    (...types: string[]) => sections?.find((s) => types.includes(s.type) && s.isActive !== false),
    [sections],
  );
  return { find, isLoading };
}

/** Every category in the tree, depth-first, with its depth. */
export function flattenCategories(tree: Category[], depth = 0): (Category & { depth: number })[] {
  return tree.flatMap((c) => [{ ...c, depth }, ...flattenCategories(c.children ?? [], depth + 1)]);
}

/** First category whose name or slug contains any keyword. */
export function findCategoryByKeyword(categories: Category[], keywords: string[]) {
  return categories.find((c) => {
    const hay = `${c.name} ${c.slug}`.toLowerCase();
    return keywords.some((k) => hay.includes(k));
  });
}

/** Internal links stay in the SPA; anything absolute opens normally. */
export function isExternal(href?: string) {
  return !!href && /^https?:\/\//i.test(href);
}
