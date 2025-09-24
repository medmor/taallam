"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Chip, Fade, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Paper, Select, Typography, Zoom } from '@mui/material';
import Timer from './Timer';
import { vocabItems, letters } from '@/lib/arabicData';
import { playSfx } from '@/lib/sfx';
import { GameProgressionManager, difficultyLevels, createParticleEffect, createPulseAnimation, createShakeAnimation } from '@/lib/gameEnhancements';

const LEVEL_CONFIG = { beginner: { rounds: 10, choices: 3 }, intermediate: { rounds: 15, choices: 4 }, advanced: { rounds: 20, choices: 4 } };

export default function LetterWordMatchGame({ level: initialLevel = 'beginner', onComplete, onBack }) {
  const [level, setLevel] = useState(initialLevel);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selected, setSelected] = useState(null);
  const [finalTime, setFinalTime] = useState(null);
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [current, setCurrent] = useState(null); // {letter, options[], answer}
  const [questionStart, setQuestionStart] = useState(Date.now());

  const particleCanvasRef = useRef(null);
  const progressManager = useRef(new GameProgressionManager('letter-word'));

  const totalRounds = LEVEL_CONFIG[level].rounds;

  useEffect(() => { resetForLevel(); }, [level]);

  const resetForLevel = () => {
    setRound(0);
    setScore(0);
    setStreak(0);
    setShowFeedback(false);
    setSelected(null);
    setTimerActive(true);
    setTimerKey(k => k + 1);
    setFinalTime(null);
    nextQuestion();
  };

  const nextQuestion = () => {
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const correctPool = vocabItems.filter(i => i.letter === letter);
    const wrongPool = vocabItems.filter(i => i.letter !== letter);
    const correct = correctPool[Math.floor(Math.random() * correctPool.length)];
    const options = [correct];
    while (options.length < LEVEL_CONFIG[level].choices) {
      const w = wrongPool[Math.floor(Math.random() * wrongPool.length)];
      if (!options.find(o => o.id === w.id)) options.push(w);
    }
    options.sort(() => Math.random() - 0.5);
    setCurrent({ letter, options, answer: correct });
    setQuestionStart(Date.now());
  };

  const pick = (opt) => {
    const correct = opt.id === current.answer.id;
    setSelected(opt.id);
    setShowFeedback(true);
    const responseTime = Date.now() - questionStart;

    let newScore = score;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      newScore = score + 1;
      setScore(newScore);
      setFeedback('✅ أحسنت!');
      playSfx('correct');
      createParticleEffect(particleCanvasRef.current, 'success');
      progressManager.current.updateScore(10, responseTime);
      progressManager.current.updateStreak(newStreak);
    } else {
      setStreak(0);
      setFeedback(`❌ الإجابة الصحيحة: ${current.answer.word}`);
      playSfx('wrong');
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
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
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, position: 'relative' }}>
      <canvas ref={particleCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} width="800" height="600" />

      <Paper elevation={8} sx={{ p: 4, borderRadius: 4, minWidth: 380, maxWidth: 700, border: `3px solid ${difficultyLevels[level].color}`, boxShadow: `0 8px 32px ${difficultyLevels[level].color}40`, background: 'linear-gradient(145deg, #ffffff, #f8f9fa)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {onBack && (<Button variant="outlined" size="small" onClick={onBack} sx={{ minWidth: 'auto', px: 1, borderRadius: 2, border: '2px solid #666', color: '#666', '&:hover': { border: '2px solid #333', color: '#333' } }}>← رجوع</Button>)}
          <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: difficultyLevels[level].color, flexGrow: 1 }}>ربط الحروف بالكلمات</Typography>
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

        {current && (
          <>
            <Zoom in={!showFeedback} timeout={500}>
              <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: '#f8f9fa', border: '2px solid #e9ecef', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>اختر الكلمة التي تبدأ بحرف</Typography>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: difficultyLevels[level].color }}>{current.letter}</Typography>
              </Paper>
            </Zoom>

            {showFeedback && (
              <Fade in timeout={300}>
                <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: selected === current.answer.id ? '#e8f5e8' : '#ffeaea', border: `2px solid ${selected === current.answer.id ? '#4caf50' : '#f44336'}`, textAlign: 'center', ...(selected === current.answer.id ? createPulseAnimation() : createShakeAnimation()) }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: selected === current.answer.id ? '#2e7d32' : '#c62828', mb: 1 }}>{feedback}</Typography>
                </Paper>
              </Fade>
            )}

            {!showFeedback && (
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                {current.options.map((opt, idx) => (
                  <Grid item key={opt.id}>
                    <Zoom in timeout={300} style={{ transitionDelay: `${idx * 100}ms` }}>
                      <Button variant="outlined" size="large" onClick={() => pick(opt)} sx={{ py: 2, minWidth: 160, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: 3, border: '2px solid #e0e0e0', backgroundColor: 'white', color: '#333', transition: 'all 0.3s ease', '&:hover': { backgroundColor: difficultyLevels[level].color, color: 'white', transform: 'translateY(-4px)', boxShadow: `0 8px 16px ${difficultyLevels[level].color}40`, border: `2px solid ${difficultyLevels[level].color}` } }}>{opt.word}</Button>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
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
