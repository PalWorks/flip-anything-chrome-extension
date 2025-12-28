import React, { useState } from 'react';
import { RefreshCwIcon, FlipHorizontalIcon, FlipVerticalIcon } from './Icons';

export const Demo: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const getTransform = () => {
    return `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;
  };

  return (
    <div id="demo" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-900 -z-10"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-primary-500/10 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-primary-400 font-bold tracking-wider uppercase text-xs mb-2 block">Interactive Demo</span>
          <h2 className="text-3xl font-bold text-white mb-4">Try it right now</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience the power of transformation. Use the controls below to manipulate the card, just like you would any element on the web.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Controls */}
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              Live Controls
            </h3>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Rotation</label>
                  <span className="text-xs font-mono text-primary-400 bg-primary-500/10 px-2 py-1 rounded">{rotation}°</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={rotation} 
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                  <span>0°</span>
                  <span>90°</span>
                  <span>180°</span>
                  <span>270°</span>
                  <span>360°</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setFlipH(!flipH)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 group ${
                    flipH 
                      ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/50' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FlipHorizontalIcon className={`w-5 h-5 ${flipH ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                  Flip X
                </button>
                <button 
                  onClick={() => setFlipV(!flipV)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 group ${
                    flipV 
                      ? 'bg-secondary-600 border-secondary-500 text-white shadow-lg shadow-secondary-900/50' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FlipVerticalIcon className={`w-5 h-5 ${flipV ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                  Flip Y
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button 
                  onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); }}
                  className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCwIcon className="w-3 h-3" />
                  Reset to Original
                </button>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="relative group perspective-[1000px]">
             {/* Grid Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] rounded-2xl border border-white/10 -z-10"></div>
             
             <div className="flex justify-center items-center min-h-[400px] overflow-hidden rounded-2xl">
               <div 
                  className="relative bg-white p-6 rounded-2xl shadow-2xl w-64 transition-transform duration-300 ease-out will-change-transform"
                  style={{ transform: getTransform() }}
               >
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl opacity-20 blur-sm -z-10"></div>
                 
                 <div className="w-full h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg mb-4 flex items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <RefreshCwIcon className="w-12 h-12 relative z-10" />
                 </div>
                 
                 <div className="space-y-2">
                   <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                   <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse"></div>
                 </div>
                 
                 <div className="mt-4 flex gap-2">
                   <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                   <div className="flex-1 space-y-1 py-1">
                     <div className="h-2 bg-slate-200 rounded"></div>
                     <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};