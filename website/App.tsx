import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Simple Hash Router Implementation
const App: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash;
      if (!hash) hash = '#/';
      setRoute(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (route) {
      case '#/privacy':
        return <PrivacyPolicy />;
      case '#/terms':
        return <TermsOfService />;
      case '#/':
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar currentRoute={route} />
      <main className="flex-grow pt-16">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;