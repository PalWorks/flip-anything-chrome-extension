import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import Panel, { ShortcutsModal } from './Panel';
import FullPagePanel from './FullPagePanel';

// Inlined from types.ts to avoid import issues in content script
enum ActionType {
  FLIP_X = 'FLIP_X',
  FLIP_Y = 'FLIP_Y',
  ROTATE = 'ROTATE',
  RESET = 'RESET',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  GET_STATE = 'GET_STATE',
  TOGGLE_INTERACTIVE = 'TOGGLE_INTERACTIVE',
  OPEN_PANEL = 'OPEN_PANEL',
  OPEN_SETTINGS = 'OPEN_SETTINGS',
  OPEN_EXT_MANAGEMENT = 'OPEN_EXT_MANAGEMENT'
}

enum TargetScope {
  PAGE = 'PAGE',
  ELEMENT = 'ELEMENT'
}

interface TransformState {
  flipX: boolean;
  flipY: boolean;
  rotation: number; // degrees
  zoom: number;
}

interface AppSettings {
  whitelistRegex: string;
  animationsEnabled: boolean;
}

interface ExtensionMessage {
  type: ActionType;
  scope: TargetScope;
  payload?: any;
}

const DEFAULT_SETTINGS: AppSettings = {
  whitelistRegex: '',
  animationsEnabled: true,
};

// import { ActionType, TargetScope, ExtensionMessage, TransformState, AppSettings, DEFAULT_SETTINGS } from './types';

declare var chrome: any;

// --- State Management ---
// --- State Management ---
let lastClickedElement: HTMLElement | null = null;
let selectedElements = new Set<HTMLElement>(); // Changed to Set for multi-selection
let currentHighlightedElement: HTMLElement | null = null; // For smart selection tracking
let settings: AppSettings = { ...DEFAULT_SETTINGS };

// We use a WeakMap to store state for individual elements without memory leaks
const elementStates = new WeakMap<HTMLElement, TransformState>();

// Page level state (applied to body/html)
const pageState: TransformState = {
  flipX: false,
  flipY: false,
  rotation: 0,
  zoom: 1
};

// Interactive Mode State
let isPanelOpen = false;
let isSelectionMode = false;
let shadowHost: HTMLElement | null = null;

let reactRoot: Root | null = null;

// Overlays
let hoverOverlay: HTMLElement | null = null;
const selectionOverlays = new Map<HTMLElement, HTMLElement>(); // Changed to Map

// --- Initialization ---

// Load settings safely
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
  chrome.storage.sync.get(['settings'], (result: any) => {
    if (result.settings) {
      settings = result.settings;
    }
  });
}

// Watch for setting changes safely
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes: any, namespace: string) => {
    if (namespace === 'sync' && changes.settings) {
      settings = changes.settings.newValue;
      // Re-apply animations preference globally
    }
  });
}

// Inject base styles for animations and highlighting
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .flip-ext-transition {
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  }
  .flip-ext-highlight {
    outline: 2px dashed #f43f5e !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.3) !important;
    cursor: crosshair !important;
  }
  .flip-ext-selected {
    outline: 4px dotted #f43f5e !important;
    outline-offset: 2px !important;
  }
`;

document.head.appendChild(styleSheet);

function createOverlay(id: string, color: string): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.position = 'absolute';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '2147483646'; // Just below the panel (MAX_INT - 1)
  overlay.style.backgroundColor = color;
  overlay.style.transition = 'all 0.1s ease-out';
  overlay.style.display = 'none';
  document.documentElement.appendChild(overlay);
  return overlay;
}

function addSelectionOverlay(element: HTMLElement) {
  if (selectionOverlays.has(element)) return;
  const overlay = createOverlay(`flip-ext-selection-${Date.now()}-${Math.random()}`, 'rgba(244, 63, 94, 0.2)');
  selectionOverlays.set(element, overlay);
  updateOverlayPosition(overlay, element);
}

function removeSelectionOverlay(element: HTMLElement) {
  const overlay = selectionOverlays.get(element);
  if (overlay) {
    overlay.remove();
    selectionOverlays.delete(element);
  }
}

function clearSelection() {
  selectedElements.forEach(el => {
    el.classList.remove('flip-ext-selected');
    removeSelectionOverlay(el);
  });
  selectedElements.clear();
}

function updateOverlayPosition(overlay: HTMLElement | null, target: HTMLElement | null) {
  if (!overlay || !target) {
    if (overlay) overlay.style.display = 'none';
    return;
  }

  const rect = target.getBoundingClientRect();
  const scrollTop = window.scrollY;
  const scrollLeft = window.scrollX;

  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.top = `${rect.top + scrollTop}px`;
  overlay.style.left = `${rect.left + scrollLeft}px`;
  overlay.style.display = 'block';
}

// Initialize overlays
if (typeof document !== 'undefined') {
  hoverOverlay = createOverlay('flip-ext-hover-overlay', 'rgba(59, 130, 246, 0.4)'); // Blue-500 @ 0.4
}

// --- Smart Selection Logic ---

function getSmartTarget(x: number, y: number): HTMLElement | null {
  const elements = document.elementsFromPoint(x, y);

  // Check if we are hovering over the panel (Shadow Host)
  // If so, we should NOT select anything behind it.
  const isOverPanel = elements.some(el => el === shadowHost || shadowHost?.contains(el));
  if (isOverPanel) return null;

  // Filter out overlays
  const validElements = elements.filter(el => {
    // Check if element is any of our overlays
    if (el === hoverOverlay) return false;
    // Check if it's one of the selection overlays
    for (const overlay of selectionOverlays.values()) {
      if (el === overlay) return false;
    }
    return true;
  });

  if (validElements.length === 0) return null;

  // Priority 1: Media Elements (Video, Img, SVG, Canvas)
  const mediaElement = validElements.find(el => {
    const tag = el.tagName.toUpperCase();
    return ['VIDEO', 'IMG', 'SVG', 'CANVAS'].includes(tag);
  });

  if (mediaElement) return mediaElement as HTMLElement;

  // Priority 2: The top-most valid element
  return validElements[0] as HTMLElement;
}

// --- Event Listeners ---

// Track right-click target
document.addEventListener('contextmenu', (e) => {
  if (isSelectionMode) {
    const target = getSmartTarget(e.clientX, e.clientY);
    if (!target) return;

    e.preventDefault();
    handleSelection(target, e.shiftKey || e.ctrlKey || e.metaKey);
    return;
  }
  // Even for normal context menu, try to be smart if it's a media element?
  // The user might want to flip the video they right-clicked on.
  // Let's use smart target for lastClickedElement too.
  const smartTarget = getSmartTarget(e.clientX, e.clientY);
  lastClickedElement = smartTarget || (e.target as HTMLElement);
}, true);

// Update overlays on scroll and resize
window.addEventListener('scroll', () => {
  if (selectedElements.size > 0) {
    selectedElements.forEach(el => {
      const overlay = selectionOverlays.get(el);
      updateOverlayPosition(overlay || null, el);
    });
  }
}, { passive: true });

window.addEventListener('resize', () => {
  if (selectedElements.size > 0) {
    selectedElements.forEach(el => {
      const overlay = selectionOverlays.get(el);
      updateOverlayPosition(overlay || null, el);
    });
  }
}, { passive: true });

// Selection Mode Listeners
document.addEventListener('mouseover', (e) => {
  if (isSelectionMode && isWhitelisted()) {
    // Use smart target instead of direct target
    const target = getSmartTarget(e.clientX, e.clientY);
    if (!target) return;

    // Clear previous highlight if any
    if (currentHighlightedElement && currentHighlightedElement !== target) {
      currentHighlightedElement.classList.remove('flip-ext-highlight');
    }
    currentHighlightedElement = target;
    target.classList.add('flip-ext-highlight');
    updateOverlayPosition(hoverOverlay, target);
  }
});

document.addEventListener('mouseout', (e) => {
  if (isSelectionMode) {
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('flip-ext-highlight');
      currentHighlightedElement = null;
    }

    if (hoverOverlay) hoverOverlay.style.display = 'none';
  }
});

document.addEventListener('click', (e) => {
  if (isSelectionMode && isWhitelisted()) {
    const target = getSmartTarget(e.clientX, e.clientY);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();
    handleSelection(target, e.shiftKey || e.ctrlKey || e.metaKey);
  }
}, true);




function handleSelection(element: HTMLElement, isMultiSelect: boolean = false) {
  if (shadowHost?.contains(element)) return;

  if (isMultiSelect) {
    if (selectedElements.has(element)) {
      // Deselect
      selectedElements.delete(element);
      element.classList.remove('flip-ext-selected');
      removeSelectionOverlay(element);
    } else {
      // Select
      selectedElements.add(element);
      element.classList.add('flip-ext-selected');
      addSelectionOverlay(element);
    }
  } else {
    // Single Selection
    clearSelection();
    selectedElements.add(element);
    element.classList.add('flip-ext-selected');
    addSelectionOverlay(element);
  }

  // Remove highlight from current element as it is now selected
  element.classList.remove('flip-ext-highlight');
  if (hoverOverlay) hoverOverlay.style.display = 'none';

  // Keep selection mode active
  // isSelectionMode = false; // We keep it true now as per previous reset behavior change, and for multi-select flow
  renderPanel();
}


// Listen for messages from Popup or Background safely
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender: any, sendResponse: any) => {
    if (!isWhitelisted()) {
      console.warn("Flip & Rotate: URL does not match whitelist regex.");
      return;
    }

    if (message.type === ActionType.OPEN_PANEL) {
      // If triggered from context menu on an element, select it
      if (message.scope === TargetScope.ELEMENT && lastClickedElement) {
        handleSelection(lastClickedElement);
      }
      openPanel();
      return;
    }

    if (message.type === ActionType.TOGGLE_INTERACTIVE) {
      // Legacy support if needed, but OPEN_PANEL replaces this
      openPanel();
      return;
    }

    const target = message.scope === TargetScope.PAGE ? document.body : lastClickedElement;

    if (!target && message.scope === TargetScope.ELEMENT) {
      console.warn("Flip & Rotate: No element selected via context menu.");
      return;
    }

    if (target) {
      applyTransform(target, message.scope, message.type, message.payload);
    }

    // Return current state if requested
    if (message.type === ActionType.GET_STATE) {
      sendResponse(pageState);
    }
  });
}

// --- Panel Logic ---

function openPanel() {
  if (isPanelOpen) return;
  isPanelOpen = true;
  isSelectionMode = true; // Auto-enable selection mode on open
  mountPanel();
}

function closePanel() {
  isPanelOpen = false;
  unmountPanel();
}

function mountPanel() {
  if (shadowHost) return;

  shadowHost = document.createElement('div');
  shadowHost.id = 'flip-rotate-interactive-root';

  // Attach to documentElement to avoid body transforms affecting the UI
  // This ensures "modals should not be subject to rotation or flipping"
  document.documentElement.appendChild(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  reactRoot = createRoot(container);
  renderPanel();
}

function unmountPanel() {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
  if (shadowHost) {
    shadowHost.remove();
    shadowHost = null;
  }

  clearSelection();

  if (hoverOverlay) hoverOverlay.style.display = 'none';
  isSelectionMode = false;
}

// React Component to manage Panel State
const PanelContainer = () => {
  const [showFullPage, setShowFullPage] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: window.innerWidth - 340, y: 20 });
  // Force update to re-render when external state changes
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Expose a render function to the outside world
    (window as any).__flip_render_panel = () => forceUpdate({});
    return () => { (window as any).__flip_render_panel = null; };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (showShortcuts) {
          setShowShortcuts(false);
        } else {
          closePanel();
        }
      }

      // Only handle other shortcuts if not typing in an input (though we don't have inputs yet)
      // and if shortcuts modal is not open? Maybe allow closing shortcuts with Esc (handled above)
      if (showShortcuts) return;

      if (e.key.toLowerCase() === 'r') {
        updateTransform(ActionType.RESET, undefined, TargetScope.ELEMENT);
      }

      if (e.key.toLowerCase() === 'h') {
        setShowFullPage(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [showShortcuts]);

  const lastSelected = Array.from(selectedElements).pop();
  const target = lastSelected || document.body;
  const elementState = getElementState(target, lastSelected ? TargetScope.ELEMENT : TargetScope.PAGE);

  // Full Page State
  const fullPageState = pageState;
  const FULL_PAGE_OFFSET_Y = 180;

  return (
    <>
      <Panel
        onClose={closePanel}
        onFlipX={() => updateTransform(ActionType.FLIP_X, undefined, TargetScope.ELEMENT)}
        onFlipY={() => updateTransform(ActionType.FLIP_Y, undefined, TargetScope.ELEMENT)}
        onRotate={(deg) => updateTransform(ActionType.ROTATE, { degrees: deg, relative: false }, TargetScope.ELEMENT)}
        onZoom={(scale) => updateTransform(ActionType.ROTATE, { zoom: scale }, TargetScope.ELEMENT)}
        onReset={() => updateTransform(ActionType.RESET, undefined, TargetScope.ELEMENT)}
        onToggleSelectionMode={() => {
          if (isSelectionMode) {
            clearSelection();
          }
          isSelectionMode = !isSelectionMode;
          renderPanel();
        }}
        onOpenSettings={() => {
          chrome.runtime.sendMessage({ type: ActionType.OPEN_SETTINGS });
        }}
        onEnableIncognito={() => {
          chrome.runtime.sendMessage({ type: ActionType.OPEN_EXT_MANAGEMENT });
        }}
        onToggleFullPage={() => setShowFullPage(!showFullPage)}
        showFullPage={showFullPage}
        onShowShortcuts={() => setShowShortcuts(true)}
        isSelectionMode={isSelectionMode}
        currentRotation={elementState.rotation}
        currentZoom={elementState.zoom}
        statusText={selectedElements.size > 0 ? `${selectedElements.size} Selected` : 'Select Element'}
        position={panelPosition}
        onPositionChange={setPanelPosition}
      />

      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {showFullPage && (
        <FullPagePanel
          onClose={() => setShowFullPage(false)}
          onFlipX={() => updateTransform(ActionType.FLIP_X, undefined, TargetScope.PAGE)}
          onFlipY={() => updateTransform(ActionType.FLIP_Y, undefined, TargetScope.PAGE)}
          onRotate={(deg) => updateTransform(ActionType.ROTATE, { degrees: deg, relative: false }, TargetScope.PAGE)}
          onReset={() => updateTransform(ActionType.RESET, undefined, TargetScope.PAGE)}
          currentRotation={fullPageState.rotation}
          position={{ x: panelPosition.x, y: panelPosition.y + FULL_PAGE_OFFSET_Y }}
        />
      )}
    </>
  );
};

function renderPanel() {
  if (!reactRoot) return;
  // If the component is already mounted, trigger a re-render via the exposed method
  if ((window as any).__flip_render_panel) {
    (window as any).__flip_render_panel();
  } else {
    reactRoot.render(<PanelContainer />);
  }
}

function updateTransform(action: ActionType, payload?: any, forcedScope?: TargetScope) {
  // Determine target and scope
  // If forcedScope is provided (e.g. from FullPagePanel), use it.
  // Otherwise default to selected element or body.

  let targets: HTMLElement[] = [];
  let scope: TargetScope;

  if (forcedScope === TargetScope.PAGE) {
    targets = [document.body];
    scope = TargetScope.PAGE;
  } else {
    // Default / Element Panel behavior
    if (selectedElements.size > 0) {
      targets = Array.from(selectedElements);
      scope = TargetScope.ELEMENT;
    } else {
      // Fallback to page if nothing selected
      targets = [document.body];
      scope = TargetScope.PAGE;
    }
  }

  // Special handling for Zoom
  if (payload && payload.zoom !== undefined) {
    targets.forEach(target => {
      const state = getElementState(target, scope);
      state.zoom = payload.zoom;
      applyTransformToElement(target, state, scope);
    });
    renderPanel();
    return;
  }

  targets.forEach(target => {
    applyTransform(target, scope, action, payload);
  });

  // Special handling for RESET: Deselect and re-enable selection mode
  if (action === ActionType.RESET && scope === TargetScope.ELEMENT) {
    clearSelection();
    if (hoverOverlay) hoverOverlay.style.display = 'none';
    isSelectionMode = true;
    renderPanel();
    return;
  }

  // Update overlay position after transform (in case it moved/resized)
  if (scope === TargetScope.ELEMENT) {
    targets.forEach(target => {
      const overlay = selectionOverlays.get(target);
      updateOverlayPosition(overlay || null, target);
    });
  }
  renderPanel();
}


// --- Logic ---

function isWhitelisted(): boolean {
  if (!settings.whitelistRegex || settings.whitelistRegex.trim() === '') return true;
  try {
    const regex = new RegExp(settings.whitelistRegex, 'i');
    return regex.test(window.location.href);
  } catch (e) {
    console.error("Invalid Regex in settings", e);
    return true; // Fail safe to enabled if regex is broken
  }
}

function getElementState(element: HTMLElement, scope: TargetScope): TransformState {
  if (scope === TargetScope.PAGE) return pageState;

  let state = elementStates.get(element);
  if (!state) {
    state = { flipX: false, flipY: false, rotation: 0, zoom: 1 };
    elementStates.set(element, state);
  }
  return state;
}

function applyTransform(element: HTMLElement, scope: TargetScope, action: ActionType, payload: any) {
  const state = getElementState(element, scope);

  // Update State
  switch (action) {
    case ActionType.FLIP_X:
      state.flipX = !state.flipX;
      break;
    case ActionType.FLIP_Y:
      state.flipY = !state.flipY;
      break;
    case ActionType.ROTATE:
      if (payload.relative) {
        state.rotation = (state.rotation + payload.degrees) % 360;
      } else {
        state.rotation = payload.degrees;
      }
      break;
    case ActionType.RESET:
      state.flipX = false;
      state.flipY = false;
      state.rotation = 0;
      state.zoom = 1;
      break;
  }

  applyTransformToElement(element, state, scope);
}

function applyTransformToElement(element: HTMLElement, state: TransformState, scope: TargetScope) {
  // Build Transform String
  // Order matters: Rotate first, then Scale. 
  // If we scale first, rotation direction flips which is confusing.
  const rotateStr = `rotate(${state.rotation}deg)`;
  const scaleXStr = state.flipX ? 'scaleX(-1)' : 'scaleX(1)';
  const scaleYStr = state.flipY ? 'scaleY(-1)' : 'scaleY(1)';
  const zoomStr = `scale(${state.zoom})`; // Add zoom

  const transformString = `${rotateStr} ${scaleXStr} ${scaleYStr} ${zoomStr}`;

  // Apply CSS
  if (settings.animationsEnabled) {
    element.classList.add('flip-ext-transition');
  } else {
    element.classList.remove('flip-ext-transition');
  }

  element.style.transform = transformString;

  // INLINE FIX:
  // CSS transforms don't work on inline elements. Force inline-block.
  const display = window.getComputedStyle(element).display;
  if (display === 'inline') {
    element.style.display = 'inline-block';
  }

  // For page scope, ensure body takes up full height/width so transforms don't clip or collapse
  if (scope === TargetScope.PAGE) {
    const hasTransform = state.flipX || state.flipY || state.rotation !== 0 || state.zoom !== 1;

    // Capture current scroll position before applying transform
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollWidth = document.documentElement.scrollWidth;
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;

    if (hasTransform) {
      document.body.style.minHeight = '100vh';
      document.body.style.overflow = 'auto'; // allow scrolling if rotated/flipped
      // Ensure the transform origin is center for page flips to look natural
      document.body.style.transformOrigin = 'center center';

      // SCROLL CORRECTION
      // When flipping, the scroll position stays the same relative to the top/left,
      // but visually the content we were looking at might have moved to the bottom/right.
      // We need to invert the scroll position to keep the user's view stable.

      if (state.flipY) {
        // Invert scroll position relative to the new bottom
        const newScrollTop = scrollHeight - scrollTop - clientHeight;
        window.scrollTo(scrollLeft, newScrollTop);
      }

      if (state.flipX) {
        // Invert scroll position relative to the new right
        const newScrollLeft = scrollWidth - scrollLeft - clientWidth;
        window.scrollTo(newScrollLeft, scrollTop);
      }

    } else {
      // Cleanup styles when reset
      document.body.style.minHeight = '';
      document.body.style.overflow = '';
      document.body.style.transformOrigin = '';
    }
  }
}