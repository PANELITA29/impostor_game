import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { MetallicPaint } from '../components/ui/MetallicPaint';
import { THEME_CONFIG } from '../utils/i18n';
import { Button, Modal } from '../components/ui';
import {
  Play,
  ArrowRight,
  HelpCircle,
  EyeOff,
  MessageSquare,
  Vote,
  Layers,
  ChevronRight,
  Shield,
  Users,
  Timer,
  Theater,
  Download,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { setScreen, categories, settings, preferences } = useGameStore();
  const { canInstall, promptInstall } = usePwaInstall();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const customCategoriesCount = categories.filter((c) => c.isCustom).length;
  const activeCategoriesCount = settings.selectedCategoryIds.length;
  const currentTheme = THEME_CONFIG[preferences.theme] || THEME_CONFIG.midnight;

  return (
    <div className="flex-1 flex flex-col justify-between py-2 max-w-md mx-auto w-full animate-in fade-in duration-300">
      {/* Hero Section with Official Amogus Shhhhh + MetallicPaint */}
      <div className="relative flex flex-col items-center justify-center text-center pt-2 pb-6 my-auto">
        {/* Atmospheric Glow Flares */}
        <div className="absolute -top-6 w-56 h-56 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-16 right-0 w-32 h-32 bg-accent-impostor/15 rounded-full blur-2xl pointer-events-none -z-10" />
        <div className="absolute top-20 left-0 w-28 h-28 bg-accent-chaos/15 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Amogus Shhhhh / Custom Avatar Metallic Emblem Container */}
        <div
          onClick={() => setScreen('SETTINGS')}
          className="relative group cursor-pointer my-2 sm:my-3"
          title="Toca para personalizar tu ícono en Ajustes"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-accent-impostor/30 via-transparent to-accent-primary/20 blur-2xl transition-all duration-700 group-hover:scale-110" />
          
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center rounded-full bg-surface border-2 border-accent-impostor/40 shadow-[0_0_30px_rgba(var(--color-accent-impostor),0.35)] overflow-hidden transition-transform duration-500 group-hover:scale-105 active:scale-95">
            {/* Vivid Neon Base Character or Custom Uploaded Avatar */}
            <img
              src={preferences.customHeroImage || '/amogus-shh.svg'}
              alt="Ícono del Menú"
              className={`absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_16px_rgba(var(--color-accent-impostor),0.45)] z-0 ${
                preferences.customHeroImage ? 'object-cover p-0' : 'p-3 sm:p-3.5 object-contain'
              }`}
            />

            {/* React Bits MetallicPaint Liquid Metal Shader Layer (active on default Amogus) */}
            {!preferences.customHeroImage && (
              <div className="absolute inset-0 w-full h-full z-10 opacity-75 mix-blend-screen pointer-events-auto">
                <MetallicPaint
                  imageSrc="/amogus-shh.svg"
                  color={currentTheme.secondary}
                  edgeBend={0.88}
                  distortion={0.07}
                  dispersion={0.4}
                  density={2.4}
                  softness={0.1}
                  scale={0.78}
                  mouseTilt={0.8}
                  speed={0.75}
                />
              </div>
            )}
          </div>

          {/* Glowing Status Badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-elevated/95 backdrop-blur-sm border border-accent-impostor/40 px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-impostor animate-ping" />
            <span className="font-code text-[10px] sm:text-[11px] text-accent-impostor tracking-widest font-bold uppercase whitespace-nowrap">
              {preferences.customHeroImage ? 'CUSTOM AVATAR' : 'SHHH... ACTIVE'}
            </span>
          </div>
        </div>

        {/* Title & Framing */}
        <div className="flex flex-col items-center mt-2 sm:mt-3 gap-1">
          <h1 className="font-headline font-bold text-3xl sm:text-5xl text-accent-primary tracking-[0.15em] sm:tracking-[0.2em] uppercase drop-shadow-[0_0_24px_rgba(0,229,160,0.4)]">
            IMPOSTOR
          </h1>
          <p className="font-body text-xs sm:text-base text-text-secondary max-w-xs mx-auto">
            Juego presencial de deducción social
          </p>
        </div>

        {/* Mystery Narrative Tagline Pill */}
        <div className="mt-3 sm:mt-4 bg-surface border border-elevated/80 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 max-w-[340px] shadow-sm">
          <Theater className="w-4 h-4 text-accent-impostor shrink-0" />
          <span className="text-[11px] sm:text-xs text-text-primary text-left leading-tight">
            1 impostor entre ustedes. Descúbrelo antes del veredicto.
          </span>
        </div>
      </div>

      {/* Primary Actions Stack */}
      <div className="flex flex-col gap-3 w-full px-1">
        {/* Main High-Stakes CTA Button */}
        <button
          type="button"
          onClick={() => setScreen('LOBBY')}
          className="btn-game-mount stagger-1 btn-game-juice btn-cta-pulse group relative w-full h-[62px] bg-accent-primary text-canvas rounded-full flex items-center justify-between px-6 shadow-[0_0_24px_rgba(0,229,160,0.28)]"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-canvas/15 flex items-center justify-center">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-headline text-lg sm:text-xl uppercase tracking-wide leading-none font-bold">
                Jugar Ahora
              </span>
              <span className="font-code text-[11px] opacity-80 mt-0.5 tracking-wider font-semibold">
                CREAR NUEVA PARTIDA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-code text-xs uppercase tracking-wider bg-canvas/15 px-3 py-1.5 rounded-full font-bold relative z-10">
            <span>Iniciar</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        {/* Custom Categories Entry */}
        <button
          type="button"
          onClick={() => setScreen('CATEGORIES')}
          className="btn-game-mount stagger-2 btn-game-juice w-full bg-surface border border-elevated/70 rounded-2xl p-4 flex items-center justify-between shadow-md text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-elevated border border-surface flex items-center justify-center shrink-0 text-accent-chaos">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-base text-text-primary truncate">
                  Mis Categorías
                </span>
                <span className="bg-accent-chaos/20 text-accent-chaos font-code text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  {customCategoriesCount > 0 ? `${customCategoriesCount} propias` : `${activeCategoriesCount} activas`}
                </span>
              </div>
              <span className="text-xs text-text-secondary truncate mt-0.5">
                Crea tus propias palabras secretas y retos
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center shrink-0 ml-2 group-hover:bg-accent-primary group-hover:text-canvas transition-colors text-text-secondary">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* How To Play Quick Access */}
        <button
          type="button"
          onClick={() => setIsRulesModalOpen(true)}
          className="btn-game-mount stagger-3 btn-game-juice w-full h-[50px] bg-surface/60 border border-elevated/60 rounded-xl px-4 flex items-center justify-between text-text-secondary hover:text-text-primary"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-accent-primary" />
            <span className="font-headline font-bold text-xs uppercase tracking-wider">
              Cómo Jugar y Reglas
            </span>
          </div>
          <span className="font-code text-xs text-text-secondary/70">
            Guía 2 min →
          </span>
        </button>

        {/* Discreet Install App Button (Visible only when PWA installation is available) */}
        {canInstall && (
          <button
            type="button"
            onClick={promptInstall}
            className="btn-game-mount stagger-4 btn-game-juice w-full h-[46px] bg-accent-primary/10 border border-accent-primary/30 rounded-xl px-4 flex items-center justify-between text-accent-primary hover:bg-accent-primary/20"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4" />
              <span className="font-headline font-bold text-xs uppercase tracking-wider">
                Instalar Aplicación
              </span>
            </div>
            <span className="font-code text-[11px] font-bold">100% Offline</span>
          </button>
        )}
      </div>

      {/* Preset Room Dynamics Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 px-1 btn-game-mount stagger-4">
        <div className="bg-surface border border-elevated/60 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-text-secondary mb-1">
            <Users className="w-4 h-4 text-accent-primary" />
            <span className="font-code text-[11px] uppercase tracking-wider font-bold">
              Capacidad
            </span>
          </div>
          <span className="font-headline font-bold text-sm text-text-primary">
            3 a 15 Jugadores
          </span>
          <span className="text-[11px] text-text-secondary mt-0.5">
            En un solo móvil
          </span>
        </div>

        <div className="bg-surface border border-elevated/60 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-text-secondary mb-1">
            <Timer className="w-4 h-4 text-accent-warning" />
            <span className="font-code text-[11px] uppercase tracking-wider font-bold">
              Duración
            </span>
          </div>
          <span className="font-headline font-bold text-sm text-text-primary">
            ~3 a 5 Minutos
          </span>
          <span className="text-[11px] text-text-secondary mt-0.5">
            Ronda tensa y rápida
          </span>
        </div>
      </div>

      {/* Anti-spy Badge Card */}
      <div className="mt-3 mx-1 bg-elevated/40 border border-surface rounded-xl p-3 flex items-center gap-3 btn-game-mount stagger-5">
        <Shield className="w-5 h-5 text-accent-primary shrink-0" />
        <p className="text-[11px] text-text-secondary leading-snug">
          <strong>Modo Antiespía Activo:</strong> Mantendrán presionado su terminal para recibir la palabra clave o condición de impostor en absoluto sigilo.
        </p>
      </div>

      {/* Educational 3-Step Modal */}
      <Modal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        title="¿Cómo jugar a IMPOSTOR?"
        description="Juego de deducción para grupos en una sola pantalla"
        footer={
          <Button
            variant="primary"
            fullWidth
            onClick={() => setIsRulesModalOpen(false)}
          >
            ¡Entendido!
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-4 p-3.5 rounded-xl bg-elevated/50 border border-elevated">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-sm text-text-primary flex items-center gap-2">
                <span>1. Reparto Secreto</span>
                <span className="text-xs text-accent-primary font-code">(Pass &amp; Play)</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Pasa el teléfono en secreto a cada jugador. Todos verán la misma palabra secreta, excepto el o los <strong>Impostores</strong>, quienes verán una alerta de incógnito.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-3.5 rounded-xl bg-elevated/50 border border-elevated">
            <div className="w-10 h-10 rounded-xl bg-accent-chaos/10 border border-accent-chaos/20 flex items-center justify-center text-accent-chaos shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-sm text-text-primary flex items-center gap-2">
                <span>2. Una Palabra por Turno</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Siguiendo el orden indicado por la app, cada jugador dice <strong>solo una palabra</strong> relacionada con la clave. ¡El impostor debe improvisar para no ser descubierto!
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-3.5 rounded-xl bg-elevated/50 border border-elevated">
            <div className="w-10 h-10 rounded-xl bg-accent-impostor/10 border border-accent-impostor/20 flex items-center justify-center text-accent-impostor shrink-0">
              <Vote className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-sm text-text-primary flex items-center gap-2">
                <span>3. Debate y Votación</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Al sonar la alarma o terminar el tiempo, debatan abiertamente y voten a quién desenmascarar. Si atrapan al impostor, ¿podrá adivinar la palabra secreta para ganar?
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
