"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(
    searchParams.get("keyword") || ""
  );

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );

  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || ""
  );

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    if (propertyType) {
      params.set("propertyType", propertyType);
    }

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form className="search-box" onSubmit={handleSearch}>

      <div className="search-field">
        <label>What are you looking for?</label>

        <input
          type="text"
          placeholder="Office, retail, warehouse..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="search-divider" />

      <div className="search-field">
        <label>Location</label>

        <input
          type="text"
          placeholder="City or micromarket"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="search-divider" />

      <div className="search-field search-type">
        <label>Property Type</label>

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        >
          <option value="">Any type</option>
          <option value="office">Office</option>
          <option value="retail">Retail</option>
          <option value="warehouse">Warehouse</option>
          <option value="land">Land</option>
        </select>
      </div>

      <button
        type="submit"
        className="search-button"
        aria-label="Search properties"
      >
        <Search size={20} />
        <span>Search</span>
      </button>

    </form>
  );
}