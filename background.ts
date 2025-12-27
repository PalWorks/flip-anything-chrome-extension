import { ActionType, TargetScope } from './types';

declare var chrome: any;

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.contextMenus) {
  // Setup Context Menus on Install
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'flip-root',
      title: 'Flip & Rotate Element',
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
      id: 'reset',
      title: 'Reset Element',
      contexts: ['all']
    });
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
    }

    if (action) {
      chrome.tabs.sendMessage(tab.id, {
        type: action,
        scope: TargetScope.ELEMENT,
        payload
      });
    }
  });
}