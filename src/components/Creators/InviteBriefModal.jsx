import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { SAMPLE_BRIEFS } from '../../data/mockCreators.js';
import { inviteCreatorToBrief } from '../../services/creatorService.js';
import './InviteBriefModal.css';

export default function InviteBriefModal({ creator, onClose, onInvitationSent }) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedBriefId, setSelectedBriefId] = useState(SAMPLE_BRIEFS[0]?.id || 'custom');
  const [customTitle, setCustomTitle] = useState('');
  const [customBudget, setCustomBudget] = useState(`$${creator.startingPrice * 1.5}`);
  const [customDeadline, setCustomDeadline] = useState('2 weeks');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [invitedBriefTitle, setInvitedBriefTitle] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const chosenBrief = SAMPLE_BRIEFS.find((b) => b.id === selectedBriefId);
    const briefTitle = chosenBrief ? chosenBrief.title : customTitle || 'Custom Commission Brief';

    await inviteCreatorToBrief(creator.id, {
      title: briefTitle,
      budget: chosenBrief ? chosenBrief.budget : customBudget,
      deadline: chosenBrief ? chosenBrief.deadline : customDeadline,
      message,
    });

    setSubmitting(false);
    setInvitedBriefTitle(briefTitle);
    setIsSuccess(true);
  };

  const handleFinishSuccess = () => {
    if (onInvitationSent) {
      onInvitationSent(invitedBriefTitle);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="invite-modal-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="invite-modal-container" role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
        <motion.div
          className="invite-modal"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            className="invite-modal__close"
            onClick={onClose}
            aria-label="Close invite dialog"
          >
            ✕
          </button>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="invite-modal__form">
              {/* Header */}
              <div className="invite-modal__header">
                <div className="invite-modal__creator-badge">
                  <img src={creator.avatar} alt={creator.name} className="invite-modal__avatar" />
                  <div>
                    <h2 id="invite-modal-title" className="invite-modal__title">
                      Invite {creator.name}
                    </h2>
                    <p className="invite-modal__subtext">
                      {creator.title} • Baseline ${creator.startingPrice.toLocaleString()} /{creator.priceUnit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Brief Selector */}
              <div className="invite-modal__field">
                <label className="invite-modal__label">Select an Active Brief</label>
                <div className="invite-modal__briefs-list">
                  {SAMPLE_BRIEFS.map((brief) => (
                    <label
                      key={brief.id}
                      className={`invite-modal__brief-option ${
                        selectedBriefId === brief.id ? 'invite-modal__brief-option--selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="brief"
                        value={brief.id}
                        checked={selectedBriefId === brief.id}
                        onChange={() => setSelectedBriefId(brief.id)}
                        className="invite-modal__radio"
                      />
                      <div className="invite-modal__brief-details">
                        <strong className="invite-modal__brief-name">{brief.title}</strong>
                        <span className="invite-modal__brief-meta">
                          {brief.category} • Budget {brief.budget} • Due {brief.deadline}
                        </span>
                      </div>
                    </label>
                  ))}

                  {/* Custom Brief option */}
                  <label
                    className={`invite-modal__brief-option ${
                      selectedBriefId === 'custom' ? 'invite-modal__brief-option--selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="brief"
                      value="custom"
                      checked={selectedBriefId === 'custom'}
                      onChange={() => setSelectedBriefId('custom')}
                      className="invite-modal__radio"
                    />
                    <div className="invite-modal__brief-details">
                      <strong className="invite-modal__brief-name">+ Create a New Custom Brief</strong>
                      <span className="invite-modal__brief-meta">Define scope, budget and deliverable format</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom Brief fields if selected */}
              {selectedBriefId === 'custom' && (
                <div className="invite-modal__custom-fields">
                  <div className="invite-modal__field">
                    <label className="invite-modal__label">Brief Title</label>
                    <input
                      type="text"
                      className="invite-modal__input"
                      placeholder="e.g. 30s Kinetic AI Commercial for Luxury Brand"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      required={selectedBriefId === 'custom'}
                    />
                  </div>

                  <div className="invite-modal__row">
                    <div className="invite-modal__field">
                      <label className="invite-modal__label">Proposed Budget</label>
                      <input
                        type="text"
                        className="invite-modal__input"
                        placeholder="e.g. $3,500"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(e.target.value)}
                      />
                    </div>
                    <div className="invite-modal__field">
                      <label className="invite-modal__label">Timeline</label>
                      <input
                        type="text"
                        className="invite-modal__input"
                        placeholder="e.g. 2–3 weeks"
                        value={customDeadline}
                        onChange={(e) => setCustomDeadline(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Message to Creator */}
              <div className="invite-modal__field">
                <label className="invite-modal__label">Direct Note to Creator (Optional)</label>
                <textarea
                  className="invite-modal__textarea"
                  rows="3"
                  placeholder={`Hi ${creator.name}, we loved your portfolio and would like to invite you to review our creative brief...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="invite-modal__actions">
                <button
                  type="button"
                  className="button button--secondary invite-modal__cancel"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button--primary invite-modal__submit"
                  disabled={submitting}
                >
                  {submitting ? 'Sending Invitation...' : 'Send Brief Invitation'}
                </button>
              </div>
            </form>
          ) : (
            /* Success confirmation */
            <div className="invite-modal__success" role="status">
              <div className="invite-modal__success-icon">✓</div>
              <h3 className="invite-modal__success-title">Invitation Dispatched!</h3>
              <p className="invite-modal__success-desc">
                {creator.name} has been invited to review your creative brief. You will receive an alert
                once they accept the commission inquiry.
              </p>
              <button
                type="button"
                className="button button--primary"
                onClick={handleFinishSuccess}
              >
                Back to Creator Profile
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
