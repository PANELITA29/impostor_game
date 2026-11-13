export type ScreenId =
  | 'HOME'
  | 'LOBBY'
  | 'CATEGORIES'
  | 'SETTINGS'
  | 'PASS_AND_PLAY'
  | 'ACTIVE_ROUND'
  | 'VOTING'
  | 'JUDGMENT'
  | 'RESOLUTION';

export type RoundDuration = 60 | 120 | 180 | 300 | null;

export type GameTheme =
  | 'midnight'
  | 'cyberpunk'
  | 'crimson'
  | 'amethyst'
  | 'matrix'
  | 'solar'
  | 'arctic'
  | 'synthwave';
export type GameLanguage = 'es' | 'en';

export interface UserPreferences {
  theme: GameTheme;
  language: GameLanguage;
  sfxVolume: number;
  musicVolume: number;
  haptics: boolean;
  wakeLockEnabled: boolean;
  debateMusicTrack: string;
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
  icon?: string;
}

export interface GameSettings {
  players: Player[];
  impostorCount: number;
  chaosMode: boolean;
  finalJudgmentMode: boolean;
  roundDuration: RoundDuration;
  selectedCategoryIds: string[];
}

export interface PlayerAssignment {
  playerId: string;
  playerName: string;
  isImpostor: boolean;
}

export interface VoteResult {
  votedPlayerId: string;
  votedPlayerName: string;
  wasImpostor: boolean;
  innocentsWon: boolean;
  impostorStoleVictory?: boolean;
  impostorGuess?: string;
}

export interface InterimElimination {
  votedPlayerId: string;
  votedPlayerName: string;
  wasImpostor: boolean;
  remainingImpostorCount: number;
  remainingInnocentCount: number;
}

export interface RoundState {
  categoryName: string;
  secretWord: string;
  assignments: PlayerAssignment[];
  starterPlayerName: string;
  rotationDirection: 'CLOCKWISE' | 'COUNTER_CLOCKWISE';
  chaosEventTriggered: string | null;
  voteResult?: VoteResult | null;
  eliminatedPlayerIds: string[];
  interimElimination?: InterimElimination | null;
  debateRemainingSeconds?: number | null;
}

