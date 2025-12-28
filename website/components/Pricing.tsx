import React from 'react';
import { CheckIcon, ChromeIcon } from './Icons';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-slate-900 text-white relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] bg-primary-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[60%] bg-secondary-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We believe essential tools should be accessible to everyone. No hidden fees, no subscriptions.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-primary-500/50 transition-colors duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ChromeIcon className="w-32 h-32 rotate-12" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-semibold text-primary-400 mb-1">Standard License</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">Free</span>
                  <span className="text-slate-400">/ forever</span>
                </div>
              </div>
              <div className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-wider rounded-full border border-primary-500/30">
                Open Source
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <PricingFeature text="Full Rotation & Flip Capabilities" />
              <PricingFeature text="Mirror Mode for Developers" />
              <PricingFeature text="Element Selection Mode" />
              <PricingFeature text="No Watermarks or Ads" />
              <PricingFeature text="100% Privacy Focused (No Tracking)" />
              <PricingFeature text="Regular Updates & Support" />
            </div>

            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 rounded-xl font-bold text-center text-lg shadow-lg shadow-primary-900/20 transition-all hover:scale-[1.02]"
            >
              Add to Chrome - It's Free
            </a>

            <p className="text-center text-xs text-slate-500 mt-4">
              Version 2.0 • Compatible with Chrome v88+
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingFeature: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-3">
    <div className="bg-green-500/20 p-1 rounded-full mt-0.5">
      <CheckIcon className="w-4 h-4 text-green-400" />
    </div>
    <span className="text-slate-300">{text}</span>
  </div>
);