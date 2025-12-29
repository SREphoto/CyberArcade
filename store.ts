
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { GameStatus, ViewMode, GameMode, GRID_WIDTH, GRID_HEIGHT, TETROMINOS, BLUEPRINTS, Blueprint, PowerUp, POWERUPS, BURGER_RECIPE } from './types';

interface GameState {
  status: GameStatus;
  mode: GameMode;
  viewMode: ViewMode;
  grid: (string | null)[][];
  score: number;
  level: number;
  lines: number;
  burgers: number;
  activePiece: {
    type: string;
    pos: [number, number];
    shape: number[][];
    facing?: [number, number];
  } | null;
  nextPiece: string | null;
  currentBlueprint: Blueprint | null;
  activePowerUps: string[];
  powerUpPool: PowerUp[];
  
  // Snake specific
  snakeBody: [number, number][];
  
  // Centipede specific
  bullets: { id: string, pos: [number, number], active: boolean }[];

  // Actions
  startGame: (mode?: GameMode) => void;
  toggleViewMode: () => void;
  movePiece: (dx: number, dy: number) => boolean;
  rotatePiece: () => void;
  hardDrop: () => void;
  tick: () => void;
  lockPiece: () => void;
  applyPowerUp: (pu: PowerUp) => void;
}

const createEmptyGrid = () => Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));

const getRandomPiece = (mode: GameMode) => {
  if (mode === GameMode.BURGERTIME) return BURGER_RECIPE[Math.floor(Math.random() * BURGER_RECIPE.length)];
  if (mode === GameMode.DIGDUG) return 'D_DIGDUG';
  if (mode === GameMode.SNAKE) return 'S_HEAD';
  if (mode === GameMode.CENTIPEDE) return 'C_BLASTER';
  const keys = Object.keys(TETROMINOS).filter(k => !k.startsWith('B_') && !k.startsWith('D_') && !k.startsWith('S_') && !k.startsWith('C_'));
  return keys[Math.floor(Math.random() * keys.length)];
};

const spawnSnakeFood = (grid: (string | null)[][]): [number, number] => {
  let x, y;
  do {
    x = Math.floor(Math.random() * GRID_WIDTH);
    y = Math.floor(Math.random() * GRID_HEIGHT);
  } while (grid[y][x]);
  return [x, y];
};

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  mode: GameMode.TETRIS,
  viewMode: ViewMode.CLASSIC,
  grid: createEmptyGrid(),
  score: 0,
  level: 1,
  lines: 0,
  burgers: 0,
  activePiece: null,
  nextPiece: null,
  currentBlueprint: null,
  activePowerUps: [],
  powerUpPool: [],
  snakeBody: [],
  bullets: [],

  startGame: (mode = GameMode.TETRIS) => {
    let grid = createEmptyGrid();
    let startPos: [number, number] = [Math.floor(GRID_WIDTH / 2) - 1, 0];
    let snakeBody: [number, number][] = [];

    if (mode === GameMode.DIGDUG) {
      grid = Array.from({ length: GRID_HEIGHT }, (_, y) => 
        Array.from({ length: GRID_WIDTH }, (_, x) => {
          if (y < 4) return null;
          const r = Math.random();
          if (r < 0.05) return 'D_ROCK';
          if (r < 0.08) return 'D_POOKA';
          if (r < 0.1) return 'D_FYGAR';
          return 'D_DIRT';
        })
      );
      startPos = [Math.floor(GRID_WIDTH / 2), 2];
    } else if (mode === GameMode.SNAKE) {
       startPos = [5, 10];
       snakeBody = [[5, 11], [5, 12]];
       const [fx, fy] = spawnSnakeFood(grid);
       grid[fy][fx] = 'S_FOOD';
    } else if (mode === GameMode.CENTIPEDE) {
       startPos = [5, GRID_HEIGHT - 1];
       // Spawn mushrooms
       for (let i = 0; i < 20; i++) {
          const rx = Math.floor(Math.random() * GRID_WIDTH);
          const ry = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 1;
          grid[ry][rx] = 'C_MUSHROOM';
       }
       // Spawn Centipede at top
       for (let i = 0; i < 8; i++) {
          grid[0][i] = 'C_SEGMENT';
       }
    }

    const type = getRandomPiece(mode);
    set({
      status: GameStatus.PLAYING,
      mode,
      grid,
      score: 0,
      level: 1,
      lines: 0,
      burgers: 0,
      activePiece: {
        type,
        pos: startPos,
        shape: TETROMINOS[type].shape,
        facing: mode === GameMode.SNAKE ? [0, -1] : [0, 1]
      },
      nextPiece: getRandomPiece(mode),
      currentBlueprint: mode === GameMode.LEGO ? BLUEPRINTS[0] : null,
      activePowerUps: [],
      snakeBody,
      bullets: []
    });
  },

  toggleViewMode: () => {
    const modes = [ViewMode.CLASSIC, ViewMode.WELL, ViewMode.ISOMETRIC];
    const nextIndex = (modes.indexOf(get().viewMode) + 1) % modes.length;
    set({ viewMode: modes[nextIndex] });
  },

  movePiece: (dx, dy) => {
    const { activePiece, grid, status, mode, snakeBody } = get();
    if (!activePiece || status !== GameStatus.PLAYING) return false;

    const newPos: [number, number] = [activePiece.pos[0] + dx, activePiece.pos[1] + dy];
    
    if (mode === GameMode.SNAKE) {
      // Just change direction, don't move immediately
      if (dx !== 0 && activePiece.facing![0] === -dx) return false;
      if (dy !== 0 && activePiece.facing![1] === -dy) return false;
      set({ activePiece: { ...activePiece, facing: [dx, dy] } });
      return true;
    }

    if (mode === GameMode.CENTIPEDE) {
      if (newPos[0] < 0 || newPos[0] >= GRID_WIDTH) return false;
      set({ activePiece: { ...activePiece, pos: [newPos[0], activePiece.pos[1]] } });
      return true;
    }

    if (mode === GameMode.DIGDUG) {
      if (newPos[0] < 0 || newPos[0] >= GRID_WIDTH || newPos[1] < 0 || newPos[1] >= GRID_HEIGHT) return false;
      const targetBlock = grid[newPos[1]][newPos[0]];
      if (targetBlock === 'D_ROCK') return false;
      if (targetBlock === 'D_POOKA' || targetBlock === 'D_FYGAR') {
        set({ status: GameStatus.GAME_OVER });
        return false;
      }
      const newGrid = grid.map(row => [...row]);
      if (targetBlock === 'D_DIRT') {
          newGrid[newPos[1]][newPos[0]] = null;
          set(state => ({ score: state.score + 10 }));
      }
      set({ activePiece: { ...activePiece, pos: newPos, facing: [dx, dy] }, grid: newGrid });
      return true;
    }

    if (checkCollision(activePiece.shape, newPos, grid)) {
      if (dy > 0) get().lockPiece();
      return false;
    }
    set({ activePiece: { ...activePiece, pos: newPos } });
    return true;
  },

  rotatePiece: () => {
    const { activePiece, grid, mode, status, bullets } = get();
    if (!activePiece || status !== GameStatus.PLAYING) return;
    
    if (mode === GameMode.CENTIPEDE) {
       // Fire Bullet
       const newBullet = { id: Math.random().toString(), pos: [activePiece.pos[0], activePiece.pos[1] - 1] as [number, number], active: true };
       set({ bullets: [...bullets, newBullet] });
       return;
    }

    if (mode === GameMode.DIGDUG) {
      const [fx, fy] = activePiece.facing || [0, 1];
      const targetX = activePiece.pos[0] + fx;
      const targetY = activePiece.pos[1] + fy;
      if (targetX >= 0 && targetX < GRID_WIDTH && targetY >= 0 && targetY < GRID_HEIGHT) {
        const target = grid[targetY][targetX];
        if (target === 'D_POOKA' || target === 'D_FYGAR') {
          const newGrid = grid.map(row => [...row]);
          newGrid[targetY][targetX] = null;
          window.dispatchEvent(new CustomEvent('particle-burst', { 
              detail: { position: [targetX - GRID_WIDTH/2 + 0.5, GRID_HEIGHT - targetY - 0.5, 0], color: '#ff0000' } 
          }));
          set(state => ({ score: state.score + 200, grid: newGrid }));
        }
      }
      return;
    }

    if (mode === GameMode.BURGERTIME || mode === GameMode.SNAKE) return; 
    const rotated = activePiece.shape[0].map((_, i) => activePiece.shape.map(row => row[i]).reverse());
    if (!checkCollision(rotated, activePiece.pos, grid)) {
      set({ activePiece: { ...activePiece, shape: rotated } });
    }
  },

  hardDrop: () => {
    if (get().mode === GameMode.DIGDUG || get().mode === GameMode.SNAKE || get().mode === GameMode.CENTIPEDE) return;
    while (get().movePiece(0, 1)) {}
  },

  lockPiece: () => {
    const { activePiece, grid, nextPiece, mode, currentBlueprint } = get();
    if (!activePiece || mode === GameMode.DIGDUG || mode === GameMode.SNAKE || mode === GameMode.CENTIPEDE) return;

    const newGrid = grid.map(row => [...row]);
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const gridY = activePiece.pos[1] + y;
          const gridX = activePiece.pos[0] + x;
          if (gridY >= 0 && gridY < GRID_HEIGHT) newGrid[gridY][gridX] = activePiece.type; 
        }
      });
    });

    if (mode === GameMode.TETRIS) {
      let cleared = 0;
      const finalGrid = newGrid.filter(row => {
        const isFull = row.every(cell => cell !== null);
        if (isFull) cleared++;
        return !isFull;
      });
      while (finalGrid.length < GRID_HEIGHT) finalGrid.unshift(Array(GRID_WIDTH).fill(null));
      const type = nextPiece || getRandomPiece(mode);
      const newActive = { type, pos: [Math.floor(GRID_WIDTH / 2) - 1, 0] as [number, number], shape: TETROMINOS[type].shape };
      if (checkCollision(newActive.shape, newActive.pos, finalGrid)) set({ status: GameStatus.GAME_OVER });
      else set(state => ({
        grid: finalGrid, activePiece: newActive, nextPiece: getRandomPiece(mode),
        lines: state.lines + cleared, score: state.score + (cleared * 100 * state.level),
        level: Math.floor((state.lines + cleared) / 10) + 1
      }));
    } else if (mode === GameMode.LEGO) {
      const isComplete = checkBlueprint(newGrid, currentBlueprint);
      if (isComplete) {
        const shuffled = [...POWERUPS].sort(() => 0.5 - Math.random()).slice(0, 10);
        set({ status: GameStatus.POWERUP_SELECT, powerUpPool: shuffled, grid: newGrid });
      } else {
        const type = nextPiece || getRandomPiece(mode);
        const newActive = { type, pos: [Math.floor(GRID_WIDTH / 2) - 1, 0] as [number, number], shape: TETROMINOS[type].shape };
        if (checkCollision(newActive.shape, newActive.pos, newGrid)) set({ status: GameStatus.GAME_OVER });
        else set({ grid: newGrid, activePiece: newActive, nextPiece: getRandomPiece(mode) });
      }
    } else if (mode === GameMode.BURGERTIME) {
      let burgersMade = 0;
      const finalGrid = newGrid.map(row => [...row]);
      for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y <= GRID_HEIGHT - BURGER_RECIPE.length; y++) {
          let match = true;
          for (let i = 0; i < BURGER_RECIPE.length; i++) {
            const expected = BURGER_RECIPE[BURGER_RECIPE.length - 1 - i];
            if (newGrid[y + i][x] !== expected) {
              match = false;
              break;
            }
          }
          if (match) {
            burgersMade++;
            for (let i = 0; i < BURGER_RECIPE.length; i++) {
              finalGrid[y + i][x] = null;
            }
            window.dispatchEvent(new CustomEvent('particle-burst', { 
                detail: { position: [x - GRID_WIDTH/2 + 0.5, GRID_HEIGHT - y - 1, 0], color: '#ffff00' } 
            }));
          }
        }
      }
      const type = nextPiece || getRandomPiece(mode);
      const newActive = { type, pos: [Math.floor(GRID_WIDTH / 2) - 1, 0] as [number, number], shape: TETROMINOS[type].shape };
      if (checkCollision(newActive.shape, newActive.pos, finalGrid)) set({ status: GameStatus.GAME_OVER });
      else set(state => ({
        grid: finalGrid,
        activePiece: newActive,
        nextPiece: getRandomPiece(mode),
        burgers: state.burgers + burgersMade,
        score: state.score + (burgersMade * 500),
        level: Math.floor((state.burgers + burgersMade) / 5) + 1
      }));
    }
  },

  applyPowerUp: (pu: PowerUp) => {
    const { level, mode } = get();
    const nextLevel = level + 1;
    const nextBlueprint = mode === GameMode.LEGO ? BLUEPRINTS[nextLevel % BLUEPRINTS.length] : null;
    set(state => ({
      status: GameStatus.PLAYING,
      level: nextLevel,
      currentBlueprint: nextBlueprint,
      grid: createEmptyGrid(),
      activePowerUps: [...state.activePowerUps, pu.id],
      score: state.score + 1000
    }));
  },

  tick: () => {
    const { status, mode, grid, activePiece, snakeBody, bullets } = get();
    if (status !== GameStatus.PLAYING) return;

    if (mode === GameMode.SNAKE && activePiece) {
      const newHead: [number, number] = [activePiece.pos[0] + activePiece.facing![0], activePiece.pos[1] + activePiece.facing![1]];
      
      // Collision Checks
      if (newHead[0] < 0 || newHead[0] >= GRID_WIDTH || newHead[1] < 0 || newHead[1] >= GRID_HEIGHT) {
        set({ status: GameStatus.GAME_OVER });
        return;
      }
      if (snakeBody.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])) {
        set({ status: GameStatus.GAME_OVER });
        return;
      }

      const newGrid = grid.map(row => [...row]);
      const ateFood = newGrid[newHead[1]][newHead[0]] === 'S_FOOD';
      const newBody = [activePiece.pos, ...snakeBody];
      
      if (ateFood) {
        newGrid[newHead[1]][newHead[0]] = null;
        const [fx, fy] = spawnSnakeFood(newGrid);
        newGrid[fy][fx] = 'S_FOOD';
        set(s => ({ score: s.score + 50 }));
      } else {
        newBody.pop();
      }

      set({ activePiece: { ...activePiece, pos: newHead }, snakeBody: newBody, grid: newGrid });
      return;
    }

    if (mode === GameMode.CENTIPEDE) {
      const newGrid = grid.map(row => [...row]);
      const newBullets = bullets.map(b => ({ ...b, pos: [b.pos[0], b.pos[1] - 1] as [number, number] })).filter(b => b.pos[1] >= 0);
      
      // Move Centipede
      for (let y = 0; y < GRID_HEIGHT - 1; y++) {
         for (let x = 0; x < GRID_WIDTH; x++) {
            if (newGrid[y][x] === 'C_SEGMENT') {
               // Simple AI: Move right, if hit wall or mushroom, drop down
               const dir = (y % 2 === 0) ? 1 : -1;
               const nx = x + dir;
               if (nx < 0 || nx >= GRID_WIDTH || newGrid[y][nx] === 'C_MUSHROOM') {
                  newGrid[y+1][x] = 'C_SEGMENT';
                  newGrid[y][x] = null;
               } else {
                  newGrid[y][nx] = 'C_SEGMENT';
                  newGrid[y][x] = null;
               }
            }
         }
      }

      // Bullet Collision
      newBullets.forEach(b => {
         const target = newGrid[b.pos[1]][b.pos[0]];
         if (target === 'C_SEGMENT') {
            newGrid[b.pos[1]][b.pos[0]] = 'C_MUSHROOM';
            b.active = false;
            set(s => ({ score: s.score + 100 }));
         } else if (target === 'C_MUSHROOM') {
            newGrid[b.pos[1]][b.pos[0]] = null;
            b.active = false;
         }
      });

      set({ grid: newGrid, bullets: newBullets.filter(b => b.active) });
      return;
    }

    if (mode === GameMode.DIGDUG) {
      const newGrid = grid.map(row => [...row]);
      let changed = false;
      for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          if (newGrid[y][x] === 'D_ROCK' && !newGrid[y + 1][x]) {
            newGrid[y + 1][x] = 'D_ROCK';
            newGrid[y][x] = null;
            changed = true;
          }
        }
      }
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const type = newGrid[y][x];
          if ((type === 'D_POOKA' || type === 'D_FYGAR') && Math.random() < 0.2) {
             const dirs = [[0,1], [0,-1], [1,0], [-1,0]];
             const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
             const nx = x + dx, ny = y + dy;
             if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT && !newGrid[ny][nx]) {
                newGrid[ny][nx] = type;
                newGrid[y][x] = null;
                changed = true;
             }
          }
        }
      }
      if (activePiece) {
        const current = newGrid[activePiece.pos[1]][activePiece.pos[0]];
        if (current === 'D_POOKA' || current === 'D_FYGAR' || current === 'D_ROCK') set({ status: GameStatus.GAME_OVER });
      }
      if (changed) set({ grid: newGrid });
    } else {
      get().movePiece(0, 1);
    }
  }
}));

function checkCollision(shape: number[][], pos: [number, number], grid: (string | null)[][]) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = pos[0] + x;
        const newY = pos[1] + y;
        if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT || (newY >= 0 && grid[newY][newX])) return true;
      }
    }
  }
  return false;
}

function checkBlueprint(grid: (string | null)[][], blueprint: Blueprint | null): boolean {
  if (!blueprint) return false;
  const bHeight = blueprint.shape.length;
  const bWidth = blueprint.shape[0].length;
  const startY = GRID_HEIGHT - bHeight;
  const startX = Math.floor((GRID_WIDTH - bWidth) / 2);
  for (let y = 0; y < bHeight; y++) {
    for (let x = 0; x < bWidth; x++) {
      const required = blueprint.shape[y][x];
      const actual = grid[startY + y][startX + x];
      if (required === 1 && !actual) return false;
    }
  }
  return true;
}
