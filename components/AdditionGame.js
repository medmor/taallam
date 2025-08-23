"use client";
import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, Stack } from '@mui/material';
import WinOverlay from './WinOverlay';
import { playSfx } from '@/lib/sfx';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateForLevel(level) {
  // returns {a,b,answer,choices}
  let a, b;
  if (level === 'easy') {
    a = randInt(1, 9);
    b = randInt(1, 9);
  } else if (level === 'medium') {
    a = randInt(1, 9);
    b = randInt(10, 20);
  } else {
    a = randInt(10, 99);
    b = randInt(10, 89);
  }
  const answer = a + b;
  const wrong1 = answer + (Math.random() > 0.5 ? randInt(1, 5) : -randInt(1, 5));
  const wrong2 = answer + (Math.random() > 0.5 ? randInt(6, 12) : -randInt(6, 12));
  const choices = [answer, wrong1, wrong2].sort(() => Math.random() - 0.5);
  return { a, b, answer, choices };
}

export default function AdditionGame() {
  const [level, setLevel] = useState('easy');
  const [round, setRound] = useState(0);
  const [expr, setExpr] = useState(() => generateForLevel('easy'));
  const [score, setScore] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const totalRounds = 10;

  useEffect(() => {
    setExpr(generateForLevel(level));
    setRound(0);
    setScore(0);
    setShowWin(false);
  }, [level]);

  const nextRound = (correct) => {
    if (correct) {
      setScore(s => s + 1);
      try { playSfx('correct'); } catch (e) {}
    } else {
      try { playSfx('wrong'); } catch (e) {}
    }
    if (round + 1 >= totalRounds) {
      setShowWin(true);
      try { playSfx('win'); } catch (e) {}
      return;
    }
    setRound(r => r + 1);
    setExpr(generateForLevel(level));
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>لعبة الجمع</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant={level==='easy' ? 'contained' : 'outlined'} onClick={() => setLevel('easy')}>سهل</Button>
        <Button variant={level==='medium' ? 'contained' : 'outlined'} onClick={() => setLevel('medium')}>متوسط</Button>
        <Button variant={level==='hard' ? 'contained' : 'outlined'} onClick={() => setLevel('hard')}>صعب</Button>
      </Stack>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 1 }}>{expr.a} + {expr.b}</Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>=</Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          {expr.choices.map((c) => (
            <Button key={c} onClick={() => nextRound(c === expr.answer)} variant="outlined" sx={{ minWidth: 100 }}>{c}</Button>
          ))}
        </Stack>
        <Typography sx={{ mt: 2 }}>النتيجة: {score} / {totalRounds}</Typography>
      </Paper>

      {showWin && (
        <WinOverlay boardPixel={320} moves={score} errors={totalRounds - score} onPlayAgain={() => {
          setShowWin(false);
          setRound(0);
          setScore(0);
          setExpr(generateForLevel(level));
        }} />
      )}
    </Box>
  );
}
