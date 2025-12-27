import React, { useEffect, useState } from 'react';
import { ActionType, TargetScope, AppSettings, DEFAULT_SETTINGS, TransformState } from './types';

declare var chrome: any;

// Icons
const FlipXIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
);
const FlipYIcon = () => (
  <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
);
const RotateRightIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);
const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ResetIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'page' | 'settings'>('page');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isUrlAllowed, setIsUrlAllowed] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Load Settings and URL on mount
  useEffect(() => {
    // Check if chrome.storage is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['settings'], (result: any) => {
        if (result.settings) setSettings(result.settings);
      });
    }

    // Check if chrome.tabs is available
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.url) {
          setCurrentUrl(tabs[0].url);
        }
      });
    } else {
      // Fallback for non-extension environments (dev/preview)
      setCurrentUrl('https://example.com');
    }
  }, []);

  // Check whitelist whenever settings or URL changes
  useEffect(() => {
    if (!settings.whitelistRegex || settings.whitelistRegex.trim() === '') {
      setIsUrlAllowed(true);
      return;
    }
    try {
      const regex = new RegExp(settings.whitelistRegex, 'i');
      setIsUrlAllowed(regex.test(currentUrl));
    } catch {
      setIsUrlAllowed(true);
    }
  }, [settings.whitelistRegex, currentUrl]);

  const handleAction = (type: ActionType, payload: any = {}) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type,
            scope: TargetScope.PAGE,
            payload
          });
        }
      });
    } else {
      console.log('Action triggered (Dev Mode):', type, payload);
    }
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ settings: newSettings }, () => {
          setSaveStatus('Saved!');
          setTimeout(() => setSaveStatus(''), 1500);
      });
    } else {
      setSaveStatus('Saved (Local)!');
      setTimeout(() => setSaveStatus(''), 1500);
    }
  };

  if (!isUrlAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-900">
        <div className="w-16 h-16 mb-4 text-gray-600 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-300 mb-2">Extension Disabled</h2>
        <p className="text-sm text-gray-500 mb-6">This URL does not match your whitelist settings.</p>
        <button 
          onClick={() => setActiveTab('settings')}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
        >
          Adjust Whitelist
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 shadow-md z-10">
        <h1 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
            <span className="text-blue-500">Flip</span>This
        </h1>
        <button 
            onClick={() => setActiveTab(activeTab === 'page' ? 'settings' : 'page')}
            className={`p-2 rounded-full transition-colors ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
        >
            <SettingsIcon />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {activeTab === 'page' ? (
          <div className="space-y-6">
            
            {/* Flip Section */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Axis</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction(ActionType.FLIP_X)}
                  className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl hover:bg-gray-700 active:scale-95 transition-all border border-gray-700 group"
                >
                  <div className="mb-2 text-blue-400 group-hover:text-blue-300"><FlipXIcon /></div>
                  <span className="text-sm font-medium">Flip X</span>
                </button>
                <button 
                  onClick={() => handleAction(ActionType.FLIP_Y)}
                  className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl hover:bg-gray-700 active:scale-95 transition-all border border-gray-700 group"
                >
                   <div className="mb-2 text-purple-400 group-hover:text-purple-300"><FlipYIcon /></div>
                  <span className="text-sm font-medium">Flip Y</span>
                </button>
              </div>
            </div>

            {/* Rotate Section */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Rotation</label>
              <div className="grid grid-cols-3 gap-2">
                 {[90, 180, 270].map(deg => (
                     <button 
                        key={deg}
                        onClick={() => handleAction(ActionType.ROTATE, { degrees: deg, relative: false })}
                        className="py-2 px-3 bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-700 border border-gray-700 transition-colors"
                     >
                        {deg}°
                     </button>
                 ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                 <button 
                    onClick={() => handleAction(ActionType.ROTATE, { degrees: 0, relative: false })}
                    className="flex-1 py-2 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                 >
                     <ResetIcon />
                     <span className="text-sm font-medium">Reset 0°</span>
                 </button>
                 <button 
                     onClick={() => handleAction(ActionType.RESET)}
                     className="flex-1 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-gray-400"
                 >
                     Reset All
                 </button>
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-200 leading-relaxed">
                    <span className="font-bold">Pro Tip:</span> Right-click any specific element on the page to flip just that image, video, or paragraph!
                </p>
            </div>

          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Whitelist Settings */}
            <div className="space-y-2">
               <label className="text-sm font-semibold text-gray-300">Whitelist URL Pattern (Regex)</label>
               <input 
                 type="text" 
                 placeholder="e.g. google|yahoo" 
                 value={settings.whitelistRegex}
                 onChange={(e) => saveSettings({...settings, whitelistRegex: e.target.value})}
                 className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
               />
               <p className="text-xs text-gray-500">
                   Leave empty to enable on all sites. Use simple keywords or regex. Example: <code className="bg-gray-800 px-1 rounded text-blue-400">google</code>
               </p>
            </div>

            {/* General Settings */}
            <div className="space-y-2 pt-4 border-t border-gray-800">
                <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-gray-300">Enable Animations</span>
                    <input 
                        type="checkbox" 
                        checked={settings.animationsEnabled}
                        onChange={(e) => saveSettings({...settings, animationsEnabled: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-offset-gray-900"
                    />
                </label>
                <p className="text-xs text-gray-500">Smooth transitions when flipping or rotating.</p>
            </div>

            <div className="h-4 flex items-center justify-end">
                {saveStatus && <span className="text-xs text-green-400 font-medium animate-pulse">{saveStatus}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;