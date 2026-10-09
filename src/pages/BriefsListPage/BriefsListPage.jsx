import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { getBriefs } from '../../services/briefService.js';
import './BriefsListPage.css';

const CATEGORIES = ['All', 'Video', 'Animation', 'Advertisement', 'Image', 'Graphic Design'];

export default function BriefsListPage() {
  const shouldReduceMotion = useReducedMotion();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'budget' | 'deadline'

  useEffect(() => {
    async function fetchBriefs() {
      setLoading(true);
      try {
        const res = await getBriefs({ status: 'published', limit: 50 });
        setBriefs(res.briefs || []);
      } catch (err) {
        console.warn('Failed to fetch briefs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBriefs();
  }, []);

  // Filter & Sort
  const filteredBriefs = briefs
    .filter((b) => {
      if (selectedCategory !== 'All' && b.content_type !== selectedCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchDesc = b.description?.toLowerCase().includes(q);
        const matchBrand = b.brand_name?.toLowerCase().includes(q);
        const matchTools = (b.ai_tools_preferred || []).some((t) => t.toLowerCase().includes(q));
        const matchStyle = b.visual_style?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchBrand || matchTools || matchStyle;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'budget') {
        return (b.budget_max || 0) - (a.budget_max || 0);
      }
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  return (
    <div className="briefs-list-page">
      <div className="container briefs-list__container">
        {/* Hero Section */}
        <motion.div
          className="briefs-list__hero"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="briefs-list__badge">⚡ OPEN COMMISSIONS &amp; COMMERCIAL BRIEFS</div>
          <h1 className="briefs-list__title">Explore Active AI Creative Briefs</h1>
          <p className="briefs-list__subtitle">
            Directly pitch enterprise brands with your custom LoRAs, generative toolchains, and cinematic workflows.
            Guaranteed commercial rights agreements and milestone escrow.
          </p>
        </motion.div>

        {/* Filter Bar */}
        <div className="briefs-filter-bar">
          <div className="briefs-filter-bar__search">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18" className="search-icon">
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.75" />
              <path d="M13.2 13.2L17.5 17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search briefs by title, brand, AI tools, or visual aesthetic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="briefs-filter-bar__sort">
            <label htmlFor="briefs-sort-select">Sort by:</label>
            <select
              id="briefs-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="briefs-select"
            >
              <option value="newest">Newest Releases</option>
              <option value="budget">Highest Budget</option>
              <option value="deadline">Soonest Deadline</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="briefs-categories-row" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Briefs Grid */}
        {loading ? (
          <div className="briefs-list__loading">Loading active briefs from Crevo network...</div>
        ) : filteredBriefs.length === 0 ? (
          <div className="briefs-list__empty">
            <h3>No creative briefs found</h3>
            <p>Try refining your search keyword or switching category filters.</p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="briefs-grid">
            {filteredBriefs.map((brief) => (
              <motion.div
                key={brief.id}
                className="brief-card"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="brief-card__top">
                  <div className="brief-card__tags">
                    <span className="type-badge">{brief.content_type || 'Video'}</span>
                    <span className="aspect-badge">{brief.aspect_ratio || '16:9'}</span>
                    {brief.duration && <span className="duration-badge">{brief.duration}</span>}
                  </div>
                  <div className="brief-card__budget">
                    ${brief.budget_min?.toLocaleString()} &ndash; ${brief.budget_max?.toLocaleString()}
                    <span className="currency"> {brief.currency || 'USD'}</span>
                  </div>
                </div>

                <h2 className="brief-card__title">
                  <Link to={`/briefs/${brief.id}`}>{brief.title}</Link>
                </h2>
                <div className="brief-card__brand">Commissioned by {brief.brand_name}</div>

                <p className="brief-card__desc">{brief.description}</p>

                {/* Style and Tools */}
                <div className="brief-card__details">
                  <div className="detail-line">
                    <span className="detail-label">Visual Style:</span>
                    <span className="detail-val">{brief.visual_style}</span>
                  </div>
                  <div className="detail-line">
                    <span className="detail-label">Preferred Toolchain:</span>
                    <div className="detail-tools">
                      {(brief.ai_tools_preferred || []).slice(0, 3).map((tool) => (
                        <span key={tool} className="tool-chip">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="brief-card__footer">
                  <div className="brief-card__deadline">
                    <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                      <path d="M8 3.5a.5.5 0 00-1 0V8a.5.5 0 00.252.434l3.5 2a.5.5 0 00.496-.868L8 7.71V3.5z" />
                      <path d="M8 16A8 8 0 108 0a8 8 0 000 16zm0-1A7 7 0 118 2a7 7 0 010 14z" />
                    </svg>
                    <span>
                      {brief.deadline
                        ? `Deadline: ${new Date(brief.deadline).toLocaleDateString()}`
                        : 'Open Submission'}
                    </span>
                  </div>

                  <Link to={`/briefs/${brief.id}`} className="button button--primary button--sm">
                    View Brief &amp; Apply &rarr;
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
