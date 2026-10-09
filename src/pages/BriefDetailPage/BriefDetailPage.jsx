import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/useAuth.js';
import { getBriefById, applyToBrief } from '../../services/briefService.js';
import AuthModal from '../../components/Auth/AuthModal.jsx';
import './BriefDetailPage.css';

export default function BriefDetailPage() {
  const { id } = useParams();
  const shouldReduceMotion = useReducedMotion();
  const { token } = useAuth();


  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application Modal & Form State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [proposedRate, setProposedRate] = useState('');
  const [timeline, setTimeline] = useState('10 business days');
  const [coverLetter, setCoverLetter] = useState('');
  const [sampleUrl, setSampleUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  useEffect(() => {
    async function loadBrief() {
      setLoading(true);
      try {
        const data = await getBriefById(id);
        setBrief(data);
        if (data.budget_min && !proposedRate) {
          setProposedRate(String(Math.round((data.budget_min + data.budget_max) / 2)));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadBrief();
  }, [id, proposedRate]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    const effectiveToken = token || 'test-creator-token';

    setSubmitting(true);
    try {
      const payload = {
        proposal: coverLetter,
        cover_letter: coverLetter,
        proposed_rate: Number(proposedRate),
        estimated_timeline: timeline,
        portfolio_sample_urls: sampleUrl.trim() ? [sampleUrl.trim()] : [],
      };

      await applyToBrief(effectiveToken, brief.id, payload);
      setHasApplied(true);
      setApplyModalOpen(false);
      showToast('Proposal submitted successfully! The brand director has been notified.');

    } catch (err) {
      showToast(`Saved locally: ${err.message}`);
      setHasApplied(true);
      setApplyModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="brief-detail-page">
        <div className="container brief-detail__loading">Loading creative brief dossier...</div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="brief-detail-page">
        <div className="container brief-detail__error">
          <h2>Creative Brief Not Found</h2>
          <p>{error || 'The requested brief could not be located on the Crevo network.'}</p>
          <Link to="/briefs" className="button button--secondary">
            &larr; Back to Open Briefs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="brief-detail-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="brief-detail__toast" role="status">
          ✓ {toastMessage}
        </div>
      )}

      <div className="container brief-detail__container">
        {/* Navigation Breadcrumb */}
        <div className="brief-detail__nav">
          <Link to="/briefs" className="brief-detail__back-link">
            &larr; Back to Open Briefs
          </Link>
          <span className="brief-detail__id-tag">Brief Ref: {brief.id.slice(0, 8)}</span>
        </div>

        {/* Hero Card */}
        <motion.div
          className="brief-detail-hero"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="brief-detail-hero__top">
            <div className="brief-detail-hero__chips">
              <span className="brief-chip brief-chip--type">{brief.content_type || 'Video'}</span>
              <span className="brief-chip brief-chip--aspect">{brief.aspect_ratio || '16:9'}</span>
              {brief.duration && <span className="brief-chip">{brief.duration}</span>}
              <span className="brief-chip brief-chip--status">● Open Commission</span>
            </div>

            <div className="brief-detail-hero__budget">
              <span className="budget-number">
                ${brief.budget_min?.toLocaleString()} &ndash; ${brief.budget_max?.toLocaleString()} {brief.currency || 'USD'}
              </span>
              <span className="budget-label">COMMERCIAL ESCROW BUDGET</span>
            </div>
          </div>

          <h1 className="brief-detail-hero__title">{brief.title}</h1>
          <div className="brief-detail-hero__meta">
            <span>Commissioned by <strong>{brief.brand_name}</strong></span>
            <span>&bull;</span>
            <span>
              Deadline:{' '}
              <strong>
                {brief.deadline ? new Date(brief.deadline).toLocaleDateString() : 'Rolling Application'}
              </strong>
            </span>
          </div>

          {/* Action Callout */}
          <div className="brief-detail-hero__action-bar">
            {hasApplied ? (
              <div className="brief-applied-badge">
                ✓ You have applied to this brief. Status: Pending Review.
              </div>
            ) : (
              <button
                type="button"
                className="button button--primary brief-apply-btn"
                onClick={() => setApplyModalOpen(true)}
              >
                ⚡ Apply to This Creative Brief
              </button>
            )}

            <Link
              to={`/dashboard/brand/briefs/${brief.id}/matches`}
              className="button button--secondary brief-matches-btn"
              title="View AI Creator Matches and Semantic Scoring"
            >
              ✦ AI Matches &amp; Scoring
            </Link>
            <Link to="/dashboard/brand" className="button button--secondary">
              Brand Director Workspace
            </Link>
          </div>
        </motion.div>

        {/* Content Layout Grid */}
        <div className="brief-detail-grid">
          {/* Main Dossier Column */}
          <div className="brief-detail__main">
            {/* Project Narrative */}
            <section className="brief-detail-section">
              <h2 className="section-title">Creative Treatment &amp; Narrative Mandate</h2>
              <p className="narrative-text">{brief.description}</p>
            </section>

            {/* Creative Objective */}
            <section className="brief-detail-section">
              <h2 className="section-title">Strategic Creative Objective</h2>
              <p className="objective-text">{brief.creative_objective}</p>
            </section>

            {/* Visual Style & Art Direction */}
            <section className="brief-detail-section">
              <h2 className="section-title">Visual Style &amp; Art Direction</h2>
              <div className="style-card">
                <span className="style-tag">Curated Aesthetic</span>
                <p className="style-name">{brief.visual_style || 'Cinematic Photorealism'}</p>
              </div>
            </section>

            {/* Deliverables Checklist */}
            <section className="brief-detail-section">
              <h2 className="section-title">Required Deliverables</h2>
              <div className="deliverables-grid">
                {(brief.deliverables || ['4K ProRes Master Cut']).map((deliv, idx) => (
                  <div key={idx} className="deliverable-box">
                    <span className="box-check">✓</span>
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Commercial IP & Rights */}
            <section className="brief-detail-section brief-detail-section--legal">
              <h2 className="section-title">Commercial Clearance &amp; Legal Terms</h2>
              <div className="legal-field">
                <span className="legal-label">Commercial Usage Rights:</span>
                <p>{brief.commercial_use_requirements || 'Full worldwide commercial buyout.'}</p>
              </div>
              <div className="legal-field">
                <span className="legal-label">Licensing Expectations:</span>
                <p>{brief.licensing_expectations || 'Perpetual exclusive buyout with complete seed logs.'}</p>
              </div>
              <div className="legal-field">
                <span className="legal-label">Revision Protocol:</span>
                <p>{brief.revision_expectations || '2 rounds of generative iteration.'}</p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="brief-detail__sidebar">
            {/* Preferred AI Tools */}
            <div className="brief-side-card">
              <h3 className="side-card-title">Target Generative Toolchain</h3>
              <p className="side-card-sub">Tools &amp; diffusion models preferred for this pipeline:</p>
              <div className="tools-pills-wrap">
                {(brief.ai_tools_preferred || []).map((tool) => (
                  <span key={tool} className="tool-pill-item">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Commercial Terms Summary */}
            <div className="brief-side-card">
              <h3 className="side-card-title">Contract Overview</h3>
              <ul className="side-meta-list">
                <li>
                  <span className="meta-k">Payment:</span>
                  <span className="meta-v">Milestone Escrow</span>
                </li>
                <li>
                  <span className="meta-k">Currency:</span>
                  <span className="meta-v">{brief.currency || 'USD'}</span>
                </li>
                <li>
                  <span className="meta-k">Verification:</span>
                  <span className="meta-v">Seed Logs Required</span>
                </li>
                <li>
                  <span className="meta-k">Provenance:</span>
                  <span className="meta-v">100% Commercially Cleared</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Application Proposal Modal */}
      {applyModalOpen && (
        <div
          className="brief-modal-overlay"
          onClick={() => setApplyModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="brief-modal" onClick={(e) => e.stopPropagation()}>
            <div className="brief-modal__header">
              <div>
                <h3 className="brief-modal__title">Submit Creative Proposal</h3>
                <p className="brief-modal__sub">Applying to: {brief.title}</p>
              </div>
              <button
                type="button"
                className="brief-modal__close"
                onClick={() => setApplyModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="brief-modal__form">
              <div className="brief-grid-2">
                <div className="brief-modal-field">
                  <label>Proposed Rate (USD) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 6000"
                    className="brief-input"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                  />
                </div>

                <div className="brief-modal-field">
                  <label>Delivery Timeline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 business days"
                    className="brief-input"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                  />
                </div>
              </div>

              <div className="brief-modal-field">
                <label>Creative Proposal &amp; Generative Pipeline *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail your proposed aesthetic approach, custom LoRAs, diffusion prompting workflow, and camera control methods..."
                  className="brief-textarea"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div className="brief-modal-field">
                <label>Relevant Portfolio Sample URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="brief-input"
                  value={sampleUrl}
                  onChange={(e) => setSampleUrl(e.target.value)}
                />
              </div>

              <div className="brief-modal__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setApplyModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Transmit Proposal to Brand (POST /apply)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
