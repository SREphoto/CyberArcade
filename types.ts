
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED',
  POWERUP_SELECT = 'POWERUP_SELECT',
  VICTORY = 'VICTORY',
  SHOP = 'SHOP'
}

export enum GameMode {
  TETRIS = 'TETRIS',
  LEGO = 'LEGO',
  BURGERTIME = 'BURGERTIME',
  DIGDUG = 'DIGDUG',
  SNAKE = 'SNAKE',
  CENTIPEDE = 'CENTIPEDE'
}

export enum ViewMode {
  CLASSIC = 'CLASSIC',
  WELL = 'WELL',
  ISOMETRIC = 'ISOMETRIC'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  GEM = 'GEM',
  LETTER = 'LETTER',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE',
  SHOP_PORTAL = 'SHOP_PORTAL'
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number];
  active: boolean;
  color?: string;
  value?: string;
  points?: number;
  targetIndex?: number;
  hasFired?: boolean;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const POWERUPS: PowerUp[] = [
  { id: 'master', name: 'Master Builder', description: 'Next 5 pieces are I-blocks', icon: '🏗️' },
  { id: 'hammer', name: 'Jackhammer', description: 'Landings destroy 2 rows', icon: '🔨' },
  { id: 'warp', name: 'Time Warp', description: 'Permenent slow motion', icon: '⏳' },
  { id: 'nuke', name: 'Neon Nuke', description: 'Clears bottom 5 rows', icon: '☢️' },
  { id: 'hack', name: 'Blueprint Hack', description: 'Skip current shape', icon: '💾' },
  { id: 'glue', name: 'Glue Gun', description: 'Double score for 1 min', icon: '🔫' },
  { id: 'switch', name: 'Spectrum Switch', description: 'Active piece becomes "Wild"', icon: '🌈' },
  { id: 'flip', name: 'Gravity Flip', description: 'Pieces fall slower', icon: '🆙' },
  { id: 'pulse', name: 'Score Pulse', description: 'Level multiplier x2', icon: '📈' },
  { id: 'ghost', name: 'Ghost Vision', description: 'Show perfect landing spot', icon: '👻' },
];

export interface Blueprint {
  name: string;
  shape: (number | null)[][];
}

export const BLUEPRINTS: Blueprint[] = [
  { name: 'Small Square', shape: [[1,1], [1,1]] },
  { name: 'Tower', shape: [[1],[1],[1],[1]] },
  { name: 'Bridge', shape: [[1,1,1], [1,0,1]] },
  { name: 'Pyramid', shape: [[0,1,0], [1,1,1]] },
];

export const BURGER_RECIPE = ['B_BOTTOM', 'B_MEAT', 'B_LETTUCE', 'B_TOP'];

export const TETROMINOS: Record<string, { shape: number[][], color: string, id: string }> = {
  I: { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: '#00ffff', id: 'I' },
  J: { shape: [[1,0,0], [1,1,1], [0,0,0]], color: '#2979ff', id: 'J' },
  L: { shape: [[0,0,1], [1,1,1], [0,0,0]], color: '#ff9100', id: 'L' },
  O: { shape: [[1,1], [1,1]], color: '#ffea00', id: 'O' },
  S: { shape: [[0,1,1], [1,1,0], [0,0,0]], color: '#00e676', id: 'S' },
  T: { shape: [[0,1,0], [1,1,1], [0,0,0]], color: '#d500f9', id: 'T' },
  Z: { shape: [[1,1,0], [0,1,1], [0,0,0]], color: '#ff1744', id: 'Z' },
  // Burger
  B_BOTTOM: { shape: [[1]], color: '#d2b48c', id: 'B_BOTTOM' },
  B_MEAT: { shape: [[1]], color: '#633917', id: 'B_MEAT' },
  B_LETTUCE: { shape: [[1]], color: '#2ecc71', id: 'B_LETTUCE' },
  B_TOP: { shape: [[1]], color: '#d2b48c', id: 'B_TOP' },
  // DigDug
  D_DIGDUG: { shape: [[1]], color: '#ffffff', id: 'D_DIGDUG' },
  D_DIRT: { shape: [[1]], color: '#5d4037', id: 'D_DIRT' },
  D_ROCK: { shape: [[1]], color: '#757575', id: 'D_ROCK' },
  D_POOKA: { shape: [[1]], color: '#ff1744', id: 'D_POOKA' },
  D_FYGAR: { shape: [[1]], color: '#00e676', id: 'D_FYGAR' },
  // Snake
  S_HEAD: { shape: [[1]], color: '#00ffcc', id: 'S_HEAD' },
  S_BODY: { shape: [[1]], color: '#00aaff', id: 'S_BODY' },
  S_FOOD: { shape: [[1]], color: '#ff00ff', id: 'S_FOOD' },
  // Centipede
  C_BLASTER: { shape: [[1]], color: '#ffffff', id: 'C_BLASTER' },
  C_SEGMENT: { shape: [[1]], color: '#ff0055', id: 'C_SEGMENT' },
  C_MUSHROOM: { shape: [[1]], color: '#ffea00', id: 'C_MUSHROOM' },
  C_BULLET: { shape: [[1]], color: '#00ffff', id: 'C_BULLET' },
};

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const BLOCK_SIZE = 1;
export const LANE_WIDTH = 4;
export const SPAWN_DISTANCE = 150;
export const REMOVE_DISTANCE = 20;
export const GEMINI_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
