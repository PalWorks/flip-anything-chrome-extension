import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By installing and using the "Flip & Rotate Ultimate" Chrome Extension, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the extension.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. License</h2>
          <p className="text-slate-600 leading-relaxed">
            Flip & Rotate Ultimate is open-source software. You are free to use, modify, and distribute the code under the terms of the MIT License provided in the source code repository.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Disclaimer of Warranties</h2>
          <p className="text-slate-600 leading-relaxed">
            The service is provided on an "AS IS" and "AS AVAILABLE" basis. The author makes no representations or warranties of any kind, whether express or implied, regarding the operation of the extension or the information, content, or materials included therein.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            In no event shall the authors be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the extension.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Modifications</h2>
          <p className="text-slate-600 leading-relaxed">
            We reserve the right to modify these terms at any time. Continued use of the extension after any such changes shall constitute your consent to such changes.
          </p>
        </section>
      </div>
    </div>
  );
};