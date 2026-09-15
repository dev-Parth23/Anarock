"use client";

import { useEffect, useState, useRef } from "react";
import { usePreferences } from "@/lib/preferences";

const STAT_CONFIG = [
  { key: "totalStock", label: "Total Stock" },
  { key: "totalVacancy", label: "Total Vacancy" },
  { key: "totalAvailableSpace", label: "Total Available Space" },
  { key: "areaTransacted", label: "Area Transacted" },
];

const SQFT_TO_SQM = 0.09290304;

function formatArea(num, unit) {
  if (num === null || num === undefined || Number.isNaN(Number(num))) {
    return "—";
  }

  let value = Number(num);

  if (unit === "sqm") {
    value = value * SQFT_TO_SQM;
  }

  const abs = Math.abs(value);

  const suffix = unit === "sqm" ? "sq.m" : "sq.ft";

  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B ${suffix}`;
  }

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ${suffix}`;
  }

  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K ${suffix}`;
  }

  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} ${suffix}`;
}

/* ---------------------------------------
   Animated Number
--------------------------------------- */

function AnimatedNumber({ value, unit, startAnimation }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!startAnimation) return;

    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return;
    }

    const target = Number(value);

    if (target === 0) {
      setAnimatedValue(0);
      return;
    }

    let startTime = null;
    let animationFrame;

    // Animation duration
    const duration = 2000;

    const animate = (currentTime) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = target * easedProgress;

      setAnimatedValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setAnimatedValue(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [value, startAnimation]);

  return formatArea(animatedValue, unit);
}

/* ---------------------------------------
   Market Stats
--------------------------------------- */

export default function MarketStats() {
  const { unit } = usePreferences();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controls when the animation starts
  const [startAnimation, setStartAnimation] = useState(false);

  const statsRef = useRef(null);

  /* ---------------------------------------
     Detect when Market Stats enters viewport
  --------------------------------------- */

  useEffect(() => {
    const element = statsRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true);

          // We only need to trigger it once
          observer.disconnect();
        }
      },
      {
        // Start when approximately 20% of
        // the section is visible
        threshold: 0.2,

        // Start slightly BEFORE the section
        // completely enters the viewport
        rootMargin: "0px 0px -50px 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* ---------------------------------------
     Fetch Market Stats
  --------------------------------------- */

  useEffect(() => {
    let isActive = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/market-stats", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        if (isActive) {
          setStats(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || "Failed to load market stats");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadStats();

    const interval = setInterval(loadStats, 60 * 12 * 60 * 1000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_CONFIG.map(({ key, label }) => (
        <div
          key={key}
          className="border border-slate-200 rounded-xl px-6 py-8 text-center bg-white"
        >
          <div className="text-xs uppercase tracking-wide font-medium text-slate-500 mb-2">
            {label}
          </div>

          {loading && (
            <div className="h-7 w-28 mx-auto bg-slate-100 rounded animate-pulse" />
          )}

          {!loading && error && (
            <div className="text-sm text-slate-400">Unavailable</div>
          )}

          {!loading && !error && (
            <div className="text-2xl font-bold text-slate-900">
              <AnimatedNumber
                value={stats?.[key]}
                unit={unit}
                startAnimation={startAnimation}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
