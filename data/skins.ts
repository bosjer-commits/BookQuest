export type Rarity = 'rare' | 'epic' | 'legendary';

export interface SkinDefinition {
  id: string;
  character: string;
  owner: string;
  asset: string;
  rarity: Rarity;
}

export const SKIN_CATALOG: SkinDefinition[] = [
  // Lucas — Rare
  { id: 'lucas-edgar',    character: 'Edgar',    owner: 'Lucas',   asset: '/assets/Skins/Lucas/Rare/Edgar.png',          rarity: 'rare' },
  { id: 'lucas-emz',      character: 'Emz',      owner: 'Lucas',   asset: '/assets/Skins/Lucas/Rare/Emz.png',            rarity: 'rare' },
  { id: 'lucas-kenji',    character: 'Kenji',    owner: 'Lucas',   asset: '/assets/Skins/Lucas/Rare/Kenji.png',          rarity: 'rare' },
  // Lucas — Epic
  { id: 'lucas-broock',   character: 'Broock',   owner: 'Lucas',   asset: '/assets/Skins/Lucas/Epic/Broock.png',         rarity: 'epic' },
  { id: 'lucas-mortis',   character: 'Mortis',   owner: 'Lucas',   asset: '/assets/Skins/Lucas/Epic/Mortis.png',         rarity: 'epic' },
  { id: 'lucas-sam',      character: 'Sam',      owner: 'Lucas',   asset: '/assets/Skins/Lucas/Epic/Sam.png',            rarity: 'epic' },
  // Lucas — Legendary
  { id: 'lucas-glowbert', character: 'Glowbert', owner: 'Lucas',   asset: '/assets/Skins/Lucas/Legendary/Glowbert.png', rarity: 'legendary' },
  { id: 'lucas-spike',    character: 'Spike',    owner: 'Lucas',   asset: '/assets/Skins/Lucas/Legendary/Spike.png',    rarity: 'legendary' },
  { id: 'lucas-surge',    character: 'Surge',    owner: 'Lucas',   asset: '/assets/Skins/Lucas/Legendary/Surge.png',    rarity: 'legendary' },

  // Oliver — Rare
  { id: 'oliver-angelo',  character: 'Angelo',   owner: 'Oliver',  asset: '/assets/Skins/Oliver/Rare/Angelo.png',        rarity: 'rare' },
  { id: 'oliver-crow',    character: 'Crow',     owner: 'Oliver',  asset: '/assets/Skins/Oliver/Rare/Crow.png',          rarity: 'rare' },
  { id: 'oliver-shelly',  character: 'Shelly',   owner: 'Oliver',  asset: '/assets/Skins/Oliver/Rare/Shelly.png',        rarity: 'rare' },
  // Oliver — Epic
  { id: 'oliver-barley',  character: 'Barley',   owner: 'Oliver',  asset: '/assets/Skins/Oliver/Epic/Barley.png',        rarity: 'epic' },
  { id: 'oliver-edgar',   character: 'Edgar',    owner: 'Oliver',  asset: '/assets/Skins/Oliver/Epic/Edgar.png',         rarity: 'epic' },
  { id: 'oliver-leon',    character: 'Leon',     owner: 'Oliver',  asset: '/assets/Skins/Oliver/Epic/Leon.png',          rarity: 'epic' },
  // Oliver — Legendary
  { id: 'oliver-dynamike', character: 'Dynamike', owner: 'Oliver', asset: '/assets/Skins/Oliver/Legendary/Dynamike.png', rarity: 'legendary' },
  { id: 'oliver-elprimo', character: 'ElPrimo',  owner: 'Oliver',  asset: '/assets/Skins/Oliver/Legendary/ElPrimo.png', rarity: 'legendary' },
  { id: 'oliver-spike',   character: 'Spike',    owner: 'Oliver',  asset: '/assets/Skins/Oliver/Legendary/Spike.png',   rarity: 'legendary' },

  // Robin — Rare
  { id: 'robin-bibi',     character: 'Bibi',     owner: 'Robin',   asset: '/assets/Skins/Robin/Rare/Bibi.png',           rarity: 'rare' },
  { id: 'robin-bull',     character: 'Bull',     owner: 'Robin',   asset: '/assets/Skins/Robin/Rare/Bull.png',           rarity: 'rare' },
  { id: 'robin-mandy',    character: 'Mandy',    owner: 'Robin',   asset: '/assets/Skins/Robin/Rare/Mandy.png',          rarity: 'rare' },
  // Robin — Epic
  { id: 'robin-dynamike', character: 'Dynamike', owner: 'Robin',   asset: '/assets/Skins/Robin/Epic/Dynamike.png',       rarity: 'epic' },
  { id: 'robin-edgar',    character: 'Edgar',    owner: 'Robin',   asset: '/assets/Skins/Robin/Epic/Edgar.png',          rarity: 'epic' },
  { id: 'robin-leon',     character: 'Leon',     owner: 'Robin',   asset: '/assets/Skins/Robin/Epic/Leon.png',           rarity: 'epic' },
  // Robin — Legendary
  { id: 'robin-mortis',   character: 'Mortis',   owner: 'Robin',   asset: '/assets/Skins/Robin/Legendary/Mortis.png',   rarity: 'legendary' },
  { id: 'robin-poco',     character: 'Poco',     owner: 'Robin',   asset: '/assets/Skins/Robin/Legendary/Poco.png',     rarity: 'legendary' },
  { id: 'robin-spike',    character: 'Spike',    owner: 'Robin',   asset: '/assets/Skins/Robin/Legendary/Spike.png',    rarity: 'legendary' },

  // Simon — Rare
  { id: 'simon-colt',     character: 'Colt',     owner: 'Simon',   asset: '/assets/Skins/Simon/Rare/Colt.png',           rarity: 'rare' },
  { id: 'simon-fang',     character: 'Fang',     owner: 'Simon',   asset: '/assets/Skins/Simon/Rare/Fang.png',           rarity: 'rare' },
  { id: 'simon-shelly',   character: 'Shelly',   owner: 'Simon',   asset: '/assets/Skins/Simon/Rare/Shelly.png',         rarity: 'rare' },
  // Simon — Epic
  { id: 'simon-barley',   character: 'Barley',   owner: 'Simon',   asset: '/assets/Skins/Simon/Epic/Barley.png',         rarity: 'epic' },
  { id: 'simon-edgar',    character: 'Edgar',    owner: 'Simon',   asset: '/assets/Skins/Simon/Epic/Edgar.png',          rarity: 'epic' },
  { id: 'simon-leon',     character: 'Leon',     owner: 'Simon',   asset: '/assets/Skins/Simon/Epic/Leon.png',           rarity: 'epic' },
  // Simon — Legendary
  { id: 'simon-bull',     character: 'Bull',     owner: 'Simon',   asset: '/assets/Skins/Simon/Legendary/Bull.png',     rarity: 'legendary' },
  { id: 'simon-elprimo',  character: 'ElPrimo',  owner: 'Simon',   asset: '/assets/Skins/Simon/Legendary/ElPrimo.png',  rarity: 'legendary' },
  { id: 'simon-spike',    character: 'Spike',    owner: 'Simon',   asset: '/assets/Skins/Simon/Legendary/Spike.png',    rarity: 'legendary' },

  // Elliot — Rare
  { id: 'elliott-barley',   character: 'Barley',   owner: 'Elliot', asset: '/assets/Skins/Elliot/Rare/Barley.png',       rarity: 'rare' },
  { id: 'elliott-edgar',    character: 'Edgar',    owner: 'Elliot', asset: '/assets/Skins/Elliot/Rare/Edgar.png',        rarity: 'rare' },
  { id: 'elliott-elprimo',  character: 'ElPrimo',  owner: 'Elliot', asset: '/assets/Skins/Elliot/Rare/ElPrimo.png',      rarity: 'rare' },
  { id: 'elliott-willow',   character: 'Willow',   owner: 'Elliot', asset: '/assets/Skins/Elliot/Rare/Willow.png',       rarity: 'rare' },
  // Elliot — Epic
  { id: 'elliott-8bit',     character: '8-Bit',    owner: 'Elliot', asset: '/assets/Skins/Elliot/Epic/8bit.png',         rarity: 'epic' },
  { id: 'elliott-frank',    character: 'Frank',    owner: 'Elliot', asset: '/assets/Skins/Elliot/Epic/Frank.png',        rarity: 'epic' },
  { id: 'elliott-tick',     character: 'Tick',     owner: 'Elliot', asset: '/assets/Skins/Elliot/Epic/Tick.png',         rarity: 'epic' },
  // Elliot — Legendary
  { id: 'elliott-nani',     character: 'Nani',     owner: 'Elliot', asset: '/assets/Skins/Elliot/Legendary/Nani.png',    rarity: 'legendary' },
  { id: 'elliott-riko',     character: 'Riko',     owner: 'Elliot', asset: '/assets/Skins/Elliot/Legendary/Riko.png',    rarity: 'legendary' },
  { id: 'elliott-spike',    character: 'Spike',    owner: 'Elliot', asset: '/assets/Skins/Elliot/Legendary/Spike.png',   rarity: 'legendary' },
];

export type ChestTier = 'brawl' | 'big' | 'mega';

export interface ChestTierDef {
  label: string;
  glow: string;
  chestImage: string;
  openingAnimation: string;
  swirlAnimation: string;
  rarity: Rarity;
}

export const CHEST_TIERS: Record<ChestTier, ChestTierDef> = {
  brawl: {
    label: 'Brawl Box',
    glow: '#74B9FF',
    chestImage: '/assets/chests/blue_chest_swirls.png',
    openingAnimation: '/assets/chests/blue_chest_opens.webp',
    swirlAnimation: '/assets/chests/blue_chest_swirls.webp',
    rarity: 'rare',
  },
  big: {
    label: 'Big Box',
    glow: '#FF6B6B',
    chestImage: '/assets/chests/red_chest_swirls.png',
    openingAnimation: '/assets/chests/red_chest_opens.webp',
    swirlAnimation: '/assets/chests/red_chest_swirls.webp',
    rarity: 'epic',
  },
  mega: {
    label: 'Mega Box',
    glow: '#A29BFE',
    chestImage: '/assets/chests/purple_chest_swirls.png',
    openingAnimation: '/assets/chests/purple_chest_opens.webp',
    swirlAnimation: '/assets/chests/purple_chest_swirls.webp',
    rarity: 'legendary',
  },
};

const UPGRADE_CHANCES: Partial<Record<ChestTier, { next: ChestTier; chance: number }>> = {
  brawl: { next: 'big', chance: 0.40 },
  big: { next: 'mega', chance: 0.25 },
};

export const RARITY_COLORS: Record<Rarity, string> = {
  rare: '#74B9FF',
  epic: '#FF6B6B',
  legendary: '#A29BFE',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
};

export function tryUpgrade(currentTier: ChestTier): ChestTier {
  const upgrade = UPGRADE_CHANCES[currentTier];
  if (!upgrade) return currentTier;
  return Math.random() < upgrade.chance ? upgrade.next : currentTier;
}

export function rollSkin(tier: ChestTier, unlockedSkinIds: string[], ownerFilter?: string): SkinDefinition {
  const targetRarity = CHEST_TIERS[tier].rarity;
  const catalog = ownerFilter
    ? SKIN_CATALOG.filter((s) => s.owner.toLowerCase() === ownerFilter.toLowerCase())
    : SKIN_CATALOG;
  const available = catalog.filter((s) => !unlockedSkinIds.includes(s.id));

  // If all skins are unlocked, pick from the full catalog
  const pool = available.length > 0 ? available : catalog;

  // Try to match the chest's rarity; if none available at that rarity, fall back to full pool
  const rarityPool = pool.filter((s) => s.rarity === targetRarity);
  const finalPool = rarityPool.length > 0 ? rarityPool : pool;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}
