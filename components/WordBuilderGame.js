"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Chip, Fade, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Paper, Select, Typography, Zoom } from '@mui/material';
import Timer from './Timer';
import { vocabItems } from '@/lib/arabicData';
import { playSfx } from '@/lib/sfx';
import { GameProgressionManager, difficultyLevels, createParticleEffect, createPulseAnimation, createShakeAnimation } from '@/lib/gameEnhancements';

const LEVEL_CONFIG = { beginner: { rounds: 8 }, intermediate: { rounds: 10 }, advanced: { rounds: 12 } };

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WordBuilderGame({ level: initialLevel = 'beginner', onComplete, onBack }) {
  const [level, setLevel] = useState(initialLevel);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [finalTime, setFinalTime] = useState(null);
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [target, setTarget] = useState(null); // string
  const [pool, setPool] = useState([]); // letters to choose
  const [built, setBuilt] = useState([]); // chosen letters
  const [questionStart, setQuestionStart] = useState(Date.now());

  const particleCanvasRef = useRef(null);
  const progressManager = useRef(new GameProgressionManager('word-builder'));

  const totalRounds = LEVEL_CONFIG[level].rounds;

  useEffect(() => { resetForLevel(); }, [level]);

  const resetForLevel = () => {
    setRound(0);
    setScore(0);
    setStreak(0);
    setShowFeedback(false);
    setTimerActive(true);
    setTimerKey(k => k + 1);
    setFinalTime(null);
    nextQuestion();
  };

  const nextQuestion = () => {
    // choose a 3-4 letter word (strip tashkeel characters for building simplicity)
    const candidates = vocabItems.map(v => v.word.replace(/[ًٌٍَُِّْ]/g, '')).filter(w => w.length >= 3 && w.length <= 4);
    const w = candidates[Math.floor(Math.random() * candidates.length)];
    setTarget(w);
    setBuilt([]);
    setPool(scramble(w));
    setQuestionStart(Date.now());
  };

  const chooseLetter = (idx) => {
    const ch = pool[idx];
    setBuilt(b => [...b, ch]);
    setPool(p => p.filter((_, i) => i !== idx));
  };

  const undo = (idx) => {
    const ch = built[idx];
    setBuilt(b => b.filter((_, i) => i !== idx));
    setPool(p => [...p, ch]);
  };

  useEffect(() => {
    if (!target) return;
    if (built.join('') === target) {
      // correct
      setShowFeedback(true);
      const responseTime = Date.now() - questionStart;
      let newScore = score + 1;
      setScore(newScore);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setFeedback('✅ رائع!');
      playSfx('correct');
      createParticleEffect(particleCanvasRef.current, 'success');
      progressManager.current.updateScore(10, responseTime);
      progressManager.current.updateStreak(newStreak);
      setTimeout(() => {
        setShowFeedback(false);
        if (round + 1 >= totalRounds) {
          setTimerActive(false);
          playSfx('win');
          if (onComplete) onComplete(newScore, finalTime || 0);
          if (onBack) onBack();
          return;
        }
        setRound(r => r + 1);
        nextQuestion();
      }, 1200);
    }
  }, [built]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, position: 'relative' }}>
      <canvas ref={particleCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} width="800" height="600" />

      <Paper elevation={8} sx={{ p: 4, borderRadius: 4, minWidth: 380, maxWidth: 700, border: `3px solid ${difficultyLevels[level].color}`, boxShadow: `0 8px 32px ${difficultyLevels[level].color}40`, background: 'linear-gradient(145deg, #ffffff, #f8f9fa)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {onBack && (<Button variant="outlined" size="small" onClick={onBack} sx={{ minWidth: 'auto', px: 1, borderRadius: 2, border: '2px solid #666', color: '#666', '&:hover': { border: '2px solid #333', color: '#333' } }}>← رجوع</Button>)}
          <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: difficultyLevels[level].color, flexGrow: 1 }}>تكوين الكلمات البسيطة</Typography>
          <Chip label={difficultyLevels[level].name} sx={{ backgroundColor: difficultyLevels[level].color, color: 'white', fontWeight: 'bold' }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip label={`الجولة: ${round + 1}/${totalRounds}`} color="primary" variant="outlined" />
          <Chip label={`النقاط: ${score}`} color="success" variant="outlined" />
          {streak > 0 && <Chip label={`متتالية: ${streak} 🔥`} sx={{ backgroundColor: '#ff6b35', color: 'white', ...createPulseAnimation() }} />}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>التقدم في اللعبة</Typography>
          <LinearProgress variant="determinate" value={(round / totalRounds) * 100} sx={{ height: 8, borderRadius: 4, backgroundColor: '#e0e0e0', '& .MuiLinearProgress-bar': { backgroundColor: difficultyLevels[level].color, borderRadius: 4 } }} />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>مستوى الصعوبة</InputLabel>
            <Select value={level} label="مستوى الصعوبة" onChange={(e) => setLevel(e.target.value)} disabled={showFeedback}>
              {Object.entries(difficultyLevels).map(([key, config]) => (<MenuItem key={key} value={key}>{config.icon} {config.name}</MenuItem>))}
            </Select>
          </FormControl>
        </Box>

        <Zoom in timeout={500}>
          <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: '#f8f9fa', border: '2px solid #e9ecef', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#2c3e50' }}>كوِّن الكلمة الصحيحة</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', minHeight: 48, py: 1, border: '1px dashed #cfd8dc', borderRadius: 2 }}>
              {built.map((ch, i) => (
                <Button key={i} size="large" variant="contained" onClick={() => undo(i)} sx={{ borderRadius: 2 }}>{ch}</Button>
              ))}
            </Box>
          </Paper>
        </Zoom>

        {showFeedback && (
          <Fade in timeout={300}>
            <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: '#e8f5e8', border: '2px solid #4caf50', textAlign: 'center', ...createPulseAnimation() }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>{feedback}</Typography>
            </Paper>
          </Fade>
        )}

        {!showFeedback && (
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            {pool.map((ch, idx) => (
              <Grid item key={idx}>
                <Zoom in timeout={300} style={{ transitionDelay: `${idx * 100}ms` }}>
                  <Button variant="outlined" size="large" onClick={() => chooseLetter(idx)} sx={{ py: 2, minWidth: 64, fontSize: '1.4rem', fontWeight: 'bold', borderRadius: 3, border: '2px solid #e0e0e0', backgroundColor: 'white', color: '#333', transition: 'all 0.3s ease', '&:hover': { backgroundColor: difficultyLevels[level].color, color: 'white', transform: 'translateY(-4px)', boxShadow: `0 8px 16px ${difficultyLevels[level].color}40`, border: `2px solid ${difficultyLevels[level].color}` } }}>{ch}</Button>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#666' }}>الوقت:</Typography>
          <Timer active={timerActive} key={timerKey} onStop={setFinalTime} />
          {finalTime !== null && (<Typography sx={{ mt: 1, fontSize: 16, color: '#00838f', textAlign: 'center' }}>الوقت المستغرق: {Math.floor(finalTime / 60).toString().padStart(2, '0')}:{(finalTime % 60).toString().padStart(2, '0')}</Typography>)}
        </Box>
      </Paper>

  {/* No WinOverlay; parent handles navigation after onComplete */}
    </Box>
  );
}
