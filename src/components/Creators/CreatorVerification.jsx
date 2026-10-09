import { motion, useReducedMotion } from 'motion/react';
import './CreatorVerification.css';

/**
 * CreatorVerification Component
 * Explicitly displays demo verification statuses for Crevo's Trust & Safety layer.
 * Per prompt guidelines:
 * - Uses sample statuses in mock data
 * - Prominently labeled as DEMO DATA
 * - Does not claim creators are genuinely certified without real verification
 */
export default function CreatorVerification({ verification, creatorName }) {
  const shouldReduceMotion = useReducedMotion();

  if (!verification) return null;

  const verificationItems = [
    {
      id: 'identity',
      title: 'Identity Verification',
      status: verification.identityStatus,
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="creator-verify-icon">
          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95A7 7 0 0110 16a7 7 0 01-3.536-1.05 4.996 4.996 0 007.072 0z" clipRule="evenodd" />
        </svg>
      ),
      badge: 'Verified Sample',
      description: 'Government identification and biometric cross-referencing matched to account holder.',
    },
    {
      id: 'portfolio',
      title: 'Portfolio Ownership Review',
      status: verification.portfolioStatus,
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="creator-verify-icon">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      badge: 'Files Inspected',
      description: 'Raw diffusion seed archives, timeline project files, and generation logs inspected for authenticity.',
    },
    {
      id: 'proficiency',
      title: 'Tool Proficiency Evidence',
      status: verification.toolProficiency,
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="creator-verify-icon">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
      badge: 'Demonstrated',
      description: 'Technical competence demonstrated across primary generative engines and post-production software.',
    },
    {
      id: 'projects',
      title: 'Completed Project Count',
      status: `${verification.completedProjects} Completed Briefs on Crevo`,
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="creator-verify-icon">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      ),
      badge: 'Escrow Cleared',
      description: 'Deliverables accepted with zero contract disputes and 100% on-time milestone fulfillment.',
    },
  ];

  return (
    <section className="creator-verification" aria-labelledby="verification-heading">
      {/* Demo Notice Banner */}
      <div className="creator-verification__demo-banner" role="note">
        <div className="creator-verification__demo-badge">
          <span className="creator-verification__demo-dot" aria-hidden="true" />
          DEMO VERIFICATION RECORD
        </div>
        <p className="creator-verification__demo-text">
          <strong>Notice:</strong> This is simulated demo data representing Crevo&apos;s upcoming Trust &amp; Safety
          audit layer. This profile is not certified under live verification.
        </p>
      </div>

      <div className="creator-verification__header">
        <div>
          <span className="creator-verification__eyebrow">CREVO TRUST &amp; SAFETY LAYER</span>
          <h3 id="verification-heading" className="creator-verification__title">
            Creator Integrity &amp; Provenance
          </h3>
        </div>
        <div className="creator-verification__last-audit">
          <span className="creator-verification__audit-label">Demo Inspection:</span>
          <strong>{verification.inspectionDate}</strong>
        </div>
      </div>

      <div className="creator-verification__grid">
        {verificationItems.map((item, idx) => (
          <motion.div
            key={item.id}
            className="creator-verification__card"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : idx * 0.06 }}
          >
            <div className="creator-verification__card-top">
              <div className="creator-verification__icon-wrap">{item.icon}</div>
              <span className="creator-verification__status-pill">
                <svg viewBox="0 0 12 12" fill="none" className="creator-verification__check" aria-hidden="true">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.badge}
              </span>
            </div>

            <div className="creator-verification__card-body">
              <h4 className="creator-verification__item-title">{item.title}</h4>
              <p className="creator-verification__item-status">{item.status}</p>
              <p className="creator-verification__item-desc">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="creator-verification__footer-note">
        <svg viewBox="0 0 16 16" fill="currentColor" className="creator-verification__shield" aria-hidden="true">
          <path d="M8 0c-.26 0-.5.1-.69.29L1.44 5.16a1 1 0 00-.28.71C1.22 10.3 4.14 14.7 7.74 15.96a1 1 0 00.52 0c3.6-1.26 6.52-5.66 6.58-10.09a1 1 0 00-.28-.71L8.69.29A1 1 0 008 0zm0 1.45l5.06 4.31C13 9.49 10.5 13.25 8 14.41 5.5 13.25 3 9.49 2.94 5.76L8 1.45z" />
        </svg>
        <span>
          Commission contracts for <strong>{creatorName}</strong> are protected with automated milestone escrow
          and guaranteed commercial IP indemnification once active.
        </span>
      </div>
    </section>
  );
}
