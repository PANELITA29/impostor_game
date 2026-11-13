import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { audioManager } from '../audio/audioManager';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { TRANSLATIONS, THEME_CONFIG } from '../utils/i18n';
import { DEBATE_MUSIC_TRACKS } from '../audio/musicTracks';
import type { GameTheme, GameLanguage } from '../types/game';
import { Card, Button, Modal } from '../components/ui';
import {
  Settings,
  Languages,
  Palette,
  Volume2,
  VolumeX,
  Sliders,
  Smartphone,
  Vibrate,
  History,
  Trash2,
  RefreshCw,
  Download,
  Check,
  ArrowLeft,
  ShieldCheck,
  Music,
  Play,
  Square,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    isMuted,
    toggleMute,
    usedWordsHistory,
    clearHistory,
    resetAllToDefaults,
    setScreen,
  } = useGameStore();

  const { canInstall, promptInstall, isInstalled } = usePwaInstall();
  const t = TRANSLATIONS[preferences.language].settings;
  const themeLabels = TRANSLATIONS[preferences.language].themes;

  // Modals for sensitive actions
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = audioManager.subscribePreview((trackId) => {
      setPreviewingTrackId(trackId);
    });

    return () => {
      unsubscribe();
      audioManager.stopPreview();
    };
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleSelectDebateTrack = (trackId: string) => {
    audioManager.playSfx('tap');
    updatePreferences({ debateMusicTrack: trackId });
    const track = DEBATE_MUSIC_TRACKS.find((t) => t.id === trackId);
    showToast(`Música: ${track?.title || trackId}`);
  };

  const handleTogglePreview = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    audioManager.togglePreviewTrack(trackId);
  };

  const handleLanguageChange = (lang: GameLanguage) => {
    audioManager.playSfx('tap');
    updatePreferences({ language: lang });
    showToast(lang === 'es' ? 'Idioma cambiado a Español' : 'Language set to English');
  };

  const handleThemeChange = (theme: GameTheme) => {
    audioManager.playSfx('tap');
    updatePreferences({ theme });
    showToast(`${themeLabels[theme].name}`);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updatePreferences({ sfxVolume: val });
  };

  const handleSfxRelease = () => {
    audioManager.playSfx('tap');
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updatePreferences({ musicVolume: val });
  };

  const handleClearHistoryConfirm = () => {
    clearHistory();
    setIsClearHistoryModalOpen(false);
    showToast(t.clearHistorySuccess);
  };

  const handleResetAllConfirm = () => {
    resetAllToDefaults();
    setIsResetAllModalOpen(false);
    showToast('Ajustes de fábrica restablecidos');
  };

  const themes: GameTheme[] = [
    'midnight',
    'cyberpunk',
    'crimson',
    'amethyst',
    'matrix',
    'solar',
    'arctic',
    'synthwave',
  ];

  return (
    <div className="flex-1 flex flex-col justify-between max-w-2xl mx-auto w-full pb-10 space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-accent-primary/20 border border-accent-primary/50 text-accent-primary font-headline text-xs font-bold shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {successToast}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-elevated/40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScreen('HOME')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-text-secondary hover:text-text-primary -ml-2"
          >
            {t.backToGame}
          </Button>
          <div className="h-4 w-px bg-elevated/60" />
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent-primary" />
            <h1 className="font-headline font-bold text-lg text-text-primary tracking-wide">
              {t.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* =========================================================================
            1. SECCIÓN: IDIOMA
            ========================================================================= */}
        <Card variant="default" className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-text-primary">
            <Languages className="w-5 h-5 text-accent-primary" />
            <div>
              <h3 className="font-headline font-bold text-sm text-text-primary">
                {t.language}
              </h3>
              <p className="text-xs text-text-secondary">{t.languageDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleLanguageChange('es')}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                preferences.language === 'es'
                  ? 'bg-accent-primary/15 border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--color-accent-primary),0.2)]'
                  : 'bg-canvas/50 border-elevated hover:bg-elevated/40 text-text-secondary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🇪🇸</span>
                <span className="font-headline font-bold text-sm">Español</span>
              </div>
              {preferences.language === 'es' && (
                <Check className="w-4 h-4 text-accent-primary" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                preferences.language === 'en'
                  ? 'bg-accent-primary/15 border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--color-accent-primary),0.2)]'
                  : 'bg-canvas/50 border-elevated hover:bg-elevated/40 text-text-secondary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🇺🇸</span>
                <span className="font-headline font-bold text-sm">English</span>
              </div>
              {preferences.language === 'en' && (
                <Check className="w-4 h-4 text-accent-primary" />
              )}
            </button>
          </div>
        </Card>

        {/* =========================================================================
            2. SECCIÓN: PALETA DE COLORES Y TEMAS
            ========================================================================= */}
        <Card variant="default" className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-text-primary">
            <Palette className="w-5 h-5 text-accent-primary" />
            <div>
              <h3 className="font-headline font-bold text-sm text-text-primary">
                {t.theme}
              </h3>
              <p className="text-xs text-text-secondary">{t.themeDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {themes.map((th) => {
              const cfg = THEME_CONFIG[th];
              const isSelected = preferences.theme === th;
              const meta = themeLabels[th];

              return (
                <button
                  key={th}
                  type="button"
                  onClick={() => handleThemeChange(th)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-elevated/80 border-accent-primary shadow-[0_0_18px_rgba(var(--color-accent-primary),0.25)]'
                      : 'bg-canvas/60 border-elevated/60 hover:bg-elevated/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-headline font-bold text-xs sm:text-sm text-text-primary flex items-center gap-1.5">
                        {meta.name}
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                        )}
                      </h4>
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
                        {meta.desc}
                      </p>
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-2 pt-1">
                    <div
                      style={{ backgroundColor: cfg.primary }}
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      title="Color Primario"
                    />
                    <div
                      style={{ backgroundColor: cfg.secondary }}
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      title="Color Impostor"
                    />
                    <div
                      style={{ backgroundColor: cfg.canvas }}
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      title="Fondo"
                    />
                    <span className="text-[10px] font-code text-text-secondary ml-auto uppercase">
                      {cfg.primary}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* =========================================================================
            3. SECCIÓN: AUDIO Y MÚSICA
            ========================================================================= */}
        <Card variant="default" className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-elevated/40">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-accent-primary" />
              <div>
                <h3 className="font-headline font-bold text-sm text-text-primary">
                  {t.audioTitle}
                </h3>
              </div>
            </div>

            {/* Master Mute Toggle */}
            <Button
              variant={isMuted ? 'danger' : 'secondary'}
              size="sm"
              onClick={toggleMute}
              leftIcon={isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            >
              {isMuted ? 'Silenciado' : 'Audio Activo'}
            </Button>
          </div>

          <div className="space-y-4 pt-1">
            {/* SFX Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-headline font-bold text-text-primary">
                  {t.sfx}
                </span>
                <span className="font-code text-accent-primary font-bold">
                  {Math.round(preferences.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={preferences.sfxVolume}
                onChange={handleSfxChange}
                onMouseUp={handleSfxRelease}
                onTouchEnd={handleSfxRelease}
                disabled={isMuted}
                className="w-full h-2 bg-canvas rounded-lg appearance-none cursor-pointer accent-accent-primary disabled:opacity-40"
              />
            </div>

            {/* Ambient Music Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-headline font-bold text-text-primary">
                  {t.music}
                </span>
                <span className="font-code text-accent-primary font-bold">
                  {Math.round(preferences.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={preferences.musicVolume}
                onChange={handleMusicChange}
                disabled={isMuted}
                className="w-full h-2 bg-canvas rounded-lg appearance-none cursor-pointer accent-accent-primary disabled:opacity-40"
              />
            </div>
          </div>
        </Card>

        {/* =========================================================================
            3B. SECCIÓN: MÚSICA DEL DEBATE (Selección de pistas con previsualización)
            ========================================================================= */}
        <Card variant="default" className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-elevated/40">
            <div className="flex items-center gap-2.5">
              <Music className="w-5 h-5 text-accent-primary" />
              <div>
                <h3 className="font-headline font-bold text-sm text-text-primary">
                  {t.debateMusic}
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {t.debateMusicDesc}
                </p>
              </div>
            </div>

            {previewingTrackId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-primary/20 text-accent-primary text-[10px] font-code font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-ping" />
                Escuchando muestra
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {DEBATE_MUSIC_TRACKS.map((track) => {
              const isSelected = preferences.debateMusicTrack === track.id;
              const isPreviewing = previewingTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectDebateTrack(track.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-accent-primary/10 border-accent-primary shadow-[0_0_16px_rgba(0,229,160,0.18)]'
                      : 'bg-canvas/50 border-elevated/70 hover:border-elevated hover:bg-elevated/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-accent-primary/20 text-accent-primary'
                          : 'bg-elevated/80 text-text-secondary'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Music className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-headline font-bold text-xs text-text-primary truncate">
                          {track.title}
                        </h4>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-elevated/80 font-code text-text-secondary shrink-0">
                          {track.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {track.type !== 'none' && (
                    <button
                      type="button"
                      onClick={(e) => handleTogglePreview(e, track.id)}
                      className={`p-2 rounded-lg border transition-all shrink-0 ${
                        isPreviewing
                          ? 'bg-accent-primary text-canvas border-accent-primary shadow-[0_0_12px_rgba(0,229,160,0.4)]'
                          : 'bg-elevated/60 text-text-secondary border-elevated hover:text-text-primary hover:border-accent-primary/50'
                      }`}
                      title={isPreviewing ? 'Detener muestra' : 'Escuchar muestra'}
                    >
                      {isPreviewing ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* =========================================================================
            4. SECCIÓN: HERRAMIENTAS DE PARTIDA & HARDWARE
            ========================================================================= */}
        <Card variant="default" className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-accent-primary" />
            <h3 className="font-headline font-bold text-sm text-text-primary">
              {t.gameplayTools}
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            {/* Haptic Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-canvas/50 border border-elevated">
              <div className="flex items-center gap-3">
                <Vibrate className="w-4 h-4 text-text-secondary" />
                <div>
                  <h4 className="font-headline font-bold text-xs text-text-primary">
                    {t.haptics}
                  </h4>
                  <p className="text-[11px] text-text-secondary">{t.hapticsDesc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioManager.playSfx('tap');
                  updatePreferences({ haptics: !preferences.haptics });
                  if (!preferences.haptics && 'vibrate' in navigator) {
                    navigator.vibrate(60);
                  }
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  preferences.haptics ? 'bg-accent-primary' : 'bg-elevated'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-canvas absolute top-1 transition-transform ${
                    preferences.haptics ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Screen Wake Lock Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-canvas/50 border border-elevated">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-text-secondary" />
                <div>
                  <h4 className="font-headline font-bold text-xs text-text-primary">
                    {t.wakeLock}
                  </h4>
                  <p className="text-[11px] text-text-secondary">{t.wakeLockDesc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioManager.playSfx('tap');
                  updatePreferences({ wakeLockEnabled: !preferences.wakeLockEnabled });
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  preferences.wakeLockEnabled ? 'bg-accent-primary' : 'bg-elevated'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-canvas absolute top-1 transition-transform ${
                    preferences.wakeLockEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* =========================================================================
            5. SECCIÓN: HISTORIAL Y RESTABLECIMIENTO
            ========================================================================= */}
        <Card variant="default" className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-accent-primary" />
            <h3 className="font-headline font-bold text-sm text-text-primary">
              {t.historyTitle}
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-canvas/50 border border-elevated">
            <div>
              <p className="font-code text-xs text-accent-primary font-bold">
                {usedWordsHistory.length} {t.wordsUsed}
              </p>
              <p className="text-[11px] text-text-secondary">
                Garantiza que ninguna palabra se repita entre rondas
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsClearHistoryModalOpen(true)}
              disabled={usedWordsHistory.length === 0}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              {t.clearHistory}
            </Button>
          </div>
        </Card>

        {/* =========================================================================
            6. SECCIÓN: INFORMACIÓN & PWA
            ========================================================================= */}
        <Card variant="default" className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-accent-primary" />
              <div>
                <h3 className="font-headline font-bold text-sm text-text-primary">
                  {t.offlineReady}
                </h3>
                <p className="text-xs text-text-secondary">{t.offlineDesc}</p>
              </div>
            </div>

            <span className="font-code text-xs px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              v1.2.0 P&amp;P
            </span>
          </div>

          {canInstall && (
            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                onClick={promptInstall}
                leftIcon={<Download className="w-4 h-4" />}
              >
                {t.installApp}
              </Button>
            </div>
          )}

          {isInstalled && (
            <p className="text-xs text-accent-primary font-semibold flex items-center gap-1.5 pt-1">
              <Check className="w-3.5 h-3.5" />
              {t.installed}
            </p>
          )}
        </Card>

        {/* =========================================================================
            7. ZONA DE PELIGRO: RESET DE FÁBRICA
            ========================================================================= */}
        <div className="p-4 rounded-xl border border-accent-impostor/30 bg-accent-impostor/5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-headline font-bold text-xs text-accent-impostor uppercase tracking-wider">
                {t.dangerZone}
              </h4>
              <p className="text-xs text-text-secondary">
                {t.factoryResetDesc}
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsResetAllModalOpen(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              {t.factoryReset}
            </Button>
          </div>
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      <Modal
        isOpen={isClearHistoryModalOpen}
        onClose={() => setIsClearHistoryModalOpen(false)}
        title={t.clearHistory}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-text-secondary">
            {t.clearHistoryConfirm}
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsClearHistoryModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearHistoryConfirm}
            >
              Confirmar Reinicio
            </Button>
          </div>
        </div>
      </Modal>

      {/* Factory Reset Modal */}
      <Modal
        isOpen={isResetAllModalOpen}
        onClose={() => setIsResetAllModalOpen(false)}
        title={t.factoryReset}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-accent-impostor font-medium">
            {t.factoryResetConfirm}
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsResetAllModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetAllConfirm}
            >
              Sí, Restablecer Todo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
