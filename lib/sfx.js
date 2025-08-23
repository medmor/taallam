const sounds = {
  click: '/sounds/effects/click.mp3',
  correct: '/sounds/effects/correct.mp3',
  wrong: '/sounds/effects/wrong.mp3',
  win: '/sounds/effects/win.mp3',
  flip: '/sounds/effects/flip.mp3',
  slide: '/sounds/effects/slide.mp3'
};

const audioMap = {};
let muted = false; // module-level cache (will fall back to localStorage when queried)

function readMutedFromStorage() {
  try {
    const v = localStorage.getItem('sfxMuted');
    if (v !== null) return JSON.parse(v);
  } catch (e) {}
  return undefined;
}

export function preloadSfx() {
  Object.keys(sounds).forEach(k => {
    try {
      const a = new Audio(sounds[k]);
      a.preload = 'auto';
      audioMap[k] = a;
    } catch (e) {
      // ignore
    }
  });
}

export function playSfx(name) {
  // respect global mute
  try {
    const stored = readMutedFromStorage();
    if (stored !== undefined) muted = !!stored;
  } catch (e) {}
  if (muted) return;
  const a = audioMap[name];
  if (!a) return;
  try {
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch (e) {}
}

export function setMuted(val) {
  muted = !!val;
  try { localStorage.setItem('sfxMuted', JSON.stringify(muted)); } catch (e) {}
}

export function isMuted() {
  try {
    const stored = readMutedFromStorage();
    if (stored !== undefined) return !!stored;
  } catch (e) {}
  return !!muted;
}

export default { preloadSfx, playSfx, setMuted, isMuted };
