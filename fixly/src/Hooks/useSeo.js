import { useEffect } from "react";

// Create-or-update a <head> tag; returns a function that restores the page.
function upsert(tag, matchAttr, matchVal, attrs) {
  let el = document.head.querySelector(`${tag}[${matchAttr}="${matchVal}"]`);
  const created = !el;
  const prev = el ? Object.fromEntries([...el.attributes].map((a) => [a.name, a.value])) : null;
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(matchAttr, matchVal);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return () => {
    if (created) el.remove();
    else Object.entries(prev).forEach(([k, v]) => el.setAttribute(k, v));
  };
}

/** Per-page title, description, canonical, social tags and JSON-LD. */
export default function useSeo({ title, description, canonical, jsonLd }) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    if (!title) return;
    const prevTitle = document.title;
    document.title = title;
    const undo = [
      upsert("meta", "name", "description", { content: description || "" }),
      upsert("meta", "property", "og:title", { content: title }),
      upsert("meta", "property", "og:description", { content: description || "" }),
      upsert("meta", "property", "og:type", { content: "website" }),
    ];
    if (canonical) {
      undo.push(upsert("link", "rel", "canonical", { href: canonical }));
      undo.push(upsert("meta", "property", "og:url", { content: canonical }));
    }
    let script;
    if (ld) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = ld;
      document.head.appendChild(script);
    }
    return () => {
      document.title = prevTitle;
      undo.forEach((fn) => fn());
      script?.remove();
    };
  }, [title, description, canonical, ld]);
}