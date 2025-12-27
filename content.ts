import { ActionType, TargetScope, ExtensionMessage, TransformState, AppSettings, DEFAULT_SETTINGS } from './types';

declare var chrome: any;

// --- State Management ---
let lastClickedElement: HTMLElement | null = null;
let settings: AppSettings = { ...DEFAULT_SETTINGS };

// We use a WeakMap to store state for individual elements without memory leaks
const elementStates = new WeakMap<HTMLElement, TransformState>();

// Page level state (applied to body/html)
const pageState: TransformState = {
  flipX: false,
  flipY: false,
  rotation: 0
};

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
  }
`;
document.head.appendChild(styleSheet);

function updateGlobalStyles() {
    // We handle animation class dynamically based on settings
}

// --- Event Listeners ---

// Track right-click target
document.addEventListener('contextmenu', (e) => {
  lastClickedElement = e.target as HTMLElement;
  
  // Visual feedback for selection
  if (lastClickedElement && isWhitelisted()) {
    lastClickedElement.classList.add('flip-ext-highlight');
    setTimeout(() => {
      lastClickedElement?.classList.remove('flip-ext-highlight');
    }, 1500);
  }
}, true);

// Listen for messages from Popup or Background safely
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender: any, sendResponse: any) => {
    if (!isWhitelisted()) {
      console.warn("Flip & Rotate: URL does not match whitelist regex.");
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
    state = { flipX: false, flipY: false, rotation: 0 };
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
      break;
  }

  // Build Transform String
  // Order matters: Rotate first, then Scale. 
  // If we scale first, rotation direction flips which is confusing.
  const rotateStr = `rotate(${state.rotation}deg)`;
  const scaleXStr = state.flipX ? 'scaleX(-1)' : 'scaleX(1)';
  const scaleYStr = state.flipY ? 'scaleY(-1)' : 'scaleY(1)';
  
  const transformString = `${rotateStr} ${scaleXStr} ${scaleYStr}`;

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