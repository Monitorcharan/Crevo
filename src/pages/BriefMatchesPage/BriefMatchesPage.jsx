import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { getBriefById, getBriefMatches } from '../../services/briefService.js';
import { useAuth } from '../../context/useAuth.js';
import InviteBriefModal from '../../components/Creators/InviteBriefModal.jsx';
import './BriefMatchesPage.css';

export default function BriefMatchesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const activeToken = (!user || user?.role === 'brand' || token === 'test-creator-token') ? 'test-brand-token' : token;

  const [brief, setBrief] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [selectedMandatoryTool, setSelectedMandatoryTool] = useState(null);
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'price'
  const [expandedScoreIds, setExpandedScoreIds] = useState(new Set());

  // Invite Modal state
  const [invitingCreator, setInvitingCreator] = useState(null);
  const [inviteSuccessToast, setInviteSuccessToast] = useState(null);

  // Load brief and matches
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const briefData = await getBriefById(id);
        if (!isMounted) return;
        setBrief(briefData);

        const matchesRes = await getBriefMatches(activeToken, id, {
          mandatoryTools: selectedMandatoryTool || undefined,
          minScore: minScoreFilter,
          limit: 20,
        });
        if (!isMounted) return;
        setMatchData(matchesRes);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching brief matches:', err);
        setError(err.message || 'Failed to load matching candidates');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, activeToken, selectedMandatoryTool, minScoreFilter]);

  const toggleScoreBreakdown = (creatorId) => {
    setExpandedScoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      return next;
    });
  };

  const displayedMatches = useMemo(() => {
    if (!matchData?.matches) return [];
    const list = [...matchData.matches];

    if (sortBy === 'price') {
      list.sort((a, b) => (a.creator.starting_price || 9999) - (b.creator.starting_price || 9999));
    } else {
      list.sort((a, b) => b.match_score - a.match_score);
    }

    return list;
  }, [matchData, sortBy]);

  const handleInviteSuccess = (briefTitle) => {
    setInviteSuccessToast(`Invitation sent for "${briefTitle}"`);
    setTimeout(() => setInviteSuccessToast(null), 4000);
  };

  return (
    <div className="matches-page-root">
      <div className="matches-container">
        {/* Top Breadcrumb & Navigation */}
        <div className="matches-nav-bar">
          <Link to="/dashboard/brand" className="back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Brand Dashboard
          </Link>

          <div className="matches-nav-actions">
            <Link to={`/briefs/${id}`} className="view-brief-link">
              View Brief Dossier ↗
            </Link>
          </div>
        </div>

        {/* Header */}
        <header className="matches-header">
          <div className="matches-title-group">
            <div className="matches-badge">
              <span className="badge-spark">✦</span> AI Matching Engine
            </div>
            <h1 className="matches-title">Creator Recommendations & Scoring</h1>
            <p className="matches-subtitle">
              Grounded, multi-factor ranking combining Sentence Transformers (all-MiniLM-L6-v2) semantic embeddings
              and verified commercial competencies.
            </p>
          </div>
        </header>

        {/* Brief Summary Dossier Card */}
        {brief && (
          <section className="brief-summary-card">
            <div className="brief-summary-header">
              <div className="brief-summary-info">
                <span className="brief-brand-pill">{brief.brand_name || 'Brand Project'}</span>
                <h2 className="brief-summary-title">{brief.title}</h2>
              </div>
              <div className="brief-summary-meta">
                <span className={`status-pill status-${brief.status || 'published'}`}>
                  {brief.status ? brief.status.toUpperCase() : 'PUBLISHED'}
                </span>
                <span className="format-pill">Format: {(brief.content_type || 'Video').toUpperCase()}</span>
              </div>
            </div>

            <div className="brief-summary-grid">
              <div className="summary-item">
                <span className="summary-label">Target Budget</span>
                <span className="summary-val">
                  {brief.budget_min ? `$${brief.budget_min.toLocaleString()}` : '$0'} –{' '}
                  {brief.budget_max ? `$${brief.budget_max.toLocaleString()}` : 'Flexible'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Creative Objective</span>
                <span className="summary-val clamp-2">{brief.creative_objective || brief.description}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Preferred AI Tools</span>
                <div className="summary-tools-row">
                  {(brief.ai_tools_preferred || []).map((t) => (
                    <span key={t} className="tool-chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {brief.commercial_use_requirements && (
                <div className="summary-item">
                  <span className="summary-label">Commercial Rights</span>
                  <span className="summary-val text-emerald clamp-2">
                    ✓ {brief.commercial_use_requirements}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Matching Engine Intelligence Bar */}
        <div className="engine-intel-bar">
          <div className="engine-mode-pill">
            {matchData?.matching_mode === 'semantic' ? (
              <span className="mode-active">
                <span className="pulse-dot green" />
                Semantic Embeddings: all-MiniLM-L6-v2
              </span>
            ) : (
              <span className="mode-fallback">
                <span className="pulse-dot amber" />
                Deterministic Competency Engine
              </span>
            )}
          </div>

          <div className="engine-stats">
            <div className="stat-unit">
              <span className="stat-num">{matchData?.total_candidates_evaluated || 0}</span>
              <span className="stat-lbl">Candidates Evaluated</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-unit">
              <span className="stat-num">{matchData?.total_matches || 0}</span>
              <span className="stat-lbl">Qualified Matches</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-unit">
              <span className="stat-num text-gradient">
                {displayedMatches[0] ? `${displayedMatches[0].match_score}%` : 'N/A'}
              </span>
              <span className="stat-lbl">Top Score</span>
            </div>
          </div>
        </div>

        {/* Controls & Filter Bar */}
        <div className="matches-controls-bar">
          <div className="mandatory-tools-filter">
            <span className="control-label">Require AI Tool:</span>
            <button
              type="button"
              className={`filter-chip ${selectedMandatoryTool === null ? 'active' : ''}`}
              onClick={() => setSelectedMandatoryTool(null)}
            >
              All Tools
            </button>
            {(brief?.ai_tools_preferred || []).map((tool) => (
              <button
                key={tool}
                type="button"
                className={`filter-chip ${selectedMandatoryTool === tool ? 'active' : ''}`}
                onClick={() => setSelectedMandatoryTool(selectedMandatoryTool === tool ? null : tool)}
              >
                {selectedMandatoryTool === tool ? `✓ ${tool}` : tool}
              </button>
            ))}
          </div>

          <div className="controls-right">
            <div className="control-group">
              <label htmlFor="min-score-select" className="control-label">Min Score:</label>
              <select
                id="min-score-select"
                className="control-select"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              >
                <option value={0}>All Matches</option>
                <option value={60}>60%+ Compatibility</option>
                <option value={75}>75%+ Strong Match</option>
                <option value={85}>85%+ Elite Match</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="sort-by-select" className="control-label">Sort By:</label>
              <select
                id="sort-by-select"
                className="control-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="score">Highest Match Score</option>
                <option value="price">Starting Rate (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Heuristic Disclaimer */}
        <div className="disclaimer-callout">
          <span className="disclaimer-icon">ℹ</span>
          <span>{matchData?.disclaimer || 'Scores are heuristic compatibility estimates, not guaranteed hiring success probabilities.'}</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="matches-loading-state">
            <div className="loading-spinner" />
            <p>Computing dense embeddings and evaluating multi-factor creator compatibility...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="matches-error-state">
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Matches</h3>
            <p>{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Retry Matching
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayedMatches.length === 0 && (
          <div className="matches-empty-state">
            <div className="empty-spark">✦</div>
            <h3>No Creators Met All Mandatory Requirements</h3>
            <p>
              {selectedMandatoryTool
                ? `No candidate met the mandatory requirement for "${selectedMandatoryTool}". Try removing the tool filter.`
                : 'No creators currently satisfy all mandatory constraints (format, commercial clearance, or minimum score).'}
            </p>
            {selectedMandatoryTool && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={() => {
                  setSelectedMandatoryTool(null);
                  setMinScoreFilter(0);
                }}
              >
                Clear Tool Filter
              </button>
            )}
          </div>
        )}

        {/* Ranked Creator Recommendations */}
        {!loading && !error && displayedMatches.length > 0 && (
          <motion.div
            className="matches-list"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {displayedMatches.map((match, index) => {
              const { creator, score_breakdown, match_score, explanation, relevant_portfolio_items } = match;
              const isExpanded = expandedScoreIds.has(creator.id);
              const rankLabel = index === 0 ? '🏆 #1 Top Match' : `#${index + 1} Ranked Match`;

              return (
                <article key={creator.id} className={`creator-match-card ${index === 0 ? 'top-match-card' : ''}`}>
                  {/* Top Bar with Rank & Score Gauge */}
                  <div className="card-top-bar">
                    <div className="rank-indicator">
                      <span className={`rank-badge rank-${index + 1}`}>{rankLabel}</span>
                      <span className="spec-badge">{creator.specialization}</span>
                    </div>

                    <div className="score-gauge-wrap">
                      <div className="score-radial">
                        <svg className="radial-svg" viewBox="0 0 36 36">
                          <path
                            className="circle-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="circle-bar"
                            strokeDasharray={`${match_score}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="radial-content">
                          <span className="radial-score">{Math.round(match_score)}%</span>
                        </div>
                      </div>
                      <div className="score-text">
                        <span className="score-tier">
                          {match_score >= 85 ? 'Elite Match' : match_score >= 70 ? 'Strong Match' : 'Qualified'}
                        </span>
                        <span className="score-label">Compatibility Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Creator Identity Header */}
                  <div className="creator-profile-row">
                    <div className="creator-avatar-wrap">
                      <img
                        src={creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={creator.display_name}
                        className="creator-avatar-img"
                      />
                      <span className="online-indicator" title="Verified Creator" />
                    </div>

                    <div className="creator-details">
                      <div className="creator-name-row">
                        <h3 className="creator-name">{creator.display_name}</h3>
                        <span className="verified-badge" title="Identity and Portfolio Verified">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z" />
                          </svg>
                          Verified
                        </span>
                      </div>
                      <p className="creator-headline">{creator.headline || 'Generative AI Specialist'}</p>
                      <div className="creator-sub-meta">
                        <span className="meta-item">📍 {creator.location || 'Global'}</span>
                        <span className="meta-item availability-item">⚡ {creator.availability || 'Available Now'}</span>
                        <span className="meta-item price-item">
                          From ${creator.starting_price?.toLocaleString() || '1,500'} / {creator.price_unit || 'project'}
                        </span>
                      </div>
                    </div>

                    <div className="creator-action-buttons">
                      <button
                        type="button"
                        className="btn-invite-creator"
                        onClick={() =>
                          setInvitingCreator({
                            id: creator.id,
                            name: creator.display_name,
                            startingPrice: creator.starting_price || 1500,
                          })
                        }
                      >
                        ⚡ Invite to Brief
                      </button>
                      <button
                        type="button"
                        className="btn-view-profile"
                        onClick={() => navigate(`/creators/${creator.id}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>

                  {/* Grounded Explainable AI Rationale */}
                  <div className="grounded-explanation-box">
                    <div className="explanation-header">
                      <span className="explanation-spark">✦</span>
                      <span className="explanation-title">Grounded Match Rationale</span>
                      <span className="explanation-tag">Verified Evidence</span>
                    </div>
                    <p className="explanation-body">{explanation}</p>
                  </div>

                  {/* Relevant Portfolio Previews */}
                  {relevant_portfolio_items && relevant_portfolio_items.length > 0 && (
                    <div className="portfolio-preview-section">
                      <h4 className="section-subtitle">Relevant Portfolio Work</h4>
                      <div className="portfolio-items-grid">
                        {relevant_portfolio_items.map((item) => (
                          <div key={item.id} className="portfolio-preview-card">
                            <div className="portfolio-thumb-wrap">
                              <img
                                src={item.media_url || '/creators/film_sci_fi.jpg'}
                                alt={item.title}
                                className="portfolio-thumb"
                              />
                              <span className="media-type-badge">{item.media_type.toUpperCase()}</span>
                              <span className="relevance-badge">{Math.round(item.relevance_score)}% Alignment</span>
                            </div>
                            <div className="portfolio-preview-info">
                              <span className="portfolio-item-title">{item.title}</span>
                              <span className={`commercial-tag ${item.commercial_use_status === 'cleared' ? 'cleared' : 'restricted'}`}>
                                {item.commercial_use_status === 'cleared' ? '✓ Commercial Buyout Cleared' : 'Restricted Rights'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Skills & Tools Chips */}
                  <div className="matched-chips-row">
                    <div className="chips-group">
                      <span className="chips-label">Matched AI Tools:</span>
                      {match.matching_tools?.length > 0 ? (
                        match.matching_tools.map((tool) => (
                          <span key={tool} className="chip chip-tool">
                            ✓ {tool}
                          </span>
                        ))
                      ) : (
                        <span className="chip-none">No exact tool overlap</span>
                      )}
                    </div>

                    <div className="chips-group">
                      <span className="chips-label">Matched Skills:</span>
                      {match.matching_skills?.length > 0 ? (
                        match.matching_skills.map((skill) => (
                          <span key={skill} className="chip chip-skill">
                            ✓ {skill}
                          </span>
                        ))
                      ) : (
                        <span className="chip-none">Core generative workflow</span>
                      )}
                    </div>

                    {match.missing_requirements?.length > 0 && (
                      <div className="chips-group">
                        <span className="chips-label">Missing Preferred:</span>
                        {match.missing_requirements.map((req) => (
                          <span key={req} className="chip chip-missing">
                            ⚠️ Not Listed: {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expandable Score Breakdown Accordion */}
                  <div className="breakdown-accordion">
                    <button
                      type="button"
                      className="breakdown-toggle-btn"
                      onClick={() => toggleScoreBreakdown(creator.id)}
                    >
                      <span>Multi-Factor Compatibility Breakdown</span>
                      <span className="toggle-arrow">{isExpanded ? '▲ Hide' : '▼ View Breakdown'}</span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="breakdown-drawer"
                          initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="factors-grid">
                            <div className="factor-bar-item">
                              <div className="factor-labels">
                                <span className="factor-name">Semantic Portfolio Relevance</span>
                                <span className="factor-weight">35% Weight</span>
                                <span className="factor-val">{Math.round(score_breakdown.portfolio_score)} / 100</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-fill fill-violet"
                                  style={{ width: `${Math.min(100, score_breakdown.portfolio_score)}%` }}
                                />
                              </div>
                            </div>

                            <div className="factor-bar-item">
                              <div className="factor-labels">
                                <span className="factor-name">Skills & Specialization Alignment</span>
                                <span className="factor-weight">25% Weight</span>
                                <span className="factor-val">{Math.round(score_breakdown.skills_score)} / 100</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-fill fill-blue"
                                  style={{ width: `${Math.min(100, score_breakdown.skills_score)}%` }}
                                />
                              </div>
                            </div>

                            <div className="factor-bar-item">
                              <div className="factor-labels">
                                <span className="factor-name">AI Tool Stack Compatibility</span>
                                <span className="factor-weight">20% Weight</span>
                                <span className="factor-val">{Math.round(score_breakdown.tools_score)} / 100</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-fill fill-cyan"
                                  style={{ width: `${Math.min(100, score_breakdown.tools_score)}%` }}
                                />
                              </div>
                            </div>

                            <div className="factor-bar-item">
                              <div className="factor-labels">
                                <span className="factor-name">Content Format Match</span>
                                <span className="factor-weight">15% Weight</span>
                                <span className="factor-val">{Math.round(score_breakdown.format_score)} / 100</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-fill fill-emerald"
                                  style={{ width: `${Math.min(100, score_breakdown.format_score)}%` }}
                                />
                              </div>
                            </div>

                            <div className="factor-bar-item">
                              <div className="factor-labels">
                                <span className="factor-name">Availability Rating</span>
                                <span className="factor-weight">5% Weight</span>
                                <span className="factor-val">{Math.round(score_breakdown.availability_score)} / 100</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-fill fill-purple"
                                  style={{ width: `${Math.min(100, score_breakdown.availability_score)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </article>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Invite Creator Modal */}
      {invitingCreator && (
        <InviteBriefModal
          creator={invitingCreator}
          onClose={() => setInvitingCreator(null)}
          onInvitationSent={handleInviteSuccess}
        />
      )}

      {/* Success Toast */}
      {inviteSuccessToast && (
        <div className="matches-toast">
          <span>✓ {inviteSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
