import { useState } from 'react';
import {
  CATEGORIES,
  TOOL_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  AVAILABILITY_OPTIONS,
  SORT_OPTIONS,
} from '../../data/mockCreators.js';
import './CreatorFilters.css';

export default function CreatorFilters({
  filters,
  onChange,
  onReset,
  totalResults = 0,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleCategoryClick = (category) => {
    onChange({ ...filters, specialization: category });
  };

  const handleSelectChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const isFiltered =
    filters.search ||
    filters.specialization !== 'All' ||
    filters.tool !== 'All' ||
    filters.contentType !== 'All' ||
    filters.experience !== 'All' ||
    filters.availability !== 'All' ||
    filters.sortBy !== 'relevance';

  return (
    <div className="creator-filters">
      {/* 1. Prominent Search Bar */}
      <div className="creator-filters__search-bar">
        <div className="creator-filters__search-input-wrapper">
          <svg
            className="creator-filters__search-icon"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
            <path d="M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>

          <input
            type="text"
            className="creator-filters__search-input"
            placeholder="Search creators, skills, tools (e.g. Runway, Midjourney, Sci-Fi)..."
            value={filters.search}
            onChange={handleSearchChange}
            aria-label="Search creators by name, tool, or skill"
          />

          {filters.search && (
            <button
              type="button"
              className="creator-filters__clear-search"
              onClick={() => onChange({ ...filters, search: '' })}
              aria-label="Clear search input"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          )}
        </div>

        {/* Toggle Filters Button */}
        <button
          type="button"
          className={`creator-filters__toggle-btn ${showAdvanced ? 'creator-filters__toggle-btn--active' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="creator-filters__toggle-icon" aria-hidden="true">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h10a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span>Filters</span>
          {isFiltered && <span className="creator-filters__active-dot" aria-hidden="true" />}
        </button>

        {/* Sort Select */}
        <div className="creator-filters__sort-wrapper">
          <label htmlFor="sort-select" className="creator-filters__sort-label">Sort:</label>
          <select
            id="sort-select"
            className="creator-filters__select creator-filters__select--sort"
            value={filters.sortBy}
            onChange={(e) => handleSelectChange('sortBy', e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Category Chips Bar */}
      <div className="creator-filters__categories" role="tablist" aria-label="Creator categories">
        {CATEGORIES.map((cat) => {
          const isActive = filters.specialization === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`creator-filters__category-chip ${
                isActive ? 'creator-filters__category-chip--active' : ''
              }`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. Collapsible Filter Drawers */}
      {showAdvanced && (
        <div className="creator-filters__advanced-grid">
          {/* AI Tools */}
          <div className="creator-filters__field">
            <label className="creator-filters__field-label">AI Tool</label>
            <select
              className="creator-filters__select"
              value={filters.tool}
              onChange={(e) => handleSelectChange('tool', e.target.value)}
            >
              {TOOL_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Content Type */}
          <div className="creator-filters__field">
            <label className="creator-filters__field-label">Content Type</label>
            <select
              className="creator-filters__select"
              value={filters.contentType}
              onChange={(e) => handleSelectChange('contentType', e.target.value)}
            >
              {CONTENT_TYPE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div className="creator-filters__field">
            <label className="creator-filters__field-label">Experience</label>
            <select
              className="creator-filters__select"
              value={filters.experience}
              onChange={(e) => handleSelectChange('experience', e.target.value)}
            >
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="creator-filters__field">
            <label className="creator-filters__field-label">Availability</label>
            <select
              className="creator-filters__select"
              value={filters.availability}
              onChange={(e) => handleSelectChange('availability', e.target.value)}
            >
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 4. Active Filters Bar & Counter */}
      <div className="creator-filters__status-bar">
        <span className="creator-filters__count">
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'creator' : 'creators'}
          {filters.specialization !== 'All' && ` in ${filters.specialization}`}
        </span>

        {isFiltered && (
          <button
            type="button"
            className="creator-filters__reset-btn"
            onClick={onReset}
          >
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
