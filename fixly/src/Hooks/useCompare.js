import { useState, useCallback } from "react";

const MAX = 4;

export function useCompare() {
  const [items, setItems] = useState([]); // array of full product objects

  const toggle = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find(
        (p) => (p._id || p.id) === (product._id || product.id),
      );
      if (exists)
        return prev.filter(
          (p) => (p._id || p.id) !== (product._id || product.id),
        );
      if (prev.length >= MAX) return prev; // silently cap at MAX
      return [...prev, product];
    });
  }, []);

  const isComparing = useCallback(
    (id) => items.some((p) => (p._id || p.id) === id),
    [items],
  );

  const clear = useCallback(() => setItems([]), []);

  return { items, toggle, isComparing, clear, count: items.length };
}
