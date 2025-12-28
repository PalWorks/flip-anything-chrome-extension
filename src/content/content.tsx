import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Panel from './Panel';

// Inlined from types.ts to avoid import issues in content script
enum ActionType {
  FLIP_X = 'FLIP_X',
  FLIP_Y = 'FLIP_Y',
  ROTATE = 'ROTATE',
  RESET = 'RESET',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  GET_STATE = 'GET_STATE',
  TOGGLE_INTERACTIVE = 'TOGGLE_INTERACTIVE'
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
let isInteractiveMode = false;
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
      updateGlobalStyles();
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
    e.preventDefault();
    handleSelection(e.target as HTMLElement);
    return;
  }
  lastClickedElement = e.target as HTMLElement;

  // Visual feedback for selection
  if (lastClickedElement && isWhitelisted() && !isInteractiveMode) {
    lastClickedElement.classList.add('flip-ext-highlight');
    setTimeout(() => {
      lastClickedElement?.classList.remove('flip-ext-highlight');
    }, 1500);
  }
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
    e.preventDefault();
    e.stopPropagation();
    handleSelection(e.target as HTMLElement);
  }
}, true);


function handleSelection(element: HTMLElement) {
  if (shadowHost?.contains(element)) return;

  // Clear previous selection
  if (selectedElement) selectedElement.classList.remove('flip-ext-selected');

  selectedElement = element;
  selectedElement.classList.add('flip-ext-selected');
  selectedElement.classList.remove('flip-ext-highlight');

  isSelectionMode = false;
  renderPanel(); // Update panel to show selected status
}


// Listen for messages from Popup or Background safely
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender: any, sendResponse: any) => {
    if (!isWhitelisted()) {
      console.warn("Flip & Rotate: URL does not match whitelist regex.");
      return;
    }

    if (message.type === ActionType.TOGGLE_INTERACTIVE) {
      toggleInteractiveMode();
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

// --- Interactive Mode Logic ---

function toggleInteractiveMode() {
  isInteractiveMode = !isInteractiveMode;
  if (isInteractiveMode) {
    mountPanel();
  } else {
    unmountPanel();
  }
}

function mountPanel() {
  if (shadowHost) return;

  shadowHost = document.createElement('div');
  shadowHost.id = 'flip-rotate-interactive-root';
  document.body.appendChild(shadowHost);

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

function renderPanel() {
  if (!reactRoot) return;

  const target = selectedElement || document.body;
  const state = getElementState(target, selectedElement ? TargetScope.ELEMENT : TargetScope.PAGE);

  reactRoot.render(
    <Panel
      onClose={toggleInteractiveMode}
      onFlipX={() => updateTransform(ActionType.FLIP_X)}
      onFlipY={() => updateTransform(ActionType.FLIP_Y)}
      onRotate={(deg) => updateTransform(ActionType.ROTATE, { degrees: deg, relative: false })}
      onZoom={(scale) => updateTransform(ActionType.ROTATE, { zoom: scale })} // Reusing ROTATE type for generic update or add new type? Let's hack it for now or add ZOOM type.
      // Actually, let's just use a direct update helper
      onReset={() => updateTransform(ActionType.RESET)}
      onToggleSelectionMode={() => {
        isSelectionMode = !isSelectionMode;
        renderPanel();
      }}
      isSelectionMode={isSelectionMode}
      currentRotation={state.rotation}
      currentZoom={state.zoom}
      statusText={selectedElement ? selectedElement.tagName : 'PAGE'}
    />
  );
}

function updateTransform(action: ActionType, payload?: any) {
  const target = selectedElement || document.body;
  const scope = selectedElement ? TargetScope.ELEMENT : TargetScope.PAGE;

  // Special handling for Zoom since I didn't add ActionType.ZOOM yet
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

  // For page scope, ensure body takes up full height/width so rotation doesn't clip
  if (scope === TargetScope.PAGE && state.rotation % 180 !== 0) {
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto'; // allow scrolling if rotated
  }
}