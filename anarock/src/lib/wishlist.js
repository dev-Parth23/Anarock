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

  const id =
    property.id ??
    property.ID ??
    property.rowId ??
    property.ROWID ??
    property.RowID ??
    property.projectId ??
    property.Project_ID ??
    property.project_id ??
    property.propertyId ??
    property.Property_ID ??
    property.PROPERTY_ID ??
    "";

  return id !== null && id !== undefined ? String(id) : "";
}

function hasPropertyData(property) {
  if (!property || typeof property !== "object") {
    return false;
  }

  const keys = Object.keys(property);

  if (keys.length <= 1) {
    return false;
  }

  return keys.some((key) => {
    const value = property[key];

    return value !== null && value !== undefined && value !== "";
  });
}

function readWishlist() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(Boolean);
  } catch (error) {
    console.error("Wishlist read error:", error);
    return [];
  }
}

function saveWishlist(items) {
  if (typeof window === "undefined") {
    return;
  }

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
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);

      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);
  const ids = useMemo(() => {
    return items.map(getPropertyId).filter(Boolean);
  }, [items]);
  const add = useCallback((property) => {
    if (!property) {
      return;
    }

    const propertyId = getPropertyId(property);

    if (!propertyId) {
      console.warn("Wishlist: property has no valid ID", property);

      return;
    }

    setItems((previousItems) => {
      const existingIndex = previousItems.findIndex(
        (item) => getPropertyId(item) === propertyId,
      );

      if (existingIndex !== -1) {
        const existingProperty = previousItems[existingIndex];
        if (hasPropertyData(property) && !hasPropertyData(existingProperty)) {
          const updatedItems = [...previousItems];
          updatedItems[existingIndex] = {
            ...existingProperty,
            ...property,
            id: property.id ?? existingProperty.id ?? propertyId,
          };
          saveWishlist(updatedItems);
          return updatedItems;
        }
        return previousItems;
      }
      const normalizedProperty =
        typeof property === "object"
          ? {
            ...property,
            id:
              property.id ??
              property.ID ??
              property.rowId ??
              property.ROWID ??
              property.RowID ??
              property.projectId ??
              property.Project_ID ??
              property.project_id ??
              property.propertyId ??
              property.Property_ID ??
              propertyId,
          }
          : {
            id: propertyId,
          };

      const updatedItems = [...previousItems, normalizedProperty];
      saveWishlist(updatedItems);
      return updatedItems;
    });
  }, []);
  const remove = useCallback((propertyOrId) => {
    const propertyId = getPropertyId(propertyOrId);
    if (!propertyId) {
      return;
    }
    setItems((previousItems) => {
      const updatedItems = previousItems.filter(
        (item) => getPropertyId(item) !== propertyId,
      );
      saveWishlist(updatedItems);
      return updatedItems;
    });
  }, []);
  const toggle = useCallback(
    (property) => {
      const propertyId = getPropertyId(property);
      if (!propertyId) {
        console.warn("Wishlist toggle failed: invalid property", property);
        return;
      }
      const exists = ids.includes(propertyId);
      if (exists) {
        remove(propertyId);
      } else {
        add(property);
      }
    },
    [ids, add, remove],
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
