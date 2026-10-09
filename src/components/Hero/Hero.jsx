import React, { Suspense, lazy } from 'react';
import './Hero.css';

// Lazy-load the React Three Fiber 3D canvas for fast initial page paint
const HeroCanvas = lazy(() => import('../Hero3D/HeroCanvas.jsx'));

export default function Hero() {
  const handleWatchReel = () => {
    const el = document.getElementById('creators');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      {/* 3D Liquid Chrome Ribbon Background (Lazy loaded, decorative & non-blocking) */}
      <div className="hero__background" aria-hidden="true">
        <Suspense
          fallback={
            <div className="hero__fallback" aria-hidden="true">
              <span className="hero__fallback-ambient" />
            </div>
          }
        >
          <HeroCanvas />
        </Suspense>
      </div>

      {/* Dark gradient scrim for maximum text legibility & contrast */}
      <div className="hero__scrim" aria-hidden="true" />

      {/* Main Hero Copy and Actions (HTML Overlays on Left) */}
      <div className="container hero__container">
        <div className="hero__copy">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-line" aria-hidden="true" />
            <span>INDEPENDENT MINDS. EXTRAORDINARY OUTCOMES.</span>
          </div>

          <h1 id="hero-title" className="hero__title">
            Ideas deserve<br />
            <em className="hero__title-accent">another<br />dimension.</em>
          </h1>

          <p className="hero__description">
            Crevo connects brands with extraordinary AI creators to turn bold ideas into unforgettable content.
          </p>

          <div className="hero__actions">
            <a href="#creators" className="hero__btn hero__btn--primary">
              <span>Explore Creators</span>
              <svg className="hero__btn-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10m-4-4 4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <a href="#about" className="hero__btn hero__btn--secondary">
              Post a Brief
            </a>
          </div>

          {/* Key Metrics / Stats Row */}
          <div className="hero__stats" role="list" aria-label="Key statistics">
            <div className="hero__stat" role="listitem">
              <span className="hero__stat-bar" aria-hidden="true" />
              <div className="hero__stat-content">
                <strong className="hero__stat-value">10K+</strong>
                <span className="hero__stat-label">Creators</span>
              </div>
            </div>

            <div className="hero__stat" role="listitem">
              <span className="hero__stat-bar" aria-hidden="true" />
              <div className="hero__stat-content">
                <strong className="hero__stat-value">2.5K+</strong>
                <span className="hero__stat-label">Projects</span>
              </div>
            </div>

            <div className="hero__stat" role="listitem">
              <span className="hero__stat-bar" aria-hidden="true" />
              <div className="hero__stat-content">
                <strong className="hero__stat-value">95%</strong>
                <span className="hero__stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar with Watch Reel & Scroll to Explore */}
      <div className="hero__bottom">
        <div className="container hero__bottom-inner">
          <button
            type="button"
            className="hero__watch-reel"
            aria-label="Watch Reel"
            onClick={handleWatchReel}
          >
            <span className="hero__watch-reel-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="9.5,7.5 16.5,12 9.5,16.5" />
              </svg>
            </span>
            <span>Watch Reel</span>
          </button>

          <a href="#creators" className="hero__scroll-indicator" aria-label="Scroll to explore creators">
            <span className="hero__mouse-icon" aria-hidden="true">
              <span className="hero__mouse-wheel" />
            </span>
            <span className="hero__scroll-text">SCROLL TO EXPLORE</span>
          </a>
        </div>
      </div>
    </section>
  );
}
