'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Zoom,
  Grid,
  Chip,
  Paper,
  IconButton
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Timer from './Timer';
import WinOverlay from './WinOverlay';
import {
  GameProgressionManager,
  difficultyLevels,
  createParticleEffect,
  createPulseAnimation,
  createShakeAnimation,
} from '@/lib/gameEnhancements';
import { playSfx } from '@/lib/sfx';

// Arabic letters with associated words and images
const ARABIC_LETTERS = [
  // Basic letters for beginners
  { letter: 'أ', word: 'أسد', image: 'lion', audio: 'alif' },
  { letter: 'ب', word: 'بطة', image: 'duck', audio: 'baa' },
  { letter: 'ت', word: 'تفاحة', image: 'apple', audio: 'taa' },
  { letter: 'ث', word: 'ثعلب', image: 'fox', audio: 'thaa' },
  { letter: 'ج', word: 'جمل', image: 'camel', audio: 'jeem' },
  { letter: 'ح', word: 'حصان', image: 'horse', audio: 'haa' },
  { letter: 'خ', word: 'خروف', image: 'sheep', audio: 'khaa' },
  { letter: 'د', word: 'دجاجة', image: 'chicken', audio: 'dal' },
  { letter: 'ذ', word: 'ذئب', image: 'wolf', audio: 'thal' },
  { letter: 'ر', word: 'رقبة', image: 'neck', audio: 'raa' },
  { letter: 'ز', word: 'زرافة', image: 'giraffe', audio: 'zay' },
  { letter: 'س', word: 'سمكة', image: 'fish', audio: 'seen' },
  { letter: 'ش', word: 'شمس', image: 'sun', audio: 'sheen' },
  { letter: 'ص', word: 'صقر', image: 'eagle', audio: 'sad' },
  { letter: 'ض', word: 'ضفدع', image: 'frog', audio: 'dad' },
  { letter: 'ط', word: 'طائر', image: 'bird', audio: 'taa_heavy' },
  { letter: 'ظ', word: 'ظبي', image: 'deer', audio: 'dhaa' },
  { letter: 'ع', word: 'عين', image: 'eye', audio: 'ain' },
  { letter: 'غ', word: 'غزال', image: 'gazelle', audio: 'ghain' },
  { letter: 'ف', word: 'فيل', image: 'elephant', audio: 'faa' },
  { letter: 'ق', word: 'قط', image: 'cat', audio: 'qaf' },
  { letter: 'ك', word: 'كلب', image: 'dog', audio: 'kaf' },
  { letter: 'ل', word: 'ليمون', image: 'lemon', audio: 'lam' },
  { letter: 'م', word: 'ماعز', image: 'goat', audio: 'meem' },
  { letter: 'ن', word: 'نحلة', image: 'bee', audio: 'noon' },
  { letter: 'ه', word: 'هدهد', image: 'hoopoe', audio: 'haa_end' },
  { letter: 'و', word: 'وردة', image: 'rose', audio: 'waw' },
  { letter: 'ي', word: 'يد', image: 'hand', audio: 'yaa' }
];

// Level configurations
const LEVEL_CONFIG = {
  beginner: {
    rounds: 10,
    lettersCount: 14, // First half of alphabet
    timeLimit: 12 * 60, // 12 minutes
    choicesCount: 3
  },
  intermediate: {
    rounds: 15,
    lettersCount: 21, // Most of alphabet
    timeLimit: 15 * 60, // 15 minutes
    choicesCount: 4
  },
  advanced: {
    rounds: 20,
    lettersCount: 28, // Full alphabet
    timeLimit: 20 * 60, // 20 minutes
    choicesCount: 4
  }
};

export default function ArabicLettersGame({ level: initialLevel = "beginner", onComplete, onBack }) {
  // Game state
  const [level, setLevel] = useState(initialLevel);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [choices, setChoices] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showWin, setShowWin] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameMode, setGameMode] = useState('letter-to-word'); // 'letter-to-word' or 'word-to-letter'

  const config = LEVEL_CONFIG[level];
  const totalRounds = config.rounds;

  // Refs
  const progressManager = useRef(new GameProgressionManager('arabic-letters'));
  const particleCanvasRef = useRef(null);
  const scoreRef = useRef(null);

  // Initialize or reset on level change
  useEffect(() => {
    setRound(0);
    setScore(0);
    setStreak(0);
    setShowFeedback(false);
    setShowWin(false);
    setTimerActive(true);
    setTimerKey(k => k + 1);
    setFinalTime(null);
    setSelectedAnswer(null);
    generateNewQuestion();
    setQuestionStartTime(Date.now());
  }, [level]);

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
  };

  const resetGame = () => {
    setRound(0);
    setScore(0);
    setStreak(0);
    setShowFeedback(false);
    setShowWin(false);
    setTimerActive(true);
    setTimerKey(k => k + 1);
    setFinalTime(null);
    setSelectedAnswer(null);
    generateNewQuestion();
    setQuestionStartTime(Date.now());
  };

  const generateNewQuestion = () => {
    const available = ARABIC_LETTERS.slice(0, LEVEL_CONFIG[level].lettersCount);
    const randomLetter = available[Math.floor(Math.random() * available.length)];
    setCurrentLetter(randomLetter);

    // Generate choices
    const correctChoice = randomLetter;
    const wrongChoices = [];
    while (wrongChoices.length < LEVEL_CONFIG[level].choicesCount - 1) {
      const randomChoice = available[Math.floor(Math.random() * available.length)];
      if (randomChoice.letter !== correctChoice.letter &&
          !wrongChoices.find(choice => choice.letter === randomChoice.letter)) {
        wrongChoices.push(randomChoice);
      }
    }

    const allChoices = [correctChoice, ...wrongChoices].sort(() => Math.random() - 0.5);
    setChoices(allChoices);

    setGameMode(Math.random() > 0.5 ? 'letter-to-word' : 'word-to-letter');
  };

  const playLetterAudio = (letterData) => {
    // Simulate audio playing - in real implementation, you'd load actual audio files
    console.log(`Playing audio for letter: ${letterData.letter} (${letterData.audio})`);
    playSfx("click");
  };

  const checkAnswer = (selectedChoice) => {
    const correct = selectedChoice.letter === currentLetter.letter;
    const responseTime = Date.now() - questionStartTime;

    setSelectedAnswer(selectedChoice);
    setShowFeedback(true);

    let newScore = score;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      newScore = score + 1;
      setScore(newScore);

      // Enhanced feedback based on performance
      if (responseTime < 3000) {
        setFeedback("⚡ ممتاز! سريع جداً!");
        playSfx("streak");
      } else if (newStreak >= 5) {
        setFeedback(`🔥 متتالية رائعة! ${newStreak}`);
        playSfx("bonus");
      } else {
        setFeedback("✅ أحسنت!");
        playSfx("correct");
      }

      // Create particle effect for correct answers
      createParticleEffect(particleCanvasRef.current, "success");

      // Update progress manager
      progressManager.current.updateScore(10, responseTime);
      progressManager.current.updateStreak(newStreak);
    } else {
      setStreak(0);
      setFeedback(`❌ خطأ! الإجابة الصحيحة: ${gameMode === 'letter-to-word' ? currentLetter.word : currentLetter.letter}`);
      playSfx("wrong");
    }

    // Continue to next round after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      if (round + 1 >= totalRounds) {
        setTimerActive(false);
        setShowWin(true);
        playSfx("win");
        // Call onComplete callback with correct final score
        if (onComplete) {
          onComplete(newScore, finalTime || 0);
        }
        return;
      }

      setRound(r => r + 1);
      generateNewQuestion();
      setQuestionStartTime(Date.now());
    }, 1500);
  };

  const restartGame = () => {
    resetGame();
  };
  if (!currentLetter) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">جاري تحضير الحروف...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        position: 'relative',
      }}
    >
      {/* Particle effect canvas */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
        width="800"
        height="600"
      />

      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 380,
          maxWidth: 600,
          border: `3px solid ${difficultyLevels[level].color}`,
          boxShadow: `0 8px 32px ${difficultyLevels[level].color}40`,
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {onBack && (
            <Button
              variant="outlined"
              size="small"
              onClick={onBack}
              sx={{
                minWidth: 'auto',
                px: 1,
                borderRadius: 2,
                border: '2px solid #666',
                color: '#666',
                '&:hover': {
                  border: '2px solid #333',
                  color: '#333',
                },
              }}
            >
              ← رجوع
            </Button>
          )}
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 'bold',
              color: difficultyLevels[level].color,
              flexGrow: 1,
            }}
          >
            تعلم الحروف العربية
          </Typography>
          <Chip
            label={difficultyLevels[level].name}
            sx={{
              backgroundColor: difficultyLevels[level].color,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Chip label={`الجولة: ${round + 1}/${totalRounds}`} color="primary" variant="outlined" />
          <Chip ref={scoreRef} label={`النقاط: ${score}`} color="success" variant="outlined" />
          {streak > 0 && (
            <Chip
              label={`متتالية: ${streak} 🔥`}
              sx={{ backgroundColor: '#ff6b35', color: 'white', ...createPulseAnimation() }}
            />
          )}
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            التقدم في اللعبة
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(round / totalRounds) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: difficultyLevels[level].color,
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Difficulty selector */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>مستوى الصعوبة</InputLabel>
            <Select value={level} label="مستوى الصعوبة" onChange={(e) => handleLevelChange(e.target.value)} disabled={showFeedback}>
              {Object.entries(difficultyLevels).map(([key, config]) => (
                <MenuItem
                  key={key}
                  value={key}
                  disabled={!progressManager.current.getProgress().difficultyUnlocked.includes(key)}
                >
                  {config.icon} {config.name}
                  {!progressManager.current.getProgress().difficultyUnlocked.includes(key) && ' 🔒'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Question panel */}
        {!showFeedback && (
          <Zoom in={!showFeedback} timeout={500}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                backgroundColor: '#f8f9fa',
                border: '2px solid #e9ecef',
                textAlign: 'center',
              }}
            >
              {gameMode === 'letter-to-word' ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
                    اختر الكلمة التي تبدأ بالحرف التالي
                  </Typography>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 4,
                      borderColor: difficultyLevels[level].color,
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      fontSize: '4rem',
                      fontWeight: 'bold',
                      color: '#2c3e50',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: 1,
                    }}
                  >
                    {currentLetter.letter}
                  </Box>
                  <IconButton onClick={() => playLetterAudio(currentLetter)} color="secondary">
                    <VolumeUpIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
                    اختر الحرف الذي تبدأ به هذه الكلمة
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: difficultyLevels[level].color }}>
                    {currentLetter.word}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({currentLetter.image})
                  </Typography>
                </Box>
              )}
            </Paper>
          </Zoom>
        )}

        {/* Feedback */}
        {showFeedback && (
          <Fade in={showFeedback} timeout={300}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                backgroundColor: selectedAnswer?.letter === currentLetter.letter ? '#e8f5e8' : '#ffeaea',
                border: `2px solid ${selectedAnswer?.letter === currentLetter.letter ? '#4caf50' : '#f44336'}`,
                textAlign: 'center',
                ...(selectedAnswer?.letter === currentLetter.letter ? createPulseAnimation() : createShakeAnimation()),
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: selectedAnswer?.letter === currentLetter.letter ? '#2e7d32' : '#c62828',
                  mb: 1,
                }}
              >
                {feedback}
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Choices */}
        {!showFeedback && (
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            {choices.map((choice, index) => (
              <Grid item key={choice.letter + index}>
                <Zoom in={true} timeout={300} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => checkAnswer(choice)}
                    disabled={showFeedback}
                    sx={{
                      py: 2,
                      minWidth: gameMode === 'letter-to-word' ? 160 : 100,
                      fontSize: gameMode === 'letter-to-word' ? '1.2rem' : '1.8rem',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      border: '2px solid #e0e0e0',
                      backgroundColor: 'white',
                      color: '#333',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: difficultyLevels[level].color,
                        color: 'white',
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 16px ${difficultyLevels[level].color}40`,
                        border: `2px solid ${difficultyLevels[level].color}`,
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      },
                    }}
                  >
                    {gameMode === 'letter-to-word' ? choice.word : choice.letter}
                  </Button>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Timer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#666' }}>
            الوقت:
          </Typography>
          <Timer active={timerActive} key={timerKey} onStop={setFinalTime} />
          {finalTime !== null && (
            <Typography sx={{ mt: 1, fontSize: 16, color: '#00838f', textAlign: 'center' }}>
              الوقت المستغرق: {Math.floor(finalTime / 60).toString().padStart(2, '0')}
              :{(finalTime % 60).toString().padStart(2, '0')}
            </Typography>
          )}
        </Box>
      </Paper>

      {showWin && (
        <WinOverlay
          boardPixel={320}
          moves={score}
          errors={totalRounds - score}
          onPlayAgain={() => {
            setShowWin(false);
            resetGame();
          }}
        />
      )}
    </Box>
  );
}