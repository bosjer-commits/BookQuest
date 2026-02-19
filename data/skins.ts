export type Rarity = 'common' | 'rare' | 'epic';

export interface SkinDefinition {
  id: string;
  character: string;
  owner: string;
  asset: string;
  rarity: Rarity;
}

export const SKIN_CATALOG: SkinDefinition[] = [
  // Common (9)
  { id: 'robin-shelly',  character: 'Shelly', owner: 'Robin',   asset: '/assets/Skins/Robin/Shelly.png',  rarity: 'common' },
  { id: 'robin-bull',    character: 'Bull',   owner: 'Robin',   asset: '/assets/Skins/Robin/Bull.png',    rarity: 'common' },
  { id: 'robin-poco',    character: 'Poco',   owner: 'Robin',   asset: '/assets/Skins/Robin/Poco.png',    rarity: 'common' },
  { id: 'robin-spike',   character: 'Spike',  owner: 'Robin',   asset: '/assets/Skins/Robin/Spike.png',   rarity: 'common' },
  { id: 'simon-shelly',  character: 'Shelly', owner: 'Simon',   asset: '/assets/Skins/Simon/Shelly.png',  rarity: 'common' },
  { id: 'simon-bull',    character: 'Bull',   owner: 'Simon',   asset: '/assets/Skins/Simon/Bull.png',    rarity: 'common' },
  { id: 'simon-spike',   character: 'Spike',  owner: 'Simon',   asset: '/assets/Skins/Simon/Spike.png',   rarity: 'common' },
  { id: 'oliver-shelly', character: 'Shelly', owner: 'Oliver',  asset: '/assets/Skins/Oliver/Shelly.png', rarity: 'common' },
  { id: 'lucas-spike',   character: 'Spike',  owner: 'Lucas',   asset: '/assets/Skins/Lucas/Spike.png',   rarity: 'common' },

  // Rare (5)
  { id: 'robin-edgar',   character: 'Edgar',  owner: 'Robin',   asset: '/assets/Skins/Robin/Edgar.png',   rarity: 'rare' },
  { id: 'robin-mandy',   character: 'Mandy',  owner: 'Robin',   asset: '/assets/Skins/Robin/Mandy.png',   rarity: 'rare' },
  { id: 'robin-bibi',    character: 'Bibi',   owner: 'Robin',   asset: '/assets/Skins/Robin/Bibi.png',    rarity: 'rare' },
  { id: 'oliver-edgar',  character: 'Edgar',  owner: 'Oliver',  asset: '/assets/Skins/Oliver/Edgar.png',  rarity: 'rare' },
  { id: 'lucas-broock',  character: 'Broock', owner: 'Lucas',   asset: '/assets/Skins/Lucas/Broock.png',  rarity: 'rare' },

  // Epic (4)
  { id: 'oliver-angelo', character: 'Angelo', owner: 'Oliver',  asset: '/assets/Skins/Oliver/Angelo.png', rarity: 'epic' },
  { id: 'oliver-crow',   character: 'Crow',   owner: 'Oliver',  asset: '/assets/Skins/Oliver/Crow.png',   rarity: 'epic' },
  { id: 'elliott-spike', character: 'Spike',  owner: 'Elliott', asset: '/assets/Skins/Elliott/Spike.png', rarity: 'epic' },
  { id: 'simon-edgar',   character: 'Edgar',  owner: 'Simon',   asset: '/assets/Skins/Simon/EdgarS.png',  rarity: 'epic' },
];

export type ChestTier = 'brawl' | 'big' | 'mega';

export interface ChestTierDef {
  label: string;
  glow: string;
  chestImage: string;
  openingAnimation: string;
  swirlAnimation: string;
  rarityOdds: Record<Rarity, number>;
}

export const CHEST_TIERS: Record<ChestTier, ChestTierDef> = {
  brawl: {
    label: 'Brawl Box',
    glow: '#74B9FF',
    chestImage: '/assets/chest.png',
    openingAnimation: '/assets/chests/blue_chest_opens.webp',
    swirlAnimation: '/assets/chests/blue_chest_swirls.webp',
    rarityOdds: { common: 0.70, rare: 0.25, epic: 0.05 },
  },
  big: {
    label: 'Big Box',
    glow: '#FF6B6B',
    chestImage: '/assets/REDchest.png',
    openingAnimation: '/assets/chests/red_chest_opens.webp',
    swirlAnimation: '/assets/chests/red_chest_swirls.webp',
    rarityOdds: { common: 0.50, rare: 0.35, epic: 0.15 },
  },
  mega: {
    label: 'Mega Box',
    glow: '#A29BFE',
    chestImage: '/assets/REDDERchest.png',
    openingAnimation: '/assets/chests/purple_chest_opens.webp',
    swirlAnimation: '/assets/chests/purple_chest_swirls.webp',
    rarityOdds: { common: 0.25, rare: 0.40, epic: 0.35 },
  },
};

const UPGRADE_CHANCES: Partial<Record<ChestTier, { next: ChestTier; chance: number }>> = {
  brawl: { next: 'big', chance: 0.40 },
  big: { next: 'mega', chance: 0.25 },
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#74B9FF',
  rare: '#A29BFE',
  epic: '#FFD93D',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'RARE',
  rare: 'EPIC',
  epic: 'LEGENDARY',
};

export function tryUpgrade(currentTier: ChestTier): ChestTier {
  const upgrade = UPGRADE_CHANCES[currentTier];
  if (!upgrade) return currentTier;
  return Math.random() < upgrade.chance ? upgrade.next : currentTier;
}

export function rollSkin(tier: ChestTier, unlockedSkinIds: string[]): SkinDefinition {
  const odds = CHEST_TIERS[tier].rarityOdds;
  const available = SKIN_CATALOG.filter((s) => !unlockedSkinIds.includes(s.id));

  // If all skins are unlocked, pick from the full catalog
  const pool = available.length > 0 ? available : SKIN_CATALOG;

  // Pick rarity via weighted random
  const roll = Math.random();
  let rarity: Rarity;
  if (roll < odds.common) {
    rarity = 'common';
  } else if (roll < odds.common + odds.rare) {
    rarity = 'rare';
  } else {
    rarity = 'epic';
  }

  // Filter pool by rarity; fallback to full pool if none available at that rarity
  let rarityPool = pool.filter((s) => s.rarity === rarity);
  if (rarityPool.length === 0) rarityPool = pool;

  return rarityPool[Math.floor(Math.random() * rarityPool.length)];
}
