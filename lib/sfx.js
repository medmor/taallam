const sounds = {
  click: '/sounds/effects/click.mp3',
  jump: '/sounds/effects/jump.mp3',
  correct: '/sounds/effects/correct.mp3',
  wrong: '/sounds/effects/wrong.mp3',
  hit: '/sounds/effects/wrong.mp3',
  death: '/sounds/effects/wrong.mp3',
  win: '/sounds/effects/win.mp3',
  flip: '/sounds/effects/flip.mp3',
  slide: '/sounds/effects/slide.mp3'
};

// background music loops (default paths — replace or add more files in public/sounds/loops)
const musicLoops = [
  '/sounds/loops/loop1.mp3',
  '/sounds/loops/loop2.mp3',
  '/sounds/loops/loop3.mp3'
];

const audioMap = {};
let muted = false; // module-level cache (will fall back to localStorage when queried)
let _currentMusic = null;
let _currentMusicSrc = null;
let _musicVolume = 0.45;
let _musicPaused = false;
let _musicMuted = false;

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

// Music loop control
// helper: linear fade between volumes on an HTMLAudio element
function _fadeAudio(audio, from, to, ms, onDone) {
  if (!audio || typeof audio.volume === 'undefined') { if (onDone) onDone(); return; }
  const steps = Math.max(1, Math.floor(ms / 50));
  const delta = (to - from) / steps;
  let cur = from;
  audio.volume = Math.max(0, Math.min(1, from));
  let i = 0;
  const iv = setInterval(() => {
    i += 1;
    cur += delta;
    audio.volume = Math.max(0, Math.min(1, cur));
    if (i >= steps) {
      clearInterval(iv);
      audio.volume = Math.max(0, Math.min(1, to));
      if (onDone) onDone();
    }
  }, 50);
}

export function startMusicLoop(list, opts = {}) {
  if (typeof window === 'undefined') return;
  try {
    const pool = (Array.isArray(list) && list.length) ? list : musicLoops;
    if (!pool || pool.length === 0) return;
    // pick random but avoid picking same as current if possible
    let src = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && _currentMusicSrc) {
      // try to pick a different one up to 3 attempts
      for (let k = 0; k < 3; k++) {
        const cand = pool[Math.floor(Math.random() * pool.length)];
        if (cand !== _currentMusicSrc) { src = cand; break; }
      }
    }

    // if already playing this src and not forced, leave it
    if (_currentMusic && _currentMusicSrc === src && !opts.force) {
      // if muted state changed, ensure volume
      if (_musicMuted) _currentMusic.volume = 0; else _currentMusic.volume = _musicVolume;
      return;
    }

    const newAudio = audioMap[src] || new Audio(src);
    newAudio.loop = true;
    newAudio.preload = 'auto';
    audioMap[src] = newAudio;
    // if there is a current music, crossfade
    const fadeMs = typeof opts.fadeMs === 'number' ? opts.fadeMs : 800;
    if (_currentMusic && _currentMusic !== newAudio) {
      try {
        // start new audio at 0
        try { newAudio.volume = 0; } catch (e) {}
        const p = newAudio.play(); if (p && typeof p.catch === 'function') p.catch(() => {});
        // fade in new and fade out old
        _fadeAudio(newAudio, 0, _musicMuted ? 0 : _musicVolume, fadeMs, () => {});
        _fadeAudio(_currentMusic, _currentMusic.volume || _musicVolume, 0, fadeMs, () => { try { _currentMusic.pause(); _currentMusic.currentTime = 0; } catch (e) {} });
        _currentMusic = newAudio;
        _currentMusicSrc = src;
        _musicPaused = false;
      } catch (e) { try { newAudio.play(); _currentMusic = newAudio; _currentMusicSrc = src; } catch (er) {} }
    } else {
      // no current music: start new normally
      try {
        newAudio.volume = _musicMuted ? 0 : _musicVolume;
        const p = newAudio.play(); if (p && typeof p.catch === 'function') p.catch(() => {});
        _currentMusic = newAudio;
        _currentMusicSrc = src;
        _musicPaused = false;
      } catch (e) { try { console.warn('startMusicLoop play failed', e); } catch (er) {} }
    }
  } catch (e) {
    try { console.warn('startMusicLoop failed', e); } catch (er) {}
  }
}

export function pauseMusic() {
  try {
    if (_currentMusic && !_musicPaused) {
      try { _currentMusic.pause(); _musicPaused = true; } catch (e) {}
    }
  } catch (e) {}
}

export function resumeMusic() {
  try {
    if (_currentMusic && _musicPaused) {
      try { const p = _currentMusic.play(); if (p && typeof p.catch === 'function') p.catch(() => {}); _musicPaused = false; } catch (e) {}
    } else if (!_currentMusic) {
      startMusicLoop();
    }
  } catch (e) {}
}

export function stopMusicLoop() {
  try {
    if (_currentMusic) {
      try { _currentMusic.pause(); _currentMusic.currentTime = 0; } catch (e) {}
      _currentMusic = null;
      _currentMusicSrc = null;
      _musicPaused = false;
    }
  } catch (e) { }
}

export function setMusicMuted(val) {
  _musicMuted = !!val;
  try {
    if (_musicMuted) { pauseMusic(); }
    else { resumeMusic(); }
  } catch (e) {}
}

export function isMusicMuted() { return !!_musicMuted; }

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
