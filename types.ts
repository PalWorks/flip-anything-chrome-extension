export enum ActionType {
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

export enum TargetScope {
  PAGE = 'PAGE',
  ELEMENT = 'ELEMENT'
}

export interface TransformState {
  flipX: boolean;
  flipY: boolean;
  rotation: number; // degrees
}

export interface AppSettings {
  whitelistRegex: string;
  animationsEnabled: boolean;
}

export interface ExtensionMessage {
  type: ActionType;
  scope: TargetScope;
  payload?: any;
}

export const DEFAULT_SETTINGS: AppSettings = {
  whitelistRegex: '',
  animationsEnabled: true,
};
