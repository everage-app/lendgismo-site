import { useEffect } from "react";

type SeoProps = {
  title: string;
  description: string;
  url?: string;
  image?: string;
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attributes).forEach(([k, v]) => el!.setAttribute(k, v));
}

export default function Seo({ title, description, url, image }: SeoProps) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      upsertMeta('meta[name="description"]', { name: "description", content: description });
      upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
      upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    }
    if (title) {
      upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
      upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    }
    if (image) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    }
    if (url) {
      upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
      const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? (() => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        document.head.appendChild(l);
        return l;
      })();
      link.setAttribute('href', url);
    }
  }, [title, description, url, image]);

  return null;
}
