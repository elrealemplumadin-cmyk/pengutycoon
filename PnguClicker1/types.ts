import React, { useState } from 'react';

export type ItemType = 'deco' | 'weapon' | 'armor' | 'potion' | 'permanent';
export type EffectType = 'luck' | 'def' | 'atk' | 'hp' | 'maxHp' | 'xp';

export interface GameItem {
    id: string;
    name: string;
    baseCost: number;
    val: number; // Click Power for Deco/Weapon, Defense for Armor
    icon: string;
    type: ItemType;
    style?: React.CSSProperties;
    description?: string;
}

export interface AlchemyItem {
    id: string;
    name: string;
    cost: number;
    effect: EffectType;
    val: number; // Porcentaje (ej: 25 para 25%) o Valor plano
    duration: number; // Duración en segundos (-1 para permanente/instantáneo)
    icon: string;
    description: string;
}

export interface Enemy {
    id: string;
    name: string;
    sprite: string;
    baseHp: number;
    baseAtk: number;
    description: string;
    lore: string; // Nuevo campo de historia
    isBoss?: boolean;
    isMiniBoss?: boolean; // Nuevo: Para diferenciar mini jefes
}

export interface Mutation {
    id: string;
    name: string;
    prefix: string;
    chance: number;
    mult: number;
    color: string;
    description: string; // Descripción científica para el bestiario
}

export interface World {
    id: number;
    name: string;
    bgGradient: string;
    enemyStyle: string;
    enemies: Enemy[];
    powerReq: number; // Nuevo: Requerimiento de poder para desbloquear
}

export interface PlayerClass {
    name: string;
    multiplier: number;
    color: string;
    tier: number;
    probability: string; // Visual display for UI
}

export interface Achievement {
    id: string;
    name: string;
    desc: string;
    goal: number;
    type: 'clicks' | 'kills' | 'moneySpent' | 'dungeon' | 'rebirths' | 'level';
    reward: number;
}

export interface ResearchStatus {
    status: 'unknown' | 'researching' | 'ready' | 'completed';
    endTime: number; // Timestamp cuando termina
}

export interface BestiaryEntry {
    kills: number;
    maxLv: number;
    claimed: boolean;
    unlockedMutations: string[];
    claimedMutationRewards: string[]; // Fixed missing property
    mutationResearch: Record<string, ResearchStatus>; // Map MutationID -> Status
}

// NEW INTERFACES FOR TRAINING & SKILLS
export interface Training {
    id: string;
    name: string;
    description: string;
    baseCostFish: number;
    baseCostGems: number;
    reqRebirth: number;
    icon: any;
    color: string;
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    costGems: number;
    cooldown: number; // seconds
    keybind: string;
    icon: any;
    color: string;
    isPassive?: boolean;
}

export interface GameState {
    fish: number;
    gems: number; // Nueva moneda
    totalFish: number;
    clicks: number;
    kills: number;
    days: number;
    
    // Level System
    level: number;
    xp: number;
    xpToNext: number;

    // Combat Stats
    hp: number;
    maxHp: number; // Now derived, but kept in type if needed for serialization compatibility
    baseAtk: number;
    baseDef: number;
    
    classIdx: number;
    inventory: Record<string, number>;
    activePotions: Record<string, number>; // ID -> Time Remaining
    enhancements: Record<string, number>; // Nuevo: ID Item -> Estrellas (0-10)
    
    // Training & Skills
    trainingLevels: Record<string, number>;
    trainingTimers: Record<string, number>; // ID -> Timestamp end
    skillsOwned: string[];

    dungeonLevel: number;
    rebirths: number;
    
    bestiary: Record<string, BestiaryEntry>;
    achievements: string[];
    
    moneySpent: number;
    startTime: number;
    tutorialSeen: boolean;
}

export const INITIAL_STATE: GameState = {
    fish: 0,
    gems: 0,
    totalFish: 0,
    clicks: 0,
    kills: 0,
    days: 1,
    level: 1,
    xp: 0,
    xpToNext: 100,
    hp: 100,
    maxHp: 100,
    baseAtk: 1,
    baseDef: 0,
    classIdx: 0,
    inventory: {},
    activePotions: {},
    enhancements: {},
    trainingLevels: {},
    trainingTimers: {},
    skillsOwned: [],
    dungeonLevel: 1,
    rebirths: 0,
    bestiary: {},
    achievements: [],
    moneySpent: 0,
    startTime: Date.now(),
    tutorialSeen: false
};