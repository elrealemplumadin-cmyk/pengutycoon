import React, { useState, useEffect } from 'react';
import { INITIAL_STATE, GameState } from './types';
import { ENEMIES } from './constants';
import { CombatModal } from './components/CombatModal';

const PENGUIN_QUOTES = [
    "¡Más pescado!",
    "¡A nadar!",
    "¡Brrr, qué frío!",
    "¡Cuidado con las focas!",
    "¡Deslízate!"
];

const HENRY_QUOTES = [
    "¡SOY EL REY!",
    "¡NADIE ME GANA!",
    "¡PODER ILLIMITADO!",
    "¡DOMINACIÓN TOTAL!"
];

let isMuted = false;

export default function App() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [muted, setMuted] = useState(false);
    const [isHenryMode, setIsHenryMode] = useState(false);
    const [penguinSpeech, setPenguinSpeech] = useState<{text: string, visible: boolean} | null>(null);
    
    // Combat State
    const [enemyHp, setEnemyHp] = useState(ENEMIES[0].baseHp);
    const currentEnemy = ENEMIES[0];

    useEffect(() => { isMuted = muted; }, [muted]);

    // PENGUIN SPEECH LOOP
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        let hideTimeout: ReturnType<typeof setTimeout>;

        const scheduleNextSpeech = () => {
            const delay = isHenryMode ? 8000 : Math.floor(Math.random() * (30000 - 20000 + 1) + 20000); 

            timeout = setTimeout(() => {
                const currentQuotes = isHenryMode ? HENRY_QUOTES : PENGUIN_QUOTES;
                const text = currentQuotes[Math.floor(Math.random() * currentQuotes.length)];
                setPenguinSpeech({ text, visible: true });
                
                hideTimeout = setTimeout(() => {
                    setPenguinSpeech(prev => prev ? { ...prev, visible: false } : null);
                }, 4000);

                scheduleNextSpeech(); 
            }, delay);
        };

        scheduleNextSpeech();

        return () => {
            clearTimeout(timeout);
            clearTimeout(hideTimeout);
        };
    }, [isHenryMode]);

    const addPlayerDamageFloat = (val: number) => {
        // Placeholder for float logic
        console.log(`Damage: ${val}`);
    };

    const handleHit = (dmg: number, isCrit: boolean) => {
        addPlayerDamageFloat(dmg);
        setEnemyHp(prev => Math.max(0, prev - dmg));
    };

    const playerStats = { atk: gameState.baseAtk, def: gameState.baseDef, clickPower: 1 };
    const skillsOwned: string[] = [];
    const skillCooldowns = {};

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
            {penguinSpeech && penguinSpeech.visible && (
                <div className="absolute top-10 z-50 bg-white text-black p-3 rounded-xl shadow-lg animate-bounce max-w-[200px] text-center font-bold border-2 border-slate-300">
                    {penguinSpeech.text}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b-2 border-r-2 border-slate-300"></div>
                </div>
            )}
            
            <div className="absolute top-4 right-4 flex gap-2 z-50">
                <button onClick={() => setMuted(!muted)} className="bg-slate-800 p-2 rounded border border-slate-700 hover:bg-slate-700">
                    {muted ? '🔇' : '🔊'}
                </button>
                <button onClick={() => setIsHenryMode(!isHenryMode)} className={`p-2 rounded border font-bold ${isHenryMode ? 'bg-red-600 border-red-400' : 'bg-blue-600 border-blue-400'}`}>
                    {isHenryMode ? 'Henry Mode' : 'Normal'}
                </button>
            </div>

            <CombatModal 
                enemy={{...currentEnemy, hp: enemyHp, maxHp: currentEnemy.baseHp}}
                playerStats={playerStats}
                playerHp={gameState.hp}
                maxPlayerHp={gameState.maxHp}
                timeLeft={30}
                onHit={handleHit}
                critChance={0.01}
                closing={false}
                skillsOwned={skillsOwned}
                skillCooldowns={skillCooldowns}
                onUseSkill={() => {}}
                playerBlocking={false}
                onAttackSound={(crit) => !muted && console.log(crit ? "Crit Sound" : "Hit Sound")}
            />
        </div>
    );
}