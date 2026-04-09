import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "fixly_recently_viewed";
const MAX = 10;

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState(() => readStorage());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const record = useCallback((id) => {
    setIds((prev) => {
      const filtered = prev.filter((x) => x !== id);
      return [id, ...filtered].slice(0, MAX);
    });
  }, []);

  return { ids, record };
}
