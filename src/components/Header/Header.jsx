import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import AuthModal from '../Auth/AuthModal.jsx';
import { NAV_LINKS } from '../../data/navigation.js';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isHome = location.pathname === '/';

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="wordmark" aria-label="Crevo — Home">
            Crevo<span className="wordmark__dot" aria-hidden="true">.</span>
          </Link>

          <nav className="site-nav-container" aria-label="Primary">
            <ul className="site-nav">
              {NAV_LINKS.map((link) => {
                const isRoute = link.href.startsWith('/');
                const targetPath = isRoute ? link.href : isHome ? link.href : `/${link.href}`;
                const isActive = isRoute
                  ? location.pathname === link.href
                  : isHome && link.href === '#home';

                return (
                  <li key={link.href}>
                    {isRoute ? (
                      <Link
                        to={link.href}
                        className={`site-nav__link ${isActive ? 'site-nav__link--active' : ''}`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={targetPath}
                        className={`site-nav__link ${isActive ? 'site-nav__link--active' : ''}`}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="site-header__actions">
            <Link
              to="/briefs"
              className="site-header__icon-btn"
              aria-label="Search open creative briefs"
              title="Open Creative Briefs"
            >
              <svg
                className="site-header__search-icon"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path
                  d="M13.2 13.2L17.5 17.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </Link>

            <Link to="/briefs/new" className="site-header__btn site-header__btn--primary">
              Post a Brief
            </Link>

            <Link to="/dashboard/brand" className="site-header__btn site-header__btn--secondary">
              Brand Studio
            </Link>

            {user ? (
              <Link
                to={user.role === 'brand' ? '/dashboard/brand' : '/dashboard'}
                className="site-header__btn site-header__btn--secondary"
              >
                {user.role === 'brand' ? 'Brand Workspace' : 'Creator Studio'}
              </Link>
            ) : (
              <button
                type="button"
                className="site-header__btn site-header__btn--secondary"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
