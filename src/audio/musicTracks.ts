export interface DebateMusicTrack {
  id: string;
  title: string;
  artist: string;
  src?: string;
  type: 'file' | 'procedural' | 'none';
  tag: string;
}

export const DEBATE_MUSIC_TRACKS: DebateMusicTrack[] = [
  {
    id: 'among-us-drip',
    title: 'Among Us Drip',
    artist: 'Trap Remix (Amogus Meme)',
    src: '/music/among-us-drip.mp3',
    type: 'file',
    tag: 'Popular',
  },
  {
    id: 'undertale-shop',
    title: 'Shop Theme',
    artist: 'Toby Fox (Undertale OST)',
    src: '/music/undertale-shop.mp3',
    type: 'file',
    tag: 'Tranquilo',
  },
  {
    id: 'repulsive-forgotten',
    title: 'Forgotten',
    artist: 'REPULSIVE (Dark Ambient)',
    src: '/music/repulsive-forgotten.mp3',
    type: 'file',
    tag: 'Suspenso',
  },
  {
    id: 'the-croods',
    title: 'Smash and Grab',
    artist: 'The Croods (Tension Run)',
    src: '/music/the-croods.mp3',
    type: 'file',
    tag: 'Caos',
  },
  {
    id: 'smash-bros',
    title: 'Pop Land Stage',
    artist: 'Super Smash Bros OST',
    src: '/music/smash-bros.mp3',
    type: 'file',
    tag: 'Retro',
  },
  {
    id: 'subway-surfers',
    title: 'Subway Surfers',
    artist: 'Sped Up Bassline Loop',
    src: '/music/subway-surfers.mp3',
    type: 'file',
    tag: 'Rápido',
  },
  {
    id: 'ambient',
    title: 'Sintetizador Procedural',
    artist: 'Web Audio API Synth',
    type: 'procedural',
    tag: 'Original',
  },
  {
    id: 'none',
    title: 'Silencio Total',
    artist: 'Sin música de fondo',
    type: 'none',
    tag: 'Silencio',
  },
];

