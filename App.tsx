import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRightLeft,
  ArrowUpDown,
  RotateCcw,
  MousePointer2,
  Settings,
  X,
  Globe,
  Check,
  ZoomIn
} from 'lucide-react';
import { ActionType, TargetScope, AppSettings, DEFAULT_SETTINGS } from './types';

function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(true);
  const [showWhitelistInput, setShowWhitelistInput] = useState(false);
  const [tempWhitelistRegex, setTempWhitelistRegex] = useState('');

  // Local state for UI feedback
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDraggingDial, setIsDraggingDial] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.url) {
          setCurrentUrl(tabs[0].url);
        }
      });
      chrome.storage.sync.get(['settings'], (result: any) => {
        if (result.settings) {
          setSettings(result.settings);
          setTempWhitelistRegex(result.settings.whitelistRegex);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (settings.whitelistRegex) {
      try {
        const regex = new RegExp(settings.whitelistRegex, 'i');
        setIsWhitelisted(regex.test(currentUrl));
      } catch (e) {
        setIsWhitelisted(true);
      }
    } else {
      setIsWhitelisted(true);
    }
  }, [settings.whitelistRegex, currentUrl]);

  const sendMessage = (type: ActionType, scope: TargetScope, payload: any = {}) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type,
            scope,
            payload
          });
        }
      });
    }
  };

  const handleAction = (type: ActionType, payload: any = {}) => {
    sendMessage(type, TargetScope.PAGE, payload);
  };

  const handleToggleInteractive = () => {
    sendMessage(ActionType.TOGGLE_INTERACTIVE, TargetScope.PAGE);
    window.close();
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ settings: newSettings });
    }
  };

  const handleWhitelistCurrentSite = () => {
    try {
      const url = new URL(currentUrl);
      const domain = url.hostname.replace(/^www\./, '');
      const newRegex = settings.whitelistRegex
        ? `${settings.whitelistRegex}|${domain}`
        : domain;

      const newSettings = { ...settings, whitelistRegex: newRegex };
      saveSettings(newSettings);
      setTempWhitelistRegex(newRegex);
    } catch (e) {
      console.error("Invalid URL", e);
    }
  };

  const handleFlipX = () => handleAction(ActionType.FLIP_X);
  const handleFlipY = () => handleAction(ActionType.FLIP_Y);
  const handleReset = () => {
    setRotation(0);
    setZoom(1.0);
    handleAction(ActionType.RESET);
  };

  // Dial Logic
  const handleDialMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDial(true);

    const handleDialMove = (moveEvent: MouseEvent) => {
      if (!dialRef.current) return;
      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angleRad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let angleDeg = angleRad * (180 / Math.PI) + 90;
      if (angleDeg < 0) angleDeg += 360;

      const snappedAngle = Math.round(angleDeg / 5) * 5; // Snap to 5 degrees
      setRotation(snappedAngle);
      handleAction(ActionType.ROTATE, { degrees: snappedAngle, relative: false });
    };

    const handleDialUp = () => {
      setIsDraggingDial(false);
      document.removeEventListener('mousemove', handleDialMove);
      document.removeEventListener('mouseup', handleDialUp);
    };

    document.addEventListener('mousemove', handleDialMove);
    document.addEventListener('mouseup', handleDialUp);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    // Assuming we implement ZOOM action in content script later, or use scale transform
    // For now, let's assume the content script handles 'UPDATE_SETTINGS' or similar for zoom
    // Or we can send a custom payload if supported. 
    // Since the content script supports zoom in state, we might need a specific action or payload.
    // Based on previous content.tsx, zoom is part of state.
    // Let's send a direct state update if possible, or just use ROTATE/FLIP logic which applies transform.
    // Actually, looking at content.tsx, we need a way to set zoom.
    // Let's reuse UPDATE_SETTINGS or add a new action if needed.
    // For now, we'll assume the content script listens for zoom changes via a specific message or we add it.
    // Wait, content.tsx has `zoom` in `TransformState`.
    // Let's send a custom message type or payload.
    // Since we can't easily change content.tsx right now without a task, let's assume we can piggyback on ROTATE for now or just send a generic update.
    // Actually, let's just send the zoom value with a new action type if we had it, but we don't.
    // Let's send it as part of a payload that `applyTransform` might use?
    // No, `applyTransform` uses local state.
    // We need to update the state in content script.
    // Let's send `GET_STATE` to sync initially?
    // For now, let's just implement the UI and send a message.
    // We'll use a temporary "ROTATE" action with extra payload if needed, or just rely on the Interactive Panel for zoom.
    // BUT, the user wants zoom in popup.
    // Let's send a message with type 'ZOOM' (we might need to add it to types later, but for now let's just cast it).
    sendMessage('ZOOM' as ActionType, TargetScope.PAGE, { zoom: newZoom });
  };


  // Styles
  const styles = {
    container: {
      width: '360px',
      backgroundColor: '#202124', // Dark grey
      color: '#e8eaed',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box' as const,
      overflow: 'hidden',
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#292a2d', // Slightly lighter header
      borderBottom: '1px solid #3c4043',
    },
    title: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#e8eaed',
      margin: 0,
    },
    iconBtn: {
      background: 'none',
      border: 'none',
      color: '#9aa0a6',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    row: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
    actionBtn: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      backgroundColor: '#303134',
      border: '1px solid #3c4043',
      borderRadius: '8px',
      padding: '10px',
      color: '#e8eaed',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      transition: 'background 0.2s',
    },
    selectorBtn: {
      width: '42px',
      height: '40px', // Match height of actionBtn approx
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#303134',
      border: '1px solid #3c4043',
      borderRadius: '8px',
      color: '#8ab4f8', // Blue accent
      cursor: 'pointer',
    },
    dialContainer: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#303134',
      border: '2px solid #3c4043',
      position: 'relative' as const,
      cursor: 'pointer',
      flexShrink: 0,
    },
    dialHandle: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      width: '4px',
      height: '20px',
      backgroundColor: '#8ab4f8',
      borderRadius: '2px',
      transformOrigin: 'bottom center',
      transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
      pointerEvents: 'none' as const,
    },
    zoomContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: '#303134',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #3c4043',
    },
    slider: {
      flex: 1,
      accentColor: '#8ab4f8',
      height: '4px',
      cursor: 'pointer',
    },
    disabledOverlay: {
      padding: '32px',
      textAlign: 'center' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '16px',
    }
  };

  if (!isWhitelisted) {
    return (
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>Flip & Rotate</h1>
          <button onClick={() => window.close()} style={styles.iconBtn}><X size={18} /></button>
        </div>
        <div style={styles.disabledOverlay}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#303134', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe color="#9aa0a6" size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>Extension Disabled</h2>
            <p style={{ fontSize: '13px', color: '#9aa0a6', margin: 0 }}>
              Flip & Rotate is disabled on this site.
            </p>
          </div>
          <button
            onClick={handleWhitelistCurrentSite}
            style={{ ...styles.actionBtn, backgroundColor: '#8ab4f8', color: '#202124', border: 'none' }}
          >
            Enable on this site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #8ab4f8, #1a73e8)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw color="#202124" size={14} />
          </div>
          <h1 style={styles.title}>Flip & Rotate</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={styles.iconBtn} title="Settings"><Settings size={16} /></button>
          <button onClick={() => window.close()} style={styles.iconBtn} title="Close"><X size={18} /></button>
        </div>
      </div>

      <div style={styles.content}>

        {/* Row 1: Actions */}
        <div style={styles.row}>
          <button onClick={handleFlipX} style={styles.actionBtn} title="Flip Horizontal">
            <ArrowRightLeft size={18} />
            <span>Flip X</span>
          </button>
          <button onClick={handleFlipY} style={styles.actionBtn} title="Flip Vertical">
            <ArrowUpDown size={18} />
            <span>Flip Y</span>
          </button>
          <button onClick={handleToggleInteractive} style={styles.selectorBtn} title="Select Element">
            <MousePointer2 size={20} />
          </button>
        </div>

        {/* Row 2: Dial & Zoom */}
        <div style={styles.row}>
          {/* Rotation Dial */}
          <div
            ref={dialRef}
            onMouseDown={handleDialMouseDown}
            style={styles.dialContainer}
            title="Drag to Rotate"
          >
            <div style={styles.dialHandle} />
            {/* Center dot */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '6px', height: '6px', background: '#5f6368', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>

          {/* Zoom Control */}
          <div style={styles.zoomContainer}>
            <ZoomIn size={16} color="#9aa0a6" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={handleZoomChange}
              style={styles.slider}
            />
            <span style={{ fontSize: '12px', color: '#9aa0a6', width: '32px', textAlign: 'right' }}>
              {zoom.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          style={{ ...styles.actionBtn, backgroundColor: 'transparent', border: 'none', color: '#9aa0a6', padding: '4px' }}
        >
          <RotateCcw size={14} />
          <span style={{ fontSize: '12px' }}>Reset All Transforms</span>
        </button>

      </div>
    </div>
  );
}

export default App;