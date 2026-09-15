"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

const WishlistContext = createContext(null);

function createSessionId() {
  if (typeof window === "undefined") return null;

  try {
    return crypto.randomUUID();
  } catch {
    return `anarock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [items, setItems] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const sessionInitializedRef = useRef(false);

  useEffect(() => {
    /*
      IMPORTANT:

      We intentionally DO NOT store the session ID in localStorage.

      This means:

      - Clicking ❤️ adds the property to the current wishlist.
      - Navigating to /wishlist keeps the wishlist.
      - Navigating between pages keeps the wishlist as long as the
        WishlistProvider remains mounted.
      - Refreshing the browser creates a completely new session,
        therefore the previous liked properties disappear.
    */

    if (sessionInitializedRef.current) return;

    sessionInitializedRef.current = true;

    const sid = createSessionId();

    setSessionId(sid);

    if (!sid) return;

    fetch(`/api/wishlist?sessionId=${sid}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setItems(d.items || []);
          setIds((d.items || []).map((i) => i.id));
        }
      })
      .catch(() => {});
  }, []);

  const add = useCallback(
    async (propertyId) => {
      if (!sessionId) return;

      /*
        Optimistic update.
        The heart/count updates immediately.
      */
      setIds((prev) =>
        prev.includes(propertyId) ? prev : [...prev, propertyId],
      );

      const res = await fetch("/api/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          propertyId,
        }),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (res?.success) {
        const list = await fetch(`/api/wishlist?sessionId=${sessionId}`)
          .then((r) => r.json())
          .catch(() => null);

        if (list?.success) {
          setItems(list.items || []);
          setIds((list.items || []).map((i) => i.id));
        }
      }
    },
    [sessionId],
  );

  const remove = useCallback(
    async (propertyId) => {
      if (!sessionId) return;

      /*
        Optimistic removal.
      */
      setIds((prev) => prev.filter((i) => i !== propertyId));

      setItems((prev) => prev.filter((p) => p.id !== propertyId));

      await fetch("/api/wishlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          propertyId,
        }),
      }).catch(() => {});
    },
    [sessionId],
  );

  const toggle = useCallback(
    (propertyId) => {
      if (ids.includes(propertyId)) {
        remove(propertyId);
      } else {
        add(propertyId);
      }
    },
    [ids, add, remove],
  );

  return (
    <WishlistContext.Provider
      value={{
        ids,
        items,
        add,
        remove,
        toggle,
        count: ids.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);

  if (!ctx) {
    return {
      ids: [],
      items: [],
      add: () => {},
      remove: () => {},
      toggle: () => {},
      count: 0,
    };
  }

  return ctx;
}
