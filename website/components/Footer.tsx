import React from 'react';
import { GithubIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">Flip & Rotate Ultimate</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              The ultimate open-source tool for adjusting web page orientation. 
              Flip, rotate, and transform any element with ease.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#/terms" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  GitHub Repository
                </a>
              </li>
              <li><a href="mailto:support@example.com" className="hover:text-primary-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Flip & Rotate Ultimate. Open Source Software.</p>
        </div>
      </div>
    </footer>
  );
};