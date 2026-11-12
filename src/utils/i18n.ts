import type { GameLanguage } from '../types/game';

export interface Translations {
  dock: {
    home: string;
    categories: string;
    rules: string;
    sound: string;
    settings: string;
  };
  settings: {
    title: string;
    subtitle: string;
    language: string;
    languageDesc: string;
    theme: string;
    themeDesc: string;
    audioTitle: string;
    sfx: string;
    music: string;
    mute: string;
    gameplayTools: string;
    haptics: string;
    hapticsDesc: string;
    wakeLock: string;
    wakeLockDesc: string;
    historyTitle: string;
    wordsUsed: string;
    clearHistory: string;
    clearHistoryConfirm: string;
    clearHistorySuccess: string;
    dangerZone: string;
    factoryReset: string;
    factoryResetDesc: string;
    factoryResetConfirm: string;
    offlineReady: string;
    offlineDesc: string;
    installApp: string;
    installed: string;
    version: string;
    backToGame: string;
  };
  themes: {
    midnight: { name: string; desc: string };
    cyberpunk: { name: string; desc: string };
    crimson: { name: string; desc: string };
    amethyst: { name: string; desc: string };
  };
  rules: {
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    chaosTitle: string;
    chaosDesc: string;
    gotIt: string;
  };
}

export const TRANSLATIONS: Record<GameLanguage, Translations> = {
  es: {
    dock: {
      home: 'Inicio',
      categories: 'Categorías',
      rules: 'Reglas',
      sound: 'Sonido',
      settings: 'Ajustes',
    },
    settings: {
      title: 'Ajustes del Juego',
      subtitle: 'Personaliza tu experiencia de deducción, estilo visual y audio',
      language: 'Idioma de la Interfaz',
      languageDesc: 'Cambia entre Español e Inglés',
      theme: 'Paleta de Colores y Ambiente',
      themeDesc: 'Cambia el aspecto visual y el shader interactivo de fondo',
      audioTitle: 'Audio y Música',
      sfx: 'Efectos de Sonido (SFX)',
      music: 'Música Ambiental (BGM)',
      mute: 'Silenciar todo el audio',
      gameplayTools: 'Herramientas de Partida',
      haptics: 'Vibración y Respuesta Háptica',
      hapticsDesc: 'Vibrar al revelar rol y al pasar el dispositivo en móviles',
      wakeLock: 'Mantener Pantalla Activa',
      wakeLockDesc: 'Evita que el teléfono se suspenda o apague durante el juego',
      historyTitle: 'Historial Anti-Repetición',
      wordsUsed: 'palabras registradas en el historial',
      clearHistory: 'Limpiar Historial de Palabras',
      clearHistoryConfirm: '¿Deseas reiniciar el historial de palabras usadas?',
      clearHistorySuccess: 'Historial de palabras restablecido',
      dangerZone: 'Zona de Restablecimiento',
      factoryReset: 'Restablecer Valores de Fábrica',
      factoryResetDesc: 'Borra categorías personalizadas y restaura los ajustes originales',
      factoryResetConfirm: '¿Seguro que deseas restablecer todos los datos a valores de fábrica? Esta acción no se puede deshacer.',
      offlineReady: 'Juego 100% Offline',
      offlineDesc: 'Sin conexión a internet requerida, sin cuentas ni servidores',
      installApp: 'Instalar Aplicación en Dispositivo',
      installed: 'Aplicación Instalada (PWA Activa)',
      version: 'Versión',
      backToGame: 'Volver a la Mesa',
    },
    themes: {
      midnight: {
        name: 'Midnight Mystery',
        desc: 'Verde esmeralda y carmesí sobre noche profunda (Oficial)',
      },
      cyberpunk: {
        name: 'Cyberpunk Neon',
        desc: 'Cian eléctrico y magenta sobre obsidiana futurista',
      },
      crimson: {
        name: 'Crimson Noir',
        desc: 'Rojo sangre y ámbar dorado con sombras oscuras',
      },
      amethyst: {
        name: 'Amethyst Twilight',
        desc: 'Lavanda místico y aguamarina sobre terciopelo',
      },
    },
    rules: {
      title: '¿Cómo se Juega a IMPOSTOR?',
      step1Title: '1. Pasa el Dispositivo',
      step1Desc: 'Cada jugador toma el teléfono en privado y mantiene presionada la tarjeta para ver su rol en secreto. Los inocentes verán la palabra clave secreta; el impostor solo verá la categoría general.',
      step2Title: '2. Ronda de Pistas',
      step2Desc: 'Por turnos, cada jugador dice UNA sola palabra como pista relacionada con la clave secreta. No digas la palabra exacta ni pistas demasiado obvias.',
      step3Title: '3. Camuflaje y Deducción',
      step3Desc: 'El impostor no conoce la palabra secreta. Debe prestar atención a las pistas de los demás para deducirla y decir una pista creíble sin levantar sospechas.',
      step4Title: '4. Debate y Votación',
      step4Desc: 'Al terminar el temporizador o las rondas de pistas, el grupo debate y vota quién es el impostor. ¡Si descubren al impostor, los inocentes ganan; pero si el impostor adivina la palabra, gana el impostor!',
      chaosTitle: 'Modo Caos (Opcional)',
      chaosDesc: 'Agrega eventos sorpresa: inicio invertido, impostores dobles o pistas misteriosas para sacudir las partidas de veteranos.',
      gotIt: '¡Entendido, vamos a jugar!',
    },
  },
  en: {
    dock: {
      home: 'Home',
      categories: 'Categories',
      rules: 'Rules',
      sound: 'Sound',
      settings: 'Settings',
    },
    settings: {
      title: 'Game Settings',
      subtitle: 'Customize your deduction experience, visual theme and audio',
      language: 'Interface Language',
      languageDesc: 'Switch between Spanish and English',
      theme: 'Color Palette & Ambience',
      themeDesc: 'Change visual styling and the interactive background shader',
      audioTitle: 'Audio & Music',
      sfx: 'Sound Effects (SFX)',
      music: 'Ambient Music (BGM)',
      mute: 'Mute all audio',
      gameplayTools: 'Gameplay Tools',
      haptics: 'Haptic Feedback & Vibration',
      hapticsDesc: 'Vibrate on role reveal and device hand-off on mobile',
      wakeLock: 'Keep Screen Awake',
      wakeLockDesc: 'Prevent phone from dimming or locking during rounds',
      historyTitle: 'Anti-Repeat History',
      wordsUsed: 'words recorded in history',
      clearHistory: 'Clear Word History',
      clearHistoryConfirm: 'Do you want to reset the used words history?',
      clearHistorySuccess: 'Word history cleared',
      dangerZone: 'Reset Zone',
      factoryReset: 'Reset to Factory Defaults',
      factoryResetDesc: 'Deletes custom categories and restores original defaults',
      factoryResetConfirm: 'Are you sure you want to reset all game data to factory defaults? This cannot be undone.',
      offlineReady: '100% Offline Game',
      offlineDesc: 'No internet required, zero accounts, zero servers',
      installApp: 'Install App on Device',
      installed: 'App Installed (PWA Active)',
      version: 'Version',
      backToGame: 'Back to Game',
    },
    themes: {
      midnight: {
        name: 'Midnight Mystery',
        desc: 'Emerald green & crimson on deep midnight (Official)',
      },
      cyberpunk: {
        name: 'Cyberpunk Neon',
        desc: 'Electric cyan & neon magenta on dark obsidian',
      },
      crimson: {
        name: 'Crimson Noir',
        desc: 'Blood red & ember gold with dark shadows',
      },
      amethyst: {
        name: 'Amethyst Twilight',
        desc: 'Mystic lavender & aqua cyan on deep velvet',
      },
    },
    rules: {
      title: 'How to Play IMPOSTOR?',
      step1Title: '1. Pass the Device',
      step1Desc: 'Each player takes the phone in private and holds down the card to secretly view their role. Innocents see the secret keyword; the impostor only sees the category.',
      step2Title: '2. Clue Round',
      step2Desc: 'In turns, each player says ONE single clue word related to the secret keyword. Do not say the exact word or clues that are too obvious.',
      step3Title: '3. Bluffing & Deduction',
      step3Desc: 'The impostor does not know the secret word. They must listen to clues from others to deduce it and give a believable clue without being caught.',
      step4Title: '4. Debate & Vote',
      step4Desc: 'When the timer runs out or everyone has spoken, the group debates and votes on who the impostor is. If you catch them, innocents win; if the impostor guesses the word, they win!',
      chaosTitle: 'Chaos Mode (Optional)',
      chaosDesc: 'Adds surprise events: reversed turns, double impostors, or mystery modifiers to spice up games for veterans.',
      gotIt: 'Got it, let\'s play!',
    },
  },
};

export const THEME_CONFIG = {
  midnight: {
    id: 'midnight' as const,
    name: 'Midnight Mystery',
    primary: '#00E5A0',
    secondary: '#FF3B5C',
    canvas: '#0B0E14',
    balatro: {
      color1: '#00E5A0',
      color2: '#FF3B5C',
      color3: '#05070A',
    },
  },
  cyberpunk: {
    id: 'cyberpunk' as const,
    name: 'Cyberpunk Neon',
    primary: '#00F0FF',
    secondary: '#FF007F',
    canvas: '#080712',
    balatro: {
      color1: '#00F0FF',
      color2: '#FF007F',
      color3: '#04030A',
    },
  },
  crimson: {
    id: 'crimson' as const,
    name: 'Crimson Noir',
    primary: '#FF3355',
    secondary: '#FF9500',
    canvas: '#0E0608',
    balatro: {
      color1: '#FF3355',
      color2: '#FF9500',
      color3: '#070204',
    },
  },
  amethyst: {
    id: 'amethyst' as const,
    name: 'Amethyst Twilight',
    primary: '#B388FF',
    secondary: '#00E5FF',
    canvas: '#0B0716',
    balatro: {
      color1: '#B388FF',
      color2: '#00E5FF',
      color3: '#06030E',
    },
  },
};

