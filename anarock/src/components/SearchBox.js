"use client";

import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const router = useRouter();

  const [mode, setMode] = useState("browse");
  const [keyword, setKeyword] = useState("");

  const [filters, setFilters] = useState({
    city: "",
    micromarket: "",
    type: "",
  });

  function updateFilter(e) {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  }

  function performSearch(e) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`/properties?${params.toString()}`);
  }

  function aiSearch(value = keyword) {
    if (!value.trim()) return;

    router.push(
      `/properties?keyword=${encodeURIComponent(value.trim())}&mode=ai`
    );
  }

  return (
    <div className="search-card">

      <div className="search-tabs">

        <button
          className={mode === "browse" ? "active" : ""}
          onClick={() => setMode("browse")}
        >
          Browse Filters
        </button>

        <button
          className={mode === "ai" ? "active" : ""}
          onClick={() => setMode("ai")}
        >
          <Sparkles size={14} />
          Ask AI
        </button>

      </div>

      {mode === "browse" && (
        <form onSubmit={performSearch}>

          <div className="filter-grid">

            <div className="filter-field">
              <label>City</label>

              <select
                name="city"
                value={filters.city}
                onChange={updateFilter}
              >
                <option value="">Any city</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div className="filter-field">
              <label>Micromarket</label>

              <select
                name="micromarket"
                value={filters.micromarket}
                onChange={updateFilter}
              >
                <option value="">Any micromarket</option>
                <option value="BKC">BKC</option>
                <option value="Whitefield">Whitefield</option>
                <option value="Cyber City">Cyber City</option>
                <option value="Hitech City">Hitech City</option>
                <option value="Koramangala">Koramangala</option>
              </select>
            </div>

            <div className="filter-field">
              <label>Property Type</label>

              <select
                name="type"
                value={filters.type}
                onChange={updateFilter}
              >
                <option value="">Any type</option>
                <option value="Corporate">Corporate</option>
                <option value="IT Park">IT Park</option>
                <option value="Flex">Flex</option>
                <option value="GCC Campus">GCC Campus</option>
              </select>
            </div>

            <div className="keyword-field">
              <label>Keyword</label>

              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="BKC office, Grade A, metro..."
              />
            </div>

            <button className="search-button" type="submit">
              <Search size={17} />
              Search properties
            </button>

          </div>
        </form>
      )}

      {mode === "ai" && (
        <div className="ai-search">

          <div className="ai-input-row">

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  aiSearch();
                }
              }}
              placeholder="e.g. Grade A office near metro in BKC..."
            />

            <button
              className="primary-button"
              onClick={() => aiSearch()}
            >
              <Search size={16} />
              Search
            </button>

          </div>

          <div className="ai-chip-row">

            {[
              "Grade A office in BKC",
              "Office near Whitefield metro",
              "GCC campus in Hyderabad",
            ].map((text) => (
              <button
                key={text}
                className="ai-chip"
                onClick={() => {
                  setKeyword(text);
                  aiSearch(text);
                }}
              >
                {text}
              </button>
            ))}

          </div>

        </div>
      )}

      <div className="sync-row">
        <span className="pulse-dot" />
        Listings synced live with CRM
      </div>

    </div>
  );
}