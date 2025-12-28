// Inlined from types.ts to avoid import issues in background script
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

// import { ActionType, TargetScope } from './types';

declare var chrome: any;

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.contextMenus) {
  // Setup Context Menus on Install
  chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.setUninstallURL('https://palworks.github.io/Flip-and-Rotate-Ultimate/#/uninstall');

    chrome.contextMenus.create({
      id: 'flip-root',
      title: 'Flip and Rotate Ultimate',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      parentId: 'flip-root',
      id: 'flip-x',
      title: 'Flip Horizontally',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      parentId: 'flip-root',
      id: 'flip-y',
      title: 'Flip Vertically',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      parentId: 'flip-root',
      id: 'rotate-90',
      title: 'Rotate 90°',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      parentId: 'flip-root',
      id: 'rotate-180',
      title: 'Rotate 180°',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      parentId: 'flip-root',
      id: 'rotate-270',
      title: 'Rotate 270°',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      parentId: 'flip-root',
      id: 'reset',
      title: 'Reset Element',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      parentId: 'flip-root',
      id: 'open-panel',
      title: 'Show more settings',
      contexts: ['all']
    });
  });

  // Handle Extension Icon Click
  if (chrome.action) {
    chrome.action.onClicked.addListener((tab: any) => {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: ActionType.OPEN_PANEL,
          scope: TargetScope.PAGE
        });
      }
    });
  }

  // Handle Messages (e.g. Open Settings)
  chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
    if (message.type === ActionType.OPEN_SETTINGS) {
      chrome.runtime.openOptionsPage ? chrome.runtime.openOptionsPage() : window.open(chrome.runtime.getURL('options.html'));
    }
    if (message.type === ActionType.OPEN_EXT_MANAGEMENT) {
      chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id });
    }
  });

  // Handle Context Menu Clicks
  chrome.contextMenus.onClicked.addListener((info: any, tab: any) => {
    if (!tab?.id) return;

    let action: ActionType | null = null;
    let payload: any = {};

    switch (info.menuItemId) {
      case 'flip-x':
        action = ActionType.FLIP_X;
        break;
      case 'flip-y':
        action = ActionType.FLIP_Y;
        break;
      case 'rotate-90':
        action = ActionType.ROTATE;
        payload = { degrees: 90, relative: true };
        break;
      case 'rotate-180':
        action = ActionType.ROTATE;
        payload = { degrees: 180, relative: true };
        break;
      case 'reset':
        action = ActionType.RESET;
        break;
      case 'rotate-270':
        action = ActionType.ROTATE;
        payload = { degrees: 270, relative: true };
        break;
      case 'open-panel':
        action = ActionType.OPEN_PANEL;
        break;
    }

    if (action) {
      chrome.tabs.sendMessage(tab.id, {
        type: action,
        scope: TargetScope.ELEMENT,
        payload
      });
    }
  });

  // Handle Keyboard Shortcuts
  chrome.commands.onCommand.addListener((command: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (!tabs[0]?.id) return;

      let action: ActionType | null = null;
      let payload: any = {};

      switch (command) {
        case 'flip-x':
          action = ActionType.FLIP_X;
          break;
        case 'flip-y':
          action = ActionType.FLIP_Y;
          break;
        case 'rotate':
          action = ActionType.ROTATE;
          payload = { degrees: 90, relative: true };
          break;
      }

      if (action) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: action,
          scope: TargetScope.PAGE, // Shortcuts apply to page by default
          payload
        });
      }
    });
  });
}