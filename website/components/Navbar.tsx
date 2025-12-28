import React, { useState } from 'react';
import { MenuIcon, XIcon } from './Icons';

interface NavbarProps {
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: 'Home', href: '#/' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.hash = '#/'}>
          <img src="logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
          <span className="font-bold text-lg md:text-xl text-slate-800 tracking-tight">Flip & Rotate Ultimate</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors ${currentRoute === link.href ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
          >
            Add to Chrome
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-base font-medium text-slate-600 hover:text-primary-600 py-2 px-4 rounded-lg hover:bg-slate-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-medium text-center mt-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Add to Chrome
          </a>
        </div>
      )}
    </nav>
  );
};