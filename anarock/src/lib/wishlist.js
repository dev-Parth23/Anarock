"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WishlistContext = createContext(null);

const STORAGE_KEY = "anarock_wishlist_properties";

function getPropertyId(property) {
  if (!property) return "";

  if (typeof property === "string" || typeof property === "number") {
    return String(property);
  }

  return String(
    property.id ||
    property.rowId ||
    property.ROWID ||
    property.ID ||
    property.projectId ||
    property.Project_ID ||
    ""
  );
}

function readWishlist() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Wishlist read error:", error);
    return [];
  }
}

function saveWishlist(items) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    window.dispatchEvent(new Event("wishlist-updated"));
  } catch (error) {
    console.error("Wishlist save error:", error);
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    const savedItems = readWishlist();

    setItems(savedItems);
    setIsInitialized(true);
  }, []);
  useEffect(() => {
    function handleWishlistUpdate() {
      setItems(readWishlist());
    }

    function handleStorageUpdate(event) {
      if (event.key === STORAGE_KEY) {
        setItems(readWishlist());
      }
    }

    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(
        "wishlist-updated",
        handleWishlistUpdate
      );

      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const ids = useMemo(() => {
    return items
      .map((property) => getPropertyId(property))
      .filter(Boolean);
  }, [items]);

  const add = useCallback((property) => {
    const propertyId = getPropertyId(property);

    if (!propertyId) return;

    setItems((previousItems) => {
      const alreadyExists = previousItems.some(
        (item) => getPropertyId(item) === propertyId
      );

      if (alreadyExists) {
        return previousItems;
      }

      const updatedItems = [
        ...previousItems,
        typeof property === "object"
          ? {
            ...property,
            id: property.id || propertyId,
          }
          : {
            id: propertyId,
          },
      ];

      saveWishlist(updatedItems);

      return updatedItems;
    });
  }, []);

  const remove = useCallback((propertyOrId) => {
    const propertyId = getPropertyId(propertyOrId);

    if (!propertyId) return;

    setItems((previousItems) => {
      const updatedItems = previousItems.filter(
        (item) => getPropertyId(item) !== propertyId
      );

      saveWishlist(updatedItems);

      return updatedItems;
    });
  }, []);

  const toggle = useCallback(
    (property) => {
      const propertyId = getPropertyId(property);

      if (!propertyId) return;

      const exists = ids.includes(propertyId);

      if (exists) {
        remove(propertyId);
      } else {
        add(property);
      }
    },
    [ids, add, remove]
  );

  const clear = useCallback(() => {
    setItems([]);
    saveWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        ids,
        count: items.length,
        add,
        remove,
        toggle,
        clear,
        isInitialized,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    return {
      items: [],
      ids: [],
      count: 0,
      add: () => { },
      remove: () => { },
      toggle: () => { },
      clear: () => { },
      isInitialized: false,
    };
  }

  return context;
}