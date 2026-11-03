import { useEffect } from "react";
import { usePublicBrand } from "@/hooks/useBrand";

const upsertIcon = (rel: string, href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
};

/** Keeps the browser tab title and favicon in sync with Brand Management. Renders nothing. */
export function BrandHead() {
  const { data } = usePublicBrand();
  const name = data?.company?.brandName;
  const favicon = data?.logos?.favicon || data?.logos?.browserIcon;

  useEffect(() => {
    if (name) document.title = `${name} Admin`;
  }, [name]);

  useEffect(() => {
    if (!favicon) return;
    upsertIcon("icon", favicon);
    upsertIcon("apple-touch-icon", data?.logos?.browserIcon || favicon);
  }, [favicon, data?.logos?.browserIcon]);

  return null;
}
