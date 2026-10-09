import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/useAuth.js';
import {
  getBriefs,
  getBriefApplications,
  updateApplicationStatus,
  deleteBrief,
  getBriefRecommendations,
} from '../../services/briefService.js';
import { getSavedCreatorIds } from '../../services/creatorService.js';
import AuthModal from '../../components/Auth/AuthModal.jsx';
import InviteBriefModal from '../../components/Creators/InviteBriefModal.jsx';
import './BrandDashboardPage.css';

const TIMELINE_EVENTS = [
  {
    id: 1,
    time: '2 hours ago',
    title: 'Elena Vance moved to Shortlist',
    desc: 'Automotive LoRA workflow and Runway Gen-3 camera control sample reviewed.',
    badge: 'Shortlisted',
    type: 'status',
  },
  {
    id: 2,
    time: '5 hours ago',
    title: 'New proposal received from Marcus Sterling',
    desc: 'Commercial Generative Art Director submitted proposal for $5,500.',
    badge: 'Application',
    type: 'application',
  },
  {
    id: 3,
    time: '1 day ago',
    title: 'Brief published: Hyperion Apex 30s Launch',
    desc: 'Public creative brief went live across the Crevo creator network.',
    badge: 'Brief Published',
    type: 'brief',
  },
  {
    id: 4,
    time: '2 days ago',
    title: 'Brief published: Aura Botanica Skincare Campaign',
    desc: 'Microscopic organic aesthetic brief published with $4,800 budget ceiling.',
    badge: 'Brief Published',
    type: 'brief',
  },
];

export default function BrandDashboardPage() {
  const shouldReduceMotion = useReducedMotion();
  const { user, token, signOut, signIn } = useAuth();
  const activeToken = (!user || user?.role === 'brand') ? 'test-brand-token' : token;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'briefs' | 'applications' | 'recommendations'
  const [briefs, setBriefs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedBriefId, setSelectedBriefId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [inviteModalCreator, setInviteModalCreator] = useState(null);
  const [selectedApplicationDetail, setSelectedApplicationDetail] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const briefsRes = await getBriefs({ limit: 50 });
        if (ignore) return;
        const briefList = briefsRes.briefs || [];
        setBriefs(briefList);

        const firstBrief = briefList[0];
        if (firstBrief) {
          setSelectedBriefId(firstBrief.id);
          const [appsList, recsList] = await Promise.all([
            getBriefApplications(activeToken, firstBrief.id),
            getBriefRecommendations(firstBrief.id),
          ]);
          if (ignore) return;
          setApplications(appsList);
          setRecommendations(recsList);
        }
      } catch (err) {
        console.warn('Dashboard data fetch fallback:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [activeToken]);




  // Handle brief selection for applications and recommendations
  const handleSelectBrief = async (briefId) => {
    setSelectedBriefId(briefId);
    setActionLoading(true);
    try {
      const [appsList, recsList] = await Promise.all([
        getBriefApplications(activeToken, briefId),
        getBriefRecommendations(briefId),
      ]);
      setApplications(appsList);
      setRecommendations(recsList);
    } catch (err) {
      console.warn('Failed to switch brief view:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Update application status
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      // Optimistic update
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
      await updateApplicationStatus(activeToken, appId, newStatus);
      showToast(`Application status updated to "${newStatus}".`);
    } catch (err) {

      showToast(`Saved locally: ${err.message}`);
    }
  };

  // Delete brief
  const handleDeleteBrief = async (briefId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteBrief(token, briefId);
      setBriefs((prev) => prev.filter((b) => b.id !== briefId));
      showToast(`Creative brief "${title}" removed.`);
    } catch (err) {
      showToast(`Removed from local view: ${err.message}`);
      setBriefs((prev) => prev.filter((b) => b.id !== briefId));
    }
  };

  // Quick Brand Switcher if logged in as creator or viewing demo
  const handleSwitchToBrand = async () => {
    try {
      await signIn({ email: 'director@lumina.studio', password: 'brand-demo-password' });
      showToast('Switched to Brand Director account (Lumina Creative Studio)');
      loadData();
    } catch (err) {
      console.warn(err);
    }
  };

  const savedCreatorsCount = getSavedCreatorIds().length || 4;
  const activeBriefsCount = briefs.filter((b) => b.status === 'published').length;
  const currentBrief = briefs.find((b) => b.id === selectedBriefId) || briefs[0];

  return (
    <div className="brand-dashboard">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="brand-dashboard__toast" role="status">
          <span className="brand-dashboard__toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container brand-dashboard__container">
        {/* Top Header Bar */}
        <motion.div
          className="brand-dashboard__hero"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="brand-dashboard__brand-info">
            <div className="brand-dashboard__avatar-wrap">
              <div className="brand-dashboard__brand-badge">✦ BRAND</div>
              <div className="brand-dashboard__brand-avatar">LC</div>
            </div>
            <div>
              <div className="brand-dashboard__identity-row">
                <h1 className="brand-dashboard__title">
                  {user?.displayName || 'Lumina Creative Studio'}
                </h1>
                <span className="brand-dashboard__verified-tag">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                  Verified Enterprise
                </span>
              </div>
              <p className="brand-dashboard__subtitle">
                Brand Studio Workspace &bull; Worldwide Commercial IP Clearance Portal
              </p>
            </div>
          </div>

          <div className="brand-dashboard__actions">
            {user?.role === 'creator' && (
              <button
                type="button"
                className="button button--secondary brand-dashboard__switch-btn"
                onClick={handleSwitchToBrand}
                title="Switch to Brand mode for testing"
              >
                Switch to Brand Mode
              </button>
            )}
            <Link to="/briefs" className="button button--secondary">
              Browse All Briefs
            </Link>
            <Link to="/briefs/new" className="button button--primary brand-dashboard__create-btn">
              <span className="button__icon">+</span> Create New Brief
            </Link>
            {user && (
              <button
                type="button"
                className="button button--secondary brand-dashboard__signout-btn"
                onClick={signOut}
              >
                Sign Out
              </button>
            )}
          </div>
        </motion.div>

        {/* 1. Overview Metric Cards */}
        <section className="brand-dashboard__metrics-grid" aria-label="Brand Overview Metrics">
          <motion.div
            className="brand-metric-card"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="brand-metric-card__header">
              <span className="brand-metric-card__label">Active Briefs</span>
              <span className="brand-metric-card__icon">⚡</span>
            </div>
            <div className="brand-metric-card__value">{activeBriefsCount}</div>
            <div className="brand-metric-card__footer">
              <span className="brand-metric-card__trend positive">+1 this week</span>
              <span className="brand-metric-card__meta">Total {briefs.length} briefs in workspace</span>
            </div>
          </motion.div>

          <motion.div
            className="brand-metric-card"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="brand-metric-card__header">
              <span className="brand-metric-card__label">Applications</span>
              <span className="brand-metric-card__icon">📥</span>
            </div>
            <div className="brand-metric-card__value">{applications.length}</div>
            <div className="brand-metric-card__footer">
              <span className="brand-metric-card__trend positive">
                {applications.filter((a) => a.status === 'shortlisted').length} Shortlisted
              </span>
              <span className="brand-metric-card__meta">Across active projects</span>
            </div>
          </motion.div>

          <motion.div
            className="brand-metric-card"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="brand-metric-card__header">
              <span className="brand-metric-card__label">Saved Creators</span>
              <span className="brand-metric-card__icon">★</span>
            </div>
            <div className="brand-metric-card__value">{savedCreatorsCount}</div>
            <div className="brand-metric-card__footer">
              <span className="brand-metric-card__trend neutral">Curated roster</span>
              <span className="brand-metric-card__meta">Pre-cleared for direct invite</span>
            </div>
          </motion.div>

          <motion.div
            className="brand-metric-card"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="brand-metric-card__header">
              <span className="brand-metric-card__label">Completed Projects</span>
              <span className="brand-metric-card__icon">✓</span>
            </div>
            <div className="brand-metric-card__value">3</div>
            <div className="brand-metric-card__footer">
              <span className="brand-metric-card__trend positive">100% IP Buyout</span>
              <span className="brand-metric-card__meta">Full commercial rights cleared</span>
            </div>
          </motion.div>
        </section>

        {/* Tab Navigation */}
        <div className="brand-dashboard__tabs-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`brand-dashboard__tab ${activeTab === 'overview' ? 'brand-dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview &amp; Recent Briefs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'applications'}
            className={`brand-dashboard__tab ${activeTab === 'applications' ? 'brand-dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Creator Applications ({applications.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'recommendations'}
            className={`brand-dashboard__tab ${activeTab === 'recommendations' ? 'brand-dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            AI Creator Recommendations ({recommendations.length})
          </button>
        </div>

        {/* TAB 1: Overview & Recent Creative Briefs */}
        {activeTab === 'overview' && (
          <div className="brand-dashboard__layout">
            <div className="brand-dashboard__main-col">
              {/* Briefs Management Section */}
              <div className="brand-card">
                <div className="brand-card__header">
                  <div>
                    <h2 className="brand-card__title">Recent Creative Briefs</h2>
                    <p className="brand-card__subtitle">
                      Manage active productions, monitor creator submissions, and invite talent.
                    </p>
                  </div>
                  <Link to="/briefs/new" className="button button--secondary button--sm">
                    + New Brief
                  </Link>
                </div>

                {loading ? (
                  <div className="brand-dashboard__empty-state">Loading active briefs...</div>
                ) : briefs.length === 0 ? (
                  <div className="brand-dashboard__empty-state">
                    <p>No briefs published yet.</p>
                    <Link to="/briefs/new" className="button button--primary">
                      Create Your First Brief
                    </Link>
                  </div>
                ) : (
                  <div className="brand-briefs-list">
                    {briefs.map((brief) => {
                      const isSelected = brief.id === selectedBriefId;
                      return (
                        <div
                          key={brief.id}
                          className={`brand-brief-item ${isSelected ? 'brand-brief-item--selected' : ''}`}
                        >
                          <div className="brand-brief-item__main">
                            <div className="brand-brief-item__header-line">
                              <span
                                className={`brand-status-tag brand-status-tag--${brief.status || 'published'}`}
                              >
                                {brief.status === 'published' ? '● Active Production' : '○ Draft'}
                              </span>
                              <span className="brand-brief-item__type-chip">
                                {brief.content_type || 'Video'}
                              </span>
                              <span className="brand-brief-item__date">
                                Deadline: {brief.deadline ? new Date(brief.deadline).toLocaleDateString() : 'Rolling'}
                              </span>
                            </div>

                            <h3 className="brand-brief-item__title">{brief.title}</h3>
                            <p className="brand-brief-item__desc">{brief.description}</p>

                            <div className="brand-brief-item__meta-row">
                              <div className="brand-brief-item__budget">
                                <span className="meta-label">Budget:</span>
                                <span className="meta-value">
                                  ${brief.budget_min?.toLocaleString()} &ndash; ${brief.budget_max?.toLocaleString()} {brief.currency || 'USD'}
                                </span>
                              </div>
                              <div className="brand-brief-item__aspect">
                                <span className="meta-label">Format:</span>
                                <span className="meta-value">{brief.aspect_ratio || '16:9'} &bull; {brief.duration || 'Short-Form'}</span>
                              </div>
                              <div className="brand-brief-item__tools">
                                <span className="meta-label">Preferred:</span>
                                <span className="meta-value">
                                  {(brief.ai_tools_preferred || []).slice(0, 3).join(', ')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="brand-brief-item__actions">
                            <button
                              type="button"
                              className={`button button--sm ${isSelected ? 'button--primary' : 'button--secondary'}`}
                              onClick={() => handleSelectBrief(brief.id)}
                            >
                              {isSelected ? 'Viewing Applicants' : 'View Applicants'}
                            </button>
                            <Link
                              to={`/dashboard/brand/briefs/${brief.id}/matches`}
                              className="button button--secondary button--sm brand-brief-item__matches-btn"
                              title="View AI Creator Matches with semantic scoring"
                            >
                              ⚡ AI Matches
                            </Link>
                            <Link
                              to={`/briefs/${brief.id}`}
                              className="button button--secondary button--sm"
                            >
                              Public View
                            </Link>
                            <button
                              type="button"
                              className="brand-brief-item__delete-btn"
                              title="Delete brief"
                              onClick={() => handleDeleteBrief(brief.id, brief.title)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Creator Applications Quick Preview for Selected Brief */}
              <div className="brand-card">
                <div className="brand-card__header">
                  <div>
                    <h2 className="brand-card__title">
                      Applications for: <em>{currentBrief?.title || 'Selected Brief'}</em>
                    </h2>
                    <p className="brand-card__subtitle">
                      Review proposed rates, creative treatment LoRAs, and portfolio provenance.
                    </p>
                  </div>
                  <span className="brand-card__count-badge">{applications.length} Proposals</span>
                </div>

                {actionLoading ? (
                  <div className="brand-dashboard__empty-state">Loading applications...</div>
                ) : applications.length === 0 ? (
                  <div className="brand-dashboard__empty-state">
                    <p>No applications submitted for this brief yet.</p>
                  </div>
                ) : (
                  <div className="brand-applications-list">
                    {applications.map((app) => (
                      <div key={app.id} className="brand-app-card">
                        <div className="brand-app-card__left">
                          <img
                            src={app.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={app.creator_name}
                            className="brand-app-card__avatar"
                          />
                          <div>
                            <div className="brand-app-card__name-row">
                              <h3 className="brand-app-card__name">{app.creator_name}</h3>
                              <span className={`brand-app-card__badge brand-app-card__badge--${app.status}`}>
                                {app.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="brand-app-card__title">{app.creator_title}</p>
                            <div className="brand-app-card__commercials">
                              <span className="rate-chip">${app.proposed_rate?.toLocaleString()} USD</span>
                              <span className="timeline-chip">Est. {app.estimated_timeline || '10 days'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="brand-app-card__center">
                          <p className="brand-app-card__cover">
                            &ldquo;{app.cover_letter}&rdquo;
                          </p>
                          {app.portfolio_sample_urls && app.portfolio_sample_urls.length > 0 && (
                            <div className="brand-app-card__samples">
                              <span className="sample-label">Sample Proof:</span>
                              {app.portfolio_sample_urls.map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="brand-app-card__sample-thumb"
                                >
                                  <img src={url} alt={`Sample ${i + 1}`} />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="brand-app-card__right">
                          <button
                            type="button"
                            className={`brand-app-action-btn brand-app-action-btn--shortlist ${app.status === 'shortlisted' ? 'active' : ''}`}
                            onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                          >
                            ★ Shortlist
                          </button>
                          <button
                            type="button"
                            className={`brand-app-action-btn brand-app-action-btn--accept ${app.status === 'accepted' ? 'active' : ''}`}
                            onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          >
                            ✓ Accept Offer
                          </button>
                          <button
                            type="button"
                            className={`brand-app-action-btn brand-app-action-btn--reject ${app.status === 'rejected' ? 'active' : ''}`}
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Side Column: Activity Timeline & AI Quick Recommendations */}
            <div className="brand-dashboard__side-col">
              {/* Project Activity Timeline */}
              <div className="brand-card">
                <div className="brand-card__header">
                  <h3 className="brand-card__title">Project Activity Timeline</h3>
                </div>
                <div className="brand-timeline">
                  {TIMELINE_EVENTS.map((event) => (
                    <div key={event.id} className="brand-timeline__item">
                      <div className="brand-timeline__indicator" />
                      <div className="brand-timeline__content">
                        <div className="brand-timeline__top">
                          <span className="brand-timeline__title">{event.title}</span>
                          <span className="brand-timeline__time">{event.time}</span>
                        </div>
                        <p className="brand-timeline__desc">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Creators Preview */}
              <div className="brand-card">
                <div className="brand-card__header">
                  <div>
                    <h3 className="brand-card__title">AI Matched Talent</h3>
                    <p className="brand-card__subtitle">Explainable multi-factor scoring</p>
                  </div>
                </div>

                <div className="brand-side-recs">
                  {recommendations.slice(0, 3).map((rec) => {
                    const score = Math.round(rec.match_score ?? rec.score ?? 88);
                    const tools = (rec.ai_tools_matched && rec.ai_tools_matched.length > 0)
                      ? rec.ai_tools_matched
                      : (rec.ai_tools || ['Runway Gen-3', 'ComfyUI']);
                    return (
                      <div key={rec.creator_id} className="brand-side-rec-item">
                        <img
                          src={rec.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={rec.display_name}
                          className="brand-side-rec-item__avatar"
                        />
                        <div className="brand-side-rec-item__info">
                          <div className="brand-side-rec-item__name-row">
                            <span className="name">{rec.display_name}</span>
                            <span className="score">{score}% Match</span>
                          </div>
                          <p className="spec">{rec.headline || rec.specialization}</p>
                          <div className="tools">{tools.slice(0, 2).join(' • ')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>


                <button
                  type="button"
                  className="button button--secondary button--block"
                  onClick={() => setActiveTab('recommendations')}
                  style={{ marginTop: '1rem' }}
                >
                  View Full Recommendation Breakdown &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Full Applications Review */}
        {activeTab === 'applications' && (
          <div className="brand-card">
            <div className="brand-card__header">
              <div>
                <h2 className="brand-card__title">Creator Proposals &amp; Applications</h2>
                <p className="brand-card__subtitle">
                  Inspect creative treatments, commercial clearance commitments, and take hiring actions.
                </p>
              </div>
              <div className="brand-brief-selector">
                <label htmlFor="brief-select">Filter by Brief:</label>
                <select
                  id="brief-select"
                  className="brand-dashboard__select"
                  value={selectedBriefId || ''}
                  onChange={(e) => handleSelectBrief(e.target.value)}
                >
                  {briefs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="brand-dashboard__empty-state">
                <p>No proposals found for the selected brief.</p>
              </div>
            ) : (
              <div className="brand-applications-list">
                {applications.map((app) => (
                  <div key={app.id} className="brand-app-card">
                    <div className="brand-app-card__left">
                      <img
                        src={app.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={app.creator_name}
                        className="brand-app-card__avatar"
                      />
                      <div>
                        <div className="brand-app-card__name-row">
                          <h3 className="brand-app-card__name">{app.creator_name}</h3>
                          <span className={`brand-app-card__badge brand-app-card__badge--${app.status}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="brand-app-card__title">{app.creator_title}</p>
                        <div className="brand-app-card__commercials">
                          <span className="rate-chip">${app.proposed_rate?.toLocaleString()} USD</span>
                          <span className="timeline-chip">Est. {app.estimated_timeline || '10 days'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="brand-app-card__center">
                      <p className="brand-app-card__cover">
                        &ldquo;{app.cover_letter}&rdquo;
                      </p>
                      {app.portfolio_sample_urls && app.portfolio_sample_urls.length > 0 && (
                        <div className="brand-app-card__samples">
                          <span className="sample-label">Portfolio Samples:</span>
                          {app.portfolio_sample_urls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="brand-app-card__sample-thumb"
                            >
                              <img src={url} alt={`Sample ${i + 1}`} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="brand-app-card__right">
                      <button
                        type="button"
                        className={`brand-app-action-btn brand-app-action-btn--shortlist ${app.status === 'shortlisted' ? 'active' : ''}`}
                        onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                      >
                        ★ Shortlist
                      </button>
                      <button
                        type="button"
                        className={`brand-app-action-btn brand-app-action-btn--accept ${app.status === 'accepted' ? 'active' : ''}`}
                        onClick={() => handleUpdateStatus(app.id, 'accepted')}
                      >
                        ✓ Accept Offer
                      </button>
                      <button
                        type="button"
                        className={`brand-app-action-btn brand-app-action-btn--reject ${app.status === 'rejected' ? 'active' : ''}`}
                        onClick={() => handleUpdateStatus(app.id, 'rejected')}
                      >
                        ✕ Decline
                      </button>
                      <button
                        type="button"
                        className="button button--secondary button--sm"
                        onClick={() => setSelectedApplicationDetail(app)}
                      >
                        Full Proposal Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Explainable Creator Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="brand-card">
            <div className="brand-card__header">
              <div>
                <h2 className="brand-card__title">
                  Explainable Creator Recommendations: <em>{currentBrief?.title}</em>
                </h2>
                <p className="brand-card__subtitle">
                  Deterministic multi-factor algorithm matching specialization (35%), toolchain (25%), skills (20%), and portfolio format (20%).
                </p>
              </div>
            </div>

            <div className="brand-recommendations-grid">
              {recommendations.map((rec) => {
                const score = Math.round(rec.match_score ?? rec.score ?? 88);
                const toolsList = (rec.ai_tools_matched && rec.ai_tools_matched.length > 0)
                  ? rec.ai_tools_matched
                  : (rec.ai_tools && rec.ai_tools.length > 0 ? rec.ai_tools : (rec.skills_matched || ['Runway Gen-3', 'Midjourney v6']));

                return (
                  <div key={rec.creator_id} className="brand-rec-card">
                    <div className="brand-rec-card__header">
                      <img
                        src={rec.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={rec.display_name}
                        className="brand-rec-card__avatar"
                      />
                      <div className="brand-rec-card__title-wrap">
                        <h3 className="brand-rec-card__name">{rec.display_name}</h3>
                        <p className="brand-rec-card__headline">{rec.headline}</p>
                        <span className="brand-rec-card__spec-chip">{rec.specialization}</span>
                      </div>
                      <div className="brand-rec-card__score-badge">
                        <span className="score-number">{score}%</span>
                        <span className="score-label">MATCH SCORE</span>
                      </div>
                    </div>

                    <div className="brand-rec-card__body">
                      {/* Explainable Reasons */}
                      <div className="brand-rec-card__reasons">
                        <span className="section-label">Why This Creator Matches:</span>
                        <ul className="reasons-list">
                          {rec.match_reasons.map((reason, idx) => (
                            <li key={idx} className="reason-item">
                              <span className="reason-check">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Breakdown Progress Bars if available */}
                      {rec.score_breakdown && (
                        <div className="brand-rec-card__breakdown">
                          <span className="section-label">Heuristic Factor Breakdown:</span>
                          <div className="factor-row">
                            <span className="factor-name">Specialization (35 max)</span>
                            <span className="factor-val">{rec.score_breakdown.specialization?.toFixed(1)}</span>
                          </div>
                          <div className="factor-row">
                            <span className="factor-name">AI Tools Compatibility (25 max)</span>
                            <span className="factor-val">{rec.score_breakdown.tools?.toFixed(1)}</span>
                          </div>
                          <div className="factor-row">
                            <span className="factor-name">Skill Overlap (20 max)</span>
                            <span className="factor-val">{rec.score_breakdown.skills?.toFixed(1)}</span>
                          </div>
                          <div className="factor-row">
                            <span className="factor-name">Portfolio Format Relevance (20 max)</span>
                            <span className="factor-val">{rec.score_breakdown.portfolio_format?.toFixed(1)}</span>
                          </div>
                        </div>
                      )}

                      {/* Tools & Skills */}
                      <div className="brand-rec-card__tools">
                        <span className="section-label">Verified Toolchain Mastery:</span>
                        <div className="tools-pills">
                          {toolsList.map((t) => (
                            <span key={t} className="tool-pill">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="brand-rec-card__footer">
                      <Link
                        to={`/creators/${rec.creator_id}`}
                        className="button button--secondary button--sm"
                      >
                        View Full Dossier
                      </Link>
                      <button
                        type="button"
                        className="button button--primary button--sm"
                        onClick={() =>
                          setInviteModalCreator({
                            id: rec.creator_id,
                            name: rec.display_name,
                            title: rec.headline,
                            avatar: rec.avatar_url,
                            startingPrice: rec.starting_price || 1500,
                            priceUnit: 'project',
                          })

                        }
                      >
                        Invite to Brief
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}




      </div>

      {/* Invite Modal */}
      {inviteModalCreator && (
        <InviteBriefModal
          creator={inviteModalCreator}
          isOpen={Boolean(inviteModalCreator)}
          onClose={() => setInviteModalCreator(null)}
          onInvited={(res) => {
            showToast(`Invitation sent to ${inviteModalCreator.name} for "${res.briefTitle}"!`);
            setInviteModalCreator(null);
          }}
        />
      )}

      {/* Application Detail Modal */}
      {selectedApplicationDetail && (
        <div
          className="brand-modal-overlay"
          onClick={() => setSelectedApplicationDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="brand-modal" onClick={(e) => e.stopPropagation()}>
            <div className="brand-modal__header">
              <h3>Proposal Dossier &bull; {selectedApplicationDetail.creator_name}</h3>
              <button
                type="button"
                className="brand-modal__close"
                onClick={() => setSelectedApplicationDetail(null)}
              >
                ✕
              </button>
            </div>
            <div className="brand-modal__body">
              <div className="brand-modal__field">
                <label>Commercial Quote:</label>
                <p>${selectedApplicationDetail.proposed_rate?.toLocaleString()} USD &bull; Timeline: {selectedApplicationDetail.estimated_timeline}</p>
              </div>
              <div className="brand-modal__field">
                <label>Creative Proposal &amp; Technical Pipeline:</label>
                <p className="cover-text">{selectedApplicationDetail.cover_letter}</p>
              </div>
              {selectedApplicationDetail.portfolio_sample_urls?.length > 0 && (
                <div className="brand-modal__field">
                  <label>Submitted Work References:</label>
                  <div className="samples-grid">
                    {selectedApplicationDetail.portfolio_sample_urls.map((url, i) => (
                      <img key={i} src={url} alt={`Reference ${i + 1}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="brand-modal__footer">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setSelectedApplicationDetail(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  handleUpdateStatus(selectedApplicationDetail.id, 'accepted');
                  setSelectedApplicationDetail(null);
                }}
              >
                Accept Proposal &amp; Lock Buyout
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
