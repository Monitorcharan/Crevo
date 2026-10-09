import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import './CreatorModal.css';

export default function CreatorModal({ creator, onClose }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [toastMessage, setToastMessage] = useState('');

  // Close on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!creator) return null;

  const isAvailable = creator.availabilityStatus === 'available';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <AnimatePresence>
      <div className="creator-modal-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="creator-modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-creator-name">
        <motion.div
          className="creator-modal"
          initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            className="creator-modal__close-btn"
            onClick={onClose}
            aria-label="Close creator profile"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Modal Header */}
          <header className="creator-modal__header">
            <div className="creator-modal__header-profile">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="creator-modal__avatar"
              />
              <div className="creator-modal__identity">
                <div className="creator-modal__name-row">
                  <h2 id="modal-creator-name" className="creator-modal__name">
                    {creator.name}
                  </h2>
                  <span className="creator-modal__verified" title="Verified AI Creator">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.146-2.854a.5.5 0 0 0-.708 0L6.5 9.793 4.854 8.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l5-5a.5.5 0 0 0 0-.708z" />
                    </svg>
                  </span>
                  <span
                    className={`creator-modal__avail-tag ${
                      isAvailable ? 'creator-modal__avail-tag--avail' : 'creator-modal__avail-tag--book'
                    }`}
                  >
                    <span className="creator-modal__avail-dot" aria-hidden="true" />
                    {creator.availability}
                  </span>
                </div>

                <p className="creator-modal__title">{creator.title}</p>
                <div className="creator-modal__tags-row">
                  <span className="creator-modal__meta-item">
                    📍 {creator.location}
                  </span>
                  <span className="creator-modal__meta-item">
                    ★ <strong>{creator.rating.toFixed(2)}</strong> ({creator.reviewsCount} reviews)
                  </span>
                  <span className="creator-modal__meta-item">
                    💼 {creator.projectsCount} completed briefs
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="creator-modal__header-actions">
              <button
                type="button"
                className="creator-modal__btn creator-modal__btn--primary"
                onClick={() => showToast(`Invitation sent to ${creator.name} for your brief!`)}
              >
                <span>Invite to Brief</span>
                <svg viewBox="0 0 16 16" fill="none" className="creator-modal__btn-icon">
                  <path d="M2 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="m2 4 6 5 6-5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>

              <button
                type="button"
                className="creator-modal__btn creator-modal__btn--secondary"
                onClick={() => showToast(`Direct messaging with ${creator.name} opened.`)}
              >
                Contact Creator
              </button>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="creator-modal__tabs" aria-label="Creator details tabs">
            <button
              type="button"
              className={`creator-modal__tab ${activeTab === 'portfolio' ? 'creator-modal__tab--active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio Gallery
            </button>
            <button
              type="button"
              className={`creator-modal__tab ${activeTab === 'workflow' ? 'creator-modal__tab--active' : ''}`}
              onClick={() => setActiveTab('workflow')}
            >
              Creative Workflow
            </button>
            <button
              type="button"
              className={`creator-modal__tab ${activeTab === 'tools' ? 'creator-modal__tab--active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              Tools & Skills
            </button>
            <button
              type="button"
              className={`creator-modal__tab ${activeTab === 'commercial' ? 'creator-modal__tab--active' : ''}`}
              onClick={() => setActiveTab('commercial')}
            >
              Commercial Terms
            </button>
          </nav>

          {/* Toast Notice */}
          {toastMessage && (
            <div className="creator-modal__toast" role="status">
              <span>✓ {toastMessage}</span>
            </div>
          )}

          {/* Tab 1: Portfolio Gallery */}
          {activeTab === 'portfolio' && (
            <div className="creator-modal__tab-content">
              <div className="creator-modal__portfolio-card">
                <div className="creator-modal__portfolio-media">
                  <img
                    src={creator.portfolio.image}
                    alt={creator.portfolio.title}
                    className="creator-modal__portfolio-img"
                  />
                  <div className="creator-modal__media-badge">
                    {creator.portfolio.aspectRatio} • {creator.portfolio.frameRate}
                  </div>
                </div>

                <div className="creator-modal__portfolio-info">
                  <span className="creator-modal__portfolio-kicker">
                    {creator.portfolio.subtitle}
                  </span>
                  <h3 className="creator-modal__portfolio-heading">
                    {creator.portfolio.title}
                  </h3>
                  <p className="creator-modal__portfolio-desc">
                    {creator.portfolio.description}
                  </p>

                  <div className="creator-modal__specs-grid">
                    <div className="creator-modal__spec">
                      <span className="creator-modal__spec-label">Primary Tool Stack</span>
                      <strong className="creator-modal__spec-val">{creator.portfolio.primaryModel}</strong>
                    </div>
                    <div className="creator-modal__spec">
                      <span className="creator-modal__spec-label">Deliverable Ratio</span>
                      <strong className="creator-modal__spec-val">{creator.portfolio.aspectRatio} Master</strong>
                    </div>
                    <div className="creator-modal__spec">
                      <span className="creator-modal__spec-label">Production Speed</span>
                      <strong className="creator-modal__spec-val">3–5 Business Days</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Statement */}
              <div className="creator-modal__bio-card">
                <h4 className="creator-modal__section-heading">Director's Overview</h4>
                <p className="creator-modal__full-bio">{creator.fullBio}</p>
              </div>
            </div>
          )}

          {/* Tab 2: Creative Workflow */}
          {activeTab === 'workflow' && (
            <div className="creator-modal__tab-content">
              <div className="creator-modal__workflow-intro">
                <h3 className="creator-modal__section-heading">
                  Transparent Creative Pipeline
                </h3>
                <p className="creator-modal__subtext">
                  How {creator.name} guides a brief from concept through final delivery with verifiable generative consistency.
                </p>
              </div>

              <div className="creator-modal__workflow-steps">
                {creator.workflow.map((step) => (
                  <div key={step.step} className="creator-modal__step-card">
                    <div className="creator-modal__step-number">0{step.step}</div>
                    <div className="creator-modal__step-body">
                      <h4 className="creator-modal__step-title">{step.title}</h4>
                      <p className="creator-modal__step-desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Tools & Skills */}
          {activeTab === 'tools' && (
            <div className="creator-modal__tab-content">
              <div className="creator-modal__tools-section">
                <h3 className="creator-modal__section-heading">Active AI Tool Stack</h3>
                <p className="creator-modal__subtext">
                  Primary generative engines, diffusion interfaces, and post-production software in regular production:
                </p>
                <div className="creator-modal__tool-tags">
                  {creator.tools.map((tool) => (
                    <div key={tool} className="creator-modal__tool-badge">
                      <span className="creator-modal__tool-icon">⚡</span>
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="creator-modal__skills-section">
                <h3 className="creator-modal__section-heading">Core Creative Competencies</h3>
                <div className="creator-modal__skill-chips">
                  {creator.skills.map((skill) => (
                    <span key={skill} className="creator-modal__skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Commercial Terms */}
          {activeTab === 'commercial' && (
            <div className="creator-modal__tab-content">
              <div className="creator-modal__commercial-card">
                <h3 className="creator-modal__section-heading">
                  Commercial Rights & IP Protection
                </h3>
                <p className="creator-modal__subtext">
                  All commissions executed via Crevo include certified legal provenance and guaranteed commercial indemnification.
                </p>

                <ul className="creator-modal__terms-list">
                  <li className="creator-modal__term-item">
                    <span className="creator-modal__term-check">✓</span>
                    <div>
                      <strong>Intellectual Property Buyout</strong>
                      <p>{creator.commercialTerms.rights}</p>
                    </div>
                  </li>
                  <li className="creator-modal__term-item">
                    <span className="creator-modal__term-check">✓</span>
                    <div>
                      <strong>Model Provenance & Compliance</strong>
                      <p>{creator.commercialTerms.compliance}</p>
                    </div>
                  </li>
                  <li className="creator-modal__term-item">
                    <span className="creator-modal__term-check">✓</span>
                    <div>
                      <strong>Revision Policy</strong>
                      <p>{creator.commercialTerms.revisions}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <footer className="creator-modal__footer">
            <div className="creator-modal__footer-pricing">
              <span className="creator-modal__footer-price-label">Baseline Engagement</span>
              <strong className="creator-modal__footer-price-val">
                ${creator.startingPrice.toLocaleString()} <span className="creator-modal__footer-unit">/{creator.priceUnit}</span>
              </strong>
            </div>

            <div className="creator-modal__footer-actions">
              <button
                type="button"
                className="creator-modal__btn creator-modal__btn--primary"
                onClick={() => showToast(`Invitation sent to ${creator.name}!`)}
              >
                Invite to Brief
              </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
