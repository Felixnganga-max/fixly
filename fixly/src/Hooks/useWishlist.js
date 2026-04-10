import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "fixly_wishlist";

function readStorage() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState(() => readStorage());

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...wishlist]));
  }, [wishlist]);

  const toggle = useCallback((id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isWishlisted = useCallback((id) => wishlist.has(id), [wishlist]);

  return { wishlist, toggle, isWishlisted, count: wishlist.size };
}
