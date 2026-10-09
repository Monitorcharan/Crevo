import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import InviteBriefModal from '../Creators/InviteBriefModal.jsx';
import './ProjectModal.css';

/**
 * ProjectModal Component
 * In-depth portfolio piece inspection modal showing technical provenance,
 * human vs machine contributions, deliverables, and verified commercial licensing.
 */
export default function ProjectModal({ project, creator, onClose }) {
  const shouldReduceMotion = useReducedMotion();
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Close on Escape & Lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !showInviteModal) {
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
  }, [onClose, showInviteModal]);

  if (!project) return null;

  const isCommercial = Boolean(project.hasCommercialPermission);

  const handleCopySpecs = () => {
    const text = `Project: ${project.title}\nTools: ${project.toolsUsed.join(', ')}\nParams: ${project.generationParams || 'N/A'}`;
    navigator.clipboard?.writeText(text);
    setToastMessage('Technical specs copied to clipboard!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <>
      <AnimatePresence>
        <div className="project-modal-backdrop" onClick={onClose} aria-hidden="true" />

        <div
          className="project-modal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
        >
          <motion.div
            className="project-modal"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="project-modal__close-btn"
              onClick={onClose}
              aria-label="Close project view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Media Hero Showcase */}
            <div className="project-modal__media-showcase">
              <div className="project-modal__media-frame">
                <img
                  src={project.image}
                  alt={project.title}
                  className={`project-modal__media-image ${isPlayingPreview ? 'project-modal__media-image--simulating' : ''}`}
                />

                {/* Media Scrim & Controls */}
                <div className="project-modal__media-overlay">
                  {/* Top Badges */}
                  <div className="project-modal__media-top-badges">
                    <span className="project-modal__media-badge project-modal__media-badge--type">
                      {project.mediaType === 'video' && '▶ Cinematic Video'}
                      {project.mediaType === 'animation' && '⟳ AI Animation'}
                      {project.mediaType === 'ad' && '✦ Commercial Spot'}
                      {project.mediaType === 'image' && '▨ Fine Art Still'}
                    </span>
                    <span className="project-modal__media-badge">
                      {project.aspectRatio} • {project.duration}
                    </span>
                  </div>

                  {/* Play Simulation Button for Video/Animation */}
                  {(project.mediaType === 'video' || project.mediaType === 'animation' || project.mediaType === 'ad') && (
                    <button
                      type="button"
                      className={`project-modal__play-btn ${isPlayingPreview ? 'project-modal__play-btn--active' : ''}`}
                      onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                      aria-label={isPlayingPreview ? 'Pause preview' : 'Play high-resolution preview sequence'}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="project-modal__play-icon" aria-hidden="true">
                        {isPlayingPreview ? (
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        ) : (
                          <path d="M8 5v14l11-7z" />
                        )}
                      </svg>
                      <span>{isPlayingPreview ? 'Simulating 4K Sequence' : 'Play Sequence Preview'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="project-modal__content">
              {/* Toast Notification */}
              {toastMessage && (
                <div className="project-modal__toast" role="status">
                  ✓ {toastMessage}
                </div>
              )}

              {/* Header Title Section */}
              <div className="project-modal__header">
                <div className="project-modal__header-main">
                  <div className="project-modal__meta-tags">
                    <span className="project-modal__kicker">{project.subtitle}</span>
                    <span className="project-modal__year">{project.year}</span>
                  </div>
                  <h2 id="project-modal-title" className="project-modal__title">
                    {project.title}
                  </h2>
                </div>

                <div className="project-modal__actions">
                  <button
                    type="button"
                    className="button button--secondary project-modal__btn-secondary"
                    onClick={handleCopySpecs}
                    title="Copy technical specifications"
                  >
                    Copy Specs
                  </button>
                  <button
                    type="button"
                    className="button button--primary project-modal__btn-primary"
                    onClick={() => setShowInviteModal(true)}
                  >
                    Invite to Similar Brief
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="project-modal__description">{project.description}</p>

              {/* Deep Dive Grid: AI Tools vs Human Contribution */}
              <div className="project-modal__grid">
                {/* Column 1: AI Tools & Generative Stack */}
                <div className="project-modal__card">
                  <div className="project-modal__card-header">
                    <span className="project-modal__card-icon">⚡</span>
                    <h3 className="project-modal__card-title">AI Tools &amp; Model Architecture</h3>
                  </div>
                  <div className="project-modal__tools-chips">
                    {project.toolsUsed.map((tool) => (
                      <span key={tool} className="project-modal__tool-chip">
                        {tool}
                      </span>
                    ))}
                  </div>

                  {project.generationParams && (
                    <div className="project-modal__params-block">
                      <span className="project-modal__params-label">Synthesis Parameters</span>
                      <code className="project-modal__params-code">
                        {project.generationParams}
                      </code>
                    </div>
                  )}

                  <div className="project-modal__subcard">
                    <h4 className="project-modal__subcard-title">Generative Pipeline</h4>
                    <p className="project-modal__subcard-text">{project.workflow}</p>
                  </div>
                </div>

                {/* Column 2: Human Creative Contribution */}
                <div className="project-modal__card project-modal__card--human">
                  <div className="project-modal__card-header">
                    <span className="project-modal__card-icon">🧠</span>
                    <h3 className="project-modal__card-title">Human Creative Contribution</h3>
                  </div>
                  <p className="project-modal__human-text">
                    {project.humanContribution}
                  </p>

                  <div className="project-modal__deliverables-section">
                    <h4 className="project-modal__subcard-title">Deliverables &amp; Master Formats</h4>
                    <div className="project-modal__deliverables-list">
                      {project.deliverables.map((item) => (
                        <div key={item} className="project-modal__deliverable-item">
                          <svg viewBox="0 0 12 12" fill="none" className="project-modal__deliv-check" aria-hidden="true">
                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commercial Use and Licensing Section */}
              <div className={`project-modal__licensing-card ${isCommercial ? 'project-modal__licensing-card--cleared' : 'project-modal__licensing-card--restricted'}`}>
                <div className="project-modal__licensing-header">
                  <div className="project-modal__licensing-badge">
                    {isCommercial ? (
                      <>
                        <span className="project-modal__license-dot project-modal__license-dot--green" aria-hidden="true" />
                        <span>Commercial Rights Cleared</span>
                      </>
                    ) : (
                      <>
                        <span className="project-modal__license-dot project-modal__license-dot--amber" aria-hidden="true" />
                        <span>Commercial Rights Not Cleared</span>
                      </>
                    )}
                  </div>
                  <span className="project-modal__licensing-note">
                    {isCommercial ? 'Commercially Safe for Brand Commissions' : 'Personal R&D / Disclosed by Creator'}
                  </span>
                </div>

                <div className="project-modal__licensing-body">
                  <p className="project-modal__licensing-statement">
                    {project.commercialLicense}
                  </p>
                  {!isCommercial && (
                    <div className="project-modal__non-commercial-alert" role="alert">
                      <strong>Policy Notice:</strong> Crevo does not claim commercial-use permissions for pieces
                      without explicit creator clearance. To utilize this concept or technique for commercial branding,
                      you must invite {creator?.name || 'the creator'} to negotiate a licensed commissioned brief.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Sub-modal: Invite to Brief */}
      {showInviteModal && creator && (
        <InviteBriefModal
          creator={creator}
          onClose={() => setShowInviteModal(false)}
          onInvitationSent={(briefTitle) => {
            setShowInviteModal(false);
            setToastMessage(`Invitation dispatched to ${creator.name} for "${briefTitle}"!`);
            setTimeout(() => setToastMessage(''), 4000);
          }}
        />
      )}
    </>
  );
}
