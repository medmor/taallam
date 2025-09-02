"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Switch, FormControlLabel } from '@mui/material';
import { preloadSfx, playSfx } from '@/lib/sfx';

// Simon Says game (visual pads with sounds).
// Behavior:
// - Power toggle, Start/Restart, Strict mode (reset on mistake) or replay sequence on mistake
// - Sequence grows by one on each successful reproduction
// - Playback speed increases slightly with sequence length
export default function SequenceBuilder({ pool: propPool = null }) {
    const defaultPool = [
        // frequencies chosen to be musically distinct (A4, C#5, E5, F4)
        { id: 'red', color: '#ef4444', sound: 'click', freq: 440.00 },
        { id: 'yellow', color: '#f59e0b', sound: 'click', freq: 554.37 },
        { id: 'green', color: '#10b981', sound: 'click', freq: 659.25 },
        { id: 'blue', color: '#3b82f6', sound: 'click', freq: 349.23 }
    ];

    const pool = propPool && propPool.length >= 2 ? propPool : defaultPool;

    const [sequence, setSequence] = useState([]); // array of indices
    const [showing, setShowing] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [message, setMessage] = useState('');
    const [running, setRunning] = useState(false);
    const [longest, setLongest] = useState(0);
        const [powered, setPowered] = useState(false);
    const [strict, setStrict] = useState(false);
    const cancelRef = useRef(false);
    const lastPressRef = useRef(0);

    const audioCtxRef = useRef(null);
    const masterGainRef = useRef(null);

    // Initialize AudioContext lazily. Call before first sound; resume when needed.
    const initAudio = () => {
        try {
            if (!audioCtxRef.current) {
                const C = window.AudioContext || window.webkitAudioContext;
                audioCtxRef.current = new C();
                const g = audioCtxRef.current.createGain();
                // increase master gain for louder tones
                g.gain.value = 0.6;
                g.connect(audioCtxRef.current.destination);
                masterGainRef.current = g;
            }
        } catch (e) {
            // Audio not supported
            audioCtxRef.current = null;
            masterGainRef.current = null;
        }
    };

    // Play a simple tone using Web Audio API. duration in ms.
    const playTone = (freq = 440, duration = 300) => {
        try {
            initAudio();
            const ctx = audioCtxRef.current;
            const g = masterGainRef.current;
            if (!ctx || !g) {
                // fallback
                try { playSfx('click'); } catch (e) { }
                return;
            }
            // resume on user gesture if suspended
            if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
                ctx.resume().catch(() => { });
            }
            const o = ctx.createOscillator();
            o.type = 'triangle';
            o.frequency.value = freq;
            const localGain = ctx.createGain();
            localGain.gain.setValueAtTime(0, ctx.currentTime);
            localGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.01);
            localGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
            o.connect(localGain);
            localGain.connect(g);
            o.start();
            o.stop(ctx.currentTime + duration / 1000 + 0.02);
        } catch (e) {
            try { playSfx('click'); } catch (er) { }
        }
    };

    useEffect(() => { try { preloadSfx(); } catch (e) { } }, []);

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // play a provided sequence (does not modify state)
    const playSequence = async (s) => {
        if (!s || s.length === 0) return;
        cancelRef.current = false;
        setShowing(true);
        setMessage('');
        setPlayerIndex(0);
        const baseDelay = Math.max(300, 700 - (s.length - 1) * 25);
        for (let i = 0; i < s.length; i++) {
            if (cancelRef.current) break;
            const idx = s[i];
            setHighlight(idx);
            try { playTone(pool[idx].freq || 440, baseDelay - 60); } catch (e) { try { playSfx(pool[idx].sound || 'click'); } catch (er) { } }
            await delay(baseDelay);
            setHighlight(-1);
            await delay(140);
        }
        setShowing(false);
    };

    // add one random tile to sequence and play the new sequence
    const addAndPlay = async () => {
        if (!powered) return;
        const next = Math.floor(Math.random() * pool.length);
        const ns = [...sequence, next];
        setSequence(ns);
        setLongest(l => Math.max(l, ns.length));
        await delay(180);
        await playSequence(ns);
    };

    // start / restart the game fresh
    const startNewGame = async () => {
        if (!powered) return;
        setMessage('');
        setSequence([]);
        setPlayerIndex(0);
        await delay(120);
        await addAndPlay();
    };

        // do not auto-start audio on mount to avoid browser autoplay blocking;
        // starting the game must happen with a user gesture (power/start button).

    const handleTileClick = async (idx) => {
        if (!powered || showing || running) return;
        setRunning(true);
        setHighlight(idx);
        try { playTone(pool[idx].freq || 440, 600); } catch (e) { try { playSfx(pool[idx].sound || 'click'); } catch (er) { } }
        await delay(200);
        setHighlight(-1);
        setRunning(false);

        const expected = sequence[playerIndex];
        if (idx !== expected) {
            // mistake
            setLongest(l => Math.max(l, sequence.length - 1));
            if (strict) {
                setMessage('خاطئ — إعادة البدء (وضع صارم)');
                setSequence([]);
                setPlayerIndex(0);
                setTimeout(() => addAndPlay(), 700);
            } else {
                setMessage('خاطئ — سنعيد عرض التسلسل لتجربة أخرى');
                setPlayerIndex(0);
                setTimeout(() => playSequence(sequence), 700);
            }
            return;
        }

        // correct step
        const nextIdx = playerIndex + 1;
        setPlayerIndex(nextIdx);
        if (nextIdx >= sequence.length) {
            setMessage('جيد — إضافة خطوة جديدة');
            setPlayerIndex(0);
            setTimeout(() => addAndPlay(), 600);
        }
    };

    // Unified press handler to support pointer, touch, and mouse.
    // Prevents duplicate events on some touch devices by debouncing.
    const handlePress = (e, idx) => {
        try { if (e && typeof e.preventDefault === 'function') e.preventDefault(); } catch (er) {}
        const now = Date.now();
        if (now - lastPressRef.current < 600) return; // debouce duplicate events
        lastPressRef.current = now;
        // call the existing async handler (fire-and-forget)
        void handleTileClick(idx);
    };

    const handleReplay = () => {
        if (!powered || showing || running) return;
        playSequence(sequence);
    };

    return (
        <Paper elevation={4} sx={{ width: '100%', maxWidth: 640, mx: 'auto', borderRadius: 2, background: '#fff', p: 3, boxShadow: 3 }}>
            <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>Simon Says — تذكر التسلسل وكرره</Typography>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>شاهد الترتيب ثم كرره بالضغط على الألوان بالترتيب الصحيح. فعّل الوضع الصارم لإعادة البدء عند أي خطأ.</Typography>

            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                    <Grid item>
                        <Typography>جولة: {sequence.length}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography>أعلى مستوى: {longest}</Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" onClick={handleReplay} disabled={showing || running || !powered}>اعادة العرض</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="outlined" onClick={startNewGame} disabled={!powered}>إعادة اللعب</Button>
                    </Grid>
                    <Grid item>
                        <FormControlLabel control={<Switch checked={strict} onChange={(e) => setStrict(e.target.checked)} />} label="الوضع الصارم" />
                    </Grid>
                    <Grid item>
                                                    <Button variant="contained" color={powered ? 'primary' : 'inherit'} onClick={() => {
                                                            // user gesture: initialize audio and start/stop
                                                            if (!powered) {
                                                                    try { initAudio(); } catch (e) {}
                                                                    addAndPlay();
                                                                    setPowered(true);
                                                            } else {
                                                                    setPowered(false);
                                                                    setSequence([]);
                                                                    setMessage('');
                                                            }
                                                    }}>{powered ? 'إيقاف التشغيل' : 'تشغيل'}</Button>
                    </Grid>
                    
                </Grid>
            </Paper>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${pool.length}, 1fr)`, gap: 12 }}>
                {pool.map((t, i) => (
                    <div key={t.id}
                        onPointerDown={(e) => handlePress(e, i)}
                        onTouchStart={(e) => handlePress(e, i)}
                        onMouseDown={(e) => handlePress(e, i)}
                        style={{
                        height: 110,
                        borderRadius: 10,
                        background: t.color,
                        boxShadow: highlight === i ? '0 6px 18px rgba(0,0,0,0.28)' : '0 2px 6px rgba(0,0,0,0.12)',
                        transform: highlight === i ? 'translateY(-6px) scale(1.02)' : 'none',
                        transition: 'transform 140ms ease, box-shadow 140ms ease',
                        cursor: (!powered || showing) ? 'default' : 'pointer'
                    }} />
                ))}
            </div>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography sx={{ minHeight: 24 }}>{message}</Typography>
            </Box>
    </Paper>
    );
}
