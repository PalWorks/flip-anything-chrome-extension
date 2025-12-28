import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import Panel from './Panel';
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
let lastClickedElement: HTMLElement | null = null;
let selectedElement: HTMLElement | null = null; // For interactive mode
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
    outline: 2px solid #3b82f6 !important;
    outline-offset: 2px !important;
  }
`;
document.head.appendChild(styleSheet);

function updateGlobalStyles() {
  // We handle animation class dynamically based on settings
}

// --- Event Listeners ---

// Track right-click target
document.addEventListener('contextmenu', (e) => {
  if (isSelectionMode) {
    const target = e.target as HTMLElement;
    // Ignore if clicking inside our own panel
    if (target === shadowHost || shadowHost?.contains(target)) return;

    e.preventDefault();
    handleSelection(target);
    return;
  }
  lastClickedElement = e.target as HTMLElement;
}, true);

// Selection Mode Listeners
document.addEventListener('mouseover', (e) => {
  if (isSelectionMode && isWhitelisted()) {
    const target = e.target as HTMLElement;
    if (target === shadowHost || shadowHost?.contains(target)) return;
    target.classList.add('flip-ext-highlight');
  }
});

document.addEventListener('mouseout', (e) => {
  if (isSelectionMode) {
    (e.target as HTMLElement).classList.remove('flip-ext-highlight');
  }
});

document.addEventListener('click', (e) => {
  if (isSelectionMode && isWhitelisted()) {
    const target = e.target as HTMLElement;
    // Ignore if clicking inside our own panel
    if (target === shadowHost || shadowHost?.contains(target)) return;

    e.preventDefault();
    e.stopPropagation();
    handleSelection(target);
  }
}, true);


function handleSelection(element: HTMLElement) {
  if (shadowHost?.contains(element)) return;

  // Clear previous selection
  if (selectedElement) selectedElement.classList.remove('flip-ext-selected');

  selectedElement = element;
  selectedElement.classList.add('flip-ext-selected');
  selectedElement.classList.remove('flip-ext-highlight');

  // Keep selection mode active or disable it? 
  // User request: "as soon as the modal has popped-up, I want the element selector action to get active"
  // Usually selection mode ends after selection. Let's end it but keep panel open.
  isSelectionMode = false;
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
  if (selectedElement) {
    selectedElement.classList.remove('flip-ext-selected');
    selectedElement = null;
  }
  isSelectionMode = false;
}

// React Component to manage Panel State
// React Component to manage Panel State
const PanelContainer = () => {
  const [showFullPage, setShowFullPage] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 20 });
  // Force update to re-render when external state changes
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Expose a render function to the outside world
    (window as any).__flip_render_panel = () => forceUpdate({});
    return () => { (window as any).__flip_render_panel = null; };
  }, []);

  const target = selectedElement || document.body;
  const elementState = getElementState(target, selectedElement ? TargetScope.ELEMENT : TargetScope.PAGE);

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
        isSelectionMode={isSelectionMode}
        currentRotation={elementState.rotation}
        currentZoom={elementState.zoom}
        statusText={selectedElement ? selectedElement.tagName : 'Select Element'}
        position={panelPosition}
        onPositionChange={setPanelPosition}
      />

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

  let target: HTMLElement;
  let scope: TargetScope;

  if (forcedScope === TargetScope.PAGE) {
    target = document.body;
    scope = TargetScope.PAGE;
  } else {
    // Default / Element Panel behavior
    // If we are in element panel, we operate on selectedElement. 
    // If no selectedElement, we shouldn't really be doing anything unless we fallback to page?
    // But user wants "Element Selector" to be primary.
    if (selectedElement) {
      target = selectedElement;
      scope = TargetScope.ELEMENT;
    } else {
      // Fallback or ignore?
      // Let's fallback to body but treat as ELEMENT scope if we want to support "Flip Body as Element"?
      // No, let's just default to PAGE scope if nothing selected, OR warn user.
      // Given the UI shows "Select Element", maybe we just return?
      // But for Zoom, we might want to zoom page?
      // Let's assume if no element selected, we target body as PAGE.
      target = document.body;
      scope = TargetScope.PAGE;
    }
  }

  // Special handling for Zoom
  if (payload && payload.zoom !== undefined) {
    const state = getElementState(target, scope);
    state.zoom = payload.zoom;
    applyTransformToElement(target, state, scope);
    renderPanel();
    return;
  }

  applyTransform(target, scope, action, payload);
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