'use client';

import { useEffect, useState } from 'react';

export default function SearchFilterBar({ activeCategory, onSearch, onCategory }) {
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    // Static categories for the auth-only backend variant
    setCategories(['All']);
  }, []);

  return (
    <div className="search-filter-bar">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="search"
          className="search-input"
          placeholder="Search models, providers, categories..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="filter-scroll">
        {categories.map((cat) => (
          <button key={cat} className={`filter-btn${activeCategory === cat ? ' active' : ''}`} onClick={() => onCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
