import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { AppShell } from './components/layout/AppShell';
import { HomeScreen } from './screens/HomeScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PassAndPlayScreen } from './screens/PassAndPlayScreen';
import { ActiveRoundScreen } from './screens/ActiveRoundScreen';
import { ResolutionScreen } from './screens/ResolutionScreen';
import { audioManager } from './audio/audioManager';
import { useWakeLock } from './hooks/useWakeLock';

export function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);
  const wakeLockEnabled = useGameStore((state) => state.preferences.wakeLockEnabled);

  // Keep screen awake during critical Pass & Play and Active Round gameplay if enabled
  const isGameActive = (currentScreen === 'PASS_AND_PLAY' || currentScreen === 'ACTIVE_ROUND') && wakeLockEnabled;
  useWakeLock(isGameActive);

  // Prevent accidental tab closure or navigation during active gameplay
  useEffect(() => {
    if (!isGameActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGameActive]);

  // Global listener for seamless AudioContext unlocking on initial user interaction
  useEffect(() => {
    const handleFirstUserGesture = () => {
      audioManager.unlockAudio();
    };

    window.addEventListener('pointerdown', handleFirstUserGesture, { once: true });
    window.addEventListener('keydown', handleFirstUserGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstUserGesture);
      window.removeEventListener('keydown', handleFirstUserGesture);
    };
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen />;
      case 'LOBBY':
        return <LobbyScreen />;
      case 'CATEGORIES':
        return <CategoriesScreen />;
      case 'SETTINGS':
        return <SettingsScreen />;
      case 'PASS_AND_PLAY':
        return <PassAndPlayScreen />;
      case 'ACTIVE_ROUND':
        return <ActiveRoundScreen />;
      case 'RESOLUTION':
        return <ResolutionScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Expand container in LOBBY, CATEGORIES or SETTINGS to allow comfortable multi-column layout on >=768px
  const isWideScreen = currentScreen === 'LOBBY' || currentScreen === 'CATEGORIES' || currentScreen === 'SETTINGS';

  return <AppShell wide={isWideScreen}>{renderScreen()}</AppShell>;
}

export default App;
