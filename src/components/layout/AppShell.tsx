import React, { useState } from 'react';
import { Balatro } from '../ui/Balatro';
import { Dock, type DockItemData } from '../ui/Dock';
import { RulesModal } from '../ui/RulesModal';
import { useGameStore } from '../../store/useGameStore';
import { THEME_CONFIG, TRANSLATIONS } from '../../utils/i18n';
import {
  Home,
  Layers,
  HelpCircle,
  Volume2,
  VolumeX,
  Settings,
} from 'lucide-react';

export interface AppShellProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean; // When true or when 2-column mode is on, expands to max-w-[960px]
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  headerRight,
  footer,
  wide = false,
}) => {
  const { currentScreen, preferences, isMuted, toggleMute, setScreen } = useGameStore();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const tDock = TRANSLATIONS[preferences.language].dock;
  const currentTheme = THEME_CONFIG[preferences.theme] || THEME_CONFIG.midnight;

  // Do not show navigation dock during pass-and-play or active round to protect secret roles
  const showDock = currentScreen !== 'PASS_AND_PLAY' && currentScreen !== 'ACTIVE_ROUND';

  const dockItems: DockItemData[] = [
    {
      id: 'home',
      label: tDock.home,
      icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      onClick: () => setScreen('HOME'),
      isActive: currentScreen === 'HOME' || currentScreen === 'LOBBY',
    },
    {
      id: 'categories',
      label: tDock.categories,
      icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
      onClick: () => setScreen('CATEGORIES'),
      isActive: currentScreen === 'CATEGORIES',
    },
    {
      id: 'rules',
      label: tDock.rules,
      icon: <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      onClick: () => setIsRulesModalOpen(true),
      isActive: isRulesModalOpen,
    },
    {
      id: 'sound',
      label: tDock.sound,
      icon: isMuted ? (
        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-accent-impostor" />
      ) : (
        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary" />
      ),
      onClick: toggleMute,
      badge: isMuted ? true : undefined,
      badgeColor: '#FF3B5C',
    },
    {
      id: 'settings',
      label: tDock.settings,
      icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
      onClick: () => setScreen('SETTINGS'),
      isActive: currentScreen === 'SETTINGS',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-canvas text-text-primary flex flex-col antialiased selection:bg-accent-primary selection:text-canvas overflow-x-hidden">
      {/* =========================================================================
          PERSISTENT BALATRO BACKGROUND SHADER (Global in all screens)
          Tuned with dynamic theme colors from active palette selection!
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-auto z-0 overflow-hidden">
        <Balatro
          color1={currentTheme.balatro.color1}
          color2={currentTheme.balatro.color2}
          color3={currentTheme.balatro.color3}
          contrast={4.8}
          lighting={0.3}
          swirl={0.36}
          speed={0.65}
          rotationSpeed={0.06}
          scale={1.2}
          detail={5}
          pixelSize={2.2}
          crt={0.15}
          mouseInteraction={true}
          mouseStrength={1.2}
          clickSwirl={true}
          opacity={0.48}
          className="w-full h-full"
        />
        {/* Subtle Vignette & Contrast Overlay so UI elements pop with readability */}
        <div className="absolute inset-0 bg-canvas/35 backdrop-blur-[1px] pointer-events-none" />
      </div>

      {/* Top Navigation Bar with Integrated React Bits Dock */}
      <header className="sticky top-0 z-40 w-full border-b border-elevated/40 bg-canvas/80 backdrop-blur-md">
        <div
          className={`mx-auto flex h-16 items-center justify-between px-3 sm:px-6 transition-all duration-300 ${
            wide ? 'max-w-[960px]' : 'max-w-[540px]'
          }`}
        >
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => {
              if (showDock) setScreen('HOME');
            }}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <span className="font-headline font-bold text-xl tracking-wider text-text-primary drop-shadow-[0_0_10px_rgba(var(--color-accent-primary),0.3)]">
              IMPOSTOR
            </span>
            <span className="text-accent-primary text-xs font-code font-bold px-1.5 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20">
              P&amp;P
            </span>
          </button>

          {/* React Bits Magnified Dock (When outside of secret rounds) */}
          {showDock ? (
            <div className="flex items-center">
              <Dock items={dockItems} magnification={1.22} distance={70} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-code font-semibold uppercase text-accent-warning bg-accent-warning/10 px-2.5 py-1 rounded-full border border-accent-warning/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-warning animate-ping" />
                Partida en Curso
              </span>
            </div>
          )}

          {headerRight && (
            <div className="flex items-center gap-2">
              {headerRight}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`relative z-10 mx-auto flex-1 w-full p-4 sm:p-6 transition-all duration-300 flex flex-col ${
          wide ? 'max-w-[960px]' : 'max-w-[540px]'
        }`}
      >
        {children}
      </main>

      {/* Optional Sticky/Fixed Footer */}
      {footer && (
        <footer className="sticky bottom-0 z-30 w-full border-t border-elevated/40 bg-canvas/90 backdrop-blur-md py-3 px-4 sm:px-6">
          <div
            className={`mx-auto w-full transition-all duration-300 ${
              wide ? 'max-w-[960px]' : 'max-w-[540px]'
            }`}
          >
            {footer}
          </div>
        </footer>
      )}

      {/* Interactive Rules Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
};
