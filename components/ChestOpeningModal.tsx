'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useChest } from '@/contexts/ChestContext';
import {
  type SkinDefinition,
  type ChestTier,
  CHEST_TIERS,
  RARITY_COLORS,
  RARITY_LABELS,
  rollSkin,
  tryUpgrade,
} from '@/data/skins';

// Phase flow:
// shimmer → upgrade1 → upgrade2 → upgrade3 → ready → opening → revealing → done
type Phase =
  | 'shimmer'    // Chest swirls, "Tap for a chance to upgrade!", arrow 1 active
  | 'upgrade1'   // After 1st tap, "2 chances left", arrow 2 active
  | 'upgrade2'   // After 2nd tap, "1 chance left!", arrow 3 active
  | 'upgrade3'   // After 3rd tap, brief flash then auto-advance to ready
  | 'ready'      // "Tap to open!"
  | 'opening'    // Opening animation plays
  | 'revealing'  // Dramatic reveal
  | 'done';      // Show reward + AWESOME button

interface ChestOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  chestGoal: number;
}

export default function ChestOpeningModal({ isOpen, onClose, chestGoal }: ChestOpeningModalProps) {
  const { unlockedSkins, unlockSkin, markChestCollected, isSkinUnlocked } = useChest();
  const [phase, setPhase] = useState<Phase>('shimmer');
  const [tier, setTier] = useState<ChestTier>('brawl');
  const [rewardSkin, setRewardSkin] = useState<SkinDefinition | null>(null);
  const [wasAlreadyUnlocked, setWasAlreadyUnlocked] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<'same' | 'upgraded' | null>(null);
  const [shaking, setShaking] = useState(false);
  const [showSkinOverlay, setShowSkinOverlay] = useState(false);
  const [upgradeFlash, setUpgradeFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('shimmer');
      setTier('brawl');
      setRewardSkin(null);
      setWasAlreadyUnlocked(false);
      setUpgradeResult(null);
      setShaking(false);
      setShowSkinOverlay(false);
      setUpgradeFlash(false);
    }
  }, [isOpen]);

  // Auto-advance from upgrade3 → ready after flash
  useEffect(() => {
    if (phase === 'upgrade3') {
      const timer = setTimeout(() => setPhase('ready'), 600);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Opening phase: show skin overlay at halfway (2.5s), then advance to done at 5s
  useEffect(() => {
    if (phase === 'opening') {
      setShowSkinOverlay(false);
      const halfTimer = setTimeout(() => setShowSkinOverlay(true), 2500);
      const doneTimer = setTimeout(() => setPhase('done'), 5000);
      return () => {
        clearTimeout(halfTimer);
        clearTimeout(doneTimer);
      };
    }
  }, [phase]);

  // Clear upgrade result indicator after showing it briefly
  useEffect(() => {
    if (upgradeResult) {
      const timer = setTimeout(() => setUpgradeResult(null), 800);
      return () => clearTimeout(timer);
    }
  }, [upgradeResult]);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 300);
  }, []);

  const doUpgrade = useCallback((currentTier: ChestTier) => {
    const newTier = tryUpgrade(currentTier);
    if (newTier !== currentTier) {
      setUpgradeResult('upgraded');
      setUpgradeFlash(true);
      setTimeout(() => setUpgradeFlash(false), 400);
    } else {
      setUpgradeResult('same');
    }
    setTier(newTier);
    return newTier;
  }, []);

  const handleTap = useCallback(() => {
    if (phase === 'opening' || phase === 'done' || phase === 'upgrade3') return;

    triggerShake();

    if (phase === 'shimmer') {
      doUpgrade(tier);
      setPhase('upgrade1');
    } else if (phase === 'upgrade1') {
      doUpgrade(tier);
      setPhase('upgrade2');
    } else if (phase === 'upgrade2') {
      doUpgrade(tier);
      setPhase('upgrade3');
    } else if (phase === 'ready') {
      // Roll skin reward and open
      const skin = rollSkin(tier, unlockedSkins);
      setRewardSkin(skin);
      setWasAlreadyUnlocked(isSkinUnlocked(skin.id));
      unlockSkin(skin.id);
      markChestCollected(chestGoal);
      setPhase('opening');
    }
  }, [phase, tier, unlockedSkins, unlockSkin, markChestCollected, isSkinUnlocked, chestGoal, doUpgrade, triggerShake]);

  if (!isOpen) return null;

  const tierDef = CHEST_TIERS[tier];

  // Which arrow (0-indexed) is currently active
  const activeArrow =
    phase === 'shimmer' ? 0 :
    phase === 'upgrade1' ? 1 :
    phase === 'upgrade2' ? 2 :
    -1;

  const isUpgradePhase = phase === 'shimmer' || phase === 'upgrade1' || phase === 'upgrade2';
  const showSwirl = isUpgradePhase || phase === 'upgrade3' || phase === 'ready';

  const promptText =
    phase === 'shimmer'
      ? 'Tap for a chance to upgrade!'
      : phase === 'upgrade1'
        ? '2 chances left'
        : phase === 'upgrade2'
          ? '1 chance left!'
          : phase === 'ready'
            ? 'Tap to open!'
            : '';

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${shaking ? 'screen-shake' : ''}`}
      style={{ background: '#162544' }}
      onClick={handleTap}
    >
      {/* White flash overlay on upgrade */}
      {upgradeFlash && (
        <div className="upgrade-tier-flash absolute inset-0 pointer-events-none" style={{ zIndex: 10 }} />
      )}

      {/* Swirl animation — absolutely centered so layout changes don't shift it */}
      {showSwirl && (
        <img
          key={`swirl-${tier}`}
          src={tierDef.swirlAnimation}
          alt=""
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100vw',
            height: 'auto',
            objectFit: 'contain',
            zIndex: 1,
          }}
        />
      )}

      {/* Bottom UI: arrows, upgrade text, prompt — all absolutely positioned */}
      <div className="absolute left-0 right-0 flex flex-col items-center" style={{ bottom: '15%', zIndex: 2 }}>
        {/* Upgrade arrows indicator */}
        {isUpgradePhase && (
          <div className="flex items-center gap-3 mb-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`upgrade-arrow ${i === activeArrow ? 'active' : ''}`}
                style={{
                  opacity: i === activeArrow ? 1 : 0.25,
                  transition: 'opacity 0.3s ease, filter 0.3s ease',
                  fontSize: 28,
                  filter: i === activeArrow
                    ? `drop-shadow(0 0 8px ${tierDef.glow})`
                    : 'none',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={i === activeArrow ? tierDef.glow : '#ffffff'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5" />
                  <path d="M5 12l7-7 7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade result flash text */}
        {upgradeResult === 'upgraded' && (
          <p className="upgrade-flash-text text-2xl font-black" style={{
            color: tierDef.glow,
            textShadow: `0 0 20px ${tierDef.glow}, 0 0 40px ${tierDef.glow}80`,
          }}>
            UPGRADED!
          </p>
        )}

        {/* Prompt text */}
        {promptText && (
          <p className="chest-prompt-text text-white text-xl mt-2">{promptText}</p>
        )}
      </div>

      {/* Opening animation — scaled to ~77vw so chest matches swirl size (1108/1440 ratio) */}
      {phase === 'opening' && (
        <div className="absolute flex items-center justify-center" style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '77vw',
          zIndex: 1,
        }}>
          <img
            key={`opening-${tier}`}
            src={tierDef.openingAnimation}
            alt="Chest opening"
            className="pointer-events-none"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
          {/* Skin overlay appears at halfway point */}
          {showSkinOverlay && rewardSkin && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="skin-reveal flex flex-col items-center">
                <div
                  className="relative rounded-2xl p-2"
                  style={{
                    boxShadow: `0 0 30px ${RARITY_COLORS[rewardSkin.rarity]}80, 0 0 60px ${RARITY_COLORS[rewardSkin.rarity]}40`,
                    background: `radial-gradient(circle, ${RARITY_COLORS[rewardSkin.rarity]}20 0%, transparent 70%)`,
                  }}
                >
                  <img
                    src={rewardSkin.asset}
                    alt={rewardSkin.character}
                    width={480}
                    height={480}
                    style={{ width: 480, height: 480, objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Done state: skin + rays + info + button */}
      {phase === 'done' && rewardSkin && (
        <>
          <div className="relative flex items-center justify-center" style={{ width: 480, height: 480, zIndex: 1 }}>
            <div className="burst-rays" />
            <div className="flex flex-col items-center">
              <div
                className="relative rounded-2xl p-2"
                style={{
                  boxShadow: `0 0 30px ${RARITY_COLORS[rewardSkin.rarity]}80, 0 0 60px ${RARITY_COLORS[rewardSkin.rarity]}40`,
                  background: `radial-gradient(circle, ${RARITY_COLORS[rewardSkin.rarity]}20 0%, transparent 70%)`,
                }}
              >
                <img
                  src={rewardSkin.asset}
                  alt={rewardSkin.character}
                  width={480}
                  height={480}
                  style={{ width: 480, height: 480, objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 mt-4" onClick={(e) => e.stopPropagation()} style={{ zIndex: 1 }}>
            <p className="text-white text-lg font-bold brawl-text">
              {rewardSkin.owner}&apos;s {rewardSkin.character}
            </p>

            <span
              className="skin-rarity-badge"
              style={{
                background: RARITY_COLORS[rewardSkin.rarity],
                color: rewardSkin.rarity === 'epic' ? '#1A1F3A' : '#fff',
              }}
            >
              {RARITY_LABELS[rewardSkin.rarity]}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="mt-4 px-8 py-3 rounded-full font-bold text-base border-2 border-white"
              style={{
                background: 'linear-gradient(to bottom, #FDCB6E 0%, #FFA502 100%)',
                color: '#1A1F3A',
                boxShadow: '0 4px 0 rgba(0,0,0,0.35), 0 6px 12px rgba(0,0,0,0.3)',
              }}
            >
              AWESOME!
            </button>
          </div>
        </>
      )}
    </div>
  );
}
