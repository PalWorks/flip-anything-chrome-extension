import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowRightLeft,
    ArrowUpDown,
    RotateCcw,
    X,
    MousePointer2,
    ZoomIn,
    Settings
} from 'lucide-react';

interface PanelProps {
    onClose: () => void;
    onFlipX: () => void;
    onFlipY: () => void;
    onRotate: (degrees: number) => void;
    onZoom: (scale: number) => void;
    onReset: () => void;
    onToggleSelectionMode: () => void;
    onOpenSettings: () => void;
    onEnableIncognito: () => void;
    onToggleFullPage: () => void;
    isSelectionMode: boolean;
    currentRotation: number;
    currentZoom: number;
    statusText: string;
    position: { x: number; y: number };
    onPositionChange: (pos: { x: number; y: number }) => void;
    showFullPage: boolean;
    onShowShortcuts: () => void;
}

const Panel: React.FC<PanelProps> = ({
    onClose,
    onFlipX,
    onFlipY,
    onRotate,
    onZoom,
    onReset,
    onToggleSelectionMode,
    onOpenSettings,
    onEnableIncognito,
    onToggleFullPage,
    isSelectionMode,
    currentRotation,
    currentZoom,
    statusText,
    position,
    onPositionChange,
    showFullPage,
    onShowShortcuts
}) => {
    // const [position, setPosition] = useState({ x: 20, y: 20 }); // Lifted up
    const [isDragging, setIsDragging] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const dialRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Auto-close settings menu when interacting outside of it
    const handleRootMouseDown = (e: React.MouseEvent) => {
        if (showSettingsMenu && settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
            setShowSettingsMenu(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.no-drag')) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                onPositionChange({
                    x: e.clientX - dragStart.current.x,
                    y: e.clientY - dragStart.current.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Rotation Dial Logic
    const handleDialMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const handleDialMove = (moveEvent: MouseEvent) => {
            if (!dialRef.current) return;
            const rect = dialRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angleRad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
            let angleDeg = angleRad * (180 / Math.PI) + 90; // +90 to make top 0
            if (angleDeg < 0) angleDeg += 360;

            // Snap to 45 degrees
            const snappedAngle = Math.round(angleDeg / 45) * 45;
            onRotate(snappedAngle);
        };

        const handleDialUp = () => {
            document.removeEventListener('mousemove', handleDialMove);
            document.removeEventListener('mouseup', handleDialUp);
        };

        document.addEventListener('mousemove', handleDialMove);
        document.addEventListener('mouseup', handleDialUp);
    };

    return (
        <div
            onMouseDownCapture={handleRootMouseDown}
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 2147483647, // Max z-index
                backgroundColor: '#222222',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                color: '#e5e7eb',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                width: '260px',
                userSelect: 'none',
                overflow: 'visible', // Allow menu to overflow
                border: '1px solid #333'
            }}
        >
            <style>{`
        .panel-btn {
          background: #333333;
          border: none;
          color: #9ca3af;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.1s;
        }
        .panel-btn:hover {
          background: #444444;
          color: white;
        }
        .panel-btn:active {
          transform: scale(0.95);
        }
        .panel-btn.active {
          background: #3b82f6;
          color: white;
        }
        .slider-thumb {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: #444;
          border-radius: 2px;
          outline: none;
        }
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #222;
        }
        .settings-menu-item {
            padding: 8px 12px;
            cursor: pointer;
            color: #d1d5db;
            font-size: 13px;
            display: block;
            width: 100%;
            text-align: left;
            background: none;
            border: none;
        }
        .settings-menu-item:hover {
            background: #333;
            color: #fff;
        }
      `}</style>

            {/* Header / Drag Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    padding: '10px 14px',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#2a2a2a',
                    borderBottom: '1px solid #333',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>Flip & Rotate</span>
                    <span style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        padding: '1px 4px',
                        borderRadius: '4px',
                        background: '#333'
                    }}>
                        {statusText}
                    </span>
                </div>
                <div className="no-drag" style={{ display: 'flex', gap: '4px' }}>
                    <div ref={settingsRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                            title="Settings"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: showSettingsMenu ? '#fff' : '#6b7280',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex'
                            }}
                        >
                            <Settings size={16} />
                        </button>
                        {showSettingsMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                background: '#222',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                width: '180px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                zIndex: 2147483647,
                                overflow: 'hidden'
                            }}>
                                <button className="settings-menu-item" onClick={() => { onEnableIncognito(); setShowSettingsMenu(false); }}>
                                    Enable in Incognito
                                </button>
                                <button className="settings-menu-item" onClick={() => { onShowShortcuts(); setShowSettingsMenu(false); }}>
                                    Shortcuts
                                </button>
                                <button className="settings-menu-item" onClick={() => { onToggleFullPage(); setShowSettingsMenu(false); }}>
                                    {showFullPage ? 'Hide Full Page Options' : 'Show Full Page Options'}
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        title="Close"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="no-drag" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Main Row: Flip H, Flip V, Dial, Reset */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="panel-btn" onClick={onFlipX} title="Flip Horizontal">
                        <ArrowRightLeft size={18} />
                    </button>

                    <button className="panel-btn" onClick={onFlipY} title="Flip Vertical">
                        <ArrowUpDown size={18} />
                    </button>

                    {/* Rotation Dial */}
                    <div
                        ref={dialRef}
                        onMouseDown={handleDialMouseDown}
                        title="Drag to Rotate"
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: '#333',
                            position: 'relative',
                            cursor: 'pointer',
                            border: '2px solid #444'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '4px',
                            height: '14px',
                            background: '#3b82f6',
                            borderRadius: '2px',
                            transformOrigin: 'bottom center',
                            transform: `translate(-50%, -100%) rotate(${currentRotation}deg)`
                        }} />
                    </div>

                    <button className="panel-btn" onClick={onReset} title="Reset All">
                        <RotateCcw size={18} />
                    </button>
                </div>

                {/* Zoom Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        className={`panel-btn ${isSelectionMode ? 'active' : ''}`}
                        onClick={onToggleSelectionMode}
                        title="Select Element"
                        style={{ width: '32px', height: '32px', flexShrink: 0 }}
                    >
                        <MousePointer2 size={16} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px', background: '#333', padding: '4px 8px', borderRadius: '6px' }}>
                        <ZoomIn size={14} color="#6b7280" />
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={currentZoom}
                            onChange={(e) => onZoom(parseFloat(e.target.value))}
                            className="slider-thumb"
                            style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: '11px', color: '#d1d5db', width: '28px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {currentZoom.toFixed(1)}x
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export const ShortcutsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2147483647
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#1f2937',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                width: '320px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #374151'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Keyboard Shortcuts</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#d1d5db' }}>Close Extension</span>
                        <code style={{ backgroundColor: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Esc</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#d1d5db' }}>Reset Transform</span>
                        <code style={{ backgroundColor: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>R</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#d1d5db' }}>Toggle Full Page</span>
                        <code style={{ backgroundColor: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>H</code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Panel;
