"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Chip, Fade, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Paper, Select, Typography, Zoom } from '@mui/material';
import Timer from './Timer';
import { sentences } from '@/lib/arabicData';
import { playSfx } from '@/lib/sfx';
import { GameProgressionManager, difficultyLevels, createParticleEffect, createPulseAnimation, createShakeAnimation } from '@/lib/gameEnhancements';

const LEVEL_CONFIG = { beginner: { rounds: 8 }, intermediate: { rounds: 10 }, advanced: { rounds: 12 } };

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function SentenceBuilderGame({ level: initialLevel = 'beginner', onComplete, onBack }) {
  const [level, setLevel] = useState(initialLevel);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [finalTime, setFinalTime] = useState(null);
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [target, setTarget] = useState(null); // {words[], shuffled[]}
  const [built, setBuilt] = useState([]);
  const [questionStart, setQuestionStart] = useState(Date.now());

  const particleCanvasRef = useRef(null);
  const progressManager = useRef(new GameProgressionManager('sentence-builder'));

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
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    const shuffled = shuffle(s.words);
    setTarget({ words: s.words, shuffled });
    setBuilt([]);
    setQuestionStart(Date.now());
  };

  const chooseWord = (idx) => {
    const w = target.shuffled[idx];
    setBuilt(b => [...b, w]);
    setTarget(t => ({ ...t, shuffled: t.shuffled.filter((_, i) => i !== idx) }));
  };

  const undo = (idx) => {
    const w = built[idx];
    setBuilt(b => b.filter((_, i) => i !== idx));
    setTarget(t => ({ ...t, shuffled: [...t.shuffled, w] }));
  };

  useEffect(() => {
    if (!target) return;
    if (built.length === target.words.length) {
      const correct = built.join(' ') === target.words.join(' ');
      setShowFeedback(true);
      const responseTime = Date.now() - questionStart;
      let newScore = score;
      if (correct) {
        newScore = score + 1;
        setScore(newScore);
        const newStreak = streak + 1;
        setStreak(newStreak);
        setFeedback('✅ ممتاز!');
        playSfx('correct');
        createParticleEffect(particleCanvasRef.current, 'success');
        progressManager.current.updateScore(10, responseTime);
        progressManager.current.updateStreak(newStreak);
      } else {
        setStreak(0);
        setFeedback('❌ ترتيب غير صحيح');
        playSfx('wrong');
      }

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
      }, 1500);
    }
  }, [built]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, position: 'relative' }}>
      <canvas ref={particleCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} width="800" height="600" />

      <Paper elevation={8} sx={{ p: 4, borderRadius: 4, minWidth: 380, maxWidth: 800, border: `3px solid ${difficultyLevels[level].color}`, boxShadow: `0 8px 32px ${difficultyLevels[level].color}40`, background: 'linear-gradient(145deg, #ffffff, #f8f9fa)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {onBack && (<Button variant="outlined" size="small" onClick={onBack} sx={{ minWidth: 'auto', px: 1, borderRadius: 2, border: '2px solid #666', color: '#666', '&:hover': { border: '2px solid #333', color: '#333' } }}>← رجوع</Button>)}
          <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: difficultyLevels[level].color, flexGrow: 1 }}>الجمل البسيطة</Typography>
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
          <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: '#f8f9fa', border: '2px solid #e9ecef' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#2c3e50', textAlign: 'center' }}>رتِّب الكلمات لتكوين جملة صحيحة</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', minHeight: 48, py: 1, border: '1px dashed #cfd8dc', borderRadius: 2, mb: 2 }}>
              {built.map((w, i) => (
                <Button key={i} size="large" variant="contained" onClick={() => undo(i)} sx={{ borderRadius: 2 }}>{w}</Button>
              ))}
            </Box>
            {target && (
              <Grid container spacing={1} justifyContent="center">
                {target.shuffled.map((w, i) => (
                  <Grid item key={i}>
                    <Button variant="outlined" size="large" onClick={() => chooseWord(i)} sx={{ borderRadius: 2 }}>{w}</Button>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Zoom>

        {showFeedback && (
          <Fade in timeout={300}>
            <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: feedback.includes('✅') ? '#e8f5e8' : '#ffeaea', border: `2px solid ${feedback.includes('✅') ? '#4caf50' : '#f44336'}`, textAlign: 'center', ...(feedback.includes('✅') ? createPulseAnimation() : createShakeAnimation()) }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: feedback.includes('✅') ? '#2e7d32' : '#c62828', mb: 1 }}>{feedback}</Typography>
            </Paper>
          </Fade>
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
