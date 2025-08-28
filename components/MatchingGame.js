'use client'
import React, { useState, useEffect } from 'react';
import { learningCategories } from '@/lib/data';
import { Box, Grid, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import WinOverlay from './WinOverlay';
import Timer from './Timer';
import { preloadSfx, playSfx } from '@/lib/sfx';

// Return up to `count` unique random images. If there are fewer unique images
// than `count`, the result will include duplicates (we try to fill as much as
// possible without replacement first).
const getRandomImages = (count) => {
  const categories = learningCategories.filter(cat => cat.items && cat.items.length);
  const allItems = categories.flatMap(cat => cat.items);
  const itemsWithImages = allItems.filter(item => item.image && item.image !== '/globe.svg').map(i => i.image);
  if (itemsWithImages.length === 0) return Array.from({ length: count }, () => '/globe.svg');

  // Shuffle a copy and take unique samples
  const shuffled = [...itemsWithImages].sort(() => Math.random() - 0.5);
  const result = [];
  for (let i = 0; i < Math.min(count, shuffled.length); i++) result.push(shuffled[i]);

  // If not enough unique images, fill remaining slots with random choices
  while (result.length < count) {
    result.push(itemsWithImages[Math.floor(Math.random() * itemsWithImages.length)]);
  }
  return result;
};

function shuffle(array) {
  let a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MatchingGame = ({ size = 4, type = 'numbers' }) => {
  const [localSize, setLocalSize] = useState(size);
  const [localType, setLocalType] = useState(type);
  const pairCount = (localSize * localSize) / 2;
  const [cards, setCards] = useState([]);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState(0);
  const [solved, setSolved] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);


  // Preload images before game starts
  useEffect(() => {
    let values = [];
    if (localType === 'numbers') values = Array.from({ length: pairCount }, (_, i) => i + 1);
    else if (localType === 'alphabets') values = Array.from({ length: pairCount }, (_, i) => String.fromCharCode(65 + i));
    else values = getRandomImages(pairCount);

    // Preload images if type is not numbers or alphabets
    if (localType !== 'numbers' && localType !== 'alphabets') {
      const imageUrls = Array.isArray(values) ? values : [];
      imageUrls.forEach((url) => {
        if (typeof url === 'string' && url !== '/globe.svg') {
          const img = new window.Image();
          img.src = url;
        }
      });
    }

    const pairs = shuffle([...values, ...values]);
    const init = pairs.map((v, i) => ({ id: i, value: v, matched: false }));
    setCards(init);
    setFirst(null); setSecond(null); setLock(false); setMoves(0); setErrors(0); setSolved(false);
    setTimerKey(k => k + 1);
    setTimerActive(true);
  }, [localSize, localType]);

  useEffect(() => {
    // preload small effects
    try { preloadSfx(); } catch (e) {}
  }, []);

  useEffect(() => {
    if (!first || !second) return;
    setLock(true);
    setTimeout(() => {
      if (first.value === second.value) {
        setCards(prev => prev.map(c => (c.value === first.value ? { ...c, matched: true } : c)));
  try { playSfx('correct'); } catch (e) {}
      } else {
        setErrors(e => e + 1);
  try { playSfx('wrong'); } catch (e) {}
      }
      setFirst(null); setSecond(null); setLock(false); setMoves(m => m + 1);
    }, 600);
  }, [first, second]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) setSolved(true);
  }, [cards]);

  useEffect(() => {
    if (solved) {
      setTimerActive(false);
      try { playSfx('win'); } catch (e) {}
    }
  }, [solved]);

  const handleClick = (card) => {
    if (lock || card.matched) return;
  try { playSfx('flip'); } catch (e) {}
    if (!first) setFirst(card);
    else if (!second && card.id !== first.id) setSecond(card);
  };

  const displayFontSize = localSize === 2 ? 28 : 20;

  return (
    <Box sx={{ width: 360, maxWidth: '100%', mx: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>لعبة المطابقة</Typography>
      <Grid container spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1, width: '100%' }}>
        <Grid item>
          <FormControl size="small">
            <InputLabel id="mg-size">الحجم</InputLabel>
            <Select labelId="mg-size" value={localSize} label="الحجم" onChange={e => setLocalSize(Number(e.target.value))}>
              <MenuItem value={2}>2 x 2</MenuItem>
              <MenuItem value={4}>4 x 4</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl size="small">
            <InputLabel id="mg-type">النوع</InputLabel>
            <Select labelId="mg-type" value={localType} label="النوع" onChange={e => setLocalType(e.target.value)}>
              <MenuItem value="numbers">أرقام</MenuItem>
              <MenuItem value="alphabets">حروف</MenuItem>
              <MenuItem value="image">صور</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <Timer active={timerActive} resetKey={timerKey} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>التحركات: {moves} • الأخطاء: {errors}</Typography>
        </Grid>
      </Grid>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${localSize}, 1fr)`, gap: 8, width: '100%', maxWidth: 360 }}>
        {cards.map(card => (
          <Paper
            key={card.id}
            elevation={card.matched ? 6 : 2}
            onClick={() => handleClick(card)}
            sx={{
              p: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              // keep tiles square
              aspectRatio: '1 / 1',
              minHeight: localSize === 2 ? 110 : 70,
              cursor: card.matched ? 'default' : 'pointer',
              overflow: 'hidden',
              borderRadius: 1
            }}
          >
            {card.matched || first?.id === card.id || second?.id === card.id ? (
              typeof card.value === 'string' && card.value.startsWith('/') ? (
                <img src={card.value} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Typography sx={{ fontWeight: 700, fontSize: displayFontSize }}>{card.value}</Typography>
              )
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#e6e6e6' }} />
            )}
          </Paper>
        ))}
      </div>
      {solved && <WinOverlay boardPixel={360} moves={moves} errors={errors} onPlayAgain={() => {
        // recreate using current local settings
        let values = [];
        if (localType === 'numbers') values = Array.from({ length: pairCount }, (_, i) => i + 1);
        else if (localType === 'alphabets') values = Array.from({ length: pairCount }, (_, i) => String.fromCharCode(65 + i));
    else values = getRandomImages(pairCount);
        const pairs = shuffle([...values, ...values]);
        const init = pairs.map((v, i) => ({ id: i, value: v, matched: false }));
  setCards(init); setSolved(false); setMoves(0); setErrors(0);
  try { playSfx('click'); } catch (e) {}
      }} />}
    </Box>
  );
};

export default MatchingGame;
