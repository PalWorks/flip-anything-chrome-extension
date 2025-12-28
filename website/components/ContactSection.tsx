import React, { useEffect } from 'react';

export const ContactSection: React.FC = () => {
    useEffect(() => {
        // Load Tally script
        const scriptSrc = "https://tally.so/widgets/embed.js";
        const d = document;

        // Check if script already exists
        if (d.querySelector(`script[src="${scriptSrc}"]`)) {
            // If Tally is already loaded, re-initialize embeds
            // @ts-ignore
            if (typeof Tally !== 'undefined') {
                // @ts-ignore
                Tally.loadEmbeds();
            }
            return;
        }

        const s = d.createElement("script");
        s.src = scriptSrc;
        s.async = true;
        s.onload = () => {
            // @ts-ignore
            if (typeof Tally !== 'undefined') {
                // @ts-ignore
                Tally.loadEmbeds();
            }
        };
        s.onerror = () => {
            console.error('Failed to load Tally script');
        };
        d.body.appendChild(s);
    }, []);

    return (
        <section id="contact" className="py-24 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Get in Touch</h2>
                    <p className="text-slate-600">Have questions or feedback? We'd love to hear from you.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <iframe
                        data-tally-src="https://tally.so/embed/81zXEl?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                        loading="lazy"
                        width="100%"
                        height="596"
                        frameBorder="0"
                        marginHeight={0}
                        marginWidth={0}
                        title="Flip & Rotate Ultimate - Get in Touch Form"
                    ></iframe>
                </div>
            </div>
        </section>
    );
};
