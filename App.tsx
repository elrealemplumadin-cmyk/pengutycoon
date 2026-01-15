import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
    Coins, Heart, Skull, Sword, Shield, Dna, Sparkles, Clock, MapPin, Sun, Book, Trophy, X, Lock, User, Zap, AlertCircle, Check, FlaskConical, FastForward, Info, RotateCcw, Target, Globe, ChevronDown, Hammer, Star, Diamond, ChevronLeft, Eye, ChevronRight, Flame, Users, AlertTriangle, Ghost, Sparkle, Anchor, Wrench, Anvil, Castle, ArrowUpCircle, Award, Search, ZapOff, Play, RefreshCcw, HeartCrack, Dumbbell, Cat, Swords, Gavel, ShieldCheck, MousePointer2, Fish, Settings, Volume2, VolumeX, Power, Key
} from 'lucide-react';
import { 
    DECORATIONS, WEAPONS, ARMOR, ENEMIES, WORLDS, CLASSES, ALCHEMY, MUTATIONS, formatNumber, BASE_REBIRTH_COST, FISHERMEN, TRAININGS, SKILLS
} from './constants';
import { GameItem, AlchemyItem, Mutation, BestiaryEntry } from './types';
import { CombatModal } from './components/CombatModal';

// --- TIPOS DE NOTIFICACIÓN ---
type NotifType = 'achievement' | 'horde' | 'unlock' | 'drop' | 'info' | 'warning' | 'rebirth';

interface Notification {
    id: number;
    text: string;
    icon: any;
    type: NotifType;
    fading?: boolean;
}

const PENGUIN_QUOTES = [
    "¿Más pescado?",
    "¡Brr, qué frío hace hoy!",
    "¿Has visto a mi primo el emperador?",
    "¡Soy el rey del hielo!",
    "Click, click, click... me mareo.",
    "Necesito unas vacaciones en el trópico.",
    "Esa espada pesa mucho para mis aletas.",
    "¡Cuidado con el Yeti!",
    "¿Unas gemitas para un pobre pingüino?",
    "Me siento más fuerte que ayer.",
    "¡Al infinito y más allá!",
    "La pesca es mi pasión.",
    "¿Y si dominamos el mundo?",
    "¡Mira qué estilo tengo!",
    "Glup, glup... tengo hambre.",
    "He visto cosas que no creerías...",
    "¿Has probado el sushi de hielo?",
    "Mis aletas están hechas para contar dinero.",
    "¿Invertimos en cripto-hielo?",
    "Dicen que soy el 'Elegido'... elegido para pescar.",
    "¡Cuidado, suelo resbaladizo!",
    "Noot noot!",
    "Soy pequeño, pero matón.",
    "¿Dónde guardo tantas espadas?",
    "El calentamiento global no es broma, amigo.",
    "¡Más rápido! ¡Más fuerte! ¡Más pez!",
    "¿Ese Leviatán me guiñó un ojo?",
    "Me duelen las patitas de tanto saltar.",
    "Si fuera un gato, tendría 9 vidas. Pero soy un pingüino.",
    "¿Tengo algo en el pico?",
    "¡Mira mamá, sin manos! (Son aletas)",
    "Un día conquistaré la galaxia... después de la siesta.",
    "¿Es eso un pez dorado o estoy alucinando?",
    "Recuerda hidratarte... con agua helada.",
    "Soy el terror de los siete mares (congelados)."
];

const HENRY_QUOTES = [
    "¡SOY EL REY!",
    "¡NADIE ME GANA!",
    "¡PODER ILLIMITADO!",
    "¡DOMINACIÓN TOTAL!",
    "¡Cuidado con la bestia!",
    "¡Soy imparable!",
    "¡Mira mi poder!",
    "¡Tiembla ante mi presencia!"
];

// --- ARQUITECTURA DE DATOS ---

interface GameStats {
    fish: number;
    gems: number; 
    totalFish: number;
    clicks: number;
    kills: number;
    day: number;
    inventory: Record<string, number>;
    rebirths: number;
    bestiary: Record<string, BestiaryEntry>;
    level: number;
    activePotions: Record<string, number>;
    enhancements: Record<string, number>;
    unlockedWorlds: number[];
    trainingLevels: Record<string, number>; 
    skillsOwned: string[]; 
    dungeonLevel: number;
    classIdx: number;
}

interface AchievementDef {
    id: string;
    name: string;
    description: string;
    condition: (stats: GameStats) => boolean;
    progress: (stats: GameStats) => { current: number, target: number, label: string };
    reward: { gems: number, xp: number };
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const ACHIEVEMENTS_LOGIC: AchievementDef[] = [
    // --- CLICS (EL GRIND) ---
    { id: 'click_1', name: '¿Hola?', description: 'Haz 1 clic.', condition: (s) => s.clicks >= 1, progress: (s) => ({ current: s.clicks, target: 1, label: 'Clics' }), reward: { gems: 5, xp: 10 }, tier: 'bronze' },
    { id: 'click_100', name: 'Calentando', description: 'Haz 100 clics.', condition: (s) => s.clicks >= 100, progress: (s) => ({ current: s.clicks, target: 100, label: 'Clics' }), reward: { gems: 10, xp: 50 }, tier: 'bronze' },
    { id: 'click_1k', name: 'Dedo Inquieto', description: 'Haz 1,000 clics.', condition: (s) => s.clicks >= 1000, progress: (s) => ({ current: s.clicks, target: 1000, label: 'Clics' }), reward: { gems: 20, xp: 200 }, tier: 'bronze' },
    { id: 'click_10k', name: 'Túnel Carpiano', description: '10,000 Clics. Descansa un poco.', condition: (s) => s.clicks >= 10000, progress: (s) => ({ current: s.clicks, target: 10000, label: 'Clics' }), reward: { gems: 50, xp: 1000 }, tier: 'silver' },
    { id: 'click_50k', name: 'Rompe-Mouses', description: '50,000 Clics. Logitech te odia.', condition: (s) => s.clicks >= 50000, progress: (s) => ({ current: s.clicks, target: 50000, label: 'Clics' }), reward: { gems: 100, xp: 5000 }, tier: 'gold' },
    { id: 'click_100k', name: 'Dedo Divino', description: '100,000 Clics. Velocidad luz.', condition: (s) => s.clicks >= 100000, progress: (s) => ({ current: s.clicks, target: 100000, label: 'Clics' }), reward: { gems: 250, xp: 20000 }, tier: 'platinum' },
    { id: 'click_500k', name: 'Singularidad', description: '500,000 Clics. Has trascendido.', condition: (s) => s.clicks >= 500000, progress: (s) => ({ current: s.clicks, target: 500000, label: 'Clics' }), reward: { gems: 500, xp: 50000 }, tier: 'platinum' },

    // --- ECONOMÍA (PECES) ---
    { id: 'fish_1k', name: 'Hucha', description: 'Acumula 1,000 peces en total.', condition: (s) => s.totalFish >= 1000, progress: (s) => ({ current: s.totalFish, target: 1000, label: 'Peces' }), reward: { gems: 5, xp: 100 }, tier: 'bronze' },
    { id: 'fish_100k', name: 'Emprendedor', description: '100,000 peces.', condition: (s) => s.totalFish >= 100000, progress: (s) => ({ current: s.totalFish, target: 100000, label: 'Peces' }), reward: { gems: 20, xp: 500 }, tier: 'bronze' },
    { id: 'fish_1m', name: 'Millonario', description: '1 Millón de peces.', condition: (s) => s.totalFish >= 1000000, progress: (s) => ({ current: s.totalFish, target: 1000000, label: 'Peces' }), reward: { gems: 50, xp: 2000 }, tier: 'silver' },
    { id: 'fish_10m', name: 'Inversionista', description: '10 Millones de peces.', condition: (s) => s.totalFish >= 10000000, progress: (s) => ({ current: s.totalFish, target: 10000000, label: 'Peces' }), reward: { gems: 100, xp: 5000 }, tier: 'gold' },
    { id: 'fish_1b', name: 'Magnate', description: '1 Billón de peces. ¿El espacio?', condition: (s) => s.totalFish >= 1000000000, progress: (s) => ({ current: s.totalFish, target: 1000000000, label: 'Peces' }), reward: { gems: 150, xp: 10000 }, tier: 'gold' },
    { id: 'fish_1t', name: 'Dueño del Océano', description: '1 Trillón de peces. Monopolio total.', condition: (s) => s.totalFish >= 1000000000000, progress: (s) => ({ current: s.totalFish, target: 1000000000000, label: 'Peces' }), reward: { gems: 500, xp: 50000 }, tier: 'platinum' },

    // --- COMBATE & ENEMIGOS ---
    { id: 'kill_1', name: 'Primera Sangre', description: 'Derrota a 1 enemigo.', condition: (s) => s.kills >= 1, progress: (s) => ({ current: s.kills, target: 1, label: 'Kills' }), reward: { gems: 5, xp: 20 }, tier: 'bronze' },
    { id: 'kill_50', name: 'Limpiador', description: 'Derrota a 50 enemigos.', condition: (s) => s.kills >= 50, progress: (s) => ({ current: s.kills, target: 50, label: 'Kills' }), reward: { gems: 20, xp: 500 }, tier: 'bronze' },
    { id: 'kill_100', name: 'Cazador', description: 'Derrota a 100 enemigos.', condition: (s) => s.kills >= 100, progress: (s) => ({ current: s.kills, target: 100, label: 'Kills' }), reward: { gems: 30, xp: 1000 }, tier: 'silver' },
    { id: 'kill_500', name: 'Guerrero', description: 'Derrota a 500 enemigos.', condition: (s) => s.kills >= 500, progress: (s) => ({ current: s.kills, target: 500, label: 'Kills' }), reward: { gems: 50, xp: 2000 }, tier: 'silver' },
    { id: 'kill_1k', name: 'Veterano', description: '1,000 Bajas.', condition: (s) => s.kills >= 1000, progress: (s) => ({ current: s.kills, target: 1000, label: 'Kills' }), reward: { gems: 100, xp: 5000 }, tier: 'gold' },
    { id: 'kill_5k', name: 'Señor de la Guerra', description: '5,000 Enemigos eliminados.', condition: (s) => s.kills >= 5000, progress: (s) => ({ current: s.kills, target: 5000, label: 'Kills' }), reward: { gems: 200, xp: 20000 }, tier: 'platinum' },
    { id: 'kill_10k', name: 'La Muerte Blanca', description: '10,000 Enemigos eliminados.', condition: (s) => s.kills >= 10000, progress: (s) => ({ current: s.kills, target: 10000, label: 'Kills' }), reward: { gems: 500, xp: 50000 }, tier: 'platinum' },

    // --- JEFES DE MUNDO ---
    { id: 'boss_1', name: 'Destrono Helado', description: 'Derrota al Emperador Gélido (Jefe M1).', condition: (s) => (s.bestiary['boss1']?.kills || 0) > 0, progress: (s) => ({ current: s.bestiary['boss1']?.kills || 0, target: 1, label: 'Jefe' }), reward: { gems: 50, xp: 5000 }, tier: 'gold' },
    { id: 'boss_2', name: 'Tala Ilegal', description: 'Derrota al Rey Espíritu (Jefe M2).', condition: (s) => (s.bestiary['boss2']?.kills || 0) > 0, progress: (s) => ({ current: s.bestiary['boss2']?.kills || 0, target: 1, label: 'Jefe' }), reward: { gems: 100, xp: 10000 }, tier: 'gold' },
    { id: 'boss_3', name: 'Apagón', description: 'Derrota al Titán de Tormenta (Jefe M3).', condition: (s) => (s.bestiary['boss3']?.kills || 0) > 0, progress: (s) => ({ current: s.bestiary['boss3']?.kills || 0, target: 1, label: 'Jefe' }), reward: { gems: 250, xp: 50000 }, tier: 'platinum' },

    // --- SUPERVIVENCIA (DÍAS) ---
    { id: 'day_5', name: 'Campista', description: 'Sobrevive hasta el día 5.', condition: (s) => s.day >= 5, progress: (s) => ({ current: s.day, target: 5, label: 'Días' }), reward: { gems: 10, xp: 100 }, tier: 'bronze' },
    { id: 'day_20', name: 'Superviviente', description: 'Llega al día 20.', condition: (s) => s.day >= 20, progress: (s) => ({ current: s.day, target: 20, label: 'Días' }), reward: { gems: 30, xp: 1000 }, tier: 'silver' },
    { id: 'day_50', name: 'Náufrago', description: 'Día 50. Wilson!!!!', condition: (s) => s.day >= 50, progress: (s) => ({ current: s.day, target: 50, label: 'Días' }), reward: { gems: 75, xp: 5000 }, tier: 'gold' },
    { id: 'day_100', name: 'Centenario', description: 'Día 100. Una leyenda viva.', condition: (s) => s.day >= 100, progress: (s) => ({ current: s.day, target: 100, label: 'Días' }), reward: { gems: 150, xp: 20000 }, tier: 'platinum' },

    // --- RENACIMIENTOS ---
    { id: 'rebirth_1', name: 'Fénix', description: 'Renace por primera vez.', condition: (s) => s.rebirths >= 1, progress: (s) => ({ current: s.rebirths, target: 1, label: 'Renacer' }), reward: { gems: 50, xp: 2000 }, tier: 'bronze' },
    { id: 'rebirth_5', name: 'Viajero del Tiempo', description: '5 Renacimientos. Déjà vu.', condition: (s) => s.rebirths >= 5, progress: (s) => ({ current: s.rebirths, target: 5, label: 'Renacer' }), reward: { gems: 150, xp: 10000 }, tier: 'silver' },
    { id: 'rebirth_10', name: 'Ciclo Eterno', description: '10 Renacimientos. Doctor Strange.', condition: (s) => s.rebirths >= 10, progress: (s) => ({ current: s.rebirths, target: 10, label: 'Renacer' }), reward: { gems: 300, xp: 50000 }, tier: 'platinum' },
    { id: 'rebirth_25', name: 'Dios del Caos', description: '25 Renacimientos. El universo es tuyo.', condition: (s) => s.rebirths >= 25, progress: (s) => ({ current: s.rebirths, target: 25, label: 'Renacer' }), reward: { gems: 1000, xp: 100000 }, tier: 'platinum' },

    // --- MAZMORRA ---
    { id: 'dung_5', name: 'Explorador', description: 'Alcanza el nivel 5 en la Mazmorra.', condition: (s) => s.dungeonLevel >= 5, progress: (s) => ({ current: s.dungeonLevel, target: 5, label: 'Nivel' }), reward: { gems: 20, xp: 1000 }, tier: 'bronze' },
    { id: 'dung_10', name: 'Ratón de Cueva', description: 'Nivel 10 en la Mazmorra.', condition: (s) => s.dungeonLevel >= 10, progress: (s) => ({ current: s.dungeonLevel, target: 10, label: 'Nivel' }), reward: { gems: 50, xp: 5000 }, tier: 'silver' },
    { id: 'dung_20', name: 'Caballero Negro', description: 'Nivel 20 en la Mazmorra.', condition: (s) => s.dungeonLevel >= 20, progress: (s) => ({ current: s.dungeonLevel, target: 20, label: 'Nivel' }), reward: { gems: 100, xp: 10000 }, tier: 'gold' },
    { id: 'dung_50', name: 'Rey del Abismo', description: 'Nivel 50 en la Mazmorra.', condition: (s) => s.dungeonLevel >= 50, progress: (s) => ({ current: s.dungeonLevel, target: 50, label: 'Nivel' }), reward: { gems: 300, xp: 50000 }, tier: 'platinum' },

    // --- HERRERÍA Y OBJETOS ---
    { id: 'blacksmith_1', name: 'Aprendiz de Herrero', description: 'Mejora un objeto a +1.', condition: (s) => Object.values(s.enhancements).some(v => v >= 1), progress: (s) => ({ current: Object.values(s.enhancements).some(v => v >= 1) ? 1 : 0, target: 1, label: 'Mejorado' }), reward: { gems: 10, xp: 200 }, tier: 'bronze' },
    { id: 'blacksmith_5', name: 'Forjador', description: 'Mejora un objeto a +5.', condition: (s) => Object.values(s.enhancements).some(v => v >= 5), progress: (s) => ({ current: Object.values(s.enhancements).filter(v => v >= 5).length, target: 1, label: 'Mejorado' }), reward: { gems: 50, xp: 2000 }, tier: 'silver' },
    { id: 'blacksmith_10', name: 'Arma Legendaria', description: 'Mejora un objeto al MÁXIMO (+10).', condition: (s) => Object.values(s.enhancements).some(v => v >= 10), progress: (s) => ({ current: Object.values(s.enhancements).filter(v => v >= 10).length, target: 1, label: 'MAX' }), reward: { gems: 150, xp: 20000 }, tier: 'gold' },
    { id: 'inventory_10', name: 'Mochilero', description: 'Ten 10 objetos únicos en el inventario.', condition: (s) => Object.keys(s.inventory).length >= 10, progress: (s) => ({ current: Object.keys(s.inventory).length, target: 10, label: 'Items' }), reward: { gems: 20, xp: 1000 }, tier: 'bronze' },
    { id: 'inventory_30', name: 'Coleccionista', description: 'Ten 30 objetos únicos.', condition: (s) => Object.keys(s.inventory).length >= 30, progress: (s) => ({ current: Object.keys(s.inventory).length, target: 30, label: 'Items' }), reward: { gems: 50, xp: 5000 }, tier: 'silver' },
    { id: 'inventory_50', name: 'Museo Andante', description: 'Ten 50 objetos únicos.', condition: (s) => Object.keys(s.inventory).length >= 50, progress: (s) => ({ current: Object.keys(s.inventory).length, target: 50, label: 'Items' }), reward: { gems: 100, xp: 10000 }, tier: 'gold' },

    // --- ALQUIMIA ---
    { id: 'potion_3', name: 'Mezcla Rara', description: 'Ten 3 pociones activas a la vez.', condition: (s) => Object.keys(s.activePotions).length >= 3, progress: (s) => ({ current: Object.keys(s.activePotions).length, target: 3, label: 'Activas' }), reward: { gems: 15, xp: 500 }, tier: 'bronze' },
    { id: 'potion_5', name: 'Cóctel Molotov', description: 'Ten 5 pociones activas a la vez.', condition: (s) => Object.keys(s.activePotions).length >= 5, progress: (s) => ({ current: Object.keys(s.activePotions).length, target: 5, label: 'Activas' }), reward: { gems: 50, xp: 2000 }, tier: 'silver' },

    // --- NIVEL DE JUGADOR ---
    { id: 'lvl_10', name: 'Nivel 10', description: 'Alcanza el nivel 10.', condition: (s) => s.level >= 10, progress: (s) => ({ current: s.level, target: 10, label: 'Nivel' }), reward: { gems: 10, xp: 0 }, tier: 'bronze' },
    { id: 'lvl_50', name: 'Nivel 50', description: 'Alcanza el nivel 50.', condition: (s) => s.level >= 50, progress: (s) => ({ current: s.level, target: 50, label: 'Nivel' }), reward: { gems: 50, xp: 0 }, tier: 'silver' },
    { id: 'lvl_100', name: 'Nivel 100', description: 'Alcanza el nivel 100.', condition: (s) => s.level >= 100, progress: (s) => ({ current: s.level, target: 100, label: 'Nivel' }), reward: { gems: 100, xp: 0 }, tier: 'gold' },
    { id: 'lvl_200', name: 'Ascendido', description: 'Alcanza el nivel 200.', condition: (s) => s.level >= 200, progress: (s) => ({ current: s.level, target: 200, label: 'Nivel' }), reward: { gems: 250, xp: 0 }, tier: 'platinum' },

    // --- VARIOS & CLASES ---
    { id: 'class_primigenio', name: 'El Elegido', description: 'Juega con la clase Primigenio (Tier 6).', condition: (s) => CLASSES[s.classIdx].name === 'Primigenio', progress: (s) => ({ current: CLASSES[s.classIdx].name === 'Primigenio' ? 1 : 0, target: 1, label: 'Clase' }), reward: { gems: 500, xp: 50000 }, tier: 'platinum' },
    { id: 'mutation_find', name: 'X-Penguin', description: 'Encuentra un enemigo con mutación.', condition: (s) => Object.values(s.bestiary).some(b => b.unlockedMutations.length > 0), progress: (s) => ({ current: Object.values(s.bestiary).filter(b => b.unlockedMutations.length > 0).length, target: 1, label: 'Mutación' }), reward: { gems: 25, xp: 1000 }, tier: 'silver' },
    { id: 'shop_1', name: 'Primer Gasto', description: 'Compra una decoración.', condition: (s) => Object.keys(s.inventory).some(k => k.startsWith('d')), progress: (s) => ({ current: Object.keys(s.inventory).some(k => k.startsWith('d')) ? 1 : 0, target: 1, label: 'Compra' }), reward: { gems: 5, xp: 50 }, tier: 'bronze' },
    { id: 'train_str_20', name: 'Gym Bro', description: 'Sube Fuerza a nivel 20.', condition: (s) => (s.trainingLevels['strength'] || 0) >= 20, progress: (s) => ({ current: s.trainingLevels['strength'] || 0, target: 20, label: 'Nivel' }), reward: { gems: 50, xp: 2000 }, tier: 'silver' },
    { id: 'train_end_20', name: 'Tanque Humano', description: 'Sube Resistencia a nivel 20.', condition: (s) => (s.trainingLevels['endurance'] || 0) >= 20, progress: (s) => ({ current: s.trainingLevels['endurance'] || 0, target: 20, label: 'Nivel' }), reward: { gems: 50, xp: 2000 }, tier: 'silver' },
    { id: 'skills_all', name: 'Archimago', description: 'Aprende 2 habilidades.', condition: (s) => s.skillsOwned.length >= 2, progress: (s) => ({ current: s.skillsOwned.length, target: 2, label: 'Skills' }), reward: { gems: 100, xp: 5000 }, tier: 'gold' },
];

let globalAudioCtx: AudioContext | null = null;

const initAudio = () => {
    if (!globalAudioCtx) {
        globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
    }
    return globalAudioCtx;
};

// Global Mute State
let isMuted = false;

const playSound = (type: 'click' | 'hit' | 'buy' | 'win' | 'crit' | 'reroll' | 'unlock' | 'claim' | 'levelup' | 'speed_up' | 'speed_down' | 'rebirth' | 'upgrade_success' | 'upgrade_fail' | 'horde' | 'trophy' | 'shield' | 'error') => {
    if (isMuted) return;
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        
        if (type === 'speed_up') {
            osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now + 0.3);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'speed_down') {
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.linearRampToValueAtTime(400, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'click') {
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'hit') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'crit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'buy') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'claim' || type === 'levelup' || type === 'upgrade_success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.linearRampToValueAtTime(1000, now + 0.2);
            if(type === 'levelup' || type === 'upgrade_success') osc.frequency.linearRampToValueAtTime(1500, now + 0.4);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now); osc.stop(now + 0.4);
        } else if (type === 'win') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'reroll') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'unlock') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.6);
            osc.start(now); osc.stop(now + 0.6);
        } else if (type === 'trophy') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1500, now);
            osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.6);
            osc.start(now); osc.stop(now + 0.6);
        } else if (type === 'rebirth' || type === 'horde') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(800, now + 1.0);
            if(type === 'horde') {
               osc.frequency.setValueAtTime(50, now);
               osc.frequency.linearRampToValueAtTime(200, now + 2.0);
            }
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.0);
            osc.start(now); osc.stop(now + 1.0);
        } else if (type === 'upgrade_fail' || type === 'error') {
             osc.type = 'sawtooth';
             osc.frequency.setValueAtTime(150, now);
             osc.frequency.linearRampToValueAtTime(50, now + 0.3);
             gain.gain.setValueAtTime(0.3, now);
             gain.gain.linearRampToValueAtTime(0, now + 0.3);
             osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'shield') {
             osc.type = 'square';
             osc.frequency.setValueAtTime(100, now);
             osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
             gain.gain.setValueAtTime(0.2, now);
             gain.gain.linearRampToValueAtTime(0, now + 0.2);
             osc.start(now); osc.stop(now + 0.2);
        }
    } catch(e) {}
};

// --- CONFETTI COMPONENT ---
const Confetti = () => {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    return (
        <div className="fixed inset-0 pointer-events-none z-[120] overflow-hidden">
            {[...Array(50)].map((_, i) => (
                <div 
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        animationDelay: `${Math.random() * 2}s`,
                        width: `${Math.random() * 10 + 5}px`,
                        height: `${Math.random() * 10 + 5}px`
                    }}
                />
            ))}
        </div>
    );
};

// --- COMPONENTES UI MODULARES ---

const Modal = ({ title, onClose, children, icon: Icon, theme = 'slate', noPadding = false, autoSize = false }: any) => {
    const isMystic = theme === 'mystic';
    const isVoid = theme === 'void';
    
    let bgClass = 'bg-slate-900/95 border-slate-700/50';
    let headerClass = 'border-slate-700/50 bg-slate-950/50';
    
    if (isMystic) {
        bgClass = 'bg-slate-950 border-orange-500/30';
        headerClass = 'border-orange-500/20 bg-orange-950/10';
    } else if (isVoid) {
        bgClass = 'bg-slate-950 border-blue-900/50 shadow-[0_0_50px_rgba(59,130,246,0.2)]';
        headerClass = 'border-blue-800/30 bg-blue-950/20';
    }

    const containerClasses = autoSize 
        ? 'w-auto h-auto max-w-[95vw] max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden'
        : 'w-full max-w-7xl h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden';

    return (
        <div className="absolute inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-modal-in pointer-events-auto">
            <div className={`${bgClass} border ${containerClasses} relative transition-colors`}>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5"></div>
                {title && (
                    <div className={`p-6 border-b ${headerClass} flex justify-between items-center shrink-0 backdrop-blur-xl relative z-20 shadow-md`}>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3 uppercase tracking-wide drop-shadow-sm">
                            {Icon && <Icon size={32} className="text-cyan-400"/>} {title}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700">
                            <X size={28}/>
                        </button>
                    </div>
                )}
                <div className={`flex-1 ${noPadding ? 'overflow-hidden' : 'overflow-y-auto custom-scroll'} relative z-10 ${noPadding ? '' : 'p-6'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    // --- STATES ---
    const [fish, setFish] = useState(0);
    const [gems, setGems] = useState(0); 
    const [totalFish, setTotalFish] = useState(0);
    const [inventory, setInventory] = useState<Record<string,number>>({});
    const [activePotions, setActivePotions] = useState<Record<string,number>>({});
    const [enhancements, setEnhancements] = useState<Record<string,number>>({}); 
    // NEW: Fishing state
    const [fishermenLevels, setFishermenLevels] = useState<Record<string,number>>({});
    const [dungeonLevel, setDungeonLevel] = useState(1);

    const [rebirths, setRebirths] = useState(0);
    const [classIdx, setClassIdx] = useState(0);
    const [clicks, setClicks] = useState(0);
    const [kills, setKills] = useState(0);
    const [hp, setHp] = useState(100);
    
    const [currentWorldId, setCurrentWorldId] = useState(0);
    const [unlockedWorlds, setUnlockedWorlds] = useState<number[]>([0]);
    const [showWorldSelector, setShowWorldSelector] = useState(false);

    const [bestiaryTab, setBestiaryTab] = useState(0); 
    const [selectedBestiaryEnemyId, setSelectedBestiaryEnemyId] = useState<string | null>(null);

    const [day, setDay] = useState(1);
    const [dayTimer, setDayTimer] = useState(0);
    const [dayAnim, setDayAnim] = useState(false);

    const [bestiary, setBestiary] = useState<Record<string, BestiaryEntry>>({});
    const [achieved, setAchieved] = useState<string[]>([]);
    const [view, setView] = useState<'game' | 'bestiary' | 'achievements' | 'blacksmith' | 'fishing' | 'dungeon' | 'training'>('game');
    const [combat, setCombat] = useState<{active: boolean, enemy: any, timer: number, closing?: boolean, isHorde?: boolean, enemiesLeft?: number, isDungeon?: boolean, dungeonWave?: number} | null>(null);
    const [shopTab, setShopTab] = useState<'deco'|'sword'|'armor'|'alchemy'>('deco');
    const [tutorial, setTutorial] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [combo, setCombo] = useState(0); 
    const [deathStats, setDeathStats] = useState({ day: 0, fish: 0, power: 0 });
    
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [xpToNext, setXpToNext] = useState(100);

    const [autoSpawnTimer, setAutoSpawnTimer] = useState(15);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [combatLog, setCombatLog] = useState<{id: number, text: string, subtext?: string, color: string}[]>([]); 
    const [playerName, setPlayerName] = useState("Pingu");
    const [tempName, setTempName] = useState("");

    const [gameSpeed, setGameSpeed] = useState(1);
    const [autoReroll, setAutoReroll] = useState(false);
    const [gacha, setGacha] = useState(false);
    const [rerollCooldown, setRerollCooldown] = useState(false);
    const [rerollProgress, setRerollProgress] = useState(0);
    const [rerollAnim, setRerollAnim] = useState(false);
    const [newClassJump, setNewClassJump] = useState(false); 
    const [rerollSuccessAnim, setRerollSuccessAnim] = useState(false); // New animation state
    const [autoRerollStoppedEffect, setAutoRerollStoppedEffect] = useState(false); 
    const [discoveredClasses, setDiscoveredClasses] = useState<string[]>([CLASSES[0].name]);
    
    const [tempClassDisplay, setTempClassDisplay] = useState<string | null>(null);

    const [hitFlash, setHitFlash] = useState(false);
    const [damageBarFlash, setDamageBarFlash] = useState(false); 
    const [damageScreenFlash, setDamageScreenFlash] = useState(false); // New Screen Vignette
    const [primalFlash, setPrimalFlash] = useState(false);
    
    const [showRebirthModal, setShowRebirthModal] = useState(false); 
    const [isRebirthing, setIsRebirthing] = useState(false); 
    const [showConfetti, setShowConfetti] = useState(false);

    const [buyMultiplier, setBuyMultiplier] = useState<number>(1); // 1, 5, 10, 50
    const [buyingItem, setBuyingItem] = useState<string | null>(null);

    const [playerDamageFloats, setPlayerDamageFloats] = useState<{id: number, val: number}[]>([]);

    // TRAINING STATES
    const [trainingTab, setTrainingTab] = useState<'train' | 'skill'>('train');
    const [trainingLevels, setTrainingLevels] = useState<Record<string, number>>({});
    const [trainingTimers, setTrainingTimers] = useState<Record<string, number>>({});
    const [skillsOwned, setSkillsOwned] = useState<string[]>([]);
    const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
    const [playerBlocking, setPlayerBlocking] = useState(false);

    const [showSettings, setShowSettings] = useState(false);
    const [muted, setMuted] = useState(false);
    const [cheatCode, setCheatCode] = useState("");

    // --- MODOS SECRETOS ---
    const [isHeisenberg, setIsHeisenberg] = useState(false);
    const [isHenryMode, setIsHenryMode] = useState(false);

    // PENGUIN SPEECH STATE
    const [penguinSpeech, setPenguinSpeech] = useState<{text: string, visible: boolean} | null>(null);

    useEffect(() => { isMuted = muted; }, [muted]);

    // PENGUIN SPEECH LOOP FIXED
    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        let hideTimeout: ReturnType<typeof setTimeout>;

        const scheduleNextSpeech = () => {
            const delay = isHenryMode ? 8000 : Math.floor(Math.random() * (30000 - 20000 + 1) + 20000); 

            interval = setTimeout(() => {
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
            clearTimeout(interval);
            clearTimeout(hideTimeout);
        };
    }, [isHenryMode]);

    const addPlayerDamageFloat = (val: number) => {
        const id = Date.now() + Math.random();
        setPlayerDamageFloats(prev => [...prev, { id, val }]);
        setTimeout(() => {
            setPlayerDamageFloats(prev => prev.filter(f => f.id !== id));
        }, 1500); 
    };

    // --- DERIVED STATS ---
    const maxHp = useMemo(() => {
        const totemCount = inventory['totem_life'] || 0;
        const totemHpBonus = (currentWorldId + 1) * 100; // Tier 1: 100, Tier 2: 200, Tier 3: 300
        return 100 + (totemCount * totemHpBonus);
    }, [inventory, currentWorldId]);

    const rebirthCost = useMemo(() => {
        return BASE_REBIRTH_COST * Math.pow(10, rebirths);
    }, [rebirths]);

    const selectedBestiaryEnemy = useMemo(() => {
        if (!selectedBestiaryEnemyId) return null;
        let def: any = null;
        let worldName = "";
        for(const w of WORLDS) {
            const found = w.enemies.find(e => e.id === selectedBestiaryEnemyId);
            if(found) { def = found; worldName = w.name; break; }
        }
        if(!def) return null;
        
        // FIX: Ensure 'data' is never undefined by providing a default object
        const defaultData: BestiaryEntry = { 
            kills: 0, 
            maxLv: 0, 
            claimed: false, 
            unlockedMutations: [], 
            claimedMutationRewards: [], 
            mutationResearch: {} 
        };
        const data = bestiary[selectedBestiaryEnemyId] || defaultData;

        return { def, data, worldName };
    }, [selectedBestiaryEnemyId, bestiary]);

    const stats = useMemo(() => {
        let clickPower = 1; 
        let combatAtk = 1;
        let def = 0;
        
        // DECORATIONS give Click Power
        DECORATIONS.forEach(d => clickPower += (inventory[d.id] || 0) * d.val);

        // WEAPONS give Attack Power + Crit (From Blacksmith Stars)
        const bestWeapon = [...WEAPONS].reverse().find(w => inventory[w.id] && inventory[w.id] > 0);
        let weaponCritBonus = 0;
        if (bestWeapon) {
            const stars = enhancements[bestWeapon.id] || 0;
            const starMult = 1 + (stars * 0.1);
            combatAtk = Math.floor(bestWeapon.val * starMult);
            
            // Critical Chance Bonus
            if (stars <= 5) weaponCritBonus = stars * 0.01; // 1% per level up to 5
            else weaponCritBonus = (5 * 0.01) + ((stars - 5) * 0.02); // 2% per level from 6 to 10
        }

        // ARMOR gives Defense + Luck (From Blacksmith Stars)
        const bestArmor = [...ARMOR].reverse().find(a => inventory[a.id] && inventory[a.id] > 0);
        let armorLuckBonus = 0;
        if (bestArmor) {
            const stars = enhancements[bestArmor.id] || 0;
            const starMult = 1 + (stars * 0.1);
            def = Math.floor(bestArmor.val * starMult); 
            
            // Luck Bonus
            if (stars <= 5) armorLuckBonus = stars * 0.02; // 2% per level up to 5
            else armorLuckBonus = (5 * 0.02) + ((stars - 5) * 0.04); // 4% per level from 6 to 10
        }

        // Potions - NOW SCALE WITH WORLD
        const potionTier = currentWorldId + 1;
        let dmgMult = 1;
        let defMult = 1;
        if ((activePotions['pot_dmg_1'] || 0) > 0) dmgMult += (1.0 * potionTier); // +100% per world tier
        if ((activePotions['pot_def_1'] || 0) > 0) defMult += (0.2 * potionTier); // +20% per world tier

        // Training Multipliers
        // Strength: +5% Crit, +5% Dmg per level
        const strLvl = trainingLevels['strength'] || 0;
        const trainCritBonus = strLvl * 0.05;
        const trainDmgMult = 1 + (strLvl * 0.05);

        // Endurance: +5% Def, +2% Luck per level
        const endLvl = trainingLevels['endurance'] || 0;
        const trainDefMult = 1 + (endLvl * 0.05);
        const trainLuckBonus = endLvl * 0.02;

        // Power: +5% Class Ability Mult per level
        const powLvl = trainingLevels['power'] || 0;
        const powerMult = 1 + (powLvl * 0.05);

        // Perfect: +1.1% All Stats
        const perfLvl = trainingLevels['perfect'] || 0;
        const perfMult = 1 + (perfLvl * 0.011);

        // Rebirth Multiplier applies ONLY TO CLICK POWER now
        const rebirthMult = 1 + rebirths;
        
        // Class Multiplier
        const classMult = CLASSES[classIdx].multiplier * powerMult;
        
        return {
            clickPower: Math.floor(clickPower * classMult * rebirthMult * perfMult),
            atk: Math.floor(combatAtk * dmgMult * trainDmgMult * perfMult), 
            def: Math.floor(def * defMult * trainDefMult * perfMult),
            extraCrit: weaponCritBonus + trainCritBonus + (perfLvl * 0.011),
            extraLuck: armorLuckBonus + trainLuckBonus + (perfLvl * 0.011)
        };
    }, [inventory, classIdx, rebirths, activePotions, enhancements, trainingLevels, currentWorldId]);

    // FISHING PRODUCTION
    const fishingProduction = useMemo(() => {
        let prod = 0;
        FISHERMEN.forEach(f => {
            const count = fishermenLevels[f.id] || 0;
            prod += count * f.production;
        });
        return prod;
    }, [fishermenLevels]);

    // CORRECTED POWER SYSTEM
    const totalPower = useMemo(() => {
        // Base stats component
        const statsComponent = (maxHp + stats.clickPower + stats.atk + stats.def) / 4;
        // Level component
        const levelComponent = 100 * level;
        // Rebirth multiplier
        const rebirthBonus = 1 + (rebirths * 0.1);
        
        return Math.floor((statsComponent + levelComponent) * rebirthBonus);
    }, [maxHp, stats, level, rebirths]);

    // World Unlock Logic (FIXED BUG: "Cosmic DNA" appearing randomly)
    useEffect(() => {
        WORLDS.forEach(world => {
            if (totalPower >= world.powerReq && !unlockedWorlds.includes(world.id)) {
                // IMPORTANT: Only update and notify if NOT already unlocked
                setUnlockedWorlds(prev => {
                    if (prev.includes(world.id)) return prev; // Already unlocked check again to be safe
                    
                    const next = [...prev, world.id].sort();
                    
                    // Specific Notifications based on World ID
                    if (world.id === 2) {
                        setTimeout(() => {
                            pushNotification("¡ADN CÓSMICO DETECTADO!", Dna, 'unlock');
                            playSound('rebirth');
                        }, 1500);
                    } else if (world.id > 0) { // Don't notify for World 0 (default)
                         pushNotification(`¡Zona Desbloqueada: ${world.name}!`, Globe, 'unlock');
                         playSound('unlock');
                    }
                    
                    return next;
                });
            }
        });
    }, [totalPower, unlockedWorlds]); // Dependency array is correct, logic inside prevents spam

    const handleWorldChange = (direction: 'prev' | 'next') => {
        const nextId = direction === 'next' ? currentWorldId + 1 : currentWorldId - 1;
        if (nextId < 0 || nextId >= WORLDS.length) return;
        const targetWorld = WORLDS[nextId];

        if (direction === 'next') {
            if (totalPower < targetWorld.powerReq) {
                playSound('upgrade_fail');
                pushNotification(`Necesitas ${formatNumber(targetWorld.powerReq)} de Poder`, Lock, 'warning');
                return;
            } else if (!unlockedWorlds.includes(nextId)) {
                setUnlockedWorlds(prev => [...prev, nextId].sort());
                // Notification handled by useEffect now to prevent duplicates, but can force sound here
                playSound('unlock');
            }
        }
        setCurrentWorldId(nextId);
        playSound('click');
    };

    const luckMultiplier = useMemo(() => {
        const potionTier = currentWorldId + 1;
        let mult = 1.0;
        if ((activePotions['pot_luck_1'] || 0) > 0) mult += (0.25 * potionTier);
        return mult + stats.extraLuck;
    }, [activePotions, stats.extraLuck, currentWorldId]);

    const xpMultiplier = useMemo(() => {
        const potionTier = currentWorldId + 1;
        return (activePotions['pot_xp_1'] ? (1 + (1.5 * potionTier)) : 1); 
    }, [activePotions, currentWorldId]);

    const critChance = useMemo(() => {
        const base = 0.05;
        const levelBonus = Math.floor(level / 10) * 0.02; 
        return ((base + levelBonus) * luckMultiplier) + stats.extraCrit;
    }, [level, luckMultiplier, stats.extraCrit]);

    const hasUnclaimedBestiary = useMemo(() => {
        return Object.values(bestiary).some((entry: BestiaryEntry) => !entry.claimed);
    }, [bestiary]);

    const isBlacksmithLocked = !unlockedWorlds.includes(1); 
    const isFishingLocked = rebirths < 1;
    const isWorld3Unlocked = unlockedWorlds.includes(2);

    useEffect(() => {
        if (!buyingItem) return;
        const executeBuy = () => {
            const item = DECORATIONS.find(d => d.id === buyingItem);
            if (!item) return;
            setFish(currentFish => {
                const currentCount = inventory[item.id] || 0;
                let cost = Math.floor(item.baseCost * Math.pow(1.2, currentCount));
                if (currentFish >= cost) {
                    setInventory(prevInv => ({ ...prevInv, [item.id]: (prevInv[item.id] || 0) + 1 }));
                    return currentFish - cost;
                } else {
                    setBuyingItem(null); 
                    return currentFish;
                }
            });
        };
        executeBuy();
        const interval = setInterval(executeBuy, 150);
        return () => clearInterval(interval);
    }, [buyingItem, inventory]); 

    // NEW: Cleanup Combat Closing state to avoid frozen screen
    useEffect(() => {
        if (combat?.closing) {
            const timer = setTimeout(() => {
                setCombat(null);
                setHitFlash(false); 
                setPlayerBlocking(false); // Reset Block
                setAutoSpawnTimer(15); // BUG FIX: Reset spawn timer when combat closes
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [combat?.closing]);

    const addToCombatLog = (text: string, subtext: string | undefined, color: string) => {
        const id = Date.now();
        setCombatLog(prev => [...prev, { id, text, subtext, color }]);
        setTimeout(() => {
            setCombatLog(prev => prev.filter(entry => entry.id !== id));
        }, 3000);
    };

    const handleCombo = (isCrit: boolean) => {
        if (isCrit) {
            setCombo(c => {
                const newC = c + 1;
                if (newC === 5) playSound('unlock');
                if (newC === 10) playSound('win');
                if (newC === 25) playSound('rebirth');
                if (newC === 50) playSound('rebirth');
                return newC;
            });
        } else {
            setCombo(0);
        }
    };

    // RESEARCH TIMER LOOP
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            setBestiary(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(enemyId => {
                    const entry = next[enemyId];
                    if(entry.mutationResearch) {
                        Object.keys(entry.mutationResearch).forEach(mutId => {
                            const research = entry.mutationResearch[mutId];
                            if(research.status === 'researching' && research.endTime <= now) {
                                next[enemyId] = {
                                    ...entry,
                                    mutationResearch: {
                                        ...entry.mutationResearch,
                                        [mutId]: { ...research, status: 'ready' }
                                    }
                                };
                                changed = true;
                                pushNotification("¡Investigación Completada!", FlaskConical, 'info');
                                playSound('unlock');
                            }
                        });
                    }
                });
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // MAIN LOOP
    useEffect(() => {
        if (gameOver || tutorial || isRebirthing) return;
        const loop = setInterval(() => {
            const delta = 0.1 * gameSpeed;
            const now = Date.now();
            
            if (fishingProduction > 0) {
               setFish(f => f + (fishingProduction * delta));
               setTotalFish(f => f + (fishingProduction * delta));
            }

            setSkillCooldowns(prev => {
                const next = {...prev};
                let changed = false;
                Object.keys(next).forEach(k => {
                    if (next[k] > 0) {
                        next[k] = Math.max(0, next[k] - delta);
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });

            setTrainingTimers(prev => {
                const next = {...prev};
                let changed = false;
                Object.keys(next).forEach(k => {
                    if (next[k] > 0 && next[k] <= now) {
                        delete next[k];
                        changed = true;
                        pushNotification("¡Entrenamiento Completado!", Dumbbell, 'info');
                        playSound('upgrade_success');
                    }
                });
                return changed ? next : prev;
            });

            setDayTimer(prev => {
                if (gameOver) return 0;
                if (prev >= 60) {
                    setDay(d => d + 1);
                    setDayAnim(true);
                    setTimeout(() => setDayAnim(false), 800); 
                    return 0;
                }
                return prev + delta;
            });
            setActivePotions(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(k => {
                    if (next[k] > 0) {
                        next[k] -= delta;
                        changed = true;
                    } else if (next[k] <= 0) {
                        delete next[k];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
            
            // SPAWN LOGIC - CRITICAL FIX: ONLY SPAWN IN GAME VIEW
            if (!combat && !gacha && view === 'game') {
                if (autoSpawnTimer <= 0) {
                    spawnEnemy();
                    setAutoSpawnTimer(15);
                } else {
                    setAutoSpawnTimer(prev => prev - delta);
                }
            }
            if (combat) {
                setCombat(prev => {
                    if (!prev || prev.closing) return prev;
                    const newTime = prev.timer - delta;
                    if (newTime <= 0) {
                        // DUNGEON FAILURE LOGIC
                        if (prev.isDungeon) {
                            const penalty = Math.floor(maxHp * 0.5);
                            setHp(h => Math.max(1, h - penalty)); 
                            playSound('hit');
                            pushNotification(`¡Derrotado en la Mazmorra!`, Skull, 'warning');
                            setHitFlash(true);
                            setDamageBarFlash(true);
                            setDamageScreenFlash(true);
                            setTimeout(() => {setHitFlash(false); setDamageBarFlash(false); setDamageScreenFlash(false);}, 300);
                            return { ...prev, closing: true };
                        }

                        let incomingDmg = (prev.enemy.atk || 10);
                        if (playerBlocking) {
                            incomingDmg = Math.floor(incomingDmg * 0.5);
                            incomingDmg = Math.max(0, incomingDmg - stats.def);
                            const el = document.createElement('div');
                            el.textContent = "¡BLOQUEADO!";
                            el.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 font-black text-4xl animate-ping pointer-events-none z-[200]";
                            document.body.appendChild(el);
                            setTimeout(() => el.remove(), 500);
                            setPlayerBlocking(false); 
                        } else {
                            incomingDmg = Math.max(10, incomingDmg - stats.def);
                        }

                        const damageToPlayer = incomingDmg;
                        const newHp = Math.max(0, hp - damageToPlayer);
                        addPlayerDamageFloat(damageToPlayer);
                        playSound('hit');
                        setHitFlash(true);
                        setDamageBarFlash(true);
                        setDamageScreenFlash(true); 
                        setTimeout(() => {setHitFlash(false); setDamageBarFlash(false); setDamageScreenFlash(false);}, 300);
                        
                        addToCombatLog(`-${formatNumber(damageToPlayer)}`, 'Daño Recibido', 'text-red-500 font-black text-2xl animate-shake-constant');
                        
                        if (newHp <= 0) {
                            // Capture stats AT MOMENT OF DEATH
                            setDeathStats({ day: day, fish: totalFish, power: totalPower });
                            setGameOver(true);
                            setHp(0);
                            setCombo(0); 
                        } else {
                            setHp(newHp);
                        }
                        return null; 
                    }
                    return { ...prev, timer: newTime };
                });
            }
            // --- OPTIMIZED ACHIEVEMENT CHECK ---
            // Only run detailed achievement check occasionally to reduce lag
            const currentStats: GameStats = { 
                fish, gems, totalFish, clicks, kills, day, inventory, rebirths, bestiary, level, activePotions, enhancements, unlockedWorlds,
                trainingLevels, skillsOwned, dungeonLevel, classIdx
            };
            ACHIEVEMENTS_LOGIC.forEach(ach => {
                if (!achieved.includes(ach.id) && ach.condition(currentStats)) {
                    setAchieved(prev => [...prev, ach.id]);
                    pushNotification(`¡Trofeo: ${ach.name}!`, Trophy, 'achievement');
                    playSound('trophy'); 
                    if (ach.reward.gems > 0) setGems(p => p + ach.reward.gems);
                    if (ach.reward.xp > 0) {
                        const rewardXp = ach.reward.xp;
                        let currentXp = xp + rewardXp;
                        let currentLevel = level;
                        let currentNext = xpToNext;
                        // LOOP for multiple level ups
                        while (currentXp >= currentNext) {
                            currentLevel++;
                            currentXp -= currentNext;
                            currentNext = Math.floor(currentNext * 1.5);
                            playSound('levelup');
                            pushNotification(`¡Nivel Alcanzado: ${currentLevel}!`, Sparkles, 'info');
                        }
                        setXp(currentXp);
                        setLevel(currentLevel);
                        setXpToNext(currentNext);
                    }
                }
            });
            if(autoReroll && !rerollCooldown && !gacha && fish >= 1000) {
                doReroll();
            }
        }, 100);
        return () => clearInterval(loop);
    }, [combat, hp, gameOver, tutorial, day, clicks, kills, totalFish, stats.def, autoSpawnTimer, gacha, xp, level, gameSpeed, autoReroll, rerollCooldown, maxHp, currentWorldId, gems, isRebirthing, fishingProduction, trainingLevels, trainingTimers, skillCooldowns, skillsOwned, playerBlocking, totalPower, view]); // Added 'view' to dependencies

    // --- ACTIONS ---
    const spawnEnemy = (forcedType?: 'horde') => {
        // --- NEW UPDATED FORMULA ---
        // Base Stats + (5% Base * Day) + (10% Base * Level/Day) + (1% Base * (50% Power)) [After Day 10, 100% Power]
        // World Multiplier: x1.2 per world index
        
        let powerScalar = 0.5;
        if (day > 10) powerScalar = 1.0; 
        
        // Growth Multiplier (Day based scaling)
        // (1 + 0.05 * Day) + (0.10 * Day) = (1 + 0.15 * Day)
        const growthMult = 1 + (0.15 * day);
        
        const currentWorldData = WORLDS[currentWorldId];
        const worldMultiplier = Math.pow(1.2, currentWorldId);

        // HORDE SPAWN LOGIC
        const isHordeDay = day % 10 === 0 && day > 0;
        if (isHordeDay || forcedType === 'horde') {
            const hordeSize = 5 + Math.floor(totalPower / 1000000);
            let base = currentWorldData.enemies[Math.floor(Math.random() * currentWorldData.enemies.length)];
            
            // Formula Application
            const baseHpWithGrowth = base.baseHp * growthMult;
            const powerBonusHp = (base.baseHp * 0.01) * (totalPower * powerScalar);
            const calculatedHp = Math.floor((baseHpWithGrowth + powerBonusHp) * worldMultiplier);
            
            const baseAtkWithGrowth = base.baseAtk * growthMult;
            const powerBonusAtk = (base.baseAtk * 0.01) * (totalPower * powerScalar);
            const calculatedAtk = Math.max(1, Math.floor((baseAtkWithGrowth + powerBonusAtk) * worldMultiplier));

            setCombat({
                active: true,
                timer: 20, 
                isHorde: true,
                enemiesLeft: hordeSize,
                enemy: { def: base, level: day, hp: calculatedHp, maxHp: calculatedHp, atk: calculatedAtk }
            });
            pushNotification("¡HORDA DE ENEMIGOS!", Users, 'horde');
            playSound('horde');
            return;
        }
        
        if (day === 1) {
            const slime = currentWorldData.enemies.find(e => e.id === 'e1') || currentWorldData.enemies[0];
            setCombat({
                active: true,
                timer: 15,
                isHorde: false,
                enemy: { def: slime, level: 1, hp: 100, maxHp: 100, atk: 10 }
            });
            return;
        }

        let availableEnemies = currentWorldData.enemies.filter(e => !e.isBoss);
        let base = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        
        if (day <= 3 && currentWorldId === 0) {
            availableEnemies = currentWorldData.enemies.slice(0, 2);
            base = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        }

        let mutation: Mutation | undefined;
        let mutationChance = 0.1 * luckMultiplier;
        if (rebirths >= 1) mutationChance += 0.1; // +10% chance after rebirth 1

        const roll = Math.random();
        // Adjust chances relatively based on tiers
        if (roll < 0.004 * (mutationChance * 10)) mutation = MUTATIONS.find(m => m.id === 'demon');
        else if (roll < 0.01 * (mutationChance * 10)) mutation = MUTATIONS.find(m => m.id === 'moon');
        else if (roll < 0.02 * (mutationChance * 10)) mutation = MUTATIONS.find(m => m.id === 'robot');
        else if (roll < 0.04 * (mutationChance * 10)) mutation = MUTATIONS.find(m => m.id === 'candy');
        else if (roll < mutationChance) mutation = MUTATIONS.find(m => m.id === 'shiny');
        
        const mutMult = (mutation ? mutation.mult : 1);

        // Formula Application for Single Enemy
        const baseHpWithGrowth = base.baseHp * growthMult;
        const powerBonusHp = (base.baseHp * 0.01) * (totalPower * powerScalar);
        const calculatedHp = Math.floor(((baseHpWithGrowth + powerBonusHp) * worldMultiplier) * mutMult);
        
        const baseAtkWithGrowth = base.baseAtk * growthMult;
        const powerBonusAtk = (base.baseAtk * 0.01) * (totalPower * powerScalar);
        const calculatedAtk = Math.max(1, Math.floor(((baseAtkWithGrowth + powerBonusAtk) * worldMultiplier) * mutMult));

        setCombat({
            active: true,
            timer: 15,
            isHorde: false,
            enemy: { def: base, level: day, hp: calculatedHp, maxHp: calculatedHp, atk: calculatedAtk, mutation: mutation }
        });
    };

    const handleUpgradeItem = (item: GameItem) => {
        const currentStars = enhancements[item.id] || 0;
        if (currentStars >= 10) return;
        const upgradeCost = Math.floor(item.baseCost * 0.2 * Math.pow(currentStars + 1, 1.5));
        
        if (fish < upgradeCost) {
            playSound('upgrade_fail'); 
            pushNotification("¡No tienes suficientes peces!", Lock, 'warning');
            return;
        }
        
        setFish(current => {
            if (current < upgradeCost) return current; 
            return current - upgradeCost;
        });
        
        const baseSuccess = 1.0 - (currentStars * 0.1);
        const successChance = Math.min(0.95, baseSuccess * luckMultiplier);
        const roll = Math.random();
        
        if (roll < successChance) {
            playSound('upgrade_success');
            setEnhancements(prev => ({ ...prev, [item.id]: currentStars + 1 }));
            pushNotification(`¡Mejora Exitosa! ${item.name} a +${currentStars + 1}`, Hammer, 'unlock');
        } else {
            playSound('upgrade_fail');
            const newLevel = Math.max(0, currentStars - 1);
            setEnhancements(prev => ({ ...prev, [item.id]: newLevel }));
            pushNotification(`¡Fallo! ${item.name} bajó a +${newLevel}`, AlertCircle, 'warning');
        }
    };

    const handleTraining = (trainId: string) => {
        const train = TRAININGS.find(t => t.id === trainId);
        if(!train) return;

        const currentLvl = trainingLevels[trainId] || 0;
        const fishCost = Math.floor(train.baseCostFish * Math.pow(1.5, currentLvl));
        const gemsCost = Math.floor(train.baseCostGems * Math.pow(1.2, currentLvl));

        if(fish < fishCost || gems < gemsCost) {
            pushNotification("Recursos insuficientes", Lock, 'warning');
            playSound('upgrade_fail');
            return;
        }

        if(trainingTimers[trainId] && trainingTimers[trainId] > Date.now()) {
            pushNotification("Entrenamiento en curso...", Clock, 'warning');
            return;
        }

        setFish(f => f - fishCost);
        setGems(g => g - gemsCost);
        
        const duration = (2 * 60 * 1000) + (currentLvl * 60 * 1000);
        setTrainingTimers(prev => ({ ...prev, [trainId]: Date.now() + duration }));
        setTrainingLevels(prev => ({ ...prev, [trainId]: currentLvl + 1 }));
        
        playSound('buy');
        pushNotification(`¡Entrenamiento Iniciado! (${(duration/60000).toFixed(0)} min)`, Dumbbell, 'info');
    };

    const handleBuySkill = (skillId: string, cost: number) => {
        if(gems < cost) {
            pushNotification("Gemas insuficientes", Lock, 'warning');
            playSound('upgrade_fail');
            return;
        }
        setGems(g => g - cost);
        setSkillsOwned(prev => [...prev, skillId]);
        playSound('unlock');
        pushNotification("¡Habilidad Desbloqueada!", Star, 'unlock');
    };

    const handleUseSkill = (skillId: string) => {
        const skill = SKILLS.find(s => s.id === skillId);
        if(!skill || !combat || skillCooldowns[skillId] > 0) return;

        if (skillId === 'smite') {
            if(combat.enemy.def.isBoss) {
                pushNotification("Inmune a Castigo", Shield, 'warning');
                return;
            }
            const dmg = Math.floor(combat.enemy.hp * 0.25);
            setCombat(prev => prev ? ({...prev, enemy: {...prev.enemy, hp: Math.max(0, prev.enemy.hp - dmg)}}) : null);
            const el = document.createElement('div');
            el.textContent = `SMITE! -${formatNumber(dmg)}`;
            el.className = `fixed font-black text-yellow-200 text-4xl pointer-events-none z-[110] animate-bounce`;
            el.style.left = `50%`;
            el.style.top = `40%`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1000);
            playSound('crit');
        } else if (skillId === 'block') {
            setPlayerBlocking(true);
            setTimeout(() => setPlayerBlocking(false), 1500); 
            playSound('shield');
        }

        setSkillCooldowns(prev => ({ ...prev, [skillId]: skill.cooldown }));
    };

    const buyFisherman = (id: string, cost: number) => {
        if (gems >= cost) {
            setGems(g => g - cost);
            setFishermenLevels(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
            playSound('buy');
        } else {
            playSound('upgrade_fail');
        }
    };

    const startDungeon = () => {
        if(combat) return;
        
        let enemyCount = 0;
        let wave = 0;
        if(dungeonLevel <= 5) { enemyCount = 5; wave = 1; }
        else if(dungeonLevel <= 20) { enemyCount = 15; wave = 2; }
        else if(dungeonLevel <= 50) { enemyCount = 20; wave = 3; }
        else { enemyCount = 25; wave = 4; }

        const currentWorldData = WORLDS[currentWorldId];
        
        const nonBossEnemies = currentWorldData.enemies.filter(e => !e.isBoss);
        const pool = nonBossEnemies.length > 0 ? nonBossEnemies : currentWorldData.enemies;
        
        let base = pool[Math.floor(Math.random() * pool.length)];
        
        const powerBonus = Math.floor(totalPower * 0.5);
        const dungeonMult = 1 + (dungeonLevel * 0.05);
        
        const calculatedHp = Math.floor((base.baseHp * dungeonMult * 1.5) + powerBonus);
        const calculatedAtk = Math.max(1, Math.floor((base.baseAtk * dungeonMult * 1.2) + (powerBonus * 0.1)));

        setView('game'); 
        setCombat({
            active: true,
            timer: 30, 
            isDungeon: true,
            enemiesLeft: enemyCount,
            dungeonWave: wave,
            enemy: { def: base, level: dungeonLevel * 2, hp: calculatedHp, maxHp: calculatedHp, atk: calculatedAtk }
        });
        playSound('horde');
        pushNotification(`¡Mazmorra Nivel ${dungeonLevel} Iniciada!`, Castle, 'horde');
    };

    const handlePlayerClick = (e: React.MouseEvent) => {
        if (combat || gacha || gameOver || tutorial || isRebirthing) return;
        e.stopPropagation(); 
        initAudio();
        let val = stats.clickPower;
        const isCrit = Math.random() < critChance; 
        if (isCrit) val = Math.floor(val * 2.5); 
        handleCombo(isCrit);
        playSound(isCrit ? 'crit' : 'click');
        setFish(p => p + val);
        setTotalFish(p => p + val);
        setClicks(p => p + 1);
        const el = document.createElement('div');
        el.textContent = isCrit ? `¡CRÍTICO! +${formatNumber(val)}` : `+${formatNumber(val)}`;
        el.className = `fixed font-black float-anim pointer-events-none z-50 ${isCrit ? 'text-yellow-400 text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-cyan-200 text-2xl'}`;
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
    };

    const handleCombatHit = (dmg: number, isCrit: boolean) => {
        if (!combat || combat.closing) return; 
        const newHp = combat.enemy.hp - dmg;
        handleCombo(isCrit);
        if (newHp <= 0) {
            playSound('win');
            const reward = Math.floor(combat.enemy.maxHp * 1.5);
            setFish(p => p + reward);
            setTotalFish(p => p + reward);
            setKills(p => p + 1);
            const baseXp = 20;
            const earnedXp = Math.floor(baseXp * combat.enemy.level * xpMultiplier);
            
            const el = document.createElement('div');
            el.innerHTML = `
                <div class="flex flex-col items-start gap-1">
                    <span class="text-yellow-400 text-2xl font-black drop-shadow-md">+${formatNumber(reward)} 🐟</span>
                    <span class="text-blue-300 text-lg font-bold">+${formatNumber(earnedXp)} XP</span>
                </div>
            `;
            el.className = `absolute z-[100] pointer-events-none animate-reward-float left-8 bottom-32`;
            el.style.position = 'fixed';
            el.style.left = '320px'; 
            el.style.bottom = '150px';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2500);

            let currentXp = xp + earnedXp;
            let currentLevel = level;
            let currentNext = xpToNext;
            
            // FIX: Use loop for multiple levels
            while (currentXp >= currentNext) {
                currentLevel++;
                currentXp -= currentNext;
                currentNext = Math.floor(currentNext * 1.5);
                playSound('levelup');
                pushNotification(`¡Nivel Alcanzado: ${currentLevel}!`, Sparkles, 'info');
            }
            
            setXp(currentXp);
            setLevel(currentLevel);
            setXpToNext(currentNext);
            
            setBestiary(prev => {
                const id = combat.enemy.def.id;
                const current: BestiaryEntry = prev[id] || { kills: 0, maxLv: 0, claimed: false, unlockedMutations: [], claimedMutationRewards: [], mutationResearch: {} };
                const newMutations = [...current.unlockedMutations];
                
                if (combat.enemy.mutation) {
                    const mId = combat.enemy.mutation.id;
                    if (!newMutations.includes(mId)) {
                        newMutations.push(mId);
                        pushNotification(`¡Nueva Mutación: ${combat.enemy.mutation.name}!`, Dna, 'unlock');
                    }
                }
                return { ...prev, [id]: { ...current, kills: current.kills + 1, maxLv: Math.max(current.maxLv, combat.enemy.level), unlockedMutations: newMutations } };
            });

            if ((combat.isHorde || combat.isDungeon) && combat.enemiesLeft && combat.enemiesLeft > 1) {
                const remaining = combat.enemiesLeft - 1;
                
                let calculatedHp = 0;
                let calculatedAtk = 0;
                let baseDef = combat.enemy.def; 

                if (combat.isDungeon) {
                    const currentWorldData = WORLDS[currentWorldId];
                    const nonBossEnemies = currentWorldData.enemies.filter(e => !e.isBoss);
                    const base = nonBossEnemies.length > 0 
                        ? nonBossEnemies[Math.floor(Math.random() * nonBossEnemies.length)] 
                        : currentWorldData.enemies[Math.floor(Math.random() * currentWorldData.enemies.length)];
                    baseDef = base;
                    const dungeonMult = 1 + (dungeonLevel * 0.05);
                    const powerBonus = Math.floor(totalPower * 0.5);
                    calculatedHp = Math.floor((base.baseHp * dungeonMult * 1.5) + powerBonus);
                    calculatedAtk = Math.max(1, Math.floor((base.baseAtk * dungeonMult * 1.2) + (powerBonus * 0.1)));
                } else {
                    // NEW FORMULA FOR MULTI-ENEMY STAGES
                    let growthMult = 1 + (0.15 * day);
                    let powerScalar = day > 10 ? 1.0 : 0.5;
                    const worldMultiplier = Math.pow(1.2, currentWorldId);
                    
                    const currentWorldData = WORLDS[currentWorldId];
                    const base = currentWorldData.enemies[Math.floor(Math.random() * currentWorldData.enemies.length)];
                    baseDef = base;
                    
                    const baseHpWithGrowth = base.baseHp * growthMult;
                    const powerBonusHp = (base.baseHp * 0.01) * (totalPower * powerScalar);
                    calculatedHp = Math.floor((baseHpWithGrowth + powerBonusHp) * worldMultiplier);
                    
                    const baseAtkWithGrowth = base.baseAtk * growthMult;
                    const powerBonusAtk = (base.baseAtk * 0.01) * (totalPower * powerScalar);
                    calculatedAtk = Math.max(1, Math.floor((baseAtkWithGrowth + powerBonusAtk) * worldMultiplier));
                }

                setCombat(prev => prev ? ({
                    ...prev,
                    enemiesLeft: remaining,
                    timer: 30, 
                    enemy: { def: baseDef, level: combat.isDungeon ? dungeonLevel * 2 : day, hp: calculatedHp, maxHp: calculatedHp, atk: calculatedAtk }
                }) : null);
            } else {
                if (combat.isDungeon) {
                    setDungeonLevel(d => d + 1);
                    pushNotification(`¡Mazmorra Completada! Nivel ${dungeonLevel} -> ${dungeonLevel + 1}`, Trophy, 'achievement');
                    
                    const totalEnemies = dungeonLevel <= 5 ? 5 : dungeonLevel <= 20 ? 15 : dungeonLevel <= 50 ? 20 : 25;
                    const finalGemReward = (totalEnemies * 50) + (10 * dungeonLevel);
                    setGems(g => g + finalGemReward);
                    pushNotification(`¡Recompensa: +${finalGemReward} Gemas!`, Diamond, 'drop');
                }
                setCombat(p => p ? {...p, closing: true} : null);
            }
        } else {
            setCombat(p => p ? {...p, enemy: {...p.enemy, hp: newHp}} : null);
        }
    };

    const claimBestiaryReward = (enemyId: string) => {
        setBestiary(prev => {
            const entry = prev[enemyId];
            if (!entry || entry.claimed) return prev;
            playSound('claim');
            setGems(g => g + 10); 
            pushNotification("¡Descubrimiento! +10 Gemas", Diamond, 'drop');
            return {
                ...prev,
                [enemyId]: { ...entry, claimed: true }
            };
        });
    };

    const claimMutationReward = (enemyId: string, mutationId: string) => {
        setBestiary(prev => {
            const entry = prev[enemyId];
            if (!entry || entry.claimedMutationRewards.includes(mutationId)) return prev;
            
            const mutation = MUTATIONS.find(m => m.id === mutationId);
            if (!mutation) return prev;

            const baseReward = 150;
            const rarityBonus = 150 * (mutation.tier || 1); 
            const totalReward = baseReward + rarityBonus;

            playSound('claim');
            setGems(g => g + totalReward);
            pushNotification(`¡Muestra Analizada! +${totalReward} Gemas`, Dna, 'drop');

            return {
                ...prev,
                [enemyId]: {
                    ...entry,
                    claimedMutationRewards: [...entry.claimedMutationRewards, mutationId]
                }
            };
        });
    };

    const buy = (item: GameItem) => {
        const count = inventory[item.id] || 0;
        let amountToBuy = 1;
        if (item.type === 'deco') amountToBuy = buyMultiplier;

        let totalCost = 0;
        let p = item.baseCost;
        if (item.type === 'deco') {
            p = Math.floor(item.baseCost * Math.pow(1.2, count));
            for(let k=0; k<amountToBuy; k++){ 
                totalCost += p; 
                p = Math.floor(p*1.2); 
            }
        } else {
            if (count > 0) return;
            totalCost = item.baseCost;
        }

        if (fish < totalCost) return;

        setFish(current => {
            if (current < totalCost) return current; 
            return current - totalCost;
        });
        
        playSound('buy');
        setInventory(i => ({ ...i, [item.id]: (i[item.id] || 0) + amountToBuy }));
    };

    const buyPotion = (item: AlchemyItem) => {
        if (hp <= 0 && !gameOver) return;

        // SCALE COST: Base * 1000^(Current World Index)
        // World 0: x1
        // World 1: x1000
        // World 2: x1,000,000
        const tierPriceMult = Math.pow(1000, currentWorldId);

        if (item.id === 'totem_life') {
            const count = inventory['totem_life'] || 0;
            const totemTier = currentWorldId + 1;
            const maxTotems = 30 * totemTier;

            if (count >= maxTotems) {
                pushNotification(`¡Límite de Tótems (Tier ${totemTier}) alcanzado!`, Lock, 'warning');
                return;
            }
            const cost = Math.floor((item.cost * tierPriceMult) * Math.pow(1.5, count));
            
            if (fish >= cost) {
                setFish(c => c >= cost ? c - cost : c);
                playSound('buy');
                setInventory(p => ({ ...p, 'totem_life': count + 1 }));
                pushNotification("¡Salud Máxima Aumentada!", Heart, 'info');
            } else {
                pushNotification("¡No tienes suficientes peces!", Lock, 'warning');
            }
            return;
        }
        
        const cost = item.cost * tierPriceMult;
        if (fish < cost) return;

        setFish(c => c >= cost ? c - cost : c);
        playSound('buy');

        // HEAL SCALING: Base 100 * (10 ^ World)
        const healMult = Math.pow(10, currentWorldId);

        if (item.id === 'pot_heal_small') {
            const healAmount = 100 * healMult;
            setHp(prevHp => Math.min(maxHp, prevHp + healAmount));
            pushNotification(`¡Curación: +${formatNumber(healAmount)} HP!`, Heart, 'info');
        } else if (item.id === 'pot_heal_grand') {
            setHp(prevHp => Math.min(maxHp, prevHp + (maxHp * 0.5)));
            pushNotification("¡Gran Curación: +50% HP!", Heart, 'info');
        } else {
            setActivePotions(p => ({...p, [item.id]: (p[item.id] || 0) + item.duration}));
            pushNotification(`¡Poción Activada! ${item.name}`, FlaskConical, 'info');
        }
    };

    const performRebirth = () => {
        setShowRebirthModal(false);
        setIsRebirthing(true);
        setCombat(null);
        setGameOver(false);
        playSound('rebirth'); 
        setTimeout(() => {
            setFish(0); setClicks(0); setKills(0); 
            setDay(1); 
            setDayTimer(0); // BUG FIX: Reset Day Timer
            setAutoSpawnTimer(15); 
            setInventory({}); setActivePotions({}); setEnhancements({}); setFishermenLevels({});
            setLevel(1); setXp(0); setXpToNext(100); 
            setHp(100); 
            setCombo(0); setCurrentWorldId(0); setUnlockedWorlds([0]);
            setRebirths(p => p + 1); setClassIdx(0); setGameOver(false); setCombat(null); setShowConfetti(true);
            setDungeonLevel(1);
            setTrainingLevels({});
            setTrainingTimers({});
            setDeathStats({ day: 0, fish: 0, power: 0 });
            setIsHeisenberg(false); // Reset Heisenberg mode on rebirth
            setIsHenryMode(false); // Reset Henry mode
            setTimeout(() => {
                setIsRebirthing(false);
                pushNotification(`¡RENACIMIENTO COMPLETADO!`, Dna, 'rebirth');
                setTimeout(() => setShowConfetti(false), 3000);
            }, 1500);
        }, 1000); 
    };

    const doReroll = () => {
        const cost = 1000;
        if (fish < cost || rerollCooldown) {
            if (fish < cost && autoReroll) {
                setAutoReroll(false);
                setAutoRerollStoppedEffect(true);
                setTimeout(() => setAutoRerollStoppedEffect(false), 2000);
            }
            return;
        }
        
        setFish(c => c >= cost ? c - cost : c);
        
        playSound('reroll');
        setRerollCooldown(true);
        setRerollProgress(0);

        const spinDuration = 1000;
        const startTime = Date.now();
        const spinInterval = setInterval(() => {
            const randomClass = CLASSES[Math.floor(Math.random() * CLASSES.length)].name;
            setTempClassDisplay(randomClass);
            
            const elapsed = Date.now() - startTime;
            const prog = Math.min(100, (elapsed / spinDuration) * 100);
            setRerollProgress(prog);

            if (elapsed >= spinDuration) {
                clearInterval(spinInterval);
                finishReroll();
            }
        }, 50); 
    };

    const finishReroll = () => {
        const baseRoll = Math.random();
        const adjustedRoll = Math.min(0.99999, baseRoll * luckMultiplier);
        let tier = 0;
        const hasWorld3 = unlockedWorlds.includes(2);
        if (hasWorld3) {
            if (adjustedRoll > 0.9995) tier = 11; else if (adjustedRoll > 0.998) tier = 10; else if (adjustedRoll > 0.99) tier = 9; else if (adjustedRoll > 0.99) tier = 8; else if (adjustedRoll > 0.97) tier = 7; else if (adjustedRoll > 0.95) tier = 5; else if (adjustedRoll > 0.85) tier = 4; else if (adjustedRoll > 0.65) tier = 3; else if (adjustedRoll > 0.40) tier = 2; else if (adjustedRoll > 0.15) tier = 1;
        } else {
            if (adjustedRoll > 0.95) tier = 5; else if (adjustedRoll > 0.85) tier = 4; else if (adjustedRoll > 0.65) tier = 3; else if (adjustedRoll > 0.40) tier = 2; else if (adjustedRoll > 0.15) tier = 1;
        }
        const pool = CLASSES.filter(c => c.tier === tier || (tier < 7 && c.tier === tier + 1));
        const picked = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CLASSES[0];
        const idx = CLASSES.findIndex(c => c.name === picked.name);
        
        setClassIdx(idx);
        setTempClassDisplay(null);
        setRerollCooldown(false);
        setRerollProgress(0);
        setRerollSuccessAnim(true); // TRIGGER JUMP
        setTimeout(() => setRerollSuccessAnim(false), 600);

        const isNew = !discoveredClasses.includes(picked.name);
        if (isNew) {
            setDiscoveredClasses(prev => [...prev, picked.name]);
            setNewClassJump(true); 
            setTimeout(() => setNewClassJump(false), 600);
            if (autoReroll) {
                setAutoReroll(false);
                setAutoRerollStoppedEffect(true);
                setTimeout(() => setAutoRerollStoppedEffect(false), 2000);
            }
        }
        if (picked.name === 'Primigenio') {
            setPrimalFlash(true);
            setTimeout(() => setPrimalFlash(false), 1200);
            playSound('rebirth'); 
        }
    };

    const toggleSpeed = () => {
        const newSpeed = gameSpeed === 1 ? 2 : gameSpeed === 2 ? 4 : 1;
        setGameSpeed(newSpeed);
        playSound(newSpeed > 1 ? 'speed_up' : 'speed_down');
    };

    // --- NOTIFICATION SYSTEM V2 (Fixes stuck notifications) ---
    const notifIdCounter = useRef(0);
    
    const pushNotification = useCallback((text: string, icon: any, type: NotifType = 'info') => {
        const id = notifIdCounter.current++;
        setNotifications(prev => {
            const next = [...prev, { id, text, icon, type }];
            return next.slice(-5); // Keep last 5
        });

        setTimeout(() => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, fading: true } : n));
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 400); 
        }, 3000);
    }, []);

    const getNotifColor = (type: NotifType) => {
        switch(type) {
            case 'achievement': return 'border-yellow-500 bg-slate-900/90 text-yellow-100';
            case 'horde': return 'border-red-600 bg-red-950/90 text-red-100';
            case 'unlock': return 'border-cyan-500 bg-slate-900/90 text-cyan-100';
            case 'drop': return 'border-purple-500 bg-slate-900/90 text-purple-100';
            case 'warning': return 'border-orange-500 bg-slate-900/90 text-orange-100';
            case 'rebirth': return 'border-pink-500 bg-black/90 text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.5)]';
            default: return 'border-slate-600 bg-slate-900/90 text-slate-200';
        }
    };

    const handleStartGame = () => {
        if (!tempName.trim()) return;
        setPlayerName(tempName.trim());
        setTutorial(false);
        initAudio();
    };

    const handleGameOver = () => {
        setGameOver(false); 
        setHp(100); 
        setFish(0); 
        setDay(1); 
        setDayTimer(0); // BUG FIX: Reset Day Timer
        setRebirths(0); 
        setInventory({});
        setEnhancements({});
        setFishermenLevels({});
        setUnlockedWorlds([0]);
        setCurrentWorldId(0);
        setClassIdx(0);
        setActivePotions({});
        setAutoSpawnTimer(15);
        setDungeonLevel(1);
        setTrainingLevels({}); 
        setTrainingTimers({});
        setLevel(1);
        setXp(0);
        setXpToNext(100);
        setDeathStats({ day: 0, fish: 0, power: 0 });
        setIsHeisenberg(false);
        setIsHenryMode(false);
    };

    const handleRedeemCode = () => {
        const code = cheatCode.trim().toLowerCase();
        
        // RESET CODES
        if (code === "maddintest72") {
            setFish(prev => prev + 10000000000000000000); 
            setTotalFish(prev => prev + 10000000000000000000);
            setGems(prev => prev + 1000000000);
            pushNotification("¡PODER DE DESARROLLADOR!", Zap, "unlock");
            playSound('rebirth');
            setCheatCode("");
        } 
        else if (code === "heisenberg") {
            setIsHeisenberg(true);
            setIsHenryMode(false);
            setPenguinSpeech({ text: "Jesse, hay que cocinar.", visible: true });
            pushNotification("Say my name...", Skull, "warning");
            playSound('upgrade_success');
            setCheatCode("");
        } 
        else if (code === "henryact") {
            setIsHenryMode(true);
            setIsHeisenberg(false);
            setPenguinSpeech({ text: "Pequeño Caesars el GOAT", visible: true });
            pushNotification("Need a dispenser here!", Wrench, "info");
            playSound('upgrade_success');
            setCheatCode("");
        }
        else if (code.startsWith("spawnboss_")) {
            const bossNum = parseInt(code.split('_')[1]);
            if (bossNum >= 1 && bossNum <= 4) {
                const worldIndex = bossNum - 1;
                const boss = WORLDS[worldIndex].enemies.find(e => e.isBoss);
                if (boss) {
                    // APPLY THE NEW FORMULA LOGIC FOR BOSS SPAWN VIA CODE
                    let growthMult = 1 + (0.15 * day);
                    let powerScalar = day > 10 ? 1.0 : 0.5;
                    const worldMultiplier = Math.pow(1.2, worldIndex);
                    
                    const baseHpWithGrowth = boss.baseHp * growthMult;
                    const powerBonusHp = (boss.baseHp * 0.01) * (totalPower * powerScalar);
                    const calculatedHp = Math.floor((baseHpWithGrowth + powerBonusHp) * worldMultiplier);
                    
                    const baseAtkWithGrowth = boss.baseAtk * growthMult;
                    const powerBonusAtk = (boss.baseAtk * 0.01) * (totalPower * powerScalar);
                    const calculatedAtk = Math.max(1, Math.floor((baseAtkWithGrowth + powerBonusAtk) * worldMultiplier));

                    setCombat({
                        active: true,
                        timer: 60,
                        isHorde: false,
                        enemy: { def: boss, level: day, hp: calculatedHp, maxHp: calculatedHp, atk: calculatedAtk }
                    });
                    pushNotification(`¡JEFE MUNDO ${bossNum} INVOCADO!`, Skull, "warning");
                    playSound('horde');
                    setCheatCode("");
                }
            } else {
                pushNotification("Mundo Inválido", X, "warning");
            }
        } else {
            pushNotification("Código Inválido", X, "warning");
            playSound('upgrade_fail');
        }
    };

    const renderShopContent = () => {
        if (shopTab === 'alchemy') {
            return ALCHEMY.map(item => {
                const isTotem = item.id === 'totem_life';
                const count = isTotem ? (inventory['totem_life'] || 0) : 0;
                const tier = currentWorldId + 1;
                const tierPriceMult = Math.pow(1000, currentWorldId); 
                const displayCost = isTotem ? Math.floor((item.cost * tierPriceMult) * Math.pow(1.5, count)) : (item.cost * tierPriceMult);
                const canAfford = fish >= displayCost;
                
                let dynamicDescription = item.description;
                if (item.effect === 'luck') dynamicDescription = `+${item.val * tier}% Suerte (Tier ${tier})`;
                if (item.effect === 'atk') dynamicDescription = `+${item.val * tier}% Daño (Tier ${tier})`;
                if (item.effect === 'def') dynamicDescription = `+${item.val * tier}% Defensa (Tier ${tier})`;
                if (item.effect === 'xp') dynamicDescription = `+${item.val * tier}% XP (Tier ${tier})`;
                if (item.effect === 'maxHp') dynamicDescription = `+${item.val * tier} HP Max (Tier ${tier})`;
                if (item.effect === 'hp') dynamicDescription = `Recupera ${formatNumber(100 * Math.pow(10, currentWorldId))} HP. (Tier ${tier})`;

                const maxTotems = 30 * tier;
                const isMaxed = isTotem && count >= maxTotems;

                if (isTotem) {
                    return (
                        <button 
                            key={item.id} 
                            onClick={() => buyPotion(item)} 
                            className={`w-full p-4 rounded-xl border-2 flex flex-col gap-3 transition-all text-left relative overflow-hidden group shadow-lg ${isMaxed ? 'bg-slate-950 border-slate-800 opacity-60 cursor-default' : canAfford ? 'bg-gradient-to-br from-amber-950/40 to-yellow-900/20 border-yellow-500/30 hover:border-yellow-400 hover:shadow-yellow-900/20 active:scale-[0.98] cursor-pointer' : 'bg-slate-900 border-slate-800 opacity-60 cursor-default'}`}
                         >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl filter drop-shadow-md animate-pulse mt-1">{item.icon}</div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="font-black text-yellow-100 uppercase tracking-wide text-sm flex flex-wrap items-center gap-2">
                                            {item.name} 
                                            <span className="bg-yellow-500/20 text-yellow-300 text-[9px] px-1.5 py-0.5 rounded border border-yellow-500/30 whitespace-nowrap">TIER {tier}</span>
                                        </div>
                                        <div className="text-[10px] text-yellow-200/60 font-medium break-words text-left">{dynamicDescription}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1 relative z-10 bg-black/20 p-2 rounded-lg border border-yellow-500/10">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">
                                    Límite: <span className="text-white">{count}/{maxTotems}</span>
                                </div>
                                {isMaxed ? (
                                    <div className="text-[10px] font-black text-red-400 uppercase">MAX (Mundo {currentWorldId + 1})</div>
                                ) : (
                                    <div className={`font-mono font-black text-sm ${canAfford ? 'text-green-400' : 'text-red-400 opacity-70'}`}>{formatNumber(displayCost)} 🐟</div>
                                )}
                            </div>
                            
                            {!isMaxed && canAfford && <div className="absolute inset-0 border-2 border-yellow-400/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-pulse"></div>}
                         </button>
                    );
                }

                return (
                 <button 
                    key={item.id} 
                    onClick={() => buyPotion(item)} 
                    className={`w-full p-3 rounded-xl border flex items-start gap-3 transition-all text-left ${canAfford ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 active:scale-[0.98] cursor-pointer' : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-default'}`}
                 >
                    <div className="text-2xl mt-1 shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm flex flex-wrap items-center gap-2">
                            {item.name}
                            {['pot_luck_1', 'pot_dmg_1', 'pot_def_1', 'pot_xp_1', 'pot_heal_small', 'pot_heal_grand'].includes(item.id) && (
                                <span className="text-[9px] bg-slate-700 text-cyan-300 px-1.5 rounded border border-slate-600">Lv {tier}</span>
                            )}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight text-left">{dynamicDescription}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                        <div className={`font-mono font-bold text-xs ${canAfford ? 'text-green-400' : 'text-red-400'}`}>{formatNumber(displayCost)} 🐟</div>
                        {activePotions[item.id] ? <div className="text-[9px] font-bold text-purple-400 uppercase animate-pulse">Activo</div> : inventory[item.id] && !isTotem ? <div className="text-[9px] font-bold text-slate-500 uppercase">En Inv.</div> : null}
                    </div>
                 </button>
                );
            });
        }

        const items = shopTab === 'deco' ? DECORATIONS : shopTab === 'sword' ? WEAPONS : ARMOR;
        return items.map((item, index, array) => {
            const count = inventory[item.id] || 0;
            const isGear = item.type !== 'deco';
            const isMaxed = isGear && count > 0;
            
            let currentBuyAmount = 1;
            if(item.type === 'deco') currentBuyAmount = buyMultiplier;

            let totalCost = 0;
            let p = item.baseCost;
            if (item.type === 'deco') {
                p = Math.floor(item.baseCost * Math.pow(1.2, count));
                for(let k=0; k<currentBuyAmount; k++){ 
                    totalCost += p; 
                    p = Math.floor(p*1.2); 
                }
            } else {
                totalCost = item.baseCost;
            }
            
            const isLocked = isGear && index > 0 && !inventory[array[index - 1].id];
            const canAfford = fish >= totalCost;
            
            let isEquipped = false;
            let isObsolete = false;
            if (isGear && isMaxed) {
                const hasNext = index < array.length - 1 && inventory[array[index + 1].id] > 0;
                if (hasNext) isObsolete = true;
                else isEquipped = true;
            }

            return (
                <button 
                    key={item.id}
                    onClick={() => {
                        if (isLocked) return;
                        if (isGear && isMaxed) return;
                        buy(item);
                    }}
                    onMouseDown={() => !isLocked && !isMaxed && item.type === 'deco' && setBuyingItem(item.id)}
                    onMouseUp={() => setBuyingItem(null)}
                    onMouseLeave={() => setBuyingItem(null)}
                    className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all relative overflow-hidden text-left group
                    ${isEquipped 
                        ? 'bg-emerald-900/30 border-emerald-500/50 cursor-default' 
                        : isObsolete
                            ? 'bg-slate-900/50 border-slate-800 opacity-30 grayscale cursor-default'
                            : isLocked
                                ? 'bg-slate-950/80 border-slate-800 opacity-50 cursor-default'
                                : canAfford 
                                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 active:scale-[0.98] cursor-pointer' 
                                    : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-default'}`}
                >
                    <div className="text-2xl relative z-10">{isLocked ? <Lock size={20} className="text-slate-600"/> : item.icon}</div>
                    <div className="flex-1 relative z-10 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className={`font-bold text-sm truncate ${isLocked ? 'text-slate-600' : 'text-white'}`}>{item.name}</div>
                            {isEquipped && <span className="text-[8px] font-black bg-emerald-500 text-slate-900 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">EQUIPADO</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight truncate">{isLocked ? 'Bloqueado' : item.description}</div>
                        {!isGear && count > 0 && <div className="text-[9px] font-bold text-cyan-400 mt-1">Cantidad: {count}</div>}
                    </div>
                    {!isMaxed && !isLocked && <div className={`text-right relative z-10 font-mono font-bold text-xs shrink-0 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>{formatNumber(totalCost)} 🐟</div>}
                </button>
            );
        });
    };

    return (
        <div className={`flex h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden select-none font-sans ${hitFlash ? 'animate-tilt-shake' : ''}`}>
            
            {/* NOTIFICATIONS CONTAINER */}
            <div className="fixed top-4 left-80 z-[160] flex flex-col gap-2 pointer-events-none items-start w-80">
                {notifications.map(n => (
                    <div 
                        key={n.id} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-xl transform transition-all duration-700 ${getNotifColor(n.type)} ${n.fading ? 'animate-notif-out' : 'animate-notif-in'}`}
                    >
                        <div className="p-1 bg-black/20 rounded-full">{React.createElement(n.icon, { size: 18 })}</div>
                        <span className="text-xs font-bold">{n.text}</span>
                    </div>
                ))}
            </div>

            {/* SETTINGS BUTTON & MODAL */}
            <div className="fixed top-4 right-4 z-[170]">
                <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full bg-black/40 text-slate-400 hover:text-white hover:bg-slate-700 border border-white/10 transition-all active:scale-95">
                    <Settings size={20} />
                </button>
            </div>

            {showSettings && (
                <div className="fixed top-14 right-4 z-[170] w-64 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-800 font-bold text-xs uppercase tracking-widest text-slate-500">Configuración</div>
                    <div className="p-3 space-y-3">
                        <button onClick={() => setMuted(!muted)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors border border-slate-800">
                            <span className="flex items-center gap-2">{muted ? <VolumeX size={14}/> : <Volume2 size={14}/>} {muted ? "Sonido: Off" : "Sonido: On"}</span>
                        </button>
                        
                        <div className="pt-2 border-t border-slate-800">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Código</label>
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    value={cheatCode}
                                    onChange={(e) => setCheatCode(e.target.value)}
                                    placeholder="CODIGO"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                                <button 
                                    onClick={handleRedeemCode}
                                    className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-3 py-1 flex items-center justify-center transition-colors"
                                >
                                    <Check size={14}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* START SCREEN / TUTORIAL MODAL */}
            {tutorial && (
                <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center p-4 pointer-events-auto bg-slate-900/90 backdrop-blur-sm">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    
                    <div className="relative z-10 bg-slate-800/80 p-6 rounded-3xl border border-slate-600 backdrop-blur-xl shadow-2xl text-center max-w-md w-full animate-in zoom-in-95 duration-500 m-4">
                        <div className="mb-6">
                            <h1 className="text-5xl font-tycoon text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] mb-2 tracking-wide transform -rotate-1">
                                PENGU TYCOON
                            </h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] opacity-80">Versión 1.0</p>
                        </div>

                        {/* TUTORIAL GRID RESTORED (NO FORBIDDEN ICONS) */}
                        <div className="bg-slate-950/50 rounded-2xl p-4 mb-8 border border-white/5">
                            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Guía Rápida</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-500/30 text-blue-400 shadow-lg">
                                        <MousePointer2 size={24} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-tight">Haz clic para<br/>pescar</p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-yellow-900/30 rounded-xl flex items-center justify-center border border-yellow-500/30 text-yellow-400 shadow-lg">
                                        <Coins size={24} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-tight">Mejora tu<br/>equipo</p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center border border-red-500/30 text-red-400 shadow-lg">
                                        <Sword size={24} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-tight">Derrota<br/>jefes</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="text-left relative">
                                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1 block ml-2">Nombre de Pingüino</label>
                                <input 
                                    type="text" 
                                    maxLength={16}
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    placeholder="Ej. Pengu"
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-4 text-center font-black text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all placeholder:text-slate-600 text-xl"
                                />
                            </div>

                            <button 
                                onClick={handleStartGame}
                                disabled={!tempName.trim()}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl relative overflow-hidden group ${
                                    tempName.trim() 
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/50' 
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <Play size={18} className="fill-current"/> EMPEZAR
                                </span>
                                {tempName.trim() && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>}
                            </button>
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-600 font-black uppercase tracking-wider">
                            <span>v3.0 Remastered</span>
                            <span>By MaddinDev</span>
                        </div>
                    </div>
                </div>
            )}

            {/* GAME OVER SCREEN */}
            {gameOver && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000 pointer-events-auto">
                    <div className="max-w-md w-full text-center animate-death-in">
                        <HeartCrack size={100} className="mx-auto text-red-600 mb-6 animate-heartbeat drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]" />
                        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-2 uppercase tracking-tighter drop-shadow-sm font-sans">¡HAS CAÍDO!</h1>
                        <p className="text-slate-500 text-sm font-bold mb-10 tracking-widest uppercase">Tu leyenda termina aquí...</p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-12">
                            <div className="flex flex-col items-center p-4 bg-red-950/20 rounded-xl border border-red-900/50">
                                <Clock className="text-red-400 mb-2" size={24}/>
                                <span className="text-2xl font-black text-white">{deathStats.day}</span>
                                <span className="text-[10px] uppercase text-red-500 font-bold tracking-widest">Días</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-red-950/20 rounded-xl border border-red-900/50">
                                <span className="text-2xl mb-2">🐟</span>
                                <span className="text-2xl font-black text-white">{formatNumber(deathStats.fish)}</span>
                                <span className="text-[10px] uppercase text-red-500 font-bold tracking-widest">Pesca</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-red-950/20 rounded-xl border border-red-900/50">
                                <Zap className="text-yellow-500 mb-2" size={24}/>
                                <span className="text-2xl font-black text-white">{formatNumber(deathStats.power)}</span>
                                <span className="text-[10px] uppercase text-red-500 font-bold tracking-widest">Poder</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleGameOver}
                            className="w-full py-6 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-black text-xl uppercase tracking-[0.2em] rounded-xl shadow-[0_0_40px_rgba(185,28,28,0.4)] transition-all hover:scale-[1.02] border border-red-500 group"
                        >
                            <span className="flex items-center justify-center gap-3">
                                <RotateCcw size={24} className="group-hover:rotate-180 transition-transform duration-500"/> LEVANTARSE
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* WHITE FLASH OVERLAY FOR PRIMAL */}
            {primalFlash && <div className="fixed inset-0 bg-white z-[100] pointer-events-none animate-flash-white"></div>}

            {/* RED FLASH OVERLAY */}
            <div className={`fixed inset-0 bg-red-600/30 z-[90] pointer-events-none transition-opacity duration-75 ${hitFlash ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* DAMAGE VIGNETTE */}
            {damageScreenFlash && (
                <div className="fixed inset-0 pointer-events-none z-[95] animate-damage-screen" style={{background: 'radial-gradient(circle, transparent 60%, rgba(220, 38, 38, 0.5) 100%)'}}></div>
            )}

            {/* REBIRTH FLASH & CONFETTI */}
            {isRebirthing && <div className="fixed inset-0 bg-white z-[150] animate-flash-bang pointer-events-none"></div>}
            {showConfetti && <Confetti />}

            {/* REBIRTH MODAL */}
            {showRebirthModal && (
                <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in zoom-in-95 fade-in duration-300 pointer-events-auto">
                    <div className="bg-gradient-to-br from-indigo-950 to-slate-950 border border-purple-500/30 w-full max-w-lg rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-in slide-in-from-bottom-4 duration-500">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none animate-pulse"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Dna size={40} className="text-purple-300" />
                            </div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200 mb-2 uppercase tracking-widest">RENACIMIENTO</h2>
                            <p className="text-purple-300/50 text-xs font-mono tracking-[0.2em] mb-8">CICLO ETERNO</p>
                            <div className="bg-black/40 rounded-2xl p-6 mb-8 text-left space-y-4 border border-white/5 backdrop-blur-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400 shrink-0"><AlertCircle size={18}/></div>
                                    <div><h4 className="font-bold text-red-400 text-sm uppercase mb-1">Pérdida Total</h4><p className="text-slate-400 text-xs leading-relaxed">Se reiniciarán tu <span className="text-white font-bold">Nivel</span>, <span className="text-white font-bold">Inventario</span> y <span className="text-white font-bold">Mejoras</span>.</p></div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 shrink-0"><RotateCcw size={18}/></div>
                                    <div><h4 className="font-bold text-orange-400 text-sm uppercase mb-1">Reinicio de ADN</h4><p className="text-slate-400 text-xs leading-relaxed">Tu clase actual se perderá y volverás a ser <span className="text-white font-bold">Novato</span>.</p></div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 shrink-0"><Sparkles size={18}/></div>
                                    <div><h4 className="font-bold text-purple-400 text-sm uppercase mb-1">Poder Infinito</h4><p className="text-slate-400 text-xs leading-relaxed">Obtienes <span className="text-white font-bold">+1 Multiplicador Permanente</span> a tu PODER DE CLIC.</p></div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowRebirthModal(false)} className="flex-1 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 font-bold transition-all text-sm uppercase tracking-wider">Cancelar</button>
                                <button onClick={performRebirth} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-purple-900/20 transition-all hover:scale-105 mystic-button-anim border border-purple-400">CONFIRMAR</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR LEFT (REROLL & STATS) - FIXED LAYOUT - REDESIGNED */}
            <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 flex flex-col h-screen max-h-screen gap-3 z-[110] shadow-2xl relative overflow-visible">
                
                {/* REROLL CARD - HIGH END CASINO "STAKE" AESTHETIC - BLUE THEME */}
                <div className={`shrink-0 relative w-full rounded-xl group border border-slate-700 shadow-lg ${newClassJump ? 'ring-2 ring-yellow-400' : ''} ${rerollSuccessAnim ? 'animate-jump-happy' : ''}`} style={{backgroundColor: '#0f212e'}}>
                    <div className="flex flex-col p-4">
                        
                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2 uppercase">
                                <Dna size={14} className="text-blue-500" />
                                INVOCACIÓN
                            </h3>
                            {/* Probabilty Pill / Tooltip - FIXED Z-INDEX and POSITIONING */}
                            <div className="relative group/info z-[200]">
                                <div className="bg-[#1a2c38] p-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <Info size={14} />
                                </div>
                                {/* Tooltip Content - FIXED Z-INDEX AND POSITION - PUSHED RIGHT */}
                                <div className="absolute left-full top-0 ml-4 w-64 bg-slate-950 border border-slate-700 rounded-xl p-3 shadow-2xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none mb-2 z-[200]">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Probabilidades</h4>
                                    <div className="space-y-1">
                                        {CLASSES.map(c => (
                                            <div key={c.name} className="flex justify-between text-[10px]">
                                                <span style={{color: c.color}} className="font-bold">{c.name}</span>
                                                <div className="flex gap-2 text-slate-500 font-mono">
                                                    <span>x{c.multiplier}</span>
                                                    <span className="text-right w-8">{c.probability}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main "Screen" Display */}
                        <div className="bg-[#0b1721] rounded-lg p-3 mb-3 border border-slate-700/50 shadow-inner relative overflow-hidden h-20 flex flex-col items-center justify-center">
                            {/* Animated Background Lines */}
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
                            
                            {/* Dynamic Text */}
                            <h2 className={`text-xl font-black uppercase tracking-wider z-10 transition-all duration-75
                                ${rerollCooldown ? 'blur-[1px] scale-110 opacity-70 text-slate-300' : 'scale-100 opacity-100 text-white drop-shadow-md'}
                            `}
                            style={{color: tempClassDisplay ? '#ffffff' : CLASSES[classIdx].color}}>
                                {tempClassDisplay || CLASSES[classIdx].name}
                            </h2>

                            {/* Multiplier Tag */}
                            <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-500">MULT</span>
                                <span className="text-xs font-black text-blue-400">x{tempClassDisplay ? '??' : CLASSES[classIdx].multiplier}</span>
                            </div>
                        </div>

                        {/* Control Area */}
                        <div className="flex flex-col gap-2">
                            {/* Big Blue Button */}
                            <button
                                onClick={doReroll}
                                disabled={rerollCooldown}
                                className={`w-full py-3 rounded text-sm font-black uppercase tracking-wider transition-all relative overflow-hidden shadow-lg group
                                ${rerollCooldown 
                                    ? 'bg-[#1a2c38] text-slate-500 cursor-not-allowed border border-slate-700' 
                                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_0_#1e40af]'}`}
                            >
                                {rerollCooldown ? (
                                    <span>RODANDO...</span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        REROLL 🎲 <span className="bg-black/20 px-1.5 rounded text-[10px]">1K</span>
                                    </span>
                                )}
                                {/* Progress Bar Overlay */}
                                {rerollCooldown && <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-100" style={{width: `${rerollProgress}%`}}></div>}
                            </button>

                            {/* Auto Toggle - Industrial Switch Look */}
                            <div className="flex justify-between items-center bg-[#0b1721] p-2 rounded border border-slate-700">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Auto-Roll</span>
                                <button 
                                    onClick={() => setAutoReroll(!autoReroll)}
                                    className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${autoReroll ? 'bg-blue-500' : 'bg-[#1a2c38]'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 shadow-sm ${autoReroll ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Stats Section - Removed Scroll - Fixed Alignment and Spacing - COMPACT */}
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 flex-1 min-h-0 overflow-y-auto custom-scroll flex flex-col justify-start">
                    <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-1 mb-2">Estadísticas</h4>
                    
                    {/* Compact List with Grid to force alignment */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-white/5 last:border-0">
                            <span className="font-bold text-purple-400 flex items-center gap-1.5"><Diamond size={12}/> GEMAS</span>
                            <span className="font-mono text-slate-200">{formatNumber(gems)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-white/5 last:border-0">
                            <span className="font-bold text-cyan-400 flex items-center gap-1.5"><Zap size={12}/> CLIC</span>
                            <span className="font-mono text-slate-200">{formatNumber(stats.clickPower)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-white/5 last:border-0">
                            <span className="font-bold text-yellow-400 flex items-center gap-1.5"><Sword size={12}/> ATK</span>
                            <span className="font-mono text-slate-200">{formatNumber(stats.atk)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-white/5 last:border-0">
                            <span className="font-bold text-blue-400 flex items-center gap-1.5"><Shield size={12}/> DEF</span>
                            <span className="font-mono text-slate-200">{formatNumber(stats.def)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-white/5 last:border-0">
                            <span className="font-bold text-green-400 flex items-center gap-1.5"><FlaskConical size={12}/> SUERTE</span>
                            <span className="font-mono text-slate-200">{(luckMultiplier * 100).toFixed(0)} %</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-white/5 last:border-0">
                            <span className="font-bold text-orange-400 flex items-center gap-1.5"><Target size={12}/> CRIT</span>
                            <span className="font-mono text-slate-200">{(critChance * 100).toFixed(1)} %</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-white/5 last:border-0">
                            <span className="font-bold text-purple-400 flex items-center gap-1.5"><Dna size={12}/> RENACER</span>
                            <span className="font-mono text-slate-200">{rebirths}</span>
                        </div>
                    </div>
                </div>
                
                {/* IMPROVED REBIRTH BUTTON */}
                <div className="shrink-0 pt-1">
                    <button 
                        onClick={() => {
                            if (fish < rebirthCost) {
                                pushNotification(`Necesitas ${formatNumber(rebirthCost)} peces`, Lock, 'warning');
                                playSound('upgrade_fail');
                                return;
                            }
                            setShowRebirthModal(true);
                        }} 
                        className={`w-full h-14 border rounded-xl px-4 flex items-center justify-between transition-all group relative overflow-hidden shadow-lg pointer-events-auto cursor-pointer ${fish >= rebirthCost ? 'bg-purple-900 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] shimmer-bg' : 'bg-slate-900 border-slate-800 text-slate-600 opacity-70'}`}
                    >
                        <div className="flex flex-col items-start z-10">
                             <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
                                <RotateCcw size={14} className={fish >= rebirthCost ? 'animate-spin-slow' : ''}/>
                                RENACER
                             </div>
                             <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-[10px] font-mono font-bold ${fish >= rebirthCost ? 'text-green-400' : 'text-red-900'}`}>{formatNumber(rebirthCost)}</span>
                                <span className="text-xs">🐟</span>
                             </div>
                        </div>
                    </button>
                </div>
            </div>
            
            {/* MAIN GAME AREA */}
            <div className={`flex-1 relative flex flex-col items-center justify-center transition-all duration-1000 bg-gradient-to-b ${WORLDS[currentWorldId].bgGradient}`}>
                {/* ... Background and Decorations ... */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                {DECORATIONS.map(d => {
                    const count = inventory[d.id] || 0;
                    if (count > 0 && d.style) {
                        const scale = Math.min(2.0, 1 + (count - 1) * 0.05);
                        const finalStyle = {
                            ...d.style,
                            transform: `${d.style.transform || ''} scale(${scale})`,
                            transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        };
                        return (
                            <div key={d.id} className="absolute pointer-events-none animate-in fade-in duration-700 will-change-transform" style={finalStyle}>
                                {d.icon}
                            </div>
                        );
                    }
                    return null;
                })}
                {/* ... Header Area ... */}
                <div className="absolute top-0 left-0 w-full p-4 flex flex-col items-center gap-2 z-20 pointer-events-none select-none">
                    <div className="pointer-events-auto flex items-center justify-center gap-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 p-1 shadow-lg mt-2 relative">
                        <div className="flex items-center gap-2 px-3 py-1 border-r border-white/10">
                            {combat ? (
                                <Skull size={14} className="text-red-500 animate-pulse"/>
                            ) : (
                                <>
                                    <Clock size={14} className="text-red-400"/>
                                    <span className="text-xs font-mono font-bold text-red-200 w-[3ch] text-center">{autoSpawnTimer.toFixed(0)}s</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-3 px-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleWorldChange('prev'); }} 
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${currentWorldId > 0 ? 'text-white hover:bg-white/10' : 'opacity-30 cursor-default'}`}
                            >
                                <ChevronLeft size={14}/>
                            </button>
                            <div className="flex flex-col items-center">
                                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-cyan-200/60 leading-none mb-0.5">Mundo {currentWorldId + 1}</span>
                                <h2 className="text-xs font-bold text-white drop-shadow-md leading-none">
                                    {WORLDS[currentWorldId].name}
                                </h2>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleWorldChange('next'); }} 
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all group ${currentWorldId < WORLDS.length - 1 ? 'text-white hover:bg-white/10' : 'opacity-30 cursor-default'}`}
                            >
                                {currentWorldId < unlockedWorlds.length - 1 || (currentWorldId < WORLDS.length - 1 && totalPower >= WORLDS[currentWorldId+1].powerReq) ? 
                                    <ChevronRight size={14}/> : 
                                    <Lock size={10} className="text-red-400 group-hover:scale-110 transition-transform"/>
                                }
                            </button>
                        </div>
                        <div className="border-l border-white/10 pl-2 flex items-center gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleSpeed(); }}
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all active:scale-95 flex items-center gap-1 ${gameSpeed > 1 ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                <FastForward size={10} className={gameSpeed > 1 ? 'fill-black' : ''}/>
                                {gameSpeed}x
                            </button>
                        </div>
                        {/* ... Potions (MINIMALIST) ... */}
                        {Object.keys(activePotions).length > 0 && (
                            <div className="absolute left-[calc(100%+16px)] flex gap-2 items-center pointer-events-auto">
                                {Object.keys(activePotions).map(id => {
                                    const p = ALCHEMY.find(a => a.id === id);
                                    if(!p) return null;
                                    const timeLeft = activePotions[id];
                                    const progress = (timeLeft / p.duration) * 100;
                                    
                                    return (
                                        <div key={id} className="relative group transition-all hover:scale-105">
                                            {/* Minimalist Square Container */}
                                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden relative shadow-lg">
                                                {/* Background Fill Animation */}
                                                <div 
                                                    className="absolute bottom-0 left-0 w-full bg-purple-600/50 transition-all duration-100 ease-linear"
                                                    style={{ height: `${progress}%` }}
                                                ></div>
                                                {/* Icon */}
                                                <div className="absolute inset-0 flex items-center justify-center text-sm z-10">{p.icon}</div>
                                            </div>

                                            {/* Elegant Tooltip */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/90 border border-slate-800 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">{p.name}</span>
                                                <span className="text-xs font-mono">{timeLeft.toFixed(1)}s</span>
                                                {/* Little arrow */}
                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-t border-l border-slate-800 transform rotate-45"></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    {/* ... Resources Bar ... */}
                    <div className="flex flex-col items-center gap-2 pointer-events-auto">
                        <div className="flex items-center gap-6 bg-slate-900/60 backdrop-blur-md px-8 py-2 rounded-full border border-white/10 shadow-xl scale-90">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Peces</span>
                                <div className="text-xl font-black text-cyan-400 leading-none flex items-center gap-2 drop-shadow-md">
                                    <span className="text-lg">🐟</span> {formatNumber(Math.floor(fish))}
                                </div>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div className="flex flex-col items-center relative group w-24">
                                <span className={`text-[8px] font-bold text-slate-400 uppercase tracking-wider flex justify-between w-full transition-transform duration-500 ${dayAnim ? 'scale-125 text-yellow-300 animate-day-change' : ''}`}>
                                    <span>Día {day}</span>
                                    <span>{dayTimer.toFixed(0)}s</span>
                                </span>
                                <div className={`w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700 mt-1 relative`}>
                                    <div className={`absolute inset-0 bg-yellow-400/50 blur-sm transition-opacity duration-500 ${dayAnim ? 'opacity-100' : 'opacity-0'}`}></div>
                                    <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500 ease-out" style={{width: `${(dayTimer/60)*100}%`}}></div>
                                </div>
                            </div>
                        </div>
                        <div className="text-[9px] font-bold text-cyan-300 uppercase tracking-widest bg-black/40 px-3 py-0.5 rounded-full backdrop-blur-sm border border-cyan-500/20 shadow-lg">
                            Poder: {formatNumber(totalPower)}
                        </div>
                    </div>
                </div>
                {/* ... Penguin ... */}
                <div 
                    onClick={handlePlayerClick}
                    className="penguin-container cursor-pointer transition-transform active:scale-90 hover:scale-105 z-10 filter drop-shadow-2xl pointer-events-auto will-change-transform flex flex-col items-center"
                >
                    {/* SPEECH BUBBLE MODIFIED */}
                    {penguinSpeech && (
                        <div className={`absolute top-[10%] left-[80%] transform bg-white text-black px-4 py-3 rounded-2xl shadow-xl z-30 max-w-[200px] w-max pointer-events-none 
                        after:content-[''] after:absolute after:top-[60%] after:right-full after:-translate-y-1/2 after:border-8 after:border-transparent after:border-r-white
                        ${penguinSpeech.visible ? 'animate-bubble-in' : 'animate-bubble-out'}`}>
                            <p className="text-sm font-bold text-center leading-tight font-friendly">
                                {penguinSpeech.text}
                            </p>
                        </div>
                    )}

                    {/* PLAYER NAME TAG */}
                    <div className="absolute -top-8 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10 shadow-lg whitespace-nowrap z-20 animate-in fade-in zoom-in duration-500">
                        {playerName || "Pingüino"}
                    </div>

                    <div className="penguin-body"></div>
                    
                    {/* HEISENBERG ACCESSORIES */}
                    {isHeisenberg && (
                        <>
                            {/* HAT (Fedora) */}
                            <div className="penguin-hat">
                                <div className="hat-brim"></div>
                                <div className="hat-crown"></div>
                                <div className="hat-band"></div>
                            </div>
                            {/* GLASSES (Sunglasses) */}
                            <div className="penguin-glasses">
                                <div className="glasses-bridge"></div>
                                <div className="glasses-lens left"></div>
                                <div className="glasses-lens right"></div>
                            </div>
                        </>
                    )}

                    {/* HENRY ACT ACCESSORIES (TF2 Scout + HL Crowbar) */}
                    {isHenryMode && (
                        <>
                            {/* SCOUT CAP */}
                            <div className="scout-cap"></div>
                            <div className="scout-cap-bill"></div>
                            
                            {/* HEADSET */}
                            <div className="scout-headset">
                                <div className="headset-band"></div>
                                <div className="headset-ear"></div>
                                <div className="headset-mic"></div>
                            </div>

                            {/* CROWBAR (Held by invisible wing/hand) */}
                            <div className="crowbar">
                                <div className="crowbar-handle"></div>
                                <div className="crowbar-hook"></div>
                            </div>
                        </>
                    )}

                    <div className="penguin-belly"></div>
                    <div className="penguin-eye left"><div className="penguin-pupil"></div></div>
                    <div className="penguin-eye right"><div className="penguin-pupil"></div></div>
                    <div className="penguin-beak"></div>
                    <div className="penguin-foot left"></div>
                    <div className="penguin-foot right"></div>
                </div>
                {/* ... HUD ... */}
                <div className="absolute bottom-32 w-full px-8 flex gap-4 pointer-events-none z-20 justify-center max-w-2xl">
                    <div className="flex-1 bg-black/40 backdrop-blur-md rounded-lg p-2 border border-white/10 flex flex-col gap-1 relative">
                        {/* DAMAGE NUMBERS FLOAT LAYER */}
                        <div className="absolute bottom-full left-0 w-full flex flex-col items-center mb-2 pointer-events-none h-32 justify-end overflow-hidden">
                            {playerDamageFloats.map(f => (
                                <div key={f.id} className="text-red-500 font-black text-2xl animate-float-up drop-shadow-lg stroke-black" style={{textShadow: '0 0 5px black'}}>
                                    -{formatNumber(f.val)}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
                            <span className="flex items-center gap-1.5"><Heart size={10} className="text-red-400"/> Vida</span>
                            <span>{Math.ceil(hp)} / {maxHp}</span>
                        </div>
                        <div className={`h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative ${damageBarFlash ? 'animate-damage-flash' : ''}`}>
                            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300" style={{width: `${(hp/maxHp)*100}%`}}></div>
                        </div>
                    </div>
                    <div className="flex-1 bg-black/40 backdrop-blur-md rounded-lg p-2 border border-white/10 flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
                            <span className="flex items-center gap-1.5"><Star size={10} className="text-yellow-400"/> Nivel {level}</span>
                            <span>{formatNumber(Math.floor(xp))} / {formatNumber(xpToNext)} XP</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300" style={{width: `${Math.min(100, (xp/xpToNext)*100)}%`}}></div>
                        </div>
                    </div>
                </div>
                
                {/* MENU BUTTONS - UNIFIED AND REORDERED */}
                {/* Z-INDEX SET TO Z-50 TO AVOID BLOCKING MODALS, BUT ABOVE GAME ELEMENTS */}
                <div className="absolute bottom-6 flex justify-center w-full z-50 px-4 pointer-events-none">
                    <div className="flex items-end gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-xl p-2 rounded-3xl border border-slate-700/50 shadow-2xl overflow-x-auto max-w-full custom-scroll">
                        
                        {/* 1. BESTIARY (LEFT EDGE) */}
                        <button onClick={(e) => {e.stopPropagation(); setView('bestiary')}} className="group flex flex-col items-center justify-center w-14 h-14 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all active:scale-95 shrink-0 relative">
                            {hasUnclaimedBestiary && <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-md border border-white/20"></div>}
                            <Book size={20} className="text-cyan-400 mb-1 group-hover:scale-110 transition-transform"/>
                            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Bestiario</span>
                        </button>
                        
                        {/* 2. FISHING */}
                        <button 
                            onClick={(e) => {e.stopPropagation(); if(isFishingLocked) { pushNotification("Desbloquea al renacer", Lock, 'warning'); } else { setView('fishing'); }}} 
                            className={`group flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition-all active:scale-95 shrink-0 cursor-pointer ${isFishingLocked ? 'bg-slate-950/50 border-slate-800 grayscale' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700'}`}
                        >
                            {isFishingLocked ? <Lock size={20} className="text-slate-500 mb-1"/> : <Anchor size={20} className="text-blue-400 mb-1 group-hover:scale-110 transition-transform"/>}
                            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Pesca</span>
                        </button>

                        {/* 3. TRAINING */}
                        <button 
                            onClick={(e) => {e.stopPropagation(); setView('training'); }} 
                            className="group flex flex-col items-center justify-center w-14 h-14 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all active:scale-95 shrink-0"
                        >
                            <Dumbbell size={20} className="text-green-400 mb-1 group-hover:scale-110 transition-transform"/>
                            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Entreno</span>
                        </button>
                        
                        {/* 4. DUNGEON (CENTER - BIG) */}
                        <button onClick={(e) => {e.stopPropagation(); if(!combat) setView('dungeon');}} disabled={!!combat} className={`group flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-105 transition-all active:scale-95 shrink-0 mx-2 relative overflow-hidden ${combat ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 pointer-events-none"></div>
                            <Castle size={32} className="text-white mb-1 group-hover:rotate-6 transition-transform relative z-10 drop-shadow-lg"/>
                            <span className="text-[8px] font-black uppercase tracking-widest text-white relative z-10">Mazmorra</span>
                        </button>

                        {/* 5. PETS */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); if(!isWorld3Unlocked) { pushNotification("Desbloquea Mundo 3", Lock, 'warning'); } else { pushNotification("Próximamente", Clock, 'info'); } }} 
                            className={`group flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition-all active:scale-95 shrink-0 cursor-pointer ${!isWorld3Unlocked ? 'bg-slate-950/50 border-slate-800 grayscale' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700'}`}
                        >
                            {!isWorld3Unlocked ? <Lock size={20} className="text-red-500 mb-1"/> : <Cat size={20} className="text-pink-400 mb-1 group-hover:scale-110 transition-transform"/>}
                            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Mascotas</span>
                        </button>
                        
                        {/* 6. BLACKSMITH */}
                        <button 
                            onClick={(e) => {e.stopPropagation(); if(isBlacksmithLocked) { pushNotification("Desbloquea Mundo 2", Lock, 'warning'); } else { setView('blacksmith'); }}} 
                            className={`group flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition-all active:scale-95 shrink-0 cursor-pointer ${isBlacksmithLocked ? 'bg-slate-950/50 border-slate-800 grayscale' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700'}`}
                        >
                            {isBlacksmithLocked ? <Lock size={20} className="text-slate-500 mb-1"/> : <Anvil size={20} className="text-orange-400 mb-1 group-hover:scale-110 transition-transform"/>}
                            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Herrería</span>
                        </button>

                        {/* 7. ACHIEVEMENTS (RIGHT EDGE) */}
                        <button onClick={(e) => {e.stopPropagation(); setView('achievements')}} className="group flex flex-col items-center justify-center w-14 h-14 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all active:scale-95 shrink-0">
                            <Trophy size={20} className="text-yellow-400 mb-1 group-hover:scale-110 transition-transform"/>
                            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Logros</span>
                        </button>

                    </div>
                </div>

                {/* ... Combat Layer ... */}
                {combat && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto">
                        <CombatModal 
                            enemy={combat.enemy} 
                            playerStats={stats} 
                            timeLeft={combat.timer} 
                            onHit={handleCombatHit}
                            critChance={critChance}
                            closing={combat.closing || false}
                            isHorde={combat.isHorde}
                            enemiesLeft={combat.enemiesLeft}
                            isDungeon={combat.isDungeon}
                            dungeonWave={combat.dungeonWave}
                            skillsOwned={skillsOwned}
                            skillCooldowns={skillCooldowns}
                            onUseSkill={handleUseSkill}
                            playerBlocking={playerBlocking}
                            playerHp={hp}
                            maxPlayerHp={maxHp}
                            onAttackSound={(isCrit) => playSound(isCrit ? 'crit' : 'hit')}
                        />
                    </div>
                )}
            </div>
            {/* ... Right Sidebar (Shop) ... */}
            <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900">
                    <h2 className="font-black text-xl text-cyan-400 flex items-center gap-2 mb-4 tracking-wider"><Fish/> MERCADO</h2>
                    <div className="flex p-1 bg-slate-950 rounded-xl gap-1 mb-3">
                        {(['deco', 'sword', 'armor', 'alchemy'] as const).map(tab => (
                            <button key={tab} onClick={() => setShopTab(tab)} className={`flex-1 py-2 text-[9px] font-bold uppercase rounded-lg transition-all flex justify-center items-center ${shopTab===tab ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                                {tab === 'deco' ? 'Deco' : tab === 'sword' ? 'Armas' : tab === 'armor' ? 'Armadura' : 'Alquimia'}
                            </button>
                        ))}
                    </div>
                    {/* BUY MULTIPLIER FOR DECO */}
                    {shopTab === 'deco' && (
                        <div className="flex items-center justify-between bg-slate-950 p-1 rounded-lg">
                            <span className="text-[9px] font-bold text-slate-500 ml-2 uppercase">Comprar x:</span>
                            <div className="flex gap-1">
                                {[1, 5, 10, 50].map(m => (
                                    <button 
                                        key={m} 
                                        onClick={() => setBuyMultiplier(m)} 
                                        className={`w-8 h-6 rounded text-[10px] font-bold transition-all ${buyMultiplier === m ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3 bg-slate-900/50">
                    {renderShopContent()}
                </div>
            </div>

            {/* --- MODAL RENDERING LAYER --- */}
            {view === 'bestiary' && (
                <Modal title="Bestiario" icon={Book} onClose={() => setView('game')} noPadding={true}>
                    <div className="flex h-full bg-[#0f172a]">
                        {/* Left Side: Enemy List (Shop Style List) */}
                        <div className="w-80 overflow-y-auto custom-scroll border-r border-slate-700/50 flex flex-col bg-slate-900/50">
                            {WORLDS.map(world => {
                                if (!unlockedWorlds.includes(world.id) && totalPower < world.powerReq) return null;
                                return (
                                    <div key={world.id}>
                                        <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-slate-950/80 sticky top-0 z-10 border-b border-slate-800 flex justify-between items-center ${unlockedWorlds.includes(world.id) ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {world.name}
                                            <span className="text-[9px] opacity-50">Mundo {world.id + 1}</span>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {world.enemies.map(enemy => {
                                                const entry = bestiary[enemy.id] || { kills: 0, maxLv: 0, claimed: false, unlockedMutations: [] };
                                                const isDiscovered = entry.kills > 0;
                                                const isSelected = selectedBestiaryEnemyId === enemy.id;
                                                const isBoss = enemy.isBoss;
                                                const isMiniBoss = enemy.isMiniBoss;
                                                
                                                return (
                                                    <button 
                                                        key={enemy.id} 
                                                        onClick={() => setSelectedBestiaryEnemyId(enemy.id)}
                                                        className={`w-full p-2.5 rounded-lg border flex items-center gap-3 transition-all relative overflow-hidden text-left group
                                                            ${isSelected 
                                                                ? 'bg-blue-900/30 border-blue-500/50' 
                                                                : isBoss
                                                                    ? 'bg-yellow-950/20 border-yellow-900/30 hover:bg-yellow-900/40'
                                                                    : isMiniBoss
                                                                        ? 'bg-green-950/20 border-green-900/30 hover:bg-green-900/40'
                                                                        : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 flex items-center justify-center rounded bg-slate-800 border border-slate-700 text-lg shrink-0 ${!isDiscovered ? 'opacity-30 grayscale blur-[1px]' : ''} ${isBoss ? 'text-2xl shadow-[0_0_10px_rgba(250,204,21,0.3)]' : ''}`}>
                                                            {isDiscovered ? enemy.sprite : '?'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`font-bold text-xs truncate ${isDiscovered ? isBoss ? 'text-yellow-400' : isMiniBoss ? 'text-green-400' : 'text-slate-200' : 'text-slate-600'}`}>
                                                                {isDiscovered ? enemy.name : 'Desconocido'}
                                                            </div>
                                                            {isDiscovered && !entry.claimed && <div className="text-[8px] font-black text-yellow-400 uppercase tracking-wide animate-pulse">¡Recompensa!</div>}
                                                        </div>
                                                        {isSelected && <div className="w-1 h-8 bg-blue-500 absolute left-0 rounded-r"></div>}
                                                        {isBoss && isDiscovered && <div className="absolute right-2 text-yellow-500"><Trophy size={14} className="fill-yellow-500/50"/></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Right Side: Objective Details (Data Driven) - NOW SCROLLABLE */}
                        <div className="flex-1 bg-slate-950/30 p-8 flex flex-col overflow-y-auto custom-scroll relative">
                            {/* Background Grid */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none fixed"></div>

                            {selectedBestiaryEnemy ? (
                                <>
                                    {selectedBestiaryEnemy.data.kills > 0 ? (
                                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10 pb-4">
                                            
                                            {/* Header Section */}
                                            <div className="flex items-start justify-between border-b border-slate-800 pb-6">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-24 h-24 bg-slate-900 rounded-xl border flex items-center justify-center shadow-lg ${selectedBestiaryEnemy.def.isBoss ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.2)]' : selectedBestiaryEnemy.def.isMiniBoss ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-slate-700'}`}>
                                                        <div className="text-5xl filter drop-shadow-lg animate-sway">{selectedBestiaryEnemy.def.sprite}</div>
                                                    </div>
                                                    <div>
                                                        <h2 className={`text-3xl font-black tracking-tight uppercase leading-none mb-2 font-tycoon ${selectedBestiaryEnemy.def.isBoss ? 'text-yellow-400' : selectedBestiaryEnemy.def.isMiniBoss ? 'text-green-400' : 'text-white'}`}>
                                                            {selectedBestiaryEnemy.def.name}
                                                        </h2>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-700">
                                                                {selectedBestiaryEnemy.worldName}
                                                            </span>
                                                            <span className="text-xs text-slate-600">•</span>
                                                            <span className="text-[10px] font-mono text-slate-500">ID: {selectedBestiaryEnemy.def.id.toUpperCase()}</span>
                                                            {selectedBestiaryEnemy.def.isBoss && <span className="bg-yellow-900/50 text-yellow-400 text-[8px] font-black px-2 py-0.5 rounded border border-yellow-500/50 uppercase tracking-wider">JEFE DE ZONA</span>}
                                                            {selectedBestiaryEnemy.def.isMiniBoss && <span className="bg-green-900/50 text-green-400 text-[8px] font-black px-2 py-0.5 rounded border border-green-500/50 uppercase tracking-wider">MINI JEFE</span>}
                                                        </div>
                                                        <p className="text-sm text-slate-400 italic mt-3 max-w-lg leading-relaxed">
                                                            "{selectedBestiaryEnemy.def.lore}"
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Claim Reward Button */}
                                                {!selectedBestiaryEnemy.data.claimed && (
                                                    <button 
                                                        onClick={() => claimBestiaryReward(selectedBestiaryEnemy.def.id)}
                                                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs px-4 py-3 rounded-lg shadow-lg animate-bounce flex items-center gap-2 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all"
                                                    >
                                                        <Diamond size={16}/> RECLAMAR 10 GEMAS
                                                    </button>
                                                )}
                                            </div>

                                            {/* Linear Stats Bar */}
                                            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 divide-x divide-slate-800 py-4 shadow-inner">
                                                <div className="flex-1 flex flex-col items-center px-4">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Vida Base</span>
                                                    <span className="font-mono text-xl font-bold text-red-400">{formatNumber(selectedBestiaryEnemy.def.baseHp)}</span>
                                                </div>
                                                <div className="flex-1 flex flex-col items-center px-4">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Ataque Base</span>
                                                    <span className="font-mono text-xl font-bold text-yellow-400">{formatNumber(selectedBestiaryEnemy.def.baseAtk)}</span>
                                                </div>
                                                <div className="flex-1 flex flex-col items-center px-4">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Derrotados</span>
                                                    <span className="font-mono text-xl font-bold text-cyan-400">{selectedBestiaryEnemy.data.kills}</span>
                                                </div>
                                                <div className="flex-1 flex flex-col items-center px-4">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Nivel Máximo</span>
                                                    <span className="font-mono text-xl font-bold text-purple-400">{selectedBestiaryEnemy.data.maxLv}</span>
                                                </div>
                                            </div>

                                            {/* Mutations Section (Static List inside Scrollable Parent) - NEW TOOLTIPS */}
                                            <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-visible">
                                                <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Dna size={14}/> Registro de Mutaciones
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-slate-600">
                                                        {selectedBestiaryEnemy.data.unlockedMutations.length} / {MUTATIONS.length}
                                                    </span>
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    {MUTATIONS.map(mut => {
                                                        const isUnlocked = selectedBestiaryEnemy.data.unlockedMutations.includes(mut.id);
                                                        const isClaimed = selectedBestiaryEnemy.data.claimedMutationRewards.includes(mut.id);
                                                        
                                                        return (
                                                            <div key={mut.id} className={`group relative flex items-center justify-between p-3 rounded-lg border transition-colors ${isUnlocked ? 'bg-slate-800 border-slate-700' : 'bg-slate-950/50 border-slate-900'}`}>
                                                                
                                                                {/* STATS TOOLTIP FOR MUTATIONS */}
                                                                {isUnlocked && (
                                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-black/95 text-white px-4 py-2 rounded-lg border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] w-max">
                                                                        <div className="flex gap-4 font-mono text-xs">
                                                                            <div className="text-red-400 font-bold">HP: {formatNumber(selectedBestiaryEnemy.def.baseHp * mut.mult)}</div>
                                                                            <div className="text-yellow-400 font-bold">ATK: {formatNumber(selectedBestiaryEnemy.def.baseAtk * mut.mult)}</div>
                                                                        </div>
                                                                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-r border-b border-slate-700 transform rotate-45"></div>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded flex items-center justify-center text-2xl bg-slate-900 border border-slate-800 ${isUnlocked ? '' : 'grayscale opacity-20'}`}>
                                                                        {mut.prefix}
                                                                    </div>
                                                                    <div>
                                                                        <div className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-slate-700'}`}>{mut.name}</div>
                                                                        <div className="text-[10px] text-slate-500 max-w-md">{isUnlocked ? mut.description : '???'}</div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {isUnlocked && !isClaimed ? (
                                                                    <button 
                                                                        onClick={() => claimMutationReward(selectedBestiaryEnemy.def.id, mut.id)}
                                                                        className="text-[10px] font-bold bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1.5 rounded shadow-sm border-b-2 border-yellow-700 active:border-b-0 active:translate-y-0.5 transition-all"
                                                                    >
                                                                        INVESTIGAR
                                                                    </button>
                                                                ) : isClaimed ? (
                                                                    <div className="px-3 py-1 bg-green-500/10 rounded border border-green-500/20 flex items-center gap-1.5">
                                                                        <Check size={12} className="text-green-500"/>
                                                                        <span className="text-[10px] font-black text-green-500 uppercase">Analizado</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="px-3 py-1 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5 opacity-50">
                                                                        <Lock size={12} className="text-slate-600"/>
                                                                        <span className="text-[10px] font-bold text-slate-600 uppercase">Bloqueado</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                            <div className="text-8xl mb-6 opacity-10 grayscale filter blur-[2px] animate-pulse">?</div>
                                            <h2 className="text-2xl font-black mb-2 uppercase tracking-wide">Datos no disponibles</h2>
                                            <p className="text-sm font-mono text-slate-500 bg-slate-900 px-4 py-2 rounded border border-slate-800">
                                                AVISTAMIENTOS REQUERIDOS: 1
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                    <Search size={64} className="mb-6 opacity-20"/>
                                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Selecciona un espécimen</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* REDESIGNED FISHING MODAL (GOTY STYLE) */}
            {view === 'fishing' && (
                <Modal title="Puerto Pesquero" icon={Anchor} onClose={() => setView('game')} theme="void">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {FISHERMEN.map(f => {
                            const level = fishermenLevels[f.id] || 0;
                            const cost = Math.floor(f.cost * Math.pow(1.15, level));
                            const canAfford = gems >= cost;
                            return (
                                <div key={f.id} className="relative group bg-slate-900/80 border border-blue-500/20 rounded-2xl p-5 overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-[1.01] hover:border-blue-500/40 backdrop-blur-sm">
                                    
                                    {/* Water Background Animation */}
                                    <div className="absolute inset-0 water-shimmer opacity-20 pointer-events-none rounded-2xl"></div>
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-800 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                                                {f.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg text-white uppercase tracking-wide drop-shadow-md">{f.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800 uppercase tracking-wider">Nivel {level}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress / Stats Bar */}
                                    <div className="space-y-1 mb-4 relative z-10">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <span>Eficiencia de Producción</span>
                                            <span className="text-cyan-400 font-mono">+{formatNumber(f.production * (level || 1))} /s</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 w-full animate-pulse opacity-80"></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Base</span>
                                            <span className="text-sm font-mono font-bold text-slate-300 flex items-center gap-1">
                                                {formatNumber(f.production)} <span className="text-[10px]">/s por nivel</span>
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => buyFisherman(f.id, cost)}
                                            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 group/btn ${canAfford ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border border-blue-400/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                                        >
                                            <span className="group-hover/btn:translate-x-[-2px] transition-transform">{formatNumber(cost)}</span> <Diamond size={14} className={canAfford ? "text-cyan-200 fill-cyan-400" : "text-slate-600"}/>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Modal>
            )}

            {/* TRAINING REDESIGNED (GOTY STYLE) */}
            {view === 'training' && (
                <Modal title="Campo de Entrenamiento" icon={Dumbbell} onClose={() => setView('game')} theme="void">
                    {/* TABS */}
                    <div className="flex gap-2 mb-6 p-1 bg-slate-950/50 rounded-xl w-max mx-auto border border-slate-800 relative z-10">
                        <button 
                            onClick={() => setTrainingTab('train')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${trainingTab === 'train' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Estadísticas
                        </button>
                        <button 
                            onClick={() => setTrainingTab('skill')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${trainingTab === 'skill' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Habilidades
                        </button>
                    </div>

                    {trainingTab === 'train' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {TRAININGS.map(t => {
                                const lvl = trainingLevels[t.id] || 0;
                                const fishCost = Math.floor(t.baseCostFish * Math.pow(1.5, lvl));
                                const gemsCost = Math.floor(t.baseCostGems * Math.pow(1.2, lvl));
                                const isLocked = rebirths < t.reqRebirth;
                                const isTraining = trainingTimers[t.id] && trainingTimers[t.id] > Date.now();
                                
                                let cardBorder = 'border-slate-800';
                                let glowColor = 'bg-slate-500';
                                if (t.id === 'strength') { cardBorder = 'border-red-900/50'; glowColor = 'bg-red-500'; }
                                if (t.id === 'endurance') { cardBorder = 'border-blue-900/50'; glowColor = 'bg-blue-500'; }
                                if (t.id === 'power') { cardBorder = 'border-purple-900/50'; glowColor = 'bg-purple-500'; }
                                if (t.id === 'perfect') { cardBorder = 'border-yellow-900/50'; glowColor = 'bg-yellow-500'; }

                                return (
                                    <div key={t.id} className={`relative group bg-slate-950 border ${cardBorder} rounded-2xl p-5 overflow-hidden shadow-lg transition-all hover:scale-[1.01]`}>
                                        
                                        {/* Ambient Glow */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 ${glowColor} blur-[60px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity`}></div>
                                        
                                        {isLocked && <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm"><Lock size={32} className="text-slate-600 mb-2"/><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Renacer {t.reqRebirth} Requerido</span></div>}

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300 ${t.color}`}>
                                                    {React.createElement(t.icon, {size: 24})}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg text-white uppercase tracking-wide drop-shadow-md">{t.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-wider">Nivel {lvl}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed h-8">{t.description}</p>

                                        {/* Dynamic Progress Bar or Static Line */}
                                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-800">
                                            {isTraining ? (
                                                <div className="h-full w-full train-bar-anim"></div>
                                            ) : (
                                                <div className={`h-full w-1/3 opacity-30 ${glowColor}`}></div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => handleTraining(t.id)}
                                            disabled={isTraining || isLocked}
                                            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative overflow-hidden group/btn ${isTraining ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed' : 'bg-slate-100 hover:bg-white text-slate-900 shadow-xl hover:shadow-2xl active:scale-[0.98]'}`}
                                        >
                                            {isTraining ? (
                                                <span className="animate-pulse">Entrenando...</span>
                                            ) : (
                                                <>
                                                    <span>MEJORAR</span>
                                                    <div className="w-px h-3 bg-slate-300"></div>
                                                    <div className="flex items-center gap-2 font-mono text-[10px]">
                                                        <span>{formatNumber(fishCost)} 🐟</span>
                                                        <span>{formatNumber(gemsCost)} 💎</span>
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {SKILLS.map(skill => {
                                const isOwned = skillsOwned.includes(skill.id);
                                const canAfford = gems >= skill.costGems;

                                return (
                                    <div key={skill.id} className={`relative group p-6 rounded-2xl border overflow-hidden transition-all ${isOwned ? 'bg-slate-950 border-green-900/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-slate-950 border-slate-800'}`}>
                                        
                                        {/* Skill Glow */}
                                        {isOwned && <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[60px] pointer-events-none"></div>}

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 shadow-lg ${skill.color} border-current bg-slate-900 group-hover:scale-110 transition-transform duration-300`}>
                                                    {React.createElement(skill.icon, { size: 28 })}
                                                </div>
                                                <div>
                                                    <h4 className={`font-black text-sm uppercase tracking-wide ${skill.color.replace('text-', 'text-')}`}>{skill.name}</h4>
                                                    <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block">Tecla: {skill.keybind}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium h-12 relative z-10">{skill.description}</p>
                                        
                                        {isOwned ? (
                                            <div className="w-full py-4 bg-green-900/20 border border-green-900/50 text-green-500 font-black text-center text-xs rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner">
                                                <Check size={16}/> ADQUIRIDO
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleBuySkill(skill.id, skill.costGems)}
                                                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${canAfford ? 'bg-white hover:bg-slate-200 text-black' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                                            >
                                                <span>APRENDER</span>
                                                <div className="w-px h-3 bg-current opacity-20"></div>
                                                <span className="font-mono">{formatNumber(skill.costGems)}</span> <Diamond size={14}/>
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Modal>
            )}

            {/* BLACKSMITH FINAL REDESIGN - NO SCROLL, STRICTLY COMPACT */}
            {view === 'blacksmith' && (
                <Modal title="Forja del Destino" icon={Anvil} onClose={() => setView('game')} theme="mystic" noPadding={true}>
                    <div className="flex items-center justify-center h-full w-full overflow-hidden p-4">
                        <div className="flex gap-4 md:gap-8 items-center justify-center w-full max-w-4xl h-full">
                            
                            {[
                                { slot: 'weapon', data: [...WEAPONS].reverse().find(w => inventory[w.id] > 0) },
                                { slot: 'armor', data: [...ARMOR].reverse().find(a => inventory[a.id] > 0) }
                            ].map(({ slot, data: item }) => {
                                
                                if (!item) {
                                    return (
                                        <div key={slot} className="w-64 h-[420px] bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center gap-4 opacity-50 hover:opacity-100 transition-opacity shrink-0">
                                            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-2">
                                                <Lock size={32} className="text-slate-600"/>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest">{slot === 'weapon' ? 'Arma' : 'Armadura'} Bloqueada</h3>
                                            <p className="text-[10px] text-slate-400 font-bold">Compra en el Mercado para desbloquear.</p>
                                        </div>
                                    );
                                }

                                const stars = enhancements[item.id] || 0;
                                const isMax = stars >= 10;
                                const baseChance = 1.0 - (stars * 0.1);
                                const successChance = Math.min(0.95, Math.max(0.05, baseChance * luckMultiplier));
                                const chancePercent = (successChance * 100).toFixed(0);
                                const upgradeCost = Math.floor(item.baseCost * 0.2 * Math.pow(stars + 1, 1.5));
                                const canAfford = fish >= upgradeCost;

                                let chanceColor = 'text-green-500';
                                if (successChance < 0.7) chanceColor = 'text-yellow-500';
                                if (successChance < 0.4) chanceColor = 'text-orange-500';
                                if (successChance < 0.2) chanceColor = 'text-red-500';

                                return (
                                    <div key={item.id} className="relative group bg-slate-950 border border-orange-900/40 w-64 h-[450px] rounded-3xl shadow-2xl flex flex-col overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/10 to-transparent pointer-events-none"></div>
                                        
                                        <div className="p-6 flex flex-col items-center flex-1 relative z-10">
                                            <div className="relative mb-4">
                                                <div className="w-20 h-20 bg-slate-900 rounded-full border border-orange-500/30 flex items-center justify-center text-4xl shadow-lg relative z-10">
                                                    {item.icon}
                                                </div>
                                                <div className="absolute inset-0 animate-ember opacity-30"><Flame className="text-orange-500 w-full h-full"/></div>
                                            </div>
                                            
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight text-center leading-none mb-1">{item.name}</h3>
                                            <div className="flex gap-0.5 mb-2">
                                                {[...Array(10)].map((_, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < stars ? "bg-yellow-400 shadow-[0_0_2px_gold]" : "bg-slate-800"}`}></div>
                                                ))}
                                            </div>
                                            
                                            <div className="w-full bg-slate-900/80 rounded-xl p-3 border border-slate-800 mb-4 flex justify-between items-center">
                                                <div className="text-center">
                                                    <div className="text-[9px] text-slate-500 uppercase font-bold">Base</div>
                                                    <div className="text-sm font-black text-white">x{(1 + (stars * 0.1)).toFixed(1)}</div>
                                                </div>
                                                <ArrowUpCircle size={16} className="text-slate-600"/>
                                                <div className="text-center">
                                                    <div className="text-[9px] text-slate-500 uppercase font-bold">Mejora</div>
                                                    <div className="text-sm font-black text-green-400">x{(1 + ((stars + 1) * 0.1)).toFixed(1)}</div>
                                                </div>
                                            </div>

                                            <div className="mt-auto w-full">
                                                <div className="flex justify-between items-end mb-1 px-1">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Éxito</span>
                                                    <span className={`text-lg font-black ${chanceColor}`}>{chancePercent}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-3">
                                                    <div className={`h-full relative z-10 ${successChance > 0.5 ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-orange-500'}`} style={{width: `${chancePercent}%`}}></div>
                                                </div>

                                                <button 
                                                    onClick={() => handleUpgradeItem(item)}
                                                    disabled={isMax}
                                                    className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 group relative overflow-hidden ${isMax ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : canAfford ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                                                >
                                                    <span className="relative z-10">{isMax ? 'MAX' : `${formatNumber(upgradeCost)} 🐟`}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Modal>
            )}

            {/* DUNGEON START MODAL - SUPER COMPACT WITH 'autoSize' PROP & CLOSE BUTTON */}
            {view === 'dungeon' && (
                <Modal title="" icon={Castle} onClose={() => setView('game')} theme="void" noPadding={true} autoSize={true}>
                    <div className="w-72 bg-slate-900 border border-purple-500 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_60px_rgba(147,51,234,0.3)] flex flex-col items-center text-center gap-4 m-4">
                        {/* MANUAL CLOSE BUTTON MOVED INSIDE */}
                        <button onClick={() => setView('game')} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-50">
                            <X size={18} />
                        </button>
                        
                        {/* Animated Background inside card */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-purple-950 rounded-full flex items-center justify-center border-2 border-purple-500 shadow-lg mb-2 mx-auto">
                                <Castle size={40} className="text-purple-300 drop-shadow-md"/>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1">Nivel {dungeonLevel}</h2>
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Zona de Peligro</p>
                        </div>

                        <div className="w-full bg-slate-950/50 rounded-xl border border-slate-800 p-3 grid grid-cols-2 gap-2 relative z-10">
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Enemigos</span>
                                <span className="text-sm font-black text-white flex items-center gap-1"><Skull size={10} className="text-red-500"/> {dungeonLevel <= 5 ? 5 : dungeonLevel <= 20 ? 15 : 25}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Botín</span>
                                <span className="text-sm font-black text-white flex items-center gap-1"><Diamond size={10} className="text-cyan-400"/> {(50 * (dungeonLevel <= 5 ? 5 : 20)) + (10 * dungeonLevel)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => { startDungeon(); }}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border border-purple-400 relative z-10 group overflow-hidden"
                        >
                            <span className="relative z-10">ENTRAR</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </Modal>
            )}

            {/* ACHIEVEMENTS - WITH GLOBAL PROGRESS BAR HEADER & TROPHY ICONS */}
            {view === 'achievements' && (
                <Modal title="Sala de Trofeos" icon={Trophy} onClose={() => setView('game')}>
                    <div className="flex flex-col gap-6">
                        {/* GLOBAL PROGRESS HEADER */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-wide">Progreso Global</h3>
                                    <div className="flex gap-3 mt-2">
                                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                                            <Trophy size={12} className="text-orange-600 fill-orange-600/20"/>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {achieved.filter(id => ACHIEVEMENTS_LOGIC.find(a => a.id === id)?.tier === 'bronze').length} / {ACHIEVEMENTS_LOGIC.filter(a => a.tier === 'bronze').length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                                            <Trophy size={12} className="text-slate-400 fill-slate-400/20"/>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {achieved.filter(id => ACHIEVEMENTS_LOGIC.find(a => a.id === id)?.tier === 'silver').length} / {ACHIEVEMENTS_LOGIC.filter(a => a.tier === 'silver').length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                                            <Trophy size={12} className="text-yellow-400 fill-yellow-400/20"/>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {achieved.filter(id => ACHIEVEMENTS_LOGIC.find(a => a.id === id)?.tier === 'gold').length} / {ACHIEVEMENTS_LOGIC.filter(a => a.tier === 'gold').length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                                            <Trophy size={12} className="text-purple-400 fill-purple-400/20"/>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {achieved.filter(id => ACHIEVEMENTS_LOGIC.find(a => a.id === id)?.tier === 'platinum').length} / {ACHIEVEMENTS_LOGIC.filter(a => a.tier === 'platinum').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-3xl font-black text-white">
                                    {((achieved.length / ACHIEVEMENTS_LOGIC.length) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                                <div 
                                    className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(250,204,21,0.5)]" 
                                    style={{width: `${(achieved.length / ACHIEVEMENTS_LOGIC.length) * 100}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* ACHIEVEMENT GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ACHIEVEMENTS_LOGIC.map(ach => {
                                const isUnlocked = achieved.includes(ach.id);
                                // Fake progress calculation for display if not unlocked
                                const currentStatsForProg: GameStats = { 
                                    fish, gems, totalFish, clicks, kills, day, inventory, rebirths, bestiary, level, activePotions, enhancements, unlockedWorlds,
                                    trainingLevels, skillsOwned, dungeonLevel, classIdx
                                };
                                const prog = ach.progress(currentStatsForProg);
                                const percent = Math.min(100, (prog.current / prog.target) * 100);

                                let borderClass = 'border-slate-800';
                                let bgClass = 'bg-slate-900';
                                let iconColor = 'text-slate-600';
                                let barColor = 'bg-slate-600';
                                let typeColor = 'text-slate-500';
                                
                                if (ach.tier === 'bronze') { borderClass = isUnlocked ? 'border-orange-700/50' : 'border-slate-800'; iconColor = 'text-orange-500'; barColor = 'bg-orange-600'; typeColor = 'text-orange-400'; }
                                if (ach.tier === 'silver') { borderClass = isUnlocked ? 'border-slate-400/50' : 'border-slate-800'; iconColor = 'text-slate-300'; barColor = 'bg-slate-400'; typeColor = 'text-slate-300'; }
                                if (ach.tier === 'gold') { borderClass = isUnlocked ? 'border-yellow-500/50' : 'border-slate-800'; iconColor = 'text-yellow-400'; barColor = 'bg-yellow-500'; typeColor = 'text-yellow-400'; }
                                if (ach.tier === 'platinum') { borderClass = isUnlocked ? 'border-purple-500/50' : 'border-slate-800'; iconColor = 'text-purple-400'; barColor = 'bg-purple-500'; typeColor = 'text-purple-400'; }

                                if (isUnlocked) bgClass = 'bg-slate-800 shadow-md';

                                return (
                                    <div key={ach.id} className={`flex flex-col p-4 rounded-xl border ${borderClass} ${bgClass} transition-all relative overflow-hidden group`}>
                                        {isUnlocked && <div className={`absolute inset-0 opacity-5 ${iconColor.replace('text-','bg-')}`}></div>}
                                        
                                        <div className="flex items-start gap-4 mb-3 relative z-10">
                                            <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 ${isUnlocked ? `${borderClass} ${iconColor} bg-slate-900` : 'border-slate-800 text-slate-700 bg-slate-950'}`}>
                                                <Trophy size={24} className={isUnlocked ? 'drop-shadow-md' : ''}/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`font-bold text-sm uppercase tracking-wide ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{ach.name}</h4>
                                                    {isUnlocked && <span className="px-2 py-0.5 rounded bg-green-900/30 border border-green-800 text-[10px] font-black uppercase text-green-400 flex items-center gap-1"><Check size={10}/> Completado</span>}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 leading-snug">{ach.description}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar Area - RESTORED AND VISIBLE */}
                                        <div className="relative z-10 mt-auto">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${typeColor}`}>Trofeo {ach.tier}</span>
                                                <span className={`text-[10px] font-mono font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                                    {formatNumber(prog.current)} / {formatNumber(prog.target)}
                                                </span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                                                <div className={`h-full transition-all duration-500 ease-out ${isUnlocked ? barColor : 'bg-slate-700'}`} style={{width: `${percent}%`}}></div>
                                            </div>
                                            
                                            {ach.reward.gems > 0 && (
                                                <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-end">
                                                    <span className={`text-xs font-bold font-mono flex items-center gap-1.5 ${isUnlocked ? 'text-cyan-400' : 'text-slate-600'}`}>
                                                        +{ach.reward.gems} <Diamond size={12}/>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
}