import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

function sanitizeLabel(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 200);
}

function safeHref(value) {
  if (!value) return undefined;

  const href = String(value).trim();

  if (!href.startsWith("/") || href.startsWith("//")) {
    return undefined;
  }

  return href;
}

export default function Breadcrumbs({ items = [] }) {
  const normalizedItems = Array.isArray(items)
    ? items
      .filter(Boolean)
      .map((item) => ({
        label: sanitizeLabel(item?.label),
        href: safeHref(item?.href),
      }))
      .filter((item) => item.label)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/",
      },
      ...normalizedItems.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.label,
        ...(item.href ? { item: item.href } : {}),
      })),
    ],
  };

  const safeJsonLd = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <nav aria-label="Breadcrumb" className="relative py-2 pl-2 sm:py-3 sm:pl-4 ">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />

      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[11px] sm:gap-x-3 sm:text-xs">
        <li className="flex shrink-0 items-center">
          <Link
            href="/"
            aria-label="Home"
            className="group inline-flex items-center gap-2 font-medium text-black/85 transition-colors duration-300 hover:text-[#A054A0]"
          >
            <Home className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span className="tracking-[0.08em]">Home</span>
          </Link>
        </li>

        {normalizedItems.map((item, i) => {
          const isCurrent = !item.href || i === normalizedItems.length - 1;

          return (
            <li
              key={`${item.href || "current"} -${item.label} -${i} `}
              className="flex min-w-0 items-center gap-x-2.5 sm:gap-x-3"
            >
              <ChevronRight
                aria-hidden="true"
                className="h-3 w-3 shrink-0 text-[#A054A0]"
                strokeWidth={1.5}
              />

              {isCurrent ? (
                <span
                  aria-current="page"
                  className="relative inline-flex min-w-0 flex-col gap-1 py-1 font-medium tracking-[0.08em] text-[#A054A0]"
                >
                  <span className="break-words">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="min-w-0 break-words font-medium tracking-[0.08em] text-black/85 transition-colors duration-300 hover:text-[#A054A0]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
