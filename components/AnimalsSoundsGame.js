'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Button, Chip, LinearProgress, Grid, IconButton, Zoom, Fade } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Image from 'next/image';
import Timer from './Timer';
import { animals } from '@/lib/scienceData';
import { difficultyLevels, createParticleEffect, createPulseAnimation, createShakeAnimation } from '@/lib/gameEnhancements';
import { playSfx } from '@/lib/sfx';

/* Game design:
   Beginner: 6 rounds, 3 choices
   Intermediate: 8 rounds, 4 choices
   Advanced: 10 rounds, 4 choices (reuse advanced color)
   Modes alternate: (1) Play sound -> pick image, (2) Show image -> pick sound label.
*/

const LEVELS = {
  beginner: { rounds: 6, choices: 3 },
  intermediate: { rounds: 8, choices: 4 },
  advanced: { rounds: 10, choices: 4 }
};

export default function AnimalsSoundsGame({ level='beginner', onComplete, onBack }) {
  const cfg = LEVELS[level] || LEVELS.beginner;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [mode, setMode] = useState('sound-to-image'); // or 'image-to-sound'
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const particleCanvasRef = useRef(null);
  const questionStart = useRef(Date.now());
  const finishedRef = useRef(false);

  const difficultyColor = difficultyLevels[level].color;

  const pickRandom = (arr, n) => {
    const pool = [...arr];
    const out = [];
    while (pool.length && out.length < n) {
      const idx = Math.floor(Math.random()*pool.length);
      out.push(pool.splice(idx,1)[0]);
    }
    return out;
  };

  const generate = () => {
    const validAnimals = animals; // could filter by availability later
    const target = validAnimals[Math.floor(Math.random()*validAnimals.length)];
    const others = validAnimals.filter(a => a.id !== target.id);
    const needed = cfg.choices - 1;
    const distractors = pickRandom(others, needed);
    const allChoices = [...distractors, target].sort(()=>Math.random()-0.5);
    setCurrent(target);
    setChoices(allChoices);
    setMode(Math.random() > 0.5 ? 'sound-to-image' : 'image-to-sound');
    questionStart.current = Date.now();
  };

  useEffect(() => { generate(); }, [level]);

  const playAnimalSound = (animal) => {
    // dynamic audio: /sounds/learn-names/other/{soundFile}; fallback to legacy /sounds/other/
    const file = animal?.soundFile;
    if (file) {
      try {
        const primary = `/sounds/learn-names/other/${file}`;
        const audio = new Audio(primary);
        audio.play().catch(() => {
          // fallback attempt (old path) then fallback sfx
          const alt = new Audio(`/sounds/other/${file}`);
          alt.play().catch(()=> playSfx('click'));
        });
      } catch (e) { playSfx('click'); }
    } else playSfx('click');
  };

  const handleChoice = (choice) => {
    if (feedback) return; // prevent double
    const correct = choice.id === current.id;
    setSelected(choice);
    let newScore = score;
    if (correct) {
      newScore = score + 1;
      setScore(newScore);
      setStreak(s => s+1);
      setFeedback({ type:'correct', msg: 'أحسنت!' });
      playSfx('correct');
      createParticleEffect(particleCanvasRef.current, 'success');
    } else {
      setStreak(0);
      setFeedback({ type:'wrong', msg: `الإجابة الصحيحة: ${mode==='sound-to-image'? current.name : current.soundLabel}` });
      playSfx('wrong');
    }

    const nextStep = () => {
      setFeedback(null);
      setSelected(null);
      if (round + 1 >= cfg.rounds) {
        if (!finishedRef.current) {
          finishedRef.current = true;
            setTimerActive(false);
            playSfx('win');
            if (onComplete) onComplete(newScore, 0);
            if (onBack) onBack();
        }
        return;
      }
      setRound(r => r + 1);
      generate();
    };
    setTimeout(nextStep, 1400);
  };

  if (!current) {
    return <Typography sx={{ mt:4, textAlign:'center' }}>جاري التحميل...</Typography>;
  }

  return (
    <Box sx={{ display:'flex', justifyContent:'center', mt:4, position:'relative' }}>
      <canvas ref={particleCanvasRef} width={800} height={600} style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none'}} />
      <Paper elevation={8} sx={{ p:4, borderRadius:4, minWidth:380, maxWidth:760, border:`3px solid ${difficultyColor}`, background:'linear-gradient(145deg,#ffffff,#f8f9fa)', position:'relative' }}>
        {/* Header */}
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
          <Button variant='outlined' size='small' onClick={onBack}>← رجوع</Button>
          <Typography variant='h4' sx={{ fontWeight:'bold', color:difficultyColor }}>الحيوانات وأصواتها</Typography>
          <Chip label={difficultyLevels[level].name} sx={{ bgcolor:difficultyColor, color:'#fff', fontWeight:'bold' }} />
        </Box>
        {/* Stats */}
        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:2 }}>
          <Chip label={`الجولة: ${round+1}/${cfg.rounds}`} />
          <Chip label={`النقاط: ${score}`} color='success' />
          {streak>1 && <Chip label={`متتالية: ${streak}`} sx={{ bgcolor:'#ff6b35', color:'#fff', ...createPulseAnimation() }} />}
        </Box>
        <LinearProgress variant='determinate' value={(round/cfg.rounds)*100} sx={{ height:8, borderRadius:4, mb:3 }} />

        {/* Question */}
        {!feedback && (
          <Zoom in>
            <Paper elevation={3} sx={{ p:3, mb:3, textAlign:'center', borderRadius:3, border:'2px solid #e9ecef' }}>
              {mode === 'sound-to-image' ? (
                <Box>
                  <Typography variant='h6' sx={{ mb:2 }}>استمع للصوت واختر الحيوان الصحيح</Typography>
                  <IconButton color='primary' onClick={()=>playAnimalSound(current)} sx={{ mb:1 }}>
                    <VolumeUpIcon />
                  </IconButton>
                  <Typography variant='body2' color='text.secondary'>اضغط للتكرار</Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant='h6' sx={{ mb:2 }}>ما هو صوت هذا الحيوان؟</Typography>
                  <Box sx={{ width:160, height:160, mx:'auto', position:'relative' }}>
                    <Image src={`/images/learn-names/${current.imageFolder}/${current.file}`} alt={current.name} fill style={{ objectFit:'contain' }} />
                  </Box>
                </Box>
              )}
            </Paper>
          </Zoom>
        )}

        {/* Feedback */}
        {feedback && (
          <Fade in>
            <Paper elevation={3} sx={{ p:3, mb:3, textAlign:'center', borderRadius:3, backgroundColor:feedback.type==='correct'? '#e8f5e9':'#ffebee', border:`2px solid ${feedback.type==='correct'? '#4caf50':'#f44336'}`, ...(feedback.type==='correct'? createPulseAnimation(): createShakeAnimation()) }}>
              <Typography variant='h5' sx={{ fontWeight:'bold', color: feedback.type==='correct'? '#2e7d32':'#c62828' }}>{feedback.msg}</Typography>
            </Paper>
          </Fade>
        )}

        {/* Choices */}
        <Grid container spacing={2} justifyContent='center'>
          {choices.map((ch, idx) => {
            const isCorrect = selected && ch.id === current.id;
            const isWrong = selected && ch.id === selected.id && selected.id !== current.id;
            return (
              <Grid item key={ch.id+idx}>
                <Zoom in style={{ transitionDelay: `${idx*80}ms` }}>
                  <Button onClick={()=>handleChoice(ch)} disabled={!!feedback} variant='outlined' sx={{
                    width: mode==='sound-to-image'? 150: 180,
                    height: mode==='sound-to-image'? 150: 80,
                    display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
                    gap:1, border:'2px solid #e0e0e0', background:'#fff', fontWeight:'bold',
                    ...(isCorrect && { borderColor:'#4caf50', background:'#e8f5e9' }),
                    ...(isWrong && { borderColor:'#f44336', background:'#ffebee' }),
                    '&:hover': { backgroundColor:difficultyColor, color:'#fff', borderColor:difficultyColor }
                  }}>
                    {mode==='sound-to-image' ? (
                      <Box sx={{ position:'relative', width:90, height:90 }}>
                        <Image src={`/images/learn-names/${ch.imageFolder}/${ch.file}`} alt={ch.name} fill style={{ objectFit:'contain' }} />
                      </Box>
                    ) : (
                      <Typography variant='subtitle1'>{ch.soundLabel}</Typography>
                    )}
                  </Button>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>

        {/* Timer */}
        <Box sx={{ mt:3, textAlign:'center' }}>
          <Typography variant='h6' sx={{ color:'#666' }}>الوقت:</Typography>
          <Timer active={timerActive} resetKey={timerKey} />
        </Box>
      </Paper>
    </Box>
  );
}