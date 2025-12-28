import React from 'react';
import { RefreshCwIcon } from './Icons';

interface NavbarProps {
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.hash = '#/'}>
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-lg text-white">
            <RefreshCwIcon className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">Flip & Rotate Ultimate</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#/" className={`text-sm font-medium transition-colors ${currentRoute === '#/' ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`}>Home</a>
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Features</a>
        </div>

        <a 
          href="https://chrome.google.com/webstore" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
        >
          Add to Chrome
        </a>
      </div>
    </nav>
  );
};