import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import ProjectModal from './ProjectModal.jsx';
import './PortfolioGrid.css';

/**
 * PortfolioGrid Component
 * Responsive masonry-style showcase for AI creators supporting videos,
 * animations, advertisements, and images with category tabs and project detail inspection.
 */
export default function PortfolioGrid({ items = [], creator }) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProject, setActiveProject] = useState(null);

  // Extract unique categories from items
  const categories = useMemo(() => {
    const set = new Set(['All']);
    items.forEach((item) => {
      if (item.type) set.add(item.type);
    });
    return Array.from(set);
  }, [items]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter((item) => item.type === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <section className="portfolio-gallery" aria-labelledby="portfolio-gallery-title">
      {/* Gallery Header & Filter Tabs */}
      <div className="portfolio-gallery__header">
        <div>
          <span className="portfolio-gallery__eyebrow">PORTFOLIO &amp; WORKFLOW ARCHIVE</span>
          <h3 id="portfolio-gallery-title" className="portfolio-gallery__title">
            Generative Works &amp; Case Studies
          </h3>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 2 && (
          <div className="portfolio-gallery__tabs" role="tablist" aria-label="Portfolio Categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`portfolio-gallery__tab ${selectedCategory === cat ? 'portfolio-gallery__tab--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                <span className="portfolio-gallery__tab-count">
                  {cat === 'All' ? items.length : items.filter((i) => i.type === cat).length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="portfolio-gallery__empty" role="status">
          <p>No projects found in this category.</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setSelectedCategory('All')}
          >
            Show All Projects
          </button>
        </div>
      ) : (
        <div className="portfolio-gallery__grid">
          {filteredItems.map((item, index) => {
            const isCommercial = Boolean(item.hasCommercialPermission);

            return (
              <motion.article
                key={item.id}
                className="portfolio-card"
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: shouldReduceMotion ? 0 : Math.min(index * 0.08, 0.4),
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                onClick={() => setActiveProject(item)}
              >
                {/* Visual Media Container */}
                <div className="portfolio-card__media">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="portfolio-card__image"
                    loading="lazy"
                  />
                  <div className="portfolio-card__scrim" />

                  {/* Top Badges */}
                  <div className="portfolio-card__badges">
                    <span className="portfolio-card__type-badge">
                      {item.mediaType === 'video' && '▶ Video'}
                      {item.mediaType === 'animation' && '⟳ Animation'}
                      {item.mediaType === 'ad' && '✦ Commercial'}
                      {item.mediaType === 'image' && '▨ Still Art'}
                    </span>

                    <span
                      className={`portfolio-card__license-badge ${
                        isCommercial
                          ? 'portfolio-card__license-badge--cleared'
                          : 'portfolio-card__license-badge--restricted'
                      }`}
                      title={
                        isCommercial
                          ? 'Commercial rights cleared by creator'
                          : 'Commercial rights not provided / personal study'
                      }
                    >
                      {isCommercial ? '✓ Cleared' : '⚠️ R&D Only'}
                    </span>
                  </div>

                  {/* Hover Inspect CTA Overlay */}
                  <div className="portfolio-card__hover-cta">
                    <span className="portfolio-card__inspect-pill">
                      Inspect Workflow &amp; Specs
                      <svg viewBox="0 0 16 16" fill="none" className="portfolio-card__arrow" aria-hidden="true">
                        <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="portfolio-card__body">
                  <div className="portfolio-card__meta">
                    <span className="portfolio-card__category">{item.type}</span>
                    <span className="portfolio-card__spec">{item.aspectRatio} • {item.duration}</span>
                  </div>

                  <h4 className="portfolio-card__title">{item.title}</h4>
                  <p className="portfolio-card__subtitle">{item.subtitle}</p>

                  {/* Tools preview pills */}
                  <div className="portfolio-card__tools">
                    {item.toolsUsed?.slice(0, 3).map((tool) => (
                      <span key={tool} className="portfolio-card__tool-chip">
                        {tool}
                      </span>
                    ))}
                    {item.toolsUsed?.length > 3 && (
                      <span className="portfolio-card__tool-chip portfolio-card__tool-chip--more">
                        +{item.toolsUsed.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {activeProject && (
        <ProjectModal
          project={activeProject}
          creator={creator}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  );
}
