import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Header from './components/Header/Header.jsx';
import Hero from './components/Hero/Hero.jsx';
import CreatorsSection from './components/Creators/CreatorsSection.jsx';
import About from './components/About/About.jsx';
import Footer from './components/Footer/Footer.jsx';
import CreatorProfilePage from './pages/CreatorProfilePage/CreatorProfilePage.jsx';
import DashboardPage from './pages/DashboardPage/DashboardPage.jsx';
import BrandDashboardPage from './pages/BrandDashboardPage/BrandDashboardPage.jsx';
import BriefBuilderPage from './pages/BriefBuilderPage/BriefBuilderPage.jsx';
import BriefsListPage from './pages/BriefsListPage/BriefsListPage.jsx';
import BriefDetailPage from './pages/BriefDetailPage/BriefDetailPage.jsx';

/**
 * Scroll and Hash Manager
 * Ensures smooth scroll to hashes (e.g. #creators) or scroll-to-top on page transitions.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}

function HomePage() {
  return (
    <main id="main" tabIndex={-1}>
      <Hero />
      <CreatorsSection />
      <About />
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollManager />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/creators/:id" element={<CreatorProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/brand" element={<BrandDashboardPage />} />
        <Route path="/briefs" element={<BriefsListPage />} />
        <Route path="/briefs/new" element={<BriefBuilderPage />} />
        <Route path="/briefs/:id" element={<BriefDetailPage />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

