import React, { useEffect, useState } from 'react';
import { Testimonials } from '../components/Testimonials';
import { Pricing } from '../components/Pricing';
import { 
  ChromeIcon, 
  RefreshCwIcon, 
  FlipHorizontalIcon, 
  TargetIcon,
  ShieldCheckIcon,
  LayersIcon,
  CpuIcon,
  MaximizeIcon,
  KeyboardIcon
} from '../components/Icons';

export const Home: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - WHITE */}
      <section className="relative pt-12 pb-20 lg:pt-32 lg:pb-40 bg-white">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10"></div>
        
        {/* Ambient background blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-400/20 rounded-full blur-[80px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-900/10 text-slate-700 text-sm font-semibold mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                v2.0: The Ultimate Engineering Update
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
                Perspective is <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Everything</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Not just a CSS injector. A professional-grade engine for correcting video orientation, checking layouts, and manipulating web content with 
                smart targeting.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <a 
                  href="https://chrome.google.com/webstore" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
                >
                  <ChromeIcon className="w-6 h-6" />
                  Add to Chrome - Free
                </a>
              </div>
            </div>

            {/* Hero Visual - 3D Composition */}
            <div className="hidden lg:block relative perspective-[2000px]">
              {/* Parallax Wrapper */}
              <div 
                className="transform-style-3d will-change-transform transition-transform duration-75 ease-out"
                style={{ 
                  transform: `translateY(${scrollY * 0.12}px) rotateY(${-scrollY * 0.015}deg) rotateX(${scrollY * 0.005}deg)` 
                }}
              >
                <div className="relative transform-style-3d animate-float-rotate w-full aspect-square max-w-md mx-auto">
                  {/* Back Card (Decoration) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary-200 to-primary-200 rounded-3xl transform -translate-z-12 rotate-6 opacity-60"></div>
                  
                  {/* Main Card (Mock Browser) */}
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden backface-hidden">
                    {/* Browser Header */}
                    <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 flex-1 h-6 bg-white border border-slate-200 rounded-md"></div>
                    </div>
                    {/* Browser Content */}
                    <div className="flex-1 p-8 flex items-center justify-center bg-slate-50 relative overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-6 gap-4 p-4 opacity-10">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className="bg-slate-900 rounded-lg h-full"></div>
                        ))}
                      </div>
                      <div className="relative z-10 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mx-auto mb-4 shadow-lg flex items-center justify-center text-white">
                          <RefreshCwIcon className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Flip & Rotate</h3>
                        <div className="mt-4 flex gap-2 justify-center">
                          <div className="px-3 py-1 bg-white rounded shadow-sm text-xs font-mono text-slate-500 border border-slate-200">Scale: 1.5x</div>
                          <div className="px-3 py-1 bg-white rounded shadow-sm text-xs font-mono text-slate-500 border border-slate-200">Rot: 180deg</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating UI Elements */}
                  <div className="absolute -right-8 top-12 bg-slate-900 text-white p-4 rounded-xl shadow-xl transform translate-z-12 animate-pulse-slow">
                    <div className="flex items-center gap-3">
                      <FlipHorizontalIcon className="w-5 h-5 text-primary-400" />
                      <span className="font-mono text-sm">Flip X-Axis</span>
                    </div>
                  </div>
                  <div className="absolute -left-4 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-slate-100 transform translate-z-8">
                    <div className="flex items-center gap-3">
                      <TargetIcon className="w-5 h-5 text-secondary-500" />
                      <span className="font-bold text-slate-800 text-sm">Smart Target</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom CSS for 3D Animation */}
        <style>{`
          .perspective-[2000px] { perspective: 2000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .translate-z-8 { transform: translateZ(30px); }
          .translate-z-12 { transform: translateZ(50px); }
          .translate-z-negative { transform: translateZ(-20px); }
          .backface-hidden { backface-visibility: hidden; }
          
          @keyframes float-rotate {
            0% { transform: rotateY(-10deg) rotateX(5deg) translateY(0px); }
            50% { transform: rotateY(10deg) rotateX(-5deg) translateY(-20px); }
            100% { transform: rotateY(-10deg) rotateX(5deg) translateY(0px); }
          }
          .animate-float-rotate {
            animation: float-rotate 8s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Pro Features Grid - SLATE-50 */}
      {/* Visual Separation: The off-white background here helps the white cards 'pop' */}
      <section id="features" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Professional Grade Control</h2>
            <p className="text-slate-600">Engineered for developers, designers, and power users.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<RefreshCwIcon className="w-6 h-6 text-white" />}
              title="Universal Transformations"
              description="Features a precision dial for rotation in 90° increments or 45° snapping. Includes a zoom slider (0.5x to 3x) for fine-grained scaling."
            />
            <FeatureCard 
              icon={<TargetIcon className="w-6 h-6 text-white" />}
              title="Smart Media Targeting"
              description="Intelligently prioritizes <video>, <img>, and <canvas> tags over their containers. No more rotating the wrapper div by mistake."
            />
             <FeatureCard 
              icon={<MaximizeIcon className="w-6 h-6 text-white" />}
              title="Multi-Selection Engine"
              description="Hold Shift/Ctrl/Cmd to select multiple elements at once. Apply transforms to a group of components instantly."
            />
            <FeatureCard 
              icon={<FlipHorizontalIcon className="w-6 h-6 text-white" />}
              title="Dual Scope Control"
              description="Operate in Page Scope to flip the entire document (great for projectors) or Element Scope for specific components."
            />
            <FeatureCard 
              icon={<LayersIcon className="w-6 h-6 text-white" />}
              title="Shadow DOM Isolation"
              description="The UI lives in a Shadow Root attached to document.documentElement. Our styles never bleed into the page, and the page never breaks our UI."
            />
             <FeatureCard 
              icon={<CpuIcon className="w-6 h-6 text-white" />}
              title="Memory Safe (WeakMap)"
              description="Uses WeakMap storage for tracking element states. If an element is removed by a SPA, memory is automatically garbage collected."
            />
          </div>
        </div>
      </section>

      {/* Engineering Highlights - WHITE */}
      {/* Return to white to create contrast with the previous section */}
      <section className="py-24 bg-white border-t border-slate-200 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              {/* Added subtle gradient behind text for depth */}
              <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl -z-10 opacity-50"></div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6">
                Engineering Excellence
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Solves the hard problems.</h2>
              <div className="space-y-8">
                <div className="group p-4 -ml-4 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white border border-slate-200 shadow-sm rounded-lg flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                      <MaximizeIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Intelligent Scroll Correction</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Flipping a long webpage usually disorients the user. Our engine calculates your relative viewport position and automatically corrects the scroll, so you stay exactly where you were.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-4 -ml-4 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white border border-slate-200 shadow-sm rounded-lg flex items-center justify-center text-secondary-600 group-hover:scale-110 transition-transform">
                      <ShieldCheckIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Inline Element Handling</h3>
                      <p className="text-slate-600 leading-relaxed">
                        CSS transforms don't work on inline elements. We automatically detect this and temporarily promote targets to inline-block, ensuring your transforms always take effect.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-secondary-500 transform rotate-3 rounded-2xl opacity-10 blur-2xl"></div>
              <div className="relative bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-800">
                <h4 className="text-white font-mono mb-6 text-sm flex items-center gap-2 border-b border-slate-800 pb-4">
                  <KeyboardIcon className="w-4 h-4 text-slate-400" />
                  Workflow Shortcuts
                </h4>
                <div className="space-y-4">
                  <ShortcutKey keys={['Alt', 'Shift', 'X']} description="Flip Horizontal" />
                  <ShortcutKey keys={['Alt', 'Shift', 'Y']} description="Flip Vertical" />
                  <ShortcutKey keys={['Alt', 'Shift', 'R']} description="Rotate 90° Clockwise" />
                  <ShortcutKey keys={['Esc']} description="Close Panel / Exit Selection" />
                  <ShortcutKey keys={['R']} description="Reset Transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - SLATE-50 */}
      {/* Alternating back to off-white to create rhythm before the dark section */}
      <Testimonials />

      {/* Pricing Section - DARK */}
      <Pricing />

      {/* CTA - WHITE/GRADIENT */}
      {/* Clean exit after the dark section */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to change your perspective?</h2>
          <p className="text-slate-600 text-lg mb-10">
            Join thousands of users flipping the web today. Completely free and open source.
          </p>
          <a 
              href="https://chrome.google.com/webstore" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl"
            >
              <ChromeIcon className="w-5 h-5" />
              Install Extension
            </a>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({ icon, title, description }) => (
  <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20 relative z-10">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{title}</h3>
    <p className="text-slate-600 leading-relaxed relative z-10">{description}</p>
  </div>
);

const ShortcutKey: React.FC<{keys: string[], description: string}> = ({ keys, description }) => (
  <div className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0 hover:bg-slate-800/50 p-2 rounded transition-colors cursor-default group">
    <div className="flex gap-1">
      {keys.map((k, i) => (
        <span key={i} className="px-2 py-1 bg-slate-800 group-hover:bg-slate-700 rounded text-slate-300 font-mono text-xs border border-slate-700 transition-colors shadow-sm">
          {k}
        </span>
      ))}
    </div>
    <span className="text-slate-400 text-sm group-hover:text-white transition-colors">{description}</span>
  </div>
);