const sounds = {
  click: '/sounds/effects/click.mp3',
  jump: '/sounds/effects/jump.mp3',
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

// Try to unlock audio by playing a short sound on first user gesture.
export function unlockSfxOnGesture() {
  if (typeof window === 'undefined') return;
  const handler = () => {
    try {
      // prefer a soft click if available
      const name = Object.keys(sounds).includes('click') ? 'click' : Object.keys(sounds)[0];
      const a = audioMap[name] || new Audio(sounds[name]);
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {
      try { console.warn('unlockSfxOnGesture failed', e); } catch (er) {}
    }
    try { window.removeEventListener('pointerdown', handler); window.removeEventListener('keydown', handler); } catch (e) {}
  };
  try { window.addEventListener('pointerdown', handler, { once: true }); window.addEventListener('keydown', handler, { once: true }); } catch (e) { }
}

export function playSfx(name) {
  // respect global mute
  try {
    const stored = readMutedFromStorage();
    if (stored !== undefined) muted = !!stored;
  } catch (e) {}
  if (muted) return;
  // try to use preloaded audio, else create on-demand from sounds map
  let a = audioMap[name];
  if (!a) {
    const src = sounds[name];
    if (!src) {
      // no mapping for this sound name
      // console.warn to help debugging
      try { console.warn('playSfx: missing sound mapping for', name); } catch (e) {}
      return;
    }
    try {
      a = new Audio(src);
      a.preload = 'auto';
      audioMap[name] = a;
    } catch (e) {
      try { console.warn('playSfx: failed to create Audio for', name, src, e); } catch (er) {}
      return;
    }
  }
  try {
    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(err => {
      // log playback errors for debugging (autoplay policy, not allowed, etc.)
      try { console.warn('playSfx: playback failed for', name, err); } catch (e) {}
    });
  } catch (e) {
    try { console.warn('playSfx: error while playing', name, e); } catch (er) {}
  }
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
