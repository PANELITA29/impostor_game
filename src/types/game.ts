export type ScreenId =
  | 'HOME'
  | 'LOBBY'
  | 'CATEGORIES'
  | 'SETTINGS'
  | 'PASS_AND_PLAY'
  | 'ACTIVE_ROUND'
  | 'RESOLUTION';

export type RoundDuration = 60 | 120 | 180 | 300 | null;

export type GameTheme = 'midnight' | 'cyberpunk' | 'crimson' | 'amethyst';
export type GameLanguage = 'es' | 'en';

export interface UserPreferences {
  theme: GameTheme;
  language: GameLanguage;
  sfxVolume: number;
  musicVolume: number;
  haptics: boolean;
  wakeLockEnabled: boolean;
}

export interface Player {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  words: string[];
  isCustom: boolean;
}

export interface GameSettings {
  players: Player[];
  impostorCount: number;
  chaosMode: boolean;
  roundDuration: RoundDuration;
  selectedCategoryIds: string[];
}

export interface PlayerAssignment {
  playerId: string;
  playerName: string;
  isImpostor: boolean;
}

export interface RoundState {
  categoryName: string;
  secretWord: string;
  assignments: PlayerAssignment[];
  starterPlayerName: string;
  rotationDirection: 'CLOCKWISE' | 'COUNTER_CLOCKWISE';
  chaosEventTriggered: string | null;
}

