"use client";

import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/lib/preferences";

const STAT_CONFIG = [
  {
    key: "totalStock",
    label: "Total Stock",
    description: "Total registered commercial stock across tracked markets.",
  },
  {
    key: "totalVacancy",
    label: "Total Vacancy",
    description: "Available commercial spaces across the tracked markets.",
  },
  {
    key: "totalAvailableSpace",
    label: "Total Available Space",
    description: "Commercial space currently available for occupation.",
  },
  {
    key: "areaTransacted",
    label: "Area Transacted",
    description: "Total area recorded through market transactions.",
  },
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

function AnimatedNumber({ value, unit, startAnimation, delay = 0 }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const animationRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return;
    }

    const target = Number(value);

    if (!Number.isFinite(target)) {
      return;
    }

    // Always show the real value even if the
    // intersection observer has not started the animation yet.
    if (!startAnimation) {
      setAnimatedValue(target);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setAnimatedValue(target);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setAnimatedValue(0);

    const duration = 1800;
    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const currentValue = target * easedProgress;

      setAnimatedValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedValue(target);
      }
    };

    timeoutRef.current = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, startAnimation, delay]);

  return formatArea(animatedValue, unit);
}

export default function MarketStats() {
  const { unit } = usePreferences();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startAnimation, setStartAnimation] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const element = statsRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/market-stats", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        useEffect(() => {
          const page = Number(searchParams.get("page") || "1");

          if (page <= 1) return;

          const params = new URLSearchParams(searchParams.toString());
          params.delete("page");

          router.replace(
            `/properties${params.toString() ? `?${params.toString()}` : ""}`,
          );
        }, [
          filters.city,
          filters.micromarket,
          filters.type,
          filters.minBudget,
          filters.maxBudget,
          filters.area,
          filters.seats,
        ]);
      } catch (err) {
        if (isActive) setError(err.message || "Failed to load market stats");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 12 * 60 * 60 * 1000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section
      ref={statsRef}
      className="
        relative
        w-full
        overflow-hidden
        rounded-[1.75rem]
        border
        border-slate-200/80
        bg-white
        shadow-[0_20px_80px_-40px_rgba(15,23,42,0.18)]
        sm:rounded-[2.25rem]
      "
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {STAT_CONFIG.map(({ key, label, description }, i) => (
          <div
            key={key}
            className={`
              group relative flex min-w-0 flex-col justify-between
              p-5 min-[400px]:p-6 sm:p-8 lg:p-9 xl:p-10
              min-h-[220px] sm:min-h-[260px] lg:min-h-[290px] xl:min-h-[320px]
              transition-colors duration-300 hover:bg-slate-50/60
              ${i % 2 !== 0 ? "border-l border-slate-200/80" : ""}
              ${i >= 2 ? "border-t border-slate-200/80 lg:border-t-0" : ""}
              ${i > 0 ? "lg:border-l lg:border-slate-200/80" : ""}
            `}
          >
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <div className="flex items-center min-h-[2.5rem] sm:min-h-[3.25rem] lg:min-h-[3.75rem]">
                {loading ? (
                  <div className="h-8 w-28 sm:h-10 sm:w-36 lg:h-12 lg:w-40 animate-pulse rounded-lg bg-slate-100" />
                ) : error ? (
                  <span className="text-xs sm:text-sm font-medium text-slate-400">
                    Unavailable
                  </span>
                ) : (
                  <div className="min-w-0 truncate text-lg min-[400px]:text-xl sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight text-[#b54fb5] transition-transform duration-300 group-hover:translate-x-0.5">
                    <AnimatedNumber
                      value={stats?.[key]}
                      unit={unit}
                      startAnimation={startAnimation}
                      delay={i * 120}
                    />
                  </div>
                )}
              </div>

              <h3 className="text-xs min-[400px]:text-sm sm:text-base font-semibold tracking-tight text-slate-800">
                {label}
              </h3>
            </div>

            <p className="mt-4 max-w-[260px] text-[11px] leading-relaxed text-slate-500 sm:text-xs min-[400px]:text-[12px] sm:leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
