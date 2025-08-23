'use client';
import React, { useState, useRef, useEffect } from 'react';
import { learningCategories } from '@/lib/data';
import { Container, Grid, Typography, Button, Box, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import LearningCard from '@/components/LearningCard';

const LearnNamesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [audioPlayer] = useState(null);
  const [itemIndex, setItemIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(0); // -1 for prev, 1 for next
  const [prevIndex, setPrevIndex] = useState(0);
  const touchStartX = useRef(null);
  const [isRtl, setIsRtl] = useState(false);
  const viewportRef = useRef(null);

  const playSound = (text) => {
    audioPlayer.src = text;
    audioPlayer.play();
  };

  const openCategory = (cat) => {
    setSelectedCategory(cat);
    setItemIndex(0);
  };

  useEffect(() => {
    audioPlayer = new Audio();
    // detect direction from document or the viewport container
    try {
      const dirFromDoc = typeof document !== 'undefined' && (document.documentElement?.dir || document.body?.dir);
      if (dirFromDoc) setIsRtl(dirFromDoc.toLowerCase() === 'rtl');
      else if (viewportRef.current) {
        const dir = getComputedStyle(viewportRef.current).direction;
        setIsRtl(dir === 'rtl');
      }
    } catch (e) {
      // fallback: assume RTL for this app
      setIsRtl(true);
    }
  }, []);
  // Reset slideDir after animation
  useEffect(() => {
    if (slideDir === 0) return;
    const timer = setTimeout(() => {
      setSlideDir(0);
      setPrevIndex(itemIndex);
    }, 400);
    return () => clearTimeout(timer);
  }, [itemIndex, slideDir]);

  const renderItems = () => {
    if (!selectedCategory) return null;

    const items = selectedCategory.items || [];
    const displayedItems = isRtl ? [...items].slice().reverse() : items;
    const len = displayedItems.length;
    const current = displayedItems[itemIndex] || null;

    const goPrev = () => {
      if (len === 0) return;
      setPrevIndex(itemIndex);
      setSlideDir(-1);
      setItemIndex(i => (i - 1 + len) % len);
    };
    const goNext = () => {
      if (len === 0) return;
      setPrevIndex(itemIndex);
      setSlideDir(1);
      setItemIndex(i => (i + 1) % len);
    };

    const onTouchStart = (e) => {
      touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    };

    const onTouchEnd = (e) => {
      if (touchStartX.current == null) return;
      const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const dx = endX - touchStartX.current;
      touchStartX.current = null;
      if (dx > 50) goPrev();
      else if (dx < -50) goNext();
    };

    return (
      <div>
        <Button onClick={() => setSelectedCategory(null)} sx={{ mb: 2 }}>
          &larr; رجوع
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
            <IconButton aria-label="previous" onClick={goPrev}>
              <ArrowForwardIos />
            </IconButton>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {displayedItems.map((_, i) => (
                <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: i === itemIndex ? 'primary.main' : 'grey.400', transition: 'background-color 200ms' }} />
              ))}
            </Box>
            <IconButton aria-label="next" onClick={goNext}>
              <ArrowBackIos />
            </IconButton>
          </Box>
          <Box ref={viewportRef} sx={{ width: '100%', maxWidth: 480, height: '55vh', minHeight: 240, overflow: 'hidden', position: 'relative' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onTouchStart} onMouseUp={onTouchEnd}>
            {items.length === 0 ? (
              <Typography>لا توجد عناصر</Typography>
            ) : (
              <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                {displayedItems.map((it, idx) => {
                  let isActive = idx === itemIndex;
                  let isPrev = idx === prevIndex && slideDir !== 0;
                  let x = 0, opacity = 1;
                  if (isActive && slideDir !== 0) x = '0%';
                  if (isPrev && slideDir !== 0) x = slideDir === 1 ? '-100%' : '100%';
                  if (!isActive && !isPrev) {
                    opacity = 0;
                  }
                  return (
                    <Box
                      key={idx}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        minHeight: 240,
                        px: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        // ...existing code...
                        opacity,
                        transform: isActive ? 'translateX(0)' : `translateX(${x})`,
                        transition: 'transform 400ms cubic-bezier(.5,1.5,.5,1), opacity 400ms',
                        zIndex: isActive ? 2 : 1,
                        visibility: (isActive || isPrev) ? 'visible' : 'hidden',
                        pointerEvents: (isActive || isPrev) ? 'auto' : 'none',
                        display: 'flex',
                      }}
                    >
                      {it ? (
                        <LearningCard
                          data={it}
                          type="item"
                          onCardClick={() => { }}
                          onSoundClick={(text, lang) => playSound(text, lang)}
                        />
                      ) : (
                        <Typography color="error">لا يوجد بيانات للعنصر</Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </div>
    );
  };

  const renderCategories = () => {
    return (
      <Grid container spacing={8} alignItems="stretch" justifyContent={"space-around"}
      >
        {learningCategories.map((category, index) => (
          <LearningCard
            data={category}
            type="category"
            onCardClick={openCategory}
          />
        ))}
      </Grid>
    );
  };

  return (
    <Container sx={{ py: 4 }}>
      {selectedCategory ? renderItems() : renderCategories()}
    </Container>
  );
};

export default LearnNamesPage;
