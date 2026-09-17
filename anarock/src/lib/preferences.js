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
  exchangeRates: {
    INR: 1,
  },
};

let state = {
  currency: DEFAULT_CURRENCY,
  unit: DEFAULT_UNIT,
  exchangeRates: {
    INR: 1,
  },
};

let initialized = false;
let ratesLoading = false;

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

    exchangeRates: state.exchangeRates || {
      INR: 1,
    },
  };
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

// Load exchange rates
async function loadExchangeRates() {
  if (ratesLoading) return;

  ratesLoading = true;

  try {
    const response = await fetch("/api/exchange-rates?base=INR", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch exchange rates");
    }

    state = {
      ...state,

      exchangeRates: {
        INR: 1,
        ...(data.rates || {}),
      },
    };

    notify();
  } catch (error) {
    console.error("Exchange rate loading failed:", error);
  } finally {
    ratesLoading = false;
  }
}

// Initialize preferences
function initialize() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;

  state = {
    ...getStoredPreferences(),

    exchangeRates: state.exchangeRates || {
      INR: 1,
    },
  };

  // Load live exchange rates
  loadExchangeRates();

  // Custom preference event
  const handlePreferenceChange = (event) => {
    const nextCurrency = normalizeCurrency(
      event.detail?.currency ??
        window.localStorage.getItem(CURRENCY_STORAGE_KEY) ??
        state.currency,
    );

    const nextUnit = normalizeUnit(
      event.detail?.unit ??
        window.localStorage.getItem(UNIT_STORAGE_KEY) ??
        state.unit,
    );

    state = {
      ...state,

      currency: nextCurrency,
      unit: nextUnit,
    };

    notify();
  };

  window.addEventListener(PREFERENCE_EVENT, handlePreferenceChange);

  // Cross-tab storage changes
  const handleStorageChange = (event) => {
    if (event.key !== CURRENCY_STORAGE_KEY && event.key !== UNIT_STORAGE_KEY) {
      return;
    }

    const storedPreferences = getStoredPreferences();

    state = {
      ...state,

      currency: storedPreferences.currency,
      unit: storedPreferences.unit,
    };

    notify();
  };

  window.addEventListener("storage", handleStorageChange);
}

// Subscribe
function subscribe(listener) {
  initialize();

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

// Client snapshot
function getSnapshot() {
  initialize();

  return state;
}

// Server snapshot
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

// Set preferences
export function setPreferences({ currency, unit }) {
  if (typeof window === "undefined") {
    return;
  }

  initialize();

  const nextCurrency = normalizeCurrency(currency ?? state.currency);

  const nextUnit = normalizeUnit(unit ?? state.unit);

  // Preserve exchange rates
  state = {
    ...state,

    currency: nextCurrency,
    unit: nextUnit,
  };

  // Save currency
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);

  // Save area unit
  window.localStorage.setItem(UNIT_STORAGE_KEY, nextUnit);

  // Notify all components
  window.dispatchEvent(
    new CustomEvent(PREFERENCE_EVENT, {
      detail: {
        currency: nextCurrency,
        unit: nextUnit,
      },
    }),
  );

  notify();
}
export function usePreferences() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
