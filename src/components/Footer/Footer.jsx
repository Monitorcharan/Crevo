import { NAV_LINKS } from '../../data/navigation.js';
import './Footer.css';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__statement">
          Ideas deserve <em>another dimension.</em>
        </p>

        <div className="site-footer__meta">
          <a href="#home" className="wordmark" aria-label="Crevo — back to top">
            Crevo<span className="wordmark__dot" aria-hidden="true">.</span>
          </a>

          <nav aria-label="Footer">
            <ul className="site-footer__nav">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="site-nav__link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <p className="site-footer__copy">© {YEAR} Crevo</p>
        </div>
      </div>
    </footer>
  );
}
