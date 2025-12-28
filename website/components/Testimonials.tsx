import React from 'react';
import { StarIcon } from './Icons';

const testimonials = [
  {
    quote: "This extension is a lifesaver for checking RTL layouts. I use the mirror mode daily to ensure our UI looks perfect in all orientations.",
    author: "Sarah Jenkins",
    role: "Frontend Engineer",
    initials: "SJ",
    color: "bg-pink-100 text-pink-700"
  },
  {
    quote: "Finally, a tool that does exactly what it says without bloat or tracking. The privacy-first approach is exactly what I look for.",
    author: "Michael Torres",
    role: "Security Researcher",
    initials: "MT",
    color: "bg-blue-100 text-blue-700"
  },
  {
    quote: "I'm not a developer, but I use this to fix upside-down videos on older websites. It works like magic every single time!",
    author: "Alex Rivera",
    role: "Digital Creator",
    initials: "AR",
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    quote: "Essential for QA testing. Being able to quickly flip elements helps us catch visual bugs that would otherwise go unnoticed.",
    author: "Emma Chen",
    role: "QA Lead",
    initials: "EC",
    color: "bg-purple-100 text-purple-700"
  },
  {
    quote: "I use it to correct the orientation of scanned documents in browser-based viewers. Simple, fast, and effective.",
    author: "David Kim",
    role: "Research Analyst",
    initials: "DK",
    color: "bg-orange-100 text-orange-700"
  },
  {
    quote: "As a streamer, I often need to mirror my webcam feed or specific browser sources. This extension makes it trivial.",
    author: "James Wilson",
    role: "Content Creator",
    initials: "JW",
    color: "bg-red-100 text-red-700"
  },
  {
    quote: "Perfect for quick layout checks during design reviews. It saves me from opening dev tools just to flip an image.",
    author: "Maria Garcia",
    role: "UI Designer",
    initials: "MG",
    color: "bg-cyan-100 text-cyan-700"
  },
  {
    quote: "The CSS transform debugging capabilities are underrated. It helps visualize 3D transforms without writing code.",
    author: "Robert Fox",
    role: "Web Developer",
    initials: "RF",
    color: "bg-indigo-100 text-indigo-700"
  },
  {
    quote: "I love how lightweight it is. It doesn't slow down my browser or ask for unnecessary permissions.",
    author: "Lisa Wang",
    role: "Product Manager",
    initials: "LW",
    color: "bg-teal-100 text-teal-700"
  },
  {
    quote: "The element picker is so intuitive. I can rotate just the specific ad or banner that's annoying me.",
    author: "John Smith",
    role: "Power User",
    initials: "JS",
    color: "bg-gray-100 text-gray-700"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/50 -skew-x-12 translate-x-32 -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm">Community Love</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Loved by 10,000+ Users</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Join the growing community of developers, designers, and power users who rely on Flip & Rotate Ultimate.
          </p>
        </div>

        <div className="relative group">
          {/* Side Gradients to smooth out entry/exit - updated to match slate-50 */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-hidden">
            <div className="flex gap-8 w-max animate-scroll py-4">
              {/* Duplicate the testimonials array to create a seamless infinite loop */}
              {[...testimonials, ...testimonials].map((t, i) => (
                <div 
                  key={i} 
                  className="w-[320px] flex-shrink-0"
                >
                  <TestimonialCard {...t} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  role: string;
  initials: string;
  color: string;
}> = ({ quote, author, role, initials, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full hover:transform hover:-translate-y-1 transition-all duration-300">
    <div className="flex gap-1 mb-4 text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className="w-5 h-5" fill="currentColor" />
      ))}
    </div>
    <blockquote className="text-slate-700 leading-relaxed mb-6 flex-grow text-sm">
      "{quote}"
    </blockquote>
    <div className="flex items-center gap-3 mt-auto border-t border-slate-100 pt-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${color}`}>
        {initials}
      </div>
      <div>
        <div className="font-bold text-slate-900 text-sm">{author}</div>
        <div className="text-xs text-slate-500">{role}</div>
      </div>
    </div>
  </div>
);