import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Overview</h2>
          <p className="text-slate-600 leading-relaxed">
            Flip & Rotate Ultimate ("we", "our", or "us") respects your privacy. This Privacy Policy describes how we handle information when you use our Chrome Extension. 
            <strong>In short: We do not collect, store, or share any of your personal data.</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Data Collection</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Our extension runs locally on your device. We do not transmit any data to external servers.
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>We do <strong>not</strong> track your browsing history.</li>
            <li>We do <strong>not</strong> collect usage analytics.</li>
            <li>We do <strong>not</strong> require user registration.</li>
            <li>We do <strong>not</strong> store cookies related to tracking.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Permissions</h2>
          <p className="text-slate-600 leading-relaxed mb-2">
            The extension requires the following permissions to function:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li><strong>activeTab:</strong> Required to inject the CSS transforms needed to flip/rotate elements on the page you are currently viewing.</li>
            <li><strong>scripting:</strong> Required to execute the javascript logic that handles the rotation.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Local Storage</h2>
          <p className="text-slate-600 leading-relaxed">
            We may use Chrome's local storage API solely to save your user preferences (e.g., if you prefer a dark mode interface for the extension popup). This data never leaves your browser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us via our GitHub repository or email us.
          </p>
        </section>
      </div>
    </div>
  );
};