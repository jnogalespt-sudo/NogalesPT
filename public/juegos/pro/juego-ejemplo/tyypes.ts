
export type Category = 'directas' | 'inversas' | 'trabadas' | 'mixtas';
export type Position = 'inicio' | 'mitad' | 'final';

export interface WordData {
  word: string;
  emoji: string;
  syllables: string[];
  targetIdx: number;
  options: string[];
}

export interface ErrorLog {
  word: string;
  correct: string;
  failed: string;
}

export type View = 'LOGIN' | 'MAIN_MENU' | 'POSITION_MENU' | 'GAME' | 'REPORT';
