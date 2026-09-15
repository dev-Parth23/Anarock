import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  // items: [{label, href}]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      ...items.map((it, idx) => ({
        '@type': 'ListItem',
        position: idx + 2,
        name: it.label,
        item: it.href || undefined
      }))
    ]
  };

  return (
    <nav aria-label="Breadcrumb" className="py-3 text-sm">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex items-center flex-wrap gap-1 text-slate-500">
        <li>
          <Link href="/" className="flex items-center gap-1 hover:text-amber-600">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-amber-600">{item.label}</Link>
            ) : (
              <span className="text-slate-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
