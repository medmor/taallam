'use client';
import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Chip, LinearProgress } from '@mui/material';
import { difficultyLevels } from '@/lib/gameEnhancements';
import Timer from './Timer';

// Simple placeholder using same visual shell as other games until real mechanics are implemented.
export default function GenericPlaceholderGame({ title, lessonId, level='beginner', onComplete, onBack }) {
  const [round, setRound] = useState(0);
  const totalRounds = 6; // temporary
  const [score, setScore] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);

  const finish = (finalScoreOverride) => {
    setTimerActive(false);
    const finalScore = finalScoreOverride != null ? finalScoreOverride : score;
    if (onComplete) onComplete(finalScore, 0);
    if (onBack) onBack();
  };

  const next = () => {
    // Simulate a correct answer each press (placeholder logic)
    if (round + 1 >= totalRounds) {
      // Count the final round's point before finishing
      setScore(s => {
        const finalScore = s + 1;
        setTimeout(() => finish(finalScore), 0);
        return finalScore;
      });
      return;
    }
    setRound(r => r + 1);
    setScore(s => s + 1);
  };

  return (
    <Box sx={{ display:'flex', justifyContent:'center', mt:4 }}>
      <Paper sx={{ p:4, borderRadius:4, border:`3px solid ${difficultyLevels[level].color}`, minWidth:360 }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
          <Button variant='outlined' size='small' onClick={onBack}>← رجوع</Button>
          <Typography variant='h5' sx={{ fontWeight:'bold', color:difficultyLevels[level].color }}>{title}</Typography>
          <Chip label={difficultyLevels[level].name} sx={{ backgroundColor:difficultyLevels[level].color, color:'#fff', fontWeight:'bold' }} />
        </Box>
        <Box sx={{ display:'flex', gap:1, mb:2 }}>
          <Chip label={`الجولة: ${round+1}/${totalRounds}`} />
          <Chip label={`النقاط: ${score}`} color='success' />
        </Box>
        <LinearProgress variant='determinate' value={(round/totalRounds)*100} sx={{ mb:3, height:8, borderRadius:4 }} />
        <Typography sx={{ mb:2 }}>محتوى تفاعلي (قريباً) لهذا الدرس: {lessonId}</Typography>
        <Button variant='contained' onClick={next}>إجابة صحيحة (مؤقت)</Button>
        <Box sx={{ mt:3, textAlign:'center' }}>
          <Typography variant='body2'>الوقت:</Typography>
          <Timer active={timerActive} resetKey={timerKey} />
        </Box>
      </Paper>
    </Box>
  );
}
