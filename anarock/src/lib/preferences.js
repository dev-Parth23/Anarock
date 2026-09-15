"use client";

import { useSyncExternalStore } from "react";

const DEFAULT_CURRENCY = "INR";
const DEFAULT_UNIT = "sqft";

const CURRENCY_STORAGE_KEY = "anarock_currency";
const UNIT_STORAGE_KEY = "anarock_unit";
const PREFERENCE_EVENT = "anarock-preferences-changed";

const SERVER_SNAPSHOT = {
  currency: DEFAULT_CURRENCY,
  unit: DEFAULT_UNIT,
};

let state = {
  currency: DEFAULT_CURRENCY,
  unit: DEFAULT_UNIT,
};

let initialized = false;

const listeners = new Set();

function normalizeCurrency(currency) {
  return currency || DEFAULT_CURRENCY;
}

function normalizeUnit(unit) {
  if (unit === "sq.m" || unit === "sqm") {
    return "sqm";
  }

  return "sqft";
}

function getStoredPreferences() {
  if (typeof window === "undefined") {
    return SERVER_SNAPSHOT;
  }

  return {
    currency: normalizeCurrency(
      window.localStorage.getItem(CURRENCY_STORAGE_KEY),
    ),
    unit: normalizeUnit(window.localStorage.getItem(UNIT_STORAGE_KEY)),
  };
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

function initialize() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;
  state = getStoredPreferences();

  const handlePreferenceChange = (event) => {
    const nextCurrency = normalizeCurrency(
      event.detail?.currency ||
        window.localStorage.getItem(CURRENCY_STORAGE_KEY),
    );

    const nextUnit = normalizeUnit(
      event.detail?.unit || window.localStorage.getItem(UNIT_STORAGE_KEY),
    );

    state = {
      currency: nextCurrency,
      unit: nextUnit,
    };

    notify();
  };

  window.addEventListener(PREFERENCE_EVENT, handlePreferenceChange);

  const handleStorageChange = (event) => {
    if (event.key !== CURRENCY_STORAGE_KEY && event.key !== UNIT_STORAGE_KEY) {
      return;
    }

    state = getStoredPreferences();
    notify();
  };

  window.addEventListener("storage", handleStorageChange);
}

function subscribe(listener) {
  initialize();

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  initialize();

  return state;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function setPreferences({ currency, unit }) {
  if (typeof window === "undefined") {
    return;
  }

  initialize();

  const nextCurrency = normalizeCurrency(currency ?? state.currency);

  const nextUnit = normalizeUnit(unit ?? state.unit);

  state = {
    currency: nextCurrency,
    unit: nextUnit,
  };

  window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);

  window.localStorage.setItem(UNIT_STORAGE_KEY, nextUnit);

  window.dispatchEvent(
    new CustomEvent(PREFERENCE_EVENT, {
      detail: {
        currency: nextCurrency,
        unit: nextUnit,
      },
    }),
  );
}

export function usePreferences() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
