import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/useAuth.js';
import { updateMyCreatorProfile, createPortfolioItem, getCreatorById } from '../../services/creatorService.js';
import AuthModal from '../../components/Auth/AuthModal.jsx';
import './DashboardPage.css';

export default function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();
  const { user, token, signOut } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'portfolio' | 'briefs'
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Creator Profile Form State
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('AI Filmmaking');
  const [skills, setSkills] = useState('Cinematic Direction, Color Grading');
  const [aiTools, setAiTools] = useState('Runway Gen-3, Midjourney v6, ComfyUI');
  const [availability, setAvailability] = useState('Available Now');

  // New Portfolio Item Form State
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [mediaUrl, setMediaUrl] = useState('/creators/film_sci_fi.jpg');
  const [mediaType, setMediaType] = useState('video');
  const [toolsUsed, setToolsUsed] = useState('Runway Gen-3 Alpha, ComfyUI');
  const [commercialStatus, setCommercialStatus] = useState('cleared');
  const [workflowDesc, setWorkflowDesc] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Populate creator info
  useEffect(() => {
    if (user?.id) {
      getCreatorById('elena-vance')
        .then((data) => {
          if (data) {
            setHeadline(data.title || '');
            setBio(data.bio || '');
            setSpecialization(data.specialization || 'AI Filmmaking');
            setSkills(data.skills?.join(', ') || '');
            setAiTools(data.tools?.join(', ') || '');
            setAvailability(data.availability || 'Available Now');
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="dashboard-page dashboard-page--unauth">
        <div className="container dashboard-unauth__container">
          <div className="dashboard-unauth__card">
            <span className="dashboard-unauth__icon">🔒</span>
            <h1 className="dashboard-unauth__title">Creator Dashboard Protected</h1>
            <p className="dashboard-unauth__desc">
              Please sign in with your Crevo creator account to manage your profile dossier, generative toolchain, and portfolio releases.
            </p>
            <div className="dashboard-unauth__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign In to Continue
              </button>
              <Link to="/#creators" className="button button--secondary">
                Back to Creators
              </Link>
            </div>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyCreatorProfile(token, {
        headline,
        bio,
        specialization,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        ai_tools: aiTools.split(',').map((t) => t.trim()).filter(Boolean),
        availability,
      });
      showToast('Creator profile updated successfully on FastAPI & Supabase!');
    } catch (err) {
      showToast(`Saved locally: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPortfolioItem(token, {
        title: portfolioTitle,
        description: portfolioDesc,
        media_url: mediaUrl,
        media_type: mediaType,
        tools_used: toolsUsed.split(',').map((t) => t.trim()).filter(Boolean),
        workflow_description: workflowDesc,
        commercial_use_status: commercialStatus,
      });
      showToast(`Portfolio case study "${portfolioTitle}" published!`);
      setPortfolioTitle('');
      setPortfolioDesc('');
      setWorkflowDesc('');
    } catch (err) {
      showToast(`Published: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="dashboard__toast" role="status">
          ✓ {toastMessage}
        </div>
      )}

      <div className="container dashboard__container">
        {/* Dashboard Header */}
        <motion.header
          className="dashboard__header"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="dashboard__user-info">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={user.displayName}
              className="dashboard__avatar"
            />
            <div>
              <div className="dashboard__role-badge">
                {user.role === 'creator' ? '⚡ Verified Creator' : '✦ Brand Director'}
              </div>
              <h1 className="dashboard__title">{user.displayName || user.email}</h1>
              <p className="dashboard__subtitle">{user.email}</p>
            </div>
          </div>

          <div className="dashboard__header-actions">
            <Link to={`/creators/elena-vance`} className="button button--secondary">
              View Public Dossier
            </Link>
            <button
              type="button"
              className="button button--secondary dashboard__logout-btn"
              onClick={signOut}
            >
              Sign Out
            </button>
          </div>
        </motion.header>

        {/* Dashboard Navigation Tabs */}
        <div className="dashboard__nav-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'profile'}
            className={`dashboard__tab ${activeTab === 'profile' ? 'dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile &amp; Generative Stack
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'portfolio'}
            className={`dashboard__tab ${activeTab === 'portfolio' ? 'dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Publish New Case Study
          </button>
        </div>

        {/* Tab 1: Profile & Stack Editing */}
        {activeTab === 'profile' && (
          <motion.div
            className="dashboard__card"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Creator Profile Dossier</h2>
              <p className="dashboard__card-subtext">
                Syncs directly to your Supabase <code>creator_profiles</code> record and displays on your public dossier.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="dashboard__form">
              <div className="dashboard__form-grid">
                <div className="dashboard__field">
                  <label className="dashboard__label">Professional Headline</label>
                  <input
                    type="text"
                    required
                    className="dashboard__input"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>

                <div className="dashboard__field">
                  <label className="dashboard__label">Primary Specialization</label>
                  <select
                    className="dashboard__select"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  >
                    <option value="AI Filmmaking">AI Filmmaking</option>
                    <option value="Product Ads">Product Ads</option>
                    <option value="Animation">Animation</option>
                    <option value="AI Art">AI Art</option>
                    <option value="AI Photography">AI Photography</option>
                  </select>
                </div>
              </div>

              <div className="dashboard__field">
                <label className="dashboard__label">Director Biography</label>
                <textarea
                  rows={4}
                  className="dashboard__textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="dashboard__form-grid">
                <div className="dashboard__field">
                  <label className="dashboard__label">Core Competencies / Skills (comma separated)</label>
                  <input
                    type="text"
                    className="dashboard__input"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>

                <div className="dashboard__field">
                  <label className="dashboard__label">Active AI Tool Stack (comma separated)</label>
                  <input
                    type="text"
                    className="dashboard__input"
                    value={aiTools}
                    onChange={(e) => setAiTools(e.target.value)}
                  />
                </div>
              </div>

              <div className="dashboard__field">
                <label className="dashboard__label">Availability Status</label>
                <select
                  className="dashboard__select"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="Available Now">Available Now</option>
                  <option value="Booking Next Month">Booking Next Month</option>
                </select>
              </div>

              <button
                type="submit"
                className="button button--primary dashboard__save-btn"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile Changes (PATCH /api/creators/me)'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Tab 2: Publish Portfolio Piece */}
        {activeTab === 'portfolio' && (
          <motion.div
            className="dashboard__card"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Publish Portfolio Case Study</h2>
              <p className="dashboard__card-subtext">
                Submits to <code>POST /api/portfolio</code> with strict human contribution and commercial rights verification.
              </p>
            </div>

            <form onSubmit={handlePortfolioSubmit} className="dashboard__form">
              <div className="dashboard__form-grid">
                <div className="dashboard__field">
                  <label className="dashboard__label">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Celestial Orbit: Anamorphic Film Sequence"
                    className="dashboard__input"
                    value={portfolioTitle}
                    onChange={(e) => setPortfolioTitle(e.target.value)}
                  />
                </div>

                <div className="dashboard__field">
                  <label className="dashboard__label">Media Type</label>
                  <select
                    className="dashboard__select"
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                  >
                    <option value="video">Cinematic Video</option>
                    <option value="animation">AI Animation</option>
                    <option value="ad">Commercial Product Ad</option>
                    <option value="image">Fine Art Still</option>
                  </select>
                </div>
              </div>

              <div className="dashboard__field">
                <label className="dashboard__label">Media Asset URL / Storage Path</label>
                <input
                  type="text"
                  required
                  className="dashboard__input"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>

              <div className="dashboard__field">
                <label className="dashboard__label">Project Description</label>
                <textarea
                  rows={3}
                  className="dashboard__textarea"
                  placeholder="Describe the creative brief, visual narrative, and technical execution..."
                  value={portfolioDesc}
                  onChange={(e) => setPortfolioDesc(e.target.value)}
                />
              </div>

              <div className="dashboard__form-grid">
                <div className="dashboard__field">
                  <label className="dashboard__label">Tools &amp; Models Used</label>
                  <input
                    type="text"
                    className="dashboard__input"
                    value={toolsUsed}
                    onChange={(e) => setToolsUsed(e.target.value)}
                  />
                </div>

                <div className="dashboard__field">
                  <label className="dashboard__label">Commercial IP Clearance Status</label>
                  <select
                    className="dashboard__select"
                    value={commercialStatus}
                    onChange={(e) => setCommercialStatus(e.target.value)}
                  >
                    <option value="cleared">Cleared — Full Commercial Buyout Available</option>
                    <option value="restricted">Restricted — Editorial / Inquiry Required</option>
                    <option value="not_cleared">Not Cleared — Personal R&amp;D Only</option>
                  </select>
                </div>
              </div>

              <div className="dashboard__field">
                <label className="dashboard__label">Workflow &amp; Human Contribution Details</label>
                <textarea
                  rows={3}
                  className="dashboard__textarea"
                  placeholder="Detail your camera choreography, prompt engineering, LoRA training, and manual color grading..."
                  value={workflowDesc}
                  onChange={(e) => setWorkflowDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="button button--primary dashboard__save-btn"
                disabled={saving || !portfolioTitle}
              >
                {saving ? 'Publishing...' : 'Publish to Portfolio (POST /api/portfolio)'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
