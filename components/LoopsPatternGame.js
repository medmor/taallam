"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, LinearProgress, Chip } from '@mui/material';
import { Loop, CheckCircle, Cancel, EmojiEvents } from '@mui/icons-material';
import Timer from './Timer';
import { playSfx } from '@/lib/sfx';
import {
  difficultyLevels,
  createParticleEffect,
  createPulseAnimation,
  createShakeAnimation,
} from '@/lib/gameEnhancements';

// Pattern types
const PATTERN_TYPES = {
  shapes: [
    ['⭕', '⬜', '🔺'],
    ['⭐', '❤️', '🔷'],
    ['🌙', '☀️', '☁️'],
    ['🍎', '🍌', '🍊'],
    ['🐶', '🐱', '🐭']
  ],
  colors: [
    ['🔴', '🔵', '🟢'],
    ['🟡', '🟣', '🟠'],
    ['⚫', '⚪', '🟤']
  ],
  numbers: [
    ['1️⃣', '2️⃣', '3️⃣'],
    ['4️⃣', '5️⃣', '6️⃣'],
    ['7️⃣', '8️⃣', '9️⃣']
  ],
  arrows: [
    ['➡️', '⬇️', '⬅️', '⬆️'],
    ['↗️', '↘️', '↙️', '↖️']
  ]
};

// Difficulty presets
const difficultyPresets = {
  beginner: { rounds: 6, patternLength: 3, repeatCount: 2, options: 3, timeLimit: null },
  intermediate: { rounds: 8, patternLength: 4, repeatCount: 3, options: 4, timeLimit: null },
  advanced: { rounds: 10, patternLength: 5, repeatCount: 3, options: 5, timeLimit: 120 }
};

// Game modes
const GAME_MODES = {
  complete: 'أكمل النمط',
  identify: 'ما هو النمط؟',
  count: 'كم مرة يتكرر النمط؟',
  find: 'ابحث عن الخطأ'
};

export default function LoopsPatternGame({ level = 'beginner', onComplete, onBack }) {
  const preset = difficultyPresets[level];
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameMode, setGameMode] = useState('complete');
  const [pattern, setPattern] = useState([]);
  const [displaySequence, setDisplaySequence] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(preset.timeLimit);

  useEffect(() => {
    generateQuestion();
  }, [currentRound]);

  const generateQuestion = () => {
    setSelectedAnswer(null);
    setFeedback(null);

    // Select random pattern type and pattern
    const patternTypeKeys = Object.keys(PATTERN_TYPES);
    const randomType = patternTypeKeys[Math.floor(Math.random() * patternTypeKeys.length)];
    const patternsOfType = PATTERN_TYPES[randomType];
    const selectedPattern = patternsOfType[Math.floor(Math.random() * patternsOfType.length)];
    
    // Create repeating pattern
    const basePattern = selectedPattern.slice(0, preset.patternLength);
    setPattern(basePattern);

    // Select random game mode
    const modes = Object.keys(GAME_MODES);
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    setGameMode(randomMode);

    let sequence, answer, opts;

    switch(randomMode) {
      case 'complete':
        // Show pattern repeated, but missing one element
        sequence = [];
        for (let i = 0; i < preset.repeatCount; i++) {
          sequence.push(...basePattern);
        }
        // Remove random element
        const missingIndex = Math.floor(Math.random() * sequence.length);
        answer = sequence[missingIndex];
        sequence[missingIndex] = '❓';
        
        // Generate options - with safety limit to prevent infinite loop
        opts = [answer];
        let attempts = 0;
        const maxAttempts = 50;
        while (opts.length < preset.options && attempts < maxAttempts) {
          attempts++;
          const randomItem = selectedPattern[Math.floor(Math.random() * selectedPattern.length)];
          if (!opts.includes(randomItem)) {
            opts.push(randomItem);
          }
        }
        // If we couldn't get enough unique options, fill with duplicates
        while (opts.length < preset.options) {
          opts.push(selectedPattern[Math.floor(Math.random() * selectedPattern.length)]);
        }
        opts.sort(() => 0.5 - Math.random());
        break;

      case 'identify':
        // Show full repeated pattern and ask what the base pattern is
        sequence = [];
        for (let i = 0; i < preset.repeatCount; i++) {
          sequence.push(...basePattern);
        }
        answer = basePattern.join(' ');
        
        // Generate wrong patterns - with safety limit to prevent infinite loop
        opts = [answer];
        let identifyAttempts = 0;
        const maxIdentifyAttempts = 50;
        while (opts.length < preset.options && identifyAttempts < maxIdentifyAttempts) {
          identifyAttempts++;
          const wrongPattern = [...basePattern].sort(() => 0.5 - Math.random());
          const wrongAnswer = wrongPattern.join(' ');
          if (!opts.includes(wrongAnswer)) {
            opts.push(wrongAnswer);
          }
        }
        // If we couldn't get enough unique patterns, create variations
        while (opts.length < preset.options) {
          // Create a different variation by reversing or rotating
          const variation = [...basePattern];
          if (Math.random() > 0.5) {
            variation.reverse();
          } else {
            variation.push(variation.shift());
          }
          const varAnswer = variation.join(' ');
          if (!opts.includes(varAnswer)) {
            opts.push(varAnswer);
          } else {
            // Last resort: just add a shuffled version
            opts.push([...basePattern].sort(() => 0.5 - Math.random()).join(' '));
          }
        }
        opts.sort(() => 0.5 - Math.random());
        break;

      case 'count':
        // Show repeated pattern and ask how many times it repeats
        const repeatTimes = 2 + Math.floor(Math.random() * 3); // 2-4 times
        sequence = [];
        for (let i = 0; i < repeatTimes; i++) {
          sequence.push(...basePattern);
        }
        answer = `${repeatTimes} مرات`;
        
        // Generate wrong counts
        opts = [answer];
        for (let i = 1; i <= preset.options - 1; i++) {
          const wrongCount = ((repeatTimes + i) % 5) + 1;
          if (!opts.includes(`${wrongCount} مرات`)) {
            opts.push(`${wrongCount} مرات`);
          }
        }
        opts.sort(() => 0.5 - Math.random());
        break;

      case 'find':
        // Show pattern with one mistake
        sequence = [];
        for (let i = 0; i < preset.repeatCount; i++) {
          sequence.push(...basePattern);
        }
        // Introduce an error
        const errorIndex = Math.floor(Math.random() * sequence.length);
        const wrongItem = selectedPattern.filter(item => item !== sequence[errorIndex])[0];
        sequence[errorIndex] = wrongItem;
        answer = `الموضع ${errorIndex + 1}`;
        
        // Generate position options - with safety limit to prevent infinite loop
        opts = [answer];
        let findAttempts = 0;
        const maxFindAttempts = 50;
        const maxOptions = Math.min(preset.options, sequence.length);
        while (opts.length < maxOptions && findAttempts < maxFindAttempts) {
          findAttempts++;
          const randomPos = Math.floor(Math.random() * sequence.length) + 1;
          const posAnswer = `الموضع ${randomPos}`;
          if (!opts.includes(posAnswer)) {
            opts.push(posAnswer);
          }
        }
        // Fill remaining if needed
        let posCounter = 1;
        while (opts.length < maxOptions && posCounter <= sequence.length) {
          const posAnswer = `الموضع ${posCounter}`;
          if (!opts.includes(posAnswer)) {
            opts.push(posAnswer);
          }
          posCounter++;
        }
        opts.sort(() => 0.5 - Math.random());
        break;
    }

    setDisplaySequence(sequence);
    setCorrectAnswer(answer);
    setOptions(opts);
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    
    const isCorrect = answer === correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    // Play sound effects
    if (isCorrect) {
      playSfx('correct');
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      playSfx('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      if (currentRound + 1 >= preset.rounds) {
        playSfx('win');
        onComplete(score + (isCorrect ? 1 : 0), preset.timeLimit ? preset.timeLimit - timeLeft : 0);
      } else {
        setCurrentRound(currentRound + 1);
      }
    }, 1500);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', py: 4 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button variant="outlined" onClick={onBack} sx={{ color: 'white', borderColor: 'white' }}>
            ← رجوع
          </Button>
          <Chip 
            icon={<Loop />} 
            label={`المستوى: ${level === 'beginner' ? 'مبتدئ' : level === 'intermediate' ? 'متوسط' : 'متقدم'}`}
            sx={{ bgcolor: 'white', fontWeight: 'bold' }}
          />
        </Box>

        {/* Progress & Stats */}
        <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">
                السؤال {currentRound + 1} من {preset.rounds}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip icon={<EmojiEvents />} label={`النقاط: ${score}`} size="small" color="primary" />
                {streak > 1 && <Chip label={`🔥 ${streak}`} size="small" color="warning" />}
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(currentRound / preset.rounds) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
            {preset.timeLimit && (
              <Box sx={{ mt: 2 }}>
                <Timer 
                  duration={preset.timeLimit} 
                  onTimeUp={() => onComplete(score, preset.timeLimit)}
                  onTick={setTimeLeft}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Question */}
        <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.98)', textAlign: 'center', py: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, color: '#8b5cf6', fontWeight: 'bold' }}>
              {GAME_MODES[gameMode]}
            </Typography>

            {/* Pattern Display */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              justifyContent: 'center',
              mb: 3,
              p: 3,
              bgcolor: '#f8fafc',
              borderRadius: 3,
              border: '2px solid #e2e8f0'
            }}>
              {displaySequence.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    fontSize: '3rem',
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: item === '❓' ? '#fef3c7' : 'white',
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: item === '❓' ? '#f59e0b' : '#e2e8f0',
                    boxShadow: item === '❓' ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>

            {/* Show base pattern for reference (except in identify mode) */}
            {gameMode !== 'identify' && gameMode !== 'count' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  النمط الأساسي:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  {pattern.map((item, index) => (
                    <Typography key={index} variant="h4">
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <Grid container spacing={2}>
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = feedback === 'correct' && isSelected;
            const isWrong = feedback === 'wrong' && isSelected;

            return (
              <Grid item xs={12} sm={6} key={index}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  sx={{
                    py: 3,
                    fontSize: gameMode === 'complete' ? '2rem' : '1.1rem',
                    bgcolor: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : 'white',
                    color: isCorrect || isWrong ? 'white' : '#1e293b',
                    '&:hover': {
                      bgcolor: isCorrect ? '#16a34a' : isWrong ? '#dc2626' : '#f1f5f9',
                    },
                    '&.Mui-disabled': {
                      bgcolor: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : 'white',
                      color: isCorrect || isWrong ? 'white' : '#1e293b',
                    },
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                  startIcon={
                    isCorrect ? <CheckCircle /> : isWrong ? <Cancel /> : null
                  }
                >
                  {option}
                </Button>
              </Grid>
            );
          })}
        </Grid>

        {/* Feedback */}
        {feedback && (
          <Card sx={{ mt: 3, bgcolor: feedback === 'correct' ? '#22c55e' : '#ef4444', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6">
                {feedback === 'correct' ? '✅ ممتاز! إجابة صحيحة!' : '❌ حاول مرة أخرى'}
              </Typography>
              {feedback === 'wrong' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  الإجابة الصحيحة: {correctAnswer}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
