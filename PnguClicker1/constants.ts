
import { AlchemyItem, Achievement, GameItem, PlayerClass, World, Mutation, Training, Skill } from "./types";
import { Swords, Shield, Zap, Star, Gavel, ShieldCheck } from 'lucide-react';

export const BASE_REBIRTH_COST = 10000000; // 10 Millones

export interface Fisherman {
    id: string;
    name: string;
    cost: number;
    production: number; // Fish per second
    icon: string;
}

export const FISHERMEN: Fisherman[] = [
    { id: 'f1', name: 'Pingüino Novato', cost: 5, production: 5, icon: '🎣' },
    { id: 'f2', name: 'Pescador con Red', cost: 25, production: 25, icon: '🥅' },
    { id: 'f3', name: 'Barco Pesquero', cost: 100, production: 150, icon: '🛶' },
    { id: 'f4', name: 'Arponero Real', cost: 500, production: 800, icon: '🔱' },
    { id: 'f5', name: 'Submarino Táctico', cost: 2000, production: 5000, icon: '🚤' },
    { id: 'f6', name: 'Plataforma Petrolera', cost: 10000, production: 30000, icon: '🏗️' },
    { id: 'f7', name: 'Dron Acuático', cost: 50000, production: 150000, icon: '🤖' },
    { id: 'f8', name: 'Base Submarina', cost: 200000, production: 800000, icon: '🏢' },
    { id: 'f9', name: 'Leviatán Domestico', cost: 1000000, production: 5000000, icon: '🐋' },
    { id: 'f10', name: 'Cosechadora de Océanos', cost: 5000000, production: 40000000, icon: '🛸' },
];

export const WORLDS: World[] = [
    { 
        id: 0, name: "Tundra Helada", bgGradient: "from-slate-900 to-cyan-900", enemyStyle: "from-cyan-100 to-cyan-500", powerReq: 0,
        enemies: [
            { id: 'e1', name: "Slime de Hielo", sprite: "🧊", baseHp: 100, baseAtk: 40, description: "Un bloque de hielo con malas intenciones.", lore: "Estas criaturas son subproductos de la magia antigua congelada. Se deslizan silenciosamente y absorben el calor de sus víctimas." },
            { id: 'e2', name: "Lobo Ártico", sprite: "🐺", baseHp: 500, baseAtk: 40, description: "Cazador veloz de las nieves.", lore: "Sus aullidos pueden congelar la sangre. Cazan en manada, pero los solitarios son los más peligrosos, expulsados por su brutalidad." },
            { id: 'e3', name: "Oso Polar", sprite: "🐻‍❄️", baseHp: 2000, baseAtk: 60, description: "El rey de la fuerza bruta en el hielo.", lore: "Un titán de músculo y furia. Las leyendas dicen que un solo golpe de su garra puede partir un iceberg en dos." },
            { id: 'e4', name: "Yeti", sprite: "🦍", baseHp: 8000, baseAtk: 60, description: "Leyenda abominable de las montañas.", lore: "Pocos han visto uno y vivido para contarlo. Se dice que protegen templos antiguos enterrados bajo la nieve eterna." },
            { id: 'mb1', name: "Leviatán Joven", sprite: "🐋", baseHp: 25000, baseAtk: 150, description: "Una bestia legendaria de las profundidades.", lore: "Aunque joven, su piel es dura como el diamante. Sube a la superficie para alimentarse de barcos pesqueros enteros.", isMiniBoss: true },
            { id: 'boss1', name: "Emperador Gélido", sprite: "👑🐧", baseHp: 50000, baseAtk: 250, description: "El regente supremo de la Antártida.", lore: "Un pingüino corrompido por el poder absoluto. Lleva una corona forjada con hielo negro y gobierna con puño de escarcha.", isBoss: true },
        ] 
    },
    { 
        id: 1, name: "Bosque Encantado", bgGradient: "from-green-950 to-emerald-900", enemyStyle: "from-green-100 to-emerald-500", powerReq: 5000000, 
        enemies: [
            { id: 'e_f1', name: "Duende Verde", sprite: "👺", baseHp: 15000, baseAtk: 500, description: "Pequeño pero letal.", lore: "Ladrones de gemas y tramposos por naturaleza. Su risa es lo último que escuchan los viajeros perdidos." },
            { id: 'e_f2', name: "Ent Ancestral", sprite: "🌳", baseHp: 45000, baseAtk: 800, description: "Un árbol con mal humor.", lore: "Guardianes milenarios. Despertaron cuando la corrupción empezó a filtrarse en las raíces del mundo." },
            { id: 'e_f3', name: "Lobo Místico", sprite: "🐕", baseHp: 80000, baseAtk: 1200, description: "Brilla con energía mágica.", lore: "No es carne y hueso, sino maná condensado en forma de bestia. Sus mordiscos drenan el alma." },
            { id: 'e_f4', name: "Hada Oscura", sprite: "🧚‍♀️", baseHp: 120000, baseAtk: 2000, description: "Su polvo no es para volar.", lore: "Antiguas protectoras que cayeron en la locura. Ahora usan su magia para confundir y destruir." },
            { id: 'mb2_1', name: "Basilisco de Musgo", sprite: "🦎", baseHp: 300000, baseAtk: 3000, description: "Su mirada petrifica.", lore: "Camuflado entre la vegetación, convierte a los aventureros en estatuas de jardín para decorar su nido.", isMiniBoss: true },
            { id: 'mb2_2', name: "Ogro Mágico", sprite: "👹", baseHp: 550000, baseAtk: 4000, description: "Fuerza bruta y hechizos torpes.", lore: "Intentó aprender magia, pero solo logró encantar sus puños para que golpeen más fuerte.", isMiniBoss: true },
            { id: 'boss2', name: "Rey Espíritu", sprite: "🦌", baseHp: 1000000, baseAtk: 5000, description: "El guardián del bosque prohibido.", lore: "La manifestación física de la voluntad del bosque. Su cornamenta toca el cielo y sus pisadas hacen temblar la tierra.", isBoss: true },
        ] 
    },
    { 
        id: 2, name: "Electroduna", bgGradient: "from-yellow-950 to-orange-900", enemyStyle: "from-yellow-100 to-orange-500", powerReq: 100000000, 
        enemies: [
            { id: 'e_l1', name: "Chispa Viviente", sprite: "⚡", baseHp: 500000, baseAtk: 8000, description: "Pura energía inestable.", lore: "Fragmentos de rayos que cobraron consciencia. Se mueven a la velocidad de la luz y queman todo a su paso." },
            { id: 'e_l2', name: "Escorpión Voltaico", sprite: "🦂", baseHp: 1500000, baseAtk: 15000, description: "Su veneno paraliza.", lore: "Habitante de las arenas cargadas de estática. Su aguijón descarga millones de voltios." },
            { id: 'e_l3', name: "Anguila Aérea", sprite: "🐍", baseHp: 3000000, baseAtk: 25000, description: "Nada por el aire cargado de estática.", lore: "Depredadores que nadan en las corrientes de aire. Caen en picado sobre sus presas como un rayo." },
            { id: 'e_l4', name: "Golem de Trueno", sprite: "🤖", baseHp: 8000000, baseAtk: 40000, description: "Metal y electricidad.", lore: "Autómatas de una civilización perdida, impulsados por núcleos de tormenta perpetua." },
            { id: 'mb3_1', name: "Dron Centinela", sprite: "🛸", baseHp: 15000000, baseAtk: 60000, description: "Tecnología antigua hostil.", lore: "Vigila las dunas eternamente. Su láser principal puede vitrificar la arena instantáneamente.", isMiniBoss: true },
            { id: 'mb3_2', name: "Djinn de Plasma", sprite: "🧞", baseHp: 25000000, baseAtk: 80000, description: "Deseos mortales.", lore: "Un espíritu hecho de gas ionizado. Te concederá tres deseos, y los tres serán ser electrocutado.", isMiniBoss: true },
            { id: 'boss3', name: "Titán de Tormenta", sprite: "🌩️", baseHp: 50000000, baseAtk: 100000, description: "La encarnación del rayo.", lore: "Una deidad menor del clima. Su sola presencia ioniza el aire y convoca huracanes.", isBoss: true },
        ] 
    },
    {
        id: 3, name: "Valle Sombrío", bgGradient: "from-gray-950 to-black", enemyStyle: "from-purple-900 to-black", powerReq: 1000000000000,
        enemies: [
            { id: 'e_s1', name: "Espectro Errante", sprite: "👻", baseHp: 200000000, baseAtk: 200000, description: "Un alma en pena.", lore: "Restos de antiguos aventureros que sucumbieron a la oscuridad. Ahora buscan arrastrar a otros a su destino." },
            { id: 'e_s2', name: "Gárgola de Obsidiana", sprite: "🦇", baseHp: 500000000, baseAtk: 350000, description: "Piedra viva con alas.", lore: "Estatuas que cobran vida cuando no se las mira. Su piel es casi impenetrable." },
            { id: 'e_s3', name: "Caballero del Vacío", sprite: "🧛", baseHp: 1000000000, baseAtk: 600000, description: "Armadura vacía movida por magia negra.", lore: "Antiguos paladines corrompidos. Su espada corta no solo la carne, sino también la esperanza." },
            { id: 'e_s4', name: "Dragón de Hueso", sprite: "🦴", baseHp: 5000000000, baseAtk: 1000000, description: "No muerto y furioso.", lore: "Un dragón alzado de su tumba. Su aliento es una niebla necrótica que pudre todo lo que toca." },
            { id: 'mb4_1', name: "La Parca", sprite: "💀", baseHp: 15000000000, baseAtk: 2500000, description: "El cobrador de almas.", lore: "Patrulla el valle buscando aquellos cuyo tiempo ha terminado. Nadie escapa de su guadaña.", isMiniBoss: true },
            { id: 'boss4', name: "Avatar de Oscuridad", sprite: "🌑", baseHp: 50000000000, baseAtk: 5000000, description: "La ausencia total de luz.", lore: "Una entidad primordial anterior a las estrellas. Su objetivo es devolver el universo al silencio eterno.", isBoss: true },
        ]
    }
];

export const ENEMIES = WORLDS[0].enemies;

// --- DECORACIONES (REBALANCEDA: Curva de dificultad agresiva para Mid/High) ---
export const DECORATIONS: GameItem[] = [
    // SUELO (Early)
    { id: 'd01', name: 'Foco de Luz', baseCost: 75, val: 1, icon: '💡', type: 'deco', description: '+1 Clic', style: { top: '60%', left: '20%', fontSize: '1.5rem', zIndex: 9 } },
    { id: 'd02', name: 'Bola de Nieve', baseCost: 450, val: 2, icon: '⚪', type: 'deco', description: '+2 Clic', style: { top: '65%', left: '75%', fontSize: '1rem', zIndex: 11 } },
    { id: 'd03', name: 'Calcetín Perdido', baseCost: 1500, val: 4, icon: '🧤', type: 'deco', description: '+4 Clic', style: { top: '62%', left: '60%', fontSize: '1.5rem', transform: 'rotate(45deg)', zIndex: 9 } },
    { id: 'd04', name: 'Pez Congelado', baseCost: 4500, val: 8, icon: '🐟', type: 'deco', description: '+8 Clic', style: { top: '64%', left: '30%', fontSize: '1.5rem', zIndex: 11 } },
    { id: 'd05', name: 'Taza de Café', baseCost: 13500, val: 12, icon: '☕', type: 'deco', description: '+12 Clic', style: { top: '58%', left: '25%', fontSize: '2rem', zIndex: 9 } },
    { id: 'd06', name: 'Helecho de Nieve', baseCost: 35000, val: 25, icon: '🌿', type: 'deco', description: '+25 Clic', style: { top: '56%', left: '80%', fontSize: '2rem', zIndex: 11 } },
    
    // MID GAME GAPS STARTS HERE
    { id: 'd07', name: 'Seta Luminosa', baseCost: 120000, val: 40, icon: '🍄', type: 'deco', description: '+40 Clic', style: { top: '61%', left: '15%', fontSize: '1.5rem', zIndex: 11 } }, // Gap up from 90k
    { id: 'd08', name: 'Cristal Azul', baseCost: 450000, val: 65, icon: '💎', type: 'deco', description: '+65 Clic', style: { top: '59%', left: '85%', fontSize: '1.5rem', opacity: 0.8, zIndex: 9 } }, // Gap up from 250k
    { id: 'd09', name: 'Flor de Hielo', baseCost: 1200000, val: 90, icon: '🌻', type: 'deco', description: '+90 Clic', style: { top: '57%', left: '10%', fontSize: '2.5rem', zIndex: 8 } }, // Gap up from 600k
    { id: 'd10', name: 'Tronco Hueco', baseCost: 5000000, val: 250, icon: '🪵', type: 'deco', description: '+250 Clic', style: { top: '65%', left: '70%', fontSize: '2.5rem', zIndex: 12 } }, // BIG GAP: 1.5M -> 5M
    
    // MEDIUM-HIGH (HUGE GAPS)
    { id: 'd11', name: 'Alfombra Polar', baseCost: 25000000, val: 600, icon: '🟦', type: 'deco', description: '+600 Clic', style: { top: '68%', left: '50%', fontSize: '3rem', zIndex: 5, transform: 'translateX(-50%) rotate(-5deg) scaleY(0.5)', opacity: 0.6 } }, // 8.5M -> 25M
    { id: 'd12', name: 'Lámpara de Lava', baseCost: 85000000, val: 1200, icon: '🏮', type: 'deco', description: '+1.2K Clic', style: { top: '55%', left: '88%', fontSize: '2rem', zIndex: 9 } }, // 45M -> 85M
    { id: 'd13', name: 'Caja Fuerte', baseCost: 400000000, val: 2500, icon: '🔒', type: 'deco', description: '+2.5K Clic', style: { top: '60%', left: '35%', fontSize: '2.5rem', zIndex: 11 } }, // 250M -> 400M
    { id: 'd14', name: 'Trono Helado', baseCost: 2500000000, val: 6000, icon: '🪑', type: 'deco', description: '+6K Clic', style: { top: '50%', left: '50%', fontSize: '3rem', zIndex: 6, transform: 'translateX(-50%)' } }, // 900M -> 2.5B (Massive Gap)
    { id: 'd15', name: 'Estatua Pingüino', baseCost: 15000000000, val: 15000, icon: '🗿', type: 'deco', description: '+15K Clic', style: { top: '52%', left: '85%', fontSize: '3rem', zIndex: 6 } }, // 3B -> 15B
    
    // HIGH (Billions/Trillions) - GOD GAP
    { id: 'd16', name: 'Estalactita', baseCost: 60000000000, val: 35000, icon: '🔻', type: 'deco', description: '+35K Clic', style: { top: '15%', left: '45%', fontSize: '2.5rem', zIndex: 40 } }, // 15B -> 60B
    { id: 'd17', name: 'Fogata Eterna', baseCost: 300000000000, val: 80000, icon: '🔥', type: 'deco', description: '+80K Clic', style: { top: '65%', left: '45%', fontSize: '2rem', zIndex: 12, animation: 'pulse 2s infinite' } }, // 85B -> 300B
    { id: 'd18', name: 'Fantasma Amigable', baseCost: 1500000000000, val: 200000, icon: '👻', type: 'deco', description: '+200K Clic', style: { top: '35%', left: '35%', fontSize: '2.5rem', opacity: 0.5, animation: 'float 3s infinite' } }, // 350B -> 1.5T
    { id: 'd19', name: 'Portal Oscuro', baseCost: 8000000000000, val: 500000, icon: '🌀', type: 'deco', description: '+500K Clic', style: { top: '40%', left: '75%', fontSize: '3rem', zIndex: 5 } }, // 1T -> 8T
    
    // ULTRA (Quadrillions+) - END GAME
    { id: 'd20', name: 'Satélite Pingüino', baseCost: 50000000000000, val: 1500000, icon: '🛰️', type: 'deco', description: '+1.5M Clic', style: { top: '10%', left: '20%', fontSize: '2rem', zIndex: 5, animation: 'float 5s infinite' } },
    { id: 'd21', name: 'Ovni Visitante', baseCost: 350000000000000, val: 5000000, icon: '🛸', type: 'deco', description: '+5M Clic', style: { top: '15%', left: '80%', fontSize: '2.5rem', zIndex: 5, animation: 'sway 4s infinite' } },
    { id: 'd22', name: 'Planeta Helado', baseCost: 2500000000000000, val: 15000000, icon: '🪐', type: 'deco', description: '+15M Clic', style: { top: '8%', left: '10%', fontSize: '4rem', zIndex: 2, opacity: 0.6 } },
    { id: 'd23', name: 'Sol Artificial', baseCost: 20000000000000000, val: 60000000, icon: '☀️', type: 'deco', description: '+60M Clic', style: { top: '5%', left: '85%', fontSize: '5rem', zIndex: 1, opacity: 0.7, filter: 'blur(4px)', animation: 'pulse 10s infinite' } },
    { id: 'd24', name: 'Agujero Negro', baseCost: 150000000000000000, val: 200000000, icon: '⚫', type: 'deco', description: '+200M Clic', style: { top: '12%', left: '50%', fontSize: '5rem', zIndex: 1, animation: 'spin 20s linear infinite' } },
    
    // GOD TIER (Absurdo)
    { id: 'd25', name: 'Dios Pingüino', baseCost: 1000000000000000000, val: 1000000000, icon: '👑', type: 'deco', description: '+1B Clic', style: { top: '20%', left: '50%', fontSize: '6rem', zIndex: 4, opacity: 0.3, transform: 'translateX(-50%)', animation: 'float 6s infinite' } },
    { id: 'd26', name: 'Estrella de Neutrones', baseCost: 10000000000000000000, val: 5000000000, icon: '🌟', type: 'deco', description: '+5B Clic', style: { top: '5%', left: '30%', fontSize: '3rem', zIndex: 2, animation: 'pulse 0.5s infinite' } },
    { id: 'd27', name: 'Nebulosa Púrpura', baseCost: 99999999999999999999, val: 25000000000, icon: '🌌', type: 'deco', description: '+25B Clic', style: { top: '2%', left: '60%', fontSize: '8rem', zIndex: 0, opacity: 0.4 } },
];

export const WEAPONS: GameItem[] = [
    { id: 'w01', name: 'Palo Afilado', baseCost: 200, type: 'weapon', val: 5, icon: '🥢', description: '+5 ATK' },
    { id: 'w02', name: 'Daga de Obsidiana', baseCost: 1200, type: 'weapon', val: 25, icon: '🗡️', description: '+25 ATK' },
    { id: 'w03', name: 'Martillo de Guerra', baseCost: 15000, type: 'weapon', val: 90, icon: '🔨', description: '+90 ATK' },
    { id: 'w04', name: 'Hacha Vikinga', baseCost: 85000, type: 'weapon', val: 250, icon: '🪓', description: '+250 ATK' },
    { id: 'w05', name: 'Espada de Hielo', baseCost: 350000, type: 'weapon', val: 600, icon: '❄️', description: '+600 ATK' },
    { id: 'w06', name: 'Tridente Poseidón', baseCost: 1500000, type: 'weapon', val: 1800, icon: '🔱', description: '+1.8K ATK' },
    { id: 'w07', name: 'Excalibur', baseCost: 6000000, type: 'weapon', val: 5000, icon: '⚔️', description: '+5K ATK' },
    { id: 'w08', name: 'Guantelete Infinito', baseCost: 25000000, type: 'weapon', val: 15000, icon: '🥊', description: '+15K ATK' },
    { id: 'w09', name: 'Bastón Cósmico', baseCost: 100000000, type: 'weapon', val: 50000, icon: '🪄', description: '+50K ATK' },
    { id: 'w10', name: 'Destructor de Mundos', baseCost: 500000000, type: 'weapon', val: 200000, icon: '☄️', description: '+200K ATK' },
    { id: 'w11', name: 'Guadaña del Segador', baseCost: 2500000000, type: 'weapon', val: 800000, icon: '💀', description: '+800K ATK' },
    { id: 'w12', name: 'Arco de la Verdad', baseCost: 15000000000, type: 'weapon', val: 3000000, icon: '🏹', description: '+3M ATK' },
    { id: 'w13', name: 'Filo del Infinito', baseCost: 80000000000, type: 'weapon', val: 12000000, icon: '🗡️', description: '+12M ATK' },
    { id: 'w14', name: 'Sable de Luz', baseCost: 500000000000, type: 'weapon', val: 50000000, icon: '🔦', description: '+50M ATK' },
    { id: 'w15', name: 'Mjolnir', baseCost: 3000000000000, type: 'weapon', val: 250000000, icon: '⚡', description: '+250M ATK' },
    { id: 'w16', name: 'Espada de Antimateria', baseCost: 20000000000000, type: 'weapon', val: 1000000000, icon: '⚛️', description: '+1B ATK' },
    { id: 'w17', name: 'Devoradora de Soles', baseCost: 100000000000000, type: 'weapon', val: 5000000000, icon: '🌞', description: '+5B ATK' },
    { id: 'w18', name: 'El Fin', baseCost: 999999999999999, type: 'weapon', val: 99999999999, icon: '❌', description: '+100B ATK' },
];

// --- ARMOR REBALANCING ---
export const ARMOR: GameItem[] = [
    { id: 'a01', name: 'Bufanda de Lana', baseCost: 150, type: 'armor', val: 2, icon: '🧣', description: '+2 DEF' },
    { id: 'a02', name: 'Chaleco Salvavidas', baseCost: 800, type: 'armor', val: 10, icon: '🦺', description: '+10 DEF' },
    { id: 'a03', name: 'Caparazón Tortuga', baseCost: 4000, type: 'armor', val: 35, icon: '🐢', description: '+35 DEF' },
    { id: 'a04', name: 'Escudo Antidisturbios', baseCost: 20000, type: 'armor', val: 100, icon: '🛡️', description: '+100 DEF' },
    { id: 'a05', name: 'Armadura Robótica', baseCost: 100000, type: 'armor', val: 350, icon: '🤖', description: '+350 DEF' },
    { id: 'a06', name: 'Piel de Dragón', baseCost: 500000, type: 'armor', val: 1000, icon: '🐉', description: '+1K DEF' },
    { id: 'a07', name: 'Campo de Fuerza', baseCost: 2500000, type: 'armor', val: 3000, icon: '🔮', description: '+3K DEF' },
    { id: 'a08', name: 'Aura Divina', baseCost: 12000000, type: 'armor', val: 10000, icon: '✨', description: '+10K DEF' },
    { id: 'a09', name: 'Materia Oscura', baseCost: 60000000, type: 'armor', val: 35000, icon: '🌑', description: '+35K DEF' },
    { id: 'a10', name: 'Singularidad', baseCost: 300000000, type: 'armor', val: 120000, icon: '⚛️', description: '+120K DEF' },
    { id: 'a11', name: 'Manto Estelar', baseCost: 1500000000, type: 'armor', val: 500000, icon: '✨', description: '+500K DEF' },
    { id: 'a12', name: 'Armadura de Vacío', baseCost: 8000000000, type: 'armor', val: 2000000, icon: '⚫', description: '+2M DEF' },
    { id: 'a13', name: 'Egida del Tiempo', baseCost: 50000000000, type: 'armor', val: 10000000, icon: '⌛', description: '+10M DEF' },
    { id: 'a14', name: 'Piel de Titanio', baseCost: 300000000000, type: 'armor', val: 50000000, icon: '🛡️', description: '+50M DEF' },
    { id: 'a15', name: 'Barrera Dimensional', baseCost: 2000000000000, type: 'armor', val: 250000000, icon: '🚪', description: '+250M DEF' },
    { id: 'a16', name: 'Invulnerabilidad', baseCost: 15000000000000, type: 'armor', val: 1000000000, icon: '🛑', description: '+1B DEF' },
];

export const MUTATIONS: (Mutation & {tier: number})[] = [
    { id: 'shiny', name: 'Shiny', prefix: '✨', chance: 0.1, mult: 1.2, color: 'text-yellow-300', description: 'Una variante que emite una luz dorada. Sus células son más densas.', tier: 1 },
    { id: 'candy', name: 'Candy', prefix: '🍬', chance: 0.04, mult: 1.5, color: 'text-pink-400', description: 'Mutación dulce. Su sangre es jarabe de alta viscosidad.', tier: 2 },
    { id: 'robot', name: 'Robot', prefix: '🤖', chance: 0.02, mult: 2.0, color: 'text-gray-400', description: 'Cibernética asimilada. Posee placas de metal orgánico.', tier: 3 },
    { id: 'moon', name: 'Moonborn', prefix: '🌕', chance: 0.01, mult: 3.0, color: 'text-indigo-300', description: 'Nacido bajo un eclipse. Sus ojos reflejan el vacío del espacio.', tier: 4 },
    { id: 'demon', name: 'Demonborn', prefix: '😈', chance: 0.004, mult: 5.0, color: 'text-red-600', description: 'Poseído por una entidad del inframundo. Pura maldad concentrada.', tier: 5 }
];

export const CLASSES: PlayerClass[] = [
    { name: "Novato", multiplier: 1, color: "#94a3b8", tier: 1, probability: "40%" },
    { name: "Superviviente", multiplier: 1.5, color: "#22d3ee", tier: 1, probability: "25%" },
    { name: "Guerrero", multiplier: 3.0, color: "#3b82f6", tier: 2, probability: "20%" },
    { name: "Hechicero", multiplier: 6.0, color: "#a855f7", tier: 3, probability: "10%" },
    { name: "Leyenda", multiplier: 15.0, color: "#fbbf24", tier: 4, probability: "4%" },
    { name: "Deidad", multiplier: 50.0, color: "#ef4444", tier: 5, probability: "0.9%" },
    { name: "Primigenio", multiplier: 200.0, color: "#FFFFFF", tier: 6, probability: "0.1%" }, // CHANGED TO WHITE FOR READABILITY
];

export const ALCHEMY: AlchemyItem[] = [
    { id: 'totem_life', name: 'Tótem de Vida', cost: 1000, effect: 'maxHp', val: 100, duration: -1, icon: '🗿', description: 'Aumenta Max HP (Escala con Mundo)' },
    { id: 'pot_heal_small', name: 'Poción de Curación', cost: 500, effect: 'hp', val: 100, duration: -1, icon: '🍷', description: 'Recupera 100 HP al instante.' },
    { id: 'pot_luck_1', name: 'Suerte Líquida', cost: 2000, effect: 'luck', val: 25, duration: 60, icon: '🍀', description: '+25% Suerte (Escala con Mundo).' },
    { id: 'pot_dmg_1', name: 'Furia de Pingüino', cost: 3500, effect: 'atk', val: 100, duration: 60, icon: '💢', description: '+100% Daño de Ataque (Escala con Mundo).' },
    { id: 'pot_def_1', name: 'Piel de Hierro', cost: 2500, effect: 'def', val: 20, duration: 60, icon: '🛡️', description: '+20% Defensa Total (Escala con Mundo).' },
    { id: 'pot_xp_1', name: 'Elixir de Sabiduría', cost: 7500, effect: 'xp', val: 150, duration: 60, icon: '🧠', description: '+150% Experiencia (Escala con Mundo).' },
];

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'click_1', name: 'Calentando', desc: '500 Clicks', goal: 500, type: 'clicks', reward: 1000 },
    { id: 'kill_1', name: 'Cazador', desc: '10 Enemigos', goal: 10, type: 'kills', reward: 2500 },
    { id: 'rich_1', name: 'Ahorrador', desc: '10K Peces gastados', goal: 10000, type: 'moneySpent', reward: 5000 },
    { id: 'rebirth_1', name: 'Eterno', desc: '1 Renacimiento', goal: 1, type: 'rebirths', reward: 25000 },
    { id: 'lvl_10', name: 'Aprendiz', desc: 'Alcanza el nivel 10', goal: 10, type: 'level', reward: 5000 },
    { id: 'lvl_25', name: 'Experto', desc: 'Alcanza el nivel 25', goal: 25, type: 'level', reward: 15000 },
    { id: 'lvl_50', name: 'Maestro', desc: 'Alcanza el nivel 50', goal: 50, type: 'level', reward: 50000 },
    { id: 'lvl_100', name: 'Gran Maestro', desc: 'Alcanza el nivel 100', goal: 100, type: 'level', reward: 100000 },
    { id: 'lvl_500', name: 'Semidiós', desc: 'Alcanza el nivel 500', goal: 500, type: 'level', reward: 1000000 },
    { id: 'lvl_1000', name: 'Ascendido', desc: 'Alcanza el nivel 1000', goal: 1000, type: 'level', reward: 10000000 },
];

export const TRAININGS: Training[] = [
    { 
        id: 'strength', name: 'Fuerza Bruta', description: '+5% Prob. Crítica y +5% Daño Total',
        baseCostFish: 5000, baseCostGems: 10, reqRebirth: 0, icon: Swords, color: 'text-red-400'
    },
    { 
        id: 'endurance', name: 'Resistencia', description: '+5% Defensa Total y +2% Suerte',
        baseCostFish: 5000, baseCostGems: 10, reqRebirth: 0, icon: Shield, color: 'text-blue-400'
    },
    { 
        id: 'power', name: 'Poder Arcano', description: '+5% Multiplicador de Habilidad (Clase)',
        baseCostFish: 50000, baseCostGems: 50, reqRebirth: 3, icon: Zap, color: 'text-purple-400'
    },
    { 
        id: 'perfect', name: 'Perfección', description: '+1.1% A TODAS LAS ESTADÍSTICAS',
        baseCostFish: 1000000, baseCostGems: 200, reqRebirth: 5, icon: Star, color: 'text-yellow-400'
    },
];

export const SKILLS: Skill[] = [
    {
        id: 'smite', name: 'Castigo Divino', description: 'Golpea al enemigo quitando 25% de su vida actual (No afecta a Jefes).',
        costGems: 500, cooldown: 8, keybind: 'Q', icon: Gavel, color: 'text-yellow-200'
    },
    {
        id: 'block', name: 'Guardia Absoluta', description: 'Bloquea el 50% del daño recibido + Tu defensa durante 1.5s.',
        costGems: 300, cooldown: 12, keybind: 'W', icon: ShieldCheck, color: 'text-blue-200'
    }
];

export function formatNumber(num: number): string {
    if (num < 1000) return Math.floor(num).toString();
    const suffixes = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "Dc"];
    const magnitude = Math.floor(Math.log10(num) / 3);
    const index = Math.min(magnitude, suffixes.length - 1);
    const shortValue = num / Math.pow(10, index * 3);
    return shortValue.toFixed(2).replace(/\.00$/, '') + suffixes[index];
}
