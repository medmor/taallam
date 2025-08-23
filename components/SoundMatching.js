'use client'
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Box, Grid, Button, Typography, Paper } from '@mui/material';
import WinOverlay from './WinOverlay';
import { playSfx, preloadSfx } from '@/lib/sfx';

// items: array of objects { name, enName, image, sound, enSound }
export default function SoundMatching({ items = [], count = 4, language = 'ar' }) {
  // only use items that have itemSound (external sound asset)
  const availableItems = useMemo(() => (items || []).filter(i => i.itemSound), [items]);
  const rounds = Math.min(count, availableItems.length);
  const [pool, setPool] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const audioMap = useRef({});
  const isPlaying = useRef(false);
  const [audioReady, setAudioReady] = useState(false);

  // pick random sample from availableItems
  useEffect(() => {
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
    const selection = shuffled.slice(0, rounds);
    setPool(selection);
    setRoundIndex(0);
    setScore(0);
    setFinished(false);
    setFeedback(null);
    setTargetIndex(selection.length ? Math.floor(Math.random() * selection.length) : 0);
  }, [availableItems, rounds]);

  useEffect(() => { preloadSfx(); }, []);

  // preload audio for pool (do not change targetIndex here — initial target is set
  // when the pool is created so we don't trigger multiple autoplay events)
  useEffect(() => {
    if (!pool.length) return;
  setAudioReady(false);
  audioMap.current = {};
    pool.forEach(it => {
      // prefer itemSound if present (user-provided higher quality files)
      const url = it.itemSound || (language === 'en' ? it.enSound : it.sound) || it.sound || it.enSound || null;
      if (!url) return;
      try {
        const a = new Audio(url);
        a.preload = 'auto';
        // ignore promise hiccups; browsers may block until gesture
        audioMap.current[it.enName || it.name] = a;
      } catch (e) {
        // ignore
      }
    });
  // mark audio as ready (we attempted to create Audio objects)
  setAudioReady(true);
  }, [pool, language]);

  // play target sound
  const playTargetSound = () => {
    if (!pool || pool.length === 0) return;
    if (isPlaying.current) return;
    const idx = Math.min(targetIndex, pool.length - 1);
    const key = (pool[idx] && (pool[idx].enName || pool[idx].name));
    const audio = audioMap.current[key];
    if (audio) {
      try {
        isPlaying.current = true;
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => { isPlaying.current = false; }).catch(() => { isPlaying.current = false; });
        } else {
          // older browsers may not return a promise
          isPlaying.current = false;
        }
        audio.onended = () => { isPlaying.current = false; };
      } catch (e) {
        isPlaying.current = false;
      }
    }
  };

  useEffect(() => {
    if (audioReady && pool.length) playTargetSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex, pool, audioReady]);

  const handleSelect = (item) => {
    if (finished) return;
    const targetKey = pool[targetIndex] && (pool[targetIndex].enName || pool[targetIndex].name);
    const itemKey = item.enName || item.name;
    const correct = itemKey === targetKey;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
  try { playSfx(correct ? 'correct' : 'wrong'); } catch (e) {}
    // brief delay then next round or finish
    setTimeout(() => {
      setFeedback(null);
      if (roundIndex + 1 >= rounds) {
        setFinished(true);
  playSfx('win');
      } else {
        setRoundIndex(r => r + 1);
  // set new target for next round and autoplay it
  const nextIndex = Math.floor(Math.random() * pool.length);
  setTargetIndex(nextIndex);
  setTimeout(() => playTargetSound(), 120);
      }
    }, 700);
  };

  const handleNext = () => {
  playSfx('click');
    // restart using availableItems
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
    const selection = shuffled.slice(0, rounds);
    setPool(selection);
    setRoundIndex(0);
  const startIdx = selection.length ? Math.floor(Math.random() * selection.length) : 0;
  setTargetIndex(startIdx);
  setTimeout(() => playTargetSound(), 120);
    setScore(0);
    setFinished(false);
    setFeedback(null);
  };

  if (!availableItems || availableItems.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>لا توجد عناصر للعبة (لم يتم إضافة ملفات صوتية بعد).</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ width: '100%', maxWidth: 960, p: 3, position: 'relative' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 1 }}>لعبة التعرف على الأصوات</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>استمع ثم اختر الصورة المطابقة للصوت.</Typography>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item>
              <Button variant="contained" onClick={() => { playSfx('click'); playTargetSound(); }}>▶️ تشغيل الصوت</Button>
            </Grid>
            <Grid item>
              <Typography>الجولة: {roundIndex + 1} / {rounds}</Typography>
            </Grid>
            <Grid item>
              <Typography>النتيجة: {score}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} justifyContent="center">
          {pool.map((it, idx) => (
            <Grid item xs={6} sm={4} md={3} key={(it.enName||it.name)+idx}>
              <Paper
                onClick={() => handleSelect(it)}
                sx={{
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'transform 0.12s ease, box-shadow 0.12s',
                  '&:hover': { transform: 'translateY(-6px) scale(1.02)', boxShadow: 3 },
                  border: feedback && idx === targetIndex ? '2px solid rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <Box
                  component="img"
                  src={it.image || '/globe.svg'}
                  alt={it.enName || it.name}
                  sx={{ width: { xs: 110, sm: 120 }, height: { xs: 110, sm: 120 }, objectFit: 'cover', borderRadius: 2 }}
                />
                <Typography sx={{ mt: 0.5 }}>{it.enName || it.name}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          {finished ? (
            <Paper sx={{ p: 2, display: 'inline-block' }}>
              <Typography variant="h6">النتيجة: {score} / {rounds}</Typography>
              <Button variant="contained" sx={{ mt: 1 }} onClick={handleNext}>إعادة اللعب</Button>
            </Paper>
          ) : (
            feedback && (
              <Typography sx={{ mt: 1 }}>{feedback === 'correct' ? 'صحيح! 🎉' : 'حاول مرة أخرى'}</Typography>
            )
          )}
        </Box>
        {finished && (
          <WinOverlay boardPixel={480} moves={score} errors={rounds - score} onPlayAgain={handleNext} />
        )}
      </Paper>
    </Box>
  );
}
