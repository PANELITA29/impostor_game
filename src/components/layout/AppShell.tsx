import React, { useState, useEffect } from 'react';
import { Balatro } from '../ui/Balatro';
import { Dock, type DockItemData } from '../ui/Dock';
import { RulesModal } from '../ui/RulesModal';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/useGameStore';
import { THEME_CONFIG, TRANSLATIONS } from '../../utils/i18n';
import {
  Home,
  Layers,
  HelpCircle,
  Volume2,
  VolumeX,
  Settings,
  ArrowLeft,
  AlertTriangle,
  LogOut,
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
  const { currentScreen, preferences, isMuted, toggleMute, setScreen, exitGameToLobby } = useGameStore();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  const tDock = TRANSLATIONS[preferences.language].dock;
  const currentTheme = THEME_CONFIG[preferences.theme] || THEME_CONFIG.midnight;

  // Active game screens where roles are secret and debate/voting is underway
  const isGameplayScreen =
    currentScreen === 'PASS_AND_PLAY' ||
    currentScreen === 'ACTIVE_ROUND' ||
    currentScreen === 'VOTING' ||
    currentScreen === 'JUDGMENT';

  // Do not show navigation dock during active game to protect secret roles and prevent accidental quits
  const showDock = !isGameplayScreen;

  // Intercept mobile back button/gesture during active gameplay to confirm exit
  useEffect(() => {
    if (!isGameplayScreen) return;

    // Push dummy state so browser back button triggers popstate instead of exiting the app
    window.history.pushState({ inGameplay: true }, '');

    const handlePopState = () => {
      window.history.pushState({ inGameplay: true }, '');
      setIsExitConfirmOpen(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isGameplayScreen]);

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
          className={`mx-auto flex h-14 sm:h-16 items-center justify-between px-2.5 sm:px-6 transition-all duration-300 ${
            wide ? 'max-w-[960px]' : 'max-w-[540px]'
          }`}
        >
          {/* Brand Logo & Back Button during Active Game */}
          <div className="flex items-center gap-1 sm:gap-2">
            {isGameplayScreen && (
              <button
                type="button"
                onClick={() => setIsExitConfirmOpen(true)}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 rounded-xl text-accent-impostor hover:text-text-primary hover:bg-accent-impostor/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-impostor"
                aria-label="Salir de la partida"
                title="Salir de la partida"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isGameplayScreen) {
                  setIsExitConfirmOpen(true);
                } else if (showDock) {
                  setScreen('HOME');
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 text-left focus:outline-none shrink-0"
            >
              <span className="font-headline font-bold text-lg sm:text-xl tracking-wider text-text-primary drop-shadow-[0_0_10px_rgba(var(--color-accent-primary),0.3)]">
                IMPOSTOR
              </span>
              <span className="hidden min-[380px]:inline-block text-accent-primary text-[10px] sm:text-xs font-code font-bold px-1.5 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20">
                P&amp;P
              </span>
            </button>
          </div>

          {/* React Bits Magnified Dock (When outside of secret rounds) */}
          {showDock ? (
            <div className="flex items-center shrink-0">
              <Dock items={dockItems} magnification={1.2} distance={65} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExitConfirmOpen(true)}
                className="text-[11px] font-code font-semibold uppercase text-accent-warning hover:text-accent-impostor bg-accent-warning/10 hover:bg-accent-impostor/10 px-2.5 py-1 rounded-full border border-accent-warning/30 hover:border-accent-impostor/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Abandonar partida"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-warning animate-ping" />
                <span className="hidden min-[380px]:inline">Partida en Curso</span>
                <span className="min-[380px]:hidden">En curso</span>
              </button>
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
        className={`relative z-10 mx-auto flex-1 w-full px-3 py-3 sm:px-6 sm:py-6 transition-all duration-300 flex flex-col ${
          wide ? 'max-w-[960px]' : 'max-w-[540px]'
        }`}
      >
        {children}
      </main>

      {/* Optional Sticky/Fixed Footer with Safe Area Support */}
      {footer && (
        <footer className="sticky bottom-0 z-30 w-full border-t border-elevated/40 bg-canvas/90 backdrop-blur-md pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-4 sm:px-6">
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

      {/* Exit Confirmation Warning Modal */}
      <Modal
        isOpen={isExitConfirmOpen}
        onClose={() => setIsExitConfirmOpen(false)}
        title="¿Salir de la partida?"
        description="Se cancelará la ronda actual y volverán al lobby."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-accent-impostor/10 border border-accent-impostor/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-accent-impostor shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Si salís ahora, se cancelará la ronda en curso, se detendrá el temporizador y se perderá el progreso de esta partida. ¿Desean abandonar la ronda?
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setIsExitConfirmOpen(false)}
            >
              Continuar Jugando
            </Button>
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={() => {
                setIsExitConfirmOpen(false);
                exitGameToLobby();
              }}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sí, Salir al Lobby
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
