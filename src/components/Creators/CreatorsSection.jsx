import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getCreators } from '../../services/creatorService.js';
import CreatorCard from './CreatorCard.jsx';
import CreatorFilters from './CreatorFilters.jsx';
import './CreatorsSection.css';

const DEFAULT_FILTERS = {
  search: '',
  specialization: 'All',
  tool: 'All',
  contentType: 'All',
  experience: 'All',
  availability: 'All',
  sortBy: 'relevance',
};

export default function CreatorsSection() {
  const shouldReduceMotion = useReducedMotion();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await getCreators(filters);
        if (!ignore) {
          setCreators(data.creators);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load creators:', err);
          setError('Unable to load creators right now. Please try again.');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [filters, reloadTrigger]);

  const handleFiltersChange = (newFilters) => {
    setLoading(true);
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setLoading(true);
    setFilters(DEFAULT_FILTERS);
  };

  const handleRetry = () => {
    setLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <section id="creators" className="creators-section" aria-labelledby="creators-title">
      {/* Background Ambience mesh */}
      <div className="creators-section__ambient" aria-hidden="true">
        <div className="creators-section__glow creators-section__glow--top" />
        <div className="creators-section__glow creators-section__glow--right" />
      </div>

      <div className="container creators-section__container">
        {/* Section Header */}
        <motion.div
          className="creators-section__header"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="eyebrow creators-section__eyebrow">
            MARKETPLACE — VERIFIED AI DIRECTORS, ARTISTS & ANIMATORS
          </div>

          <h2 id="creators-title" className="creators-section__title">
            Discover extraordinary <em>AI talent.</em>
          </h2>

          <p className="creators-section__description">
            Connect directly with specialized generative creators. Evaluate authentic AI-native portfolios
            with full workflow transparency, model provenance, and guaranteed commercial IP rights.
          </p>
        </motion.div>

        {/* Discovery Filter Controls */}
        <CreatorFilters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
          totalResults={creators.length}
        />

        {/* Dynamic Content Views */}
        {loading ? (
          /* Loading Skeletons State */
          <div className="creators-section__grid" aria-busy="true" aria-label="Loading creators">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="creator-card-skeleton" aria-hidden="true">
                <div className="creator-card-skeleton__media" />
                <div className="creator-card-skeleton__body">
                  <div className="creator-card-skeleton__avatar-row">
                    <div className="creator-card-skeleton__avatar" />
                    <div className="creator-card-skeleton__lines">
                      <div className="creator-card-skeleton__line creator-card-skeleton__line--title" />
                      <div className="creator-card-skeleton__line creator-card-skeleton__line--sub" />
                    </div>
                  </div>
                  <div className="creator-card-skeleton__line creator-card-skeleton__line--bio" />
                  <div className="creator-card-skeleton__line creator-card-skeleton__line--tools" />
                  <div className="creator-card-skeleton__footer" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="creators-section__error" role="alert">
            <div className="creators-section__error-icon">⚠️</div>
            <h3 className="creators-section__error-title">Something went wrong</h3>
            <p className="creators-section__error-desc">{error}</p>
            <button
              type="button"
              className="button button--primary"
              onClick={handleRetry}
            >
              Try Again
            </button>
          </div>
        ) : creators.length === 0 ? (
          /* Empty Results State */
          <div className="creators-section__empty" role="status">
            <div className="creators-section__empty-icon">🔍</div>
            <h3 className="creators-section__empty-title">No creators found</h3>
            <p className="creators-section__empty-desc">
              We couldn't find any creators matching your current filters. Try expanding your search terms
              or reset filters to view all available talent.
            </p>
            <button
              type="button"
              className="button button--primary"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Creators Grid */
          <div className="creators-section__grid">
            {creators.map((creator, idx) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
