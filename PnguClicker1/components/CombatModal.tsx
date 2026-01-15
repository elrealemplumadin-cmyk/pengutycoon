import React, { useEffect, useState } from 'react';
import { Skull, Sword, Shield, Castle, Users, Target, Zap, Gavel, ShieldCheck } from 'lucide-react';
import { SKILLS, formatNumber } from '../constants';

interface CombatModalProps {
    enemy: any;
    playerStats: {
        atk: number;
        def: number;
        clickPower: number; 
    };
    playerHp: number;
    maxPlayerHp: number;
    timeLeft: number;
    onHit: (dmg: number, isCrit: boolean) => void;
    critChance: number;
    closing: boolean;
    isHorde?: boolean;
    enemiesLeft?: number;
    isDungeon?: boolean;
    dungeonWave?: number;
    skillsOwned: string[];
    skillCooldowns: Record<string, number>;
    onUseSkill: (skillId: string) => void;
    playerBlocking: boolean;
    onAttackSound: (isCrit: boolean) => void; // New prop for sound
}

export const CombatModal: React.FC<CombatModalProps> = ({
    enemy, playerStats, playerHp, maxPlayerHp, timeLeft, onHit, critChance, closing, isHorde, enemiesLeft, isDungeon, dungeonWave, skillsOwned, skillCooldowns, onUseSkill, playerBlocking, onAttackSound
}) => {
    const [shake, setShake] = useState(false);
    const [floats, setFloats] = useState<{id: number, val: string, crit: boolean, x: number, y: number}[]>([]);

    // Keyboard Shortcuts for Skills
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(closing || !enemy) return;
            if (e.key.toLowerCase() === 'q' && skillsOwned.includes('smite')) onUseSkill('smite');
            if (e.key.toLowerCase() === 'w' && skillsOwned.includes('block')) onUseSkill('block');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [skillsOwned, closing, enemy, onUseSkill]);

    const handleAttack = () => {
        if(closing) return;
        const isCrit = Math.random() < critChance; 
        
        let dmg = playerStats.atk;
        if (isCrit) dmg = Math.floor(dmg * 1.75);

        onHit(dmg, isCrit);
        onAttackSound(isCrit); // Play sound

        setShake(true);
        setTimeout(() => setShake(false), 50);

        const id = Date.now() + Math.random();
        setFloats(p => [...p.slice(-4), { 
            id, 
            val: isCrit ? `¡CRÍTICO! ${formatNumber(dmg)}` : formatNumber(dmg), 
            crit: isCrit, 
            x: 50 + (Math.random()*20 - 10), 
            y: 40 + (Math.random()*10 - 5) 
        }]);
        setTimeout(() => setFloats(p => p.filter(f => f.id !== id)), 800);
    };

    if (!enemy) return null;

    const enemyDef = enemy.def || enemy;

    return (
        <div className={`absolute inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm ${closing ? 'animate-combat-exit' : 'animate-combat-enter'} pointer-events-auto`}>
            
            {/* SKILLS SIDEBAR (Restored Layout) */}
            {skillsOwned.length > 0 && (
                <div className="absolute right-4 md:right-[calc(50%-320px)] top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
                    {SKILLS.filter(s => skillsOwned.includes(s.id)).map(skill => {
                        const cd = skillCooldowns[skill.id] || 0;
                        const onCooldown = cd > 0;
                        const isBoss = enemyDef.isBoss && skill.id === 'smite'; 
                        
                        return (
                            <div key={skill.id} className="relative group">
                                <button
                                    onClick={() => onUseSkill(skill.id)}
                                    disabled={onCooldown || isBoss}
                                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg transition-all active:scale-95 ${onCooldown || isBoss ? 'bg-slate-800 border-slate-600 opacity-50 cursor-default' : 'bg-slate-900 border-white/50 hover:bg-slate-800 hover:scale-105 cursor-pointer'}`}
                                >
                                    <div className={`${skill.color} ${onCooldown ? 'grayscale' : ''}`}>{React.createElement(skill.icon, { size: 28 })}</div>
                                    <span className="absolute -bottom-2 bg-black text-white text-[10px] font-black px-2 rounded border border-white/20">{skill.keybind}</span>
                                    {onCooldown && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full font-mono font-bold text-white text-sm">
                                            {Math.ceil(cd)}
                                        </div>
                                    )}
                                </button>
                                {/* Tooltip */}
                                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-48 bg-black/90 p-2 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-right">
                                    <h4 className={`font-bold text-xs uppercase ${skill.color}`}>{skill.name}</h4>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-1">{isBoss ? "No afecta a Jefes" : skill.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className={`w-full ${isDungeon ? 'max-w-xl border-purple-500 shadow-[0_0_50px_rgba(147,51,234,0.4)] dungeon-glow' : enemyDef.isBoss ? 'max-w-lg scale-105 border-yellow-500' : isHorde ? 'max-w-lg border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'max-w-[400px] border-slate-600'} bg-slate-900/90 border-2 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col transform transition-all`}>
                
                {/* DUNGEON SPECIFIC HEADER BG */}
                {isDungeon && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 pointer-events-none"></div>}

                {/* BLOCKING OVERLAY */}
                {playerBlocking && (
                    <div className="absolute inset-0 border-4 border-blue-400 z-[60] pointer-events-none animate-pulse rounded-3xl shadow-[inset_0_0_50px_rgba(59,130,246,0.5)]"></div>
                )}

                <div className={`p-3 flex justify-between items-center border-b border-slate-800 relative z-10 ${isDungeon ? 'bg-purple-950/80' : isHorde ? 'bg-red-900/80' : enemyDef.isBoss ? 'bg-red-950/50' : 'bg-slate-950'}`}>
                    <div className="flex items-center gap-2">
                        {isDungeon ? <Castle className="text-purple-300 animate-pulse" size={24}/> : <Skull className={`${enemyDef.isBoss ? 'text-yellow-400' : 'text-red-500'}`} size={enemyDef.isBoss ? 28 : 20} />}
                        <div>
                            <div className={`text-lg font-bold leading-none flex items-center gap-2 ${enemy.mutation ? enemy.mutation.color : 'text-white'}`}>
                                {enemy.mutation && <span>{enemy.mutation.prefix}</span>}
                                {isDungeon ? `Mazmorra: ${enemyDef.name}` : isHorde ? `Horda: ${enemyDef.name}` : enemyDef.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                {isDungeon ? <span className="text-purple-200 bg-purple-900/50 px-2 py-0.5 rounded">Oleada {dungeonWave} • Restantes: {enemiesLeft}</span> : isHorde ? <span className="text-white flex items-center gap-1"><Users size={10}/> Restantes: {enemiesLeft}</span> : enemyDef.isBoss ? 'JEFE DE MUNDO' : `Nivel ${enemy.level} ${enemy.mutation ? enemy.mutation.name : ''}`}
                            </div>
                        </div>
                    </div>
                    <div className={`bg-slate-900 px-3 py-1 rounded font-mono font-black border border-slate-800 ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                        {timeLeft.toFixed(1)}s
                    </div>
                </div>

                <div className="h-64 relative bg-slate-800/30 flex items-center justify-center overflow-hidden z-10">
                    {/* Dungeon Particles */}
                    {isDungeon && <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent animate-pulse"></div>}

                    <div className="absolute inset-0 pointer-events-none z-50">
                        {floats.map(f => (
                            <div key={f.id} className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black float-anim 
                                ${f.crit ? 'text-yellow-400 text-3xl z-50 drop-shadow-[0_2px_0_rgba(0,0,0,1)]' : 'text-white text-2xl drop-shadow-md'}`}
                                 style={{ left: `${f.x}%`, top: `${f.y}%` }}>
                                {f.val}
                            </div>
                        ))}
                    </div>

                    <div 
                        // onMouseDown removed to fix bug where clicking sprite dealt damage
                        className={`text-[8rem] filter drop-shadow-2xl transition-transform duration-75 ${shake ? 'scale-90 translate-y-2' : enemyDef.isBoss ? 'animate-pulse' : 'animate-sway'}`}
                    >
                        {enemyDef.sprite}
                    </div>
                </div>

                <div className="px-6 py-2 bg-slate-950/50 z-10">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                        <span>HP Enemigo</span>
                        <span className="text-white">{formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                        <div 
                            className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500 ease-out" 
                            style={{width: `${(enemy.hp/enemy.maxHp)*100}%`}}
                        ></div>
                    </div>
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-800 z-10">
                    <button 
                        onMouseDown={handleAttack}
                        className="w-full bg-red-600 hover:bg-red-500 border-b-4 border-red-800 active:scale-[0.98] transition-all rounded-2xl py-3 flex items-center justify-center gap-3 group shadow-lg"
                    >
                        <Sword className="text-white group-active:rotate-45 transition-transform" size={24} />
                        <span className="text-2xl font-black text-white tracking-widest italic">¡ATACAR!</span>
                    </button>
                    {/* STATS SECTION (MINIMALIST) */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="flex flex-col items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Daño</span>
                            <div className="flex items-center gap-1 text-yellow-400 font-mono font-bold"><Sword size={14}/> {formatNumber(playerStats.atk)}</div>
                        </div>
                        <div className="flex flex-col items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Defensa</span>
                            <div className="flex items-center gap-1 text-blue-400 font-mono font-bold"><Shield size={14}/> {formatNumber(playerStats.def)}</div>
                        </div>
                        <div className="flex flex-col items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Crit %</span>
                            <div className="flex items-center gap-1 text-orange-400 font-mono font-bold"><Target size={14}/> {(critChance*100).toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};