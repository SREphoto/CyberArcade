
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect } from 'react';
import { Play, RotateCw, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Layout, Box, Shapes, Zap, Utensils, Mountain, MousePointer2, Gamepad2, Bug } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, TETROMINOS, ViewMode, GameMode, PowerUp, BURGER_RECIPE } from '../../types';

export const HUD: React.FC = () => {
  const { 
    score, status, level, lines, burgers, nextPiece, startGame, movePiece, rotatePiece, 
    hardDrop, viewMode, toggleViewMode, mode, currentBlueprint, powerUpPool, applyPowerUp, activePowerUps 
  } = useStore();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (status !== GameStatus.PLAYING) return;
        switch(e.key) {
            case 'ArrowLeft': movePiece(-1, 0); break;
            case 'ArrowRight': movePiece(1, 0); break;
            case 'ArrowDown': movePiece(0, 1); break;
            case 'ArrowUp': 
              if (mode === GameMode.DIGDUG || mode === GameMode.SNAKE) movePiece(0, -1);
              else rotatePiece(); 
              break;
            case 'Enter':
              if (mode === GameMode.DIGDUG || mode === GameMode.CENTIPEDE) rotatePiece(); 
              break;
            case ' ': hardDrop(); break;
            case 'v': toggleViewMode(); break;
        }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, mode, movePiece, rotatePiece, hardDrop, toggleViewMode]);

  if (status === GameStatus.MENU || status === GameStatus.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-gray-900/90 border border-cyan-500/30 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(0,255,255,0.2)] max-w-sm w-full my-8">
          <h1 className="text-4xl font-black text-cyan-400 mb-2 font-cyber tracking-tighter italic uppercase">
            {status === GameStatus.MENU ? 'Cyber Arcade' : 'System Crash'}
          </h1>
          
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => startGame(GameMode.TETRIS)}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              CLASSIC TETRIS <Play fill="black" className="w-4 h-4" />
            </button>
            <button 
              onClick={() => startGame(GameMode.LEGO)}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
            >
              LEGO BUILD <Box fill="black" className="w-4 h-4" />
            </button>
            <button 
              onClick={() => startGame(GameMode.BURGERTIME)}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
            >
              BURGER TIME <Utensils fill="black" className="w-4 h-4" />
            </button>
            <button 
              onClick={() => startGame(GameMode.DIGDUG)}
              className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
            >
              DIG DUG 3D <Mountain fill="black" className="w-4 h-4" />
            </button>
            <button 
              onClick={() => startGame(GameMode.SNAKE)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
            >
              NEON SNAKE <Gamepad2 fill="black" className="w-4 h-4" />
            </button>
            <button 
              onClick={() => startGame(GameMode.CENTIPEDE)}
              className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
            >
              CENTIPEDE <Bug fill="black" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.POWERUP_SELECT) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/90 backdrop-blur-xl p-4 overflow-y-auto">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-yellow-400 italic font-cyber tracking-widest uppercase">Augmentation Required</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {powerUpPool.map((pu) => (
              <button 
                key={pu.id}
                onClick={() => applyPowerUp(pu)}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-yellow-500/20 hover:border-yellow-500 transition-all text-center flex flex-col items-center gap-2"
              >
                <div className="text-3xl">{pu.icon}</div>
                <div className="text-[10px] text-yellow-400 font-bold uppercase">{pu.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-10 flex flex-col justify-between z-50 font-cyber overflow-hidden">
        {/* Top Section */}
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <div className="text-cyan-400 text-3xl md:text-6xl font-black drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                    {score.toLocaleString()}
                </div>
                <div className="text-purple-400 text-[10px] md:text-sm tracking-[0.3em] font-bold uppercase">
                    LEVEL {level} • {
                      mode === GameMode.BURGERTIME ? `BURGERS ${burgers}` : 
                      mode === GameMode.DIGDUG ? 'MINING DEEP' :
                      mode === GameMode.SNAKE ? 'COLLECTING DATA' :
                      mode === GameMode.CENTIPEDE ? 'DEFENDING GRID' :
                      mode === GameMode.TETRIS ? `LINES ${lines}` : 'BUILD'
                    }
                </div>
            </div>

            <div className="flex flex-col items-end gap-2 md:gap-4">
                {mode === GameMode.BURGERTIME && (
                    <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/30 p-2 md:p-4 rounded-2xl flex flex-col items-center gap-2">
                        <span className="text-[8px] md:text-[10px] text-orange-400 font-bold tracking-widest uppercase">RECIPE</span>
                        <div className="flex flex-col-reverse gap-1 items-center">
                            {BURGER_RECIPE.map((id, i) => (
                                <div key={i} className="px-2 py-0.5 rounded text-[8px] font-mono border border-white/10 text-white bg-white/5 uppercase" style={{ color: TETROMINOS[id].color }}>
                                    {id.replace('B_', '')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {mode !== GameMode.DIGDUG && mode !== GameMode.SNAKE && mode !== GameMode.CENTIPEDE && (
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 p-2 md:p-3 rounded-2xl flex flex-col items-center">
                      <span className="text-[8px] md:text-[10px] text-gray-400 mb-2 uppercase tracking-tighter">NEXT</span>
                      <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center scale-50 md:scale-75">
                          {nextPiece && (
                              <div className="grid grid-cols-4 gap-1">
                                  {TETROMINOS[nextPiece].shape.flat().map((v, i) => (
                                      <div key={i} className={`w-3 h-3 rounded-sm ${v ? '' : 'opacity-0'}`} style={{ backgroundColor: TETROMINOS[nextPiece].color }}></div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
                )}

                <button onClick={toggleViewMode} className="pointer-events-auto p-3 md:p-4 bg-white/5 border border-white/10 rounded-full text-white shadow-xl hover:bg-white/20 transition-colors">
                  <Layout className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex justify-between items-end w-full pb-4">
            <div className="grid grid-cols-3 gap-1 pointer-events-auto">
                <div />
                <button 
                  onPointerDown={() => (mode === GameMode.DIGDUG || mode === GameMode.SNAKE) ? movePiece(0, -1) : rotatePiece()} 
                  className="w-12 h-12 md:w-16 md:h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white active:bg-cyan-500"
                >
                  <ArrowUp className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <div />
                
                <button 
                  onPointerDown={() => movePiece(-1, 0)} 
                  className="w-12 h-12 md:w-16 md:h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white active:bg-cyan-500"
                >
                  <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button 
                  onPointerDown={() => movePiece(0, 1)} 
                  className="w-12 h-12 md:w-16 md:h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white active:bg-cyan-500"
                >
                  <ArrowDown className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button 
                  onPointerDown={() => movePiece(1, 0)} 
                  className="w-12 h-12 md:w-16 md:h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white active:bg-cyan-500"
                >
                  <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
            </div>

            <div className="flex flex-col gap-2 pointer-events-auto items-end">
                {mode === GameMode.DIGDUG || mode === GameMode.CENTIPEDE ? (
                  <button 
                    onPointerDown={() => rotatePiece()} 
                    className="w-20 h-20 md:w-24 md:h-24 bg-red-500/80 border-4 border-white/30 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-90 font-black text-xl italic"
                  >
                    {mode === GameMode.CENTIPEDE ? 'FIRE' : 'PUMP'}
                  </button>
                ) : (
                  <>
                    <button 
                      onPointerDown={() => hardDrop()} 
                      className="w-14 h-14 md:w-16 md:h-16 bg-purple-500/80 border border-white/30 rounded-2xl flex items-center justify-center text-white active:scale-90"
                    >
                      <ArrowDown className="w-8 h-8" />
                    </button>
                    <button 
                      onPointerDown={() => rotatePiece()} 
                      className="w-20 h-20 md:w-24 md:h-24 bg-cyan-500 border-4 border-white/30 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-90"
                    >
                      <RotateCw className="w-10 h-10" />
                    </button>
                  </>
                )}
            </div>
        </div>
    </div>
  );
};
