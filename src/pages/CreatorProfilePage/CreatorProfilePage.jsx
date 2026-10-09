import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { getCreatorById, toggleSaveCreator, isCreatorSaved } from '../../services/creatorService.js';
import PortfolioGrid from '../../components/Portfolio/PortfolioGrid.jsx';
import CreatorVerification from '../../components/Creators/CreatorVerification.jsx';
import InviteBriefModal from '../../components/Creators/InviteBriefModal.jsx';
import './CreatorProfilePage.css';

/**
 * CreatorProfilePage Component
 * Route: /creators/:id
 * Full, cinematic Creator Profile and AI Portfolio showcase.
 */
export default function CreatorProfilePage() {
  const { id } = useParams();
  const shouldReduceMotion = useReducedMotion();

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Load Creator
  useEffect(() => {
    let ignore = false;

    getCreatorById(id)
      .then((data) => {
        if (!ignore) {
          setCreator(data);
          setIsSaved(isCreatorSaved(data.id));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          setError(`Creator "${id}" could not be found.`);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  // Banner Parallax on mouse move
  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 16;
    const y = ((clientY - top) / height - 0.5) * 16;
    setMouseParallax({ x, y });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleSave = () => {
    if (!creator) return;
    const result = toggleSaveCreator(creator.id);
    setIsSaved(result.isSaved);
    showToast(
      result.isSaved
        ? `${creator.name} added to your saved creators shortlist`
        : `${creator.name} removed from saved creators`
    );
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Creator profile link copied to clipboard!');
    }
  };

  // Loading Skeleton State
  const isLoading = loading || (!error && (!creator || creator.id !== id));
  if (isLoading) {
    return (
      <div className="creator-profile-page creator-profile-page--loading" aria-busy="true">
        <div className="creator-profile-skeleton__banner" />
        <div className="container creator-profile-skeleton__content">
          <div className="creator-profile-skeleton__header-row">
            <div className="creator-profile-skeleton__avatar" />
            <div className="creator-profile-skeleton__info">
              <div className="creator-profile-skeleton__line creator-profile-skeleton__line--title" />
              <div className="creator-profile-skeleton__line creator-profile-skeleton__line--subtitle" />
              <div className="creator-profile-skeleton__line creator-profile-skeleton__line--badges" />
            </div>
          </div>
          <div className="creator-profile-skeleton__grid">
            <div className="creator-profile-skeleton__main" />
            <div className="creator-profile-skeleton__sidebar" />
          </div>
        </div>
      </div>
    );
  }

  // Error / 404 State
  if (error || !creator) {
    return (
      <div className="creator-profile-page creator-profile-page--error">
        <div className="container creator-profile__error-box" role="alert">
          <div className="creator-profile__error-icon">🔍</div>
          <h2 className="creator-profile__error-title">Creator Not Found</h2>
          <p className="creator-profile__error-desc">
            We couldn&apos;t find an active AI creator profile matching &quot;{id}&quot;.
          </p>
          <Link to="/#creators" className="button button--primary">
            Explore All AI Creators
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = creator.availabilityStatus === 'available';

  return (
    <div className="creator-profile-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="creator-profile__toast" role="status">
          <span className="creator-profile__toast-check">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Breadcrumb Bar */}
      <div className="creator-profile__nav-bar">
        <div className="container creator-profile__nav-inner">
          <Link to="/#creators" className="creator-profile__back-link">
            <svg viewBox="0 0 16 16" fill="none" className="creator-profile__back-icon" aria-hidden="true">
              <path d="M13 8H3m4-4-4 4 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to Marketplace</span>
          </Link>
          <div className="creator-profile__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="creator-profile__breadcrumb-sep">/</span>
            <Link to="/#creators">Creators</Link>
            <span className="creator-profile__breadcrumb-sep">/</span>
            <span className="creator-profile__breadcrumb-current">{creator.name}</span>
          </div>
        </div>
      </div>

      {/* Cinematic Banner with Gentle Parallax */}
      <section
        className="creator-profile__banner-section"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouseParallax({ x: 0, y: 0 })}
        aria-hidden="true"
      >
        <div
          className="creator-profile__banner-img-wrap"
          style={{
            transform: shouldReduceMotion
              ? 'none'
              : `translate3d(${mouseParallax.x}px, ${mouseParallax.y}px, 0) scale(1.04)`,
          }}
        >
          <img
            src={creator.coverImage}
            alt=""
            className="creator-profile__banner-img"
          />
        </div>
        <div className="creator-profile__banner-scrim" />
        <div className="creator-profile__banner-glow" />
      </section>

      {/* Main Profile Header Card */}
      <div className="container creator-profile__container">
        <motion.header
          className="creator-profile__header-card"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="creator-profile__identity-row">
            {/* Creator Avatar with Status Ring */}
            <div className="creator-profile__avatar-wrap">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="creator-profile__avatar"
              />
              <span
                className={`creator-profile__avatar-dot ${
                  isAvailable
                    ? 'creator-profile__avatar-dot--available'
                    : 'creator-profile__avatar-dot--booking'
                }`}
                title={creator.availability}
              />
            </div>

            {/* Core Info */}
            <div className="creator-profile__info">
              <div className="creator-profile__name-row">
                <h1 className="creator-profile__name">{creator.name}</h1>
                <span className="creator-profile__handle">{creator.handle}</span>

                {/* Demo Verified Badge */}
                <span
                  className="creator-profile__verified-badge"
                  title="Demo Verified Creator — Crevo Trust & Safety Layer"
                  aria-label="Demo Verified Creator"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="creator-profile__verified-icon" aria-hidden="true">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.146-2.854a.5.5 0 0 0-.708 0L6.5 9.793 4.854 8.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l5-5a.5.5 0 0 0 0-.708z" />
                  </svg>
                  <span>{creator.verification?.badgeLabel || 'Demo Verified'}</span>
                </span>
              </div>

              <p className="creator-profile__title">{creator.title}</p>

              {/* Badges and Metadata */}
              <div className="creator-profile__meta-row">
                <span className="creator-profile__meta-badge creator-profile__meta-badge--spec">
                  {creator.specialization}
                </span>

                <span
                  className={`creator-profile__meta-badge ${
                    isAvailable
                      ? 'creator-profile__meta-badge--available'
                      : 'creator-profile__meta-badge--booking'
                  }`}
                >
                  <span className="creator-profile__status-dot" aria-hidden="true" />
                  {creator.availability}
                </span>

                <span className="creator-profile__meta-item">
                  📍 {creator.location}
                </span>

                <span className="creator-profile__meta-item">
                  ★ <strong>{creator.rating.toFixed(2)}</strong> ({creator.reviewsCount} reviews)
                </span>

                <span className="creator-profile__meta-item">
                  💼 {creator.projectsCount} completed briefs
                </span>

                <span className="creator-profile__meta-item">
                  ⏳ {creator.experienceYears}+ years AI production
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="creator-profile__cta-bar">
            <button
              type="button"
              className="button button--primary creator-profile__btn-invite"
              onClick={() => setShowInviteModal(true)}
              aria-label={`Invite ${creator.name} to a creative brief`}
            >
              <span>Invite to Brief</span>
              <svg viewBox="0 0 16 16" fill="none" className="creator-profile__btn-icon" aria-hidden="true">
                <path d="M2 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" />
                <path d="m2 4 6 5 6-5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            <button
              type="button"
              className={`button creator-profile__btn-save ${
                isSaved ? 'creator-profile__btn-save--active' : 'button--secondary'
              }`}
              onClick={handleToggleSave}
              aria-label={isSaved ? `Unsave ${creator.name}` : `Save ${creator.name} to shortlist`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="creator-profile__save-icon"
                aria-hidden="true"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{isSaved ? 'Saved Creator' : 'Save Creator'}</span>
            </button>

            <button
              type="button"
              className="button button--secondary creator-profile__btn-share"
              onClick={handleShare}
              title="Share creator profile"
              aria-label="Share creator profile link"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="creator-profile__share-icon" aria-hidden="true">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </motion.header>

        {/* 2-Column Content Layout */}
        <div className="creator-profile__content-grid">
          {/* Main Column (Portfolio & Detailed Background) */}
          <main className="creator-profile__main-col">
            {/* AI Portfolio Gallery */}
            <PortfolioGrid
              items={creator.portfolioItems}
              creator={creator}
            />

            {/* Biography & Editorial Statement */}
            <section className="creator-profile__bio-section" aria-labelledby="bio-heading">
              <span className="creator-profile__section-eyebrow">DIRECTOR&apos;S DOSSIER</span>
              <h3 id="bio-heading" className="creator-profile__section-title">
                Biography &amp; Creative Practice
              </h3>
              <p className="creator-profile__bio-text">{creator.fullBio}</p>
            </section>

            {/* Creative Pipeline & Workflow */}
            <section className="creator-profile__workflow-section" aria-labelledby="workflow-heading">
              <span className="creator-profile__section-eyebrow">PRODUCTION INTEGRITY</span>
              <h3 id="workflow-heading" className="creator-profile__section-title">
                Verifiable Creative Pipeline
              </h3>
              <p className="creator-profile__section-subtext">
                How {creator.name} guides prompts and diffusion latents from concept through final delivery
                with reproducible consistency:
              </p>

              <div className="creator-profile__workflow-cards">
                {creator.workflow.map((step) => (
                  <div key={step.step} className="creator-profile__step-card">
                    <span className="creator-profile__step-num">0{step.step}</span>
                    <div className="creator-profile__step-body">
                      <h4 className="creator-profile__step-title">{step.title}</h4>
                      <p className="creator-profile__step-desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Sticky Sidebar (Verification, Tools, Skills, Hire Card) */}
          <aside className="creator-profile__sidebar-col" aria-label="Creator Specifications">
            {/* Creator Verification Card (Demo Data) */}
            <CreatorVerification
              verification={creator.verification}
              creatorName={creator.name}
            />

            {/* Direct Hire / Rate Card */}
            <div className="creator-profile__hire-card">
              <div className="creator-profile__hire-top">
                <span className="creator-profile__hire-label">Baseline Commission</span>
                <div className="creator-profile__hire-price">
                  <strong>${creator.startingPrice.toLocaleString()}</strong>
                  <span className="creator-profile__hire-unit">/{creator.priceUnit}</span>
                </div>
              </div>
              <p className="creator-profile__hire-meta">
                Estimated turnaround: <strong>3–7 business days</strong> depending on deliverable complexity.
              </p>
              <button
                type="button"
                className="button button--primary creator-profile__hire-btn"
                onClick={() => setShowInviteModal(true)}
              >
                Commission {creator.name}
              </button>
            </div>

            {/* AI Tool Stack */}
            <div className="creator-profile__sidebar-box">
              <h4 className="creator-profile__box-title">Active AI Tool Stack</h4>
              <p className="creator-profile__box-subtext">
                Generative models and production environments in daily rotation:
              </p>
              <div className="creator-profile__tools-list">
                {creator.tools.map((tool) => (
                  <div key={tool} className="creator-profile__tool-item">
                    <span className="creator-profile__tool-bolt">⚡</span>
                    <span className="creator-profile__tool-name">{tool}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Creative Competencies */}
            <div className="creator-profile__sidebar-box">
              <h4 className="creator-profile__box-title">Creative Competencies</h4>
              <div className="creator-profile__skills-cloud">
                {creator.skills.map((skill) => (
                  <span key={skill} className="creator-profile__skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Commercial Terms & IP Protection */}
            {creator.commercialTerms && (
              <div className="creator-profile__sidebar-box">
                <h4 className="creator-profile__box-title">Commercial IP Protection</h4>
                <ul className="creator-profile__terms-list">
                  <li className="creator-profile__term-row">
                    <span className="creator-profile__term-check">✓</span>
                    <div>
                      <strong>IP Buyout Included</strong>
                      <p>{creator.commercialTerms.rights}</p>
                    </div>
                  </li>
                  <li className="creator-profile__term-row">
                    <span className="creator-profile__term-check">✓</span>
                    <div>
                      <strong>Provenance &amp; Compliance</strong>
                      <p>{creator.commercialTerms.compliance}</p>
                    </div>
                  </li>
                  <li className="creator-profile__term-row">
                    <span className="creator-profile__term-check">✓</span>
                    <div>
                      <strong>Revision Rounds</strong>
                      <p>{creator.commercialTerms.revisions}</p>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Invite to Brief Dialog */}
      {showInviteModal && (
        <InviteBriefModal
          creator={creator}
          onClose={() => setShowInviteModal(false)}
          onInvitationSent={(briefTitle) => {
            setShowInviteModal(false);
            showToast(`Invitation dispatched to ${creator.name} for "${briefTitle}"!`);
          }}
        />
      )}
    </div>
  );
}
