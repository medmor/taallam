'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  LinearProgress,
  Fade,
  Zoom,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SchoolIcon from '@mui/icons-material/School';
import Timer from './Timer';
import WinOverlay from './WinOverlay';
import { GameProgressionManager, createParticleEffect } from '@/lib/gameEnhancements';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Game state
  const [level, setLevel] = useState(initialLevel);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [choices, setChoices] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showWin, setShowWin] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [finalTime, setFinalTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameMode, setGameMode] = useState('letter-to-word'); // 'letter-to-word' or 'word-to-letter'

  const config = LEVEL_CONFIG[level];
  const totalRounds = config.rounds;
  const availableLetters = ARABIC_LETTERS.slice(0, config.lettersCount);

  // Refs
  const progressManager = useRef(null);
  const particleCanvasRef = useRef(null);

  // Initialize game
  useEffect(() => {
    progressManager.current = new GameProgressionManager();
    generateNewQuestion();
    setQuestionStartTime(Date.now());
  }, [level]);

  // Handle level change
  const handleLevelChange = (newLevel) => {
    if (round === 1) {
      setLevel(newLevel);
      resetGame();
    }
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setStreak(0);
    setShowFeedback(false);
    setShowWin(false);
    setTimerActive(true);
    setFinalTime(0);
    setSelectedAnswer(null);
    generateNewQuestion();
    setQuestionStartTime(Date.now());
  };

  const generateNewQuestion = () => {
    // Randomly select a letter from available letters
    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    setCurrentLetter(randomLetter);

    // Generate choices
    const correctChoice = randomLetter;
    const wrongChoices = [];
    
    while (wrongChoices.length < config.choicesCount - 1) {
      const randomChoice = availableLetters[Math.floor(Math.random() * availableLetters.length)];
      if (randomChoice.letter !== correctChoice.letter && 
          !wrongChoices.find(choice => choice.letter === randomChoice.letter)) {
        wrongChoices.push(randomChoice);
      }
    }

    // Shuffle choices
    const allChoices = [correctChoice, ...wrongChoices];
    setChoices(allChoices.sort(() => Math.random() - 0.5));

    // Randomly decide game mode for variety
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
      setFeedback(`❌ خطأ! الإجابة الصحيحة: ${currentLetter.word}`);
      playSfx("wrong");
    }

    // Continue to next round after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      if (round >= totalRounds) {
        setTimerActive(false);
        setShowWin(true);
        playSfx("win");
        
        // Call onComplete callback with correct final score
        if (onComplete) {
          onComplete(newScore, finalTime || 0);
        }
        return;
      }

      setRound((r) => r + 1);
      generateNewQuestion();
      setQuestionStartTime(Date.now());
    }, 2500);
  };

  const handleTimeUp = (time) => {
    setFinalTime(time);
    setTimerActive(false);
    setShowWin(true);
    playSfx("lose");
    
    if (onComplete) {
      onComplete(score, time);
    }
  };

  const restartGame = () => {
    resetGame();
  };

  if (!currentLetter) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">جاري تحضير الحروف...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 2
    }}>
      {/* Particle canvas */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative' }}>
        {/* Header Card */}
        <Box sx={{
          bgcolor: 'white',
          borderRadius: 4,
          p: 3,
          mb: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '3px solid',
          borderColor: 'primary.main'
        }}>
          {/* Top Row: Back button, Title, Round indicator */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Button
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                borderColor: 'grey.300',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.light'
                }
              }}
            >
              رجوع
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                تعلم الحروف
              </Typography>
            </Box>

            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              px: 2, 
              py: 1, 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 60
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {round}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1 }}>
                {totalRounds}
              </Typography>
            </Box>
          </Box>

          {/* Second Row: Game info */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2, 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <Box sx={{
              bgcolor: 'success.light',
              color: 'success.contrastText',
              borderRadius: 3,
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="body2">النقاط:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {score}
              </Typography>
            </Box>
            
            <Box sx={{
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
              borderRadius: 3,
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="body2">الجولة:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {round}/{totalRounds}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Timer 
                initialTime={config.timeLimit}
                isActive={timerActive}
                onTimeUp={handleTimeUp}
              />
            </Box>
          </Box>

          {/* Third Row: Progress and Difficulty */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                التقدم في اللعبة
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(round - 1) / totalRounds * 100}
                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
              />
            </Box>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>مستوى الصعوبة</InputLabel>
              <Select
                value={level}
                onChange={(e) => handleLevelChange(e.target.value)}
                label="مستوى الصعوبة"
                disabled={round > 1}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="beginner">مبتدئ 🌱</MenuItem>
                <MenuItem value="intermediate">متوسط 🌿</MenuItem>
                <MenuItem value="advanced">متقدم 🌳</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Main Game Card */}
        <Box sx={{
          bgcolor: 'white',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          mb: 3
        }}>
          {/* Question Display */}
          <Fade in={!showFeedback}>
            <Box sx={{ textAlign: 'center' }}>
              {gameMode === 'letter-to-word' ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                    اختر الكلمة التي تبدأ بالحرف:
                  </Typography>
                  
                  {/* Letter Display */}
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 4,
                        borderColor: 'primary.main',
                        borderRadius: 3,
                        backgroundColor: 'primary.light',
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: 'primary.contrastText',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: 3
                      }}
                    >
                      {currentLetter.letter}
                    </Box>
                    <IconButton
                      onClick={() => playLetterAudio(currentLetter)}
                      sx={{
                        bgcolor: 'secondary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'secondary.dark' }
                      }}
                    >
                      <VolumeUpIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                    اختر الحرف الذي تبدأ به الكلمة:
                  </Typography>
                  
                  {/* Word Display */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main',
                      mb: 1
                    }}>
                      {currentLetter.word}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      ({currentLetter.image})
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Choices */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                gap: 2,
                maxWidth: 600,
                mx: 'auto'
              }}>
                {choices.map((choice, index) => (
                  <Card
                    key={index}
                    sx={{
                      cursor: showFeedback ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      border: 2,
                      borderColor: selectedAnswer?.letter === choice.letter 
                        ? (choice.letter === currentLetter.letter ? 'success.main' : 'error.main')
                        : 'transparent',
                      '&:hover': showFeedback ? {} : {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => !showFeedback && checkAnswer(choice)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      {gameMode === 'letter-to-word' ? (
                        <Box>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 'bold', 
                            color: 'primary.main',
                            mb: 1
                          }}>
                            {choice.word}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({choice.image})
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="h2" sx={{ 
                          fontWeight: 'bold', 
                          color: 'primary.main'
                        }}>
                          {choice.letter}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Fade>

          {/* Feedback */}
          <Zoom in={showFeedback}>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Alert 
                severity={feedback.includes('✅') ? 'success' : 'error'}
                icon={feedback.includes('✅') ? <CheckCircleIcon /> : <ErrorIcon />}
                sx={{ 
                  fontSize: '1.2rem', 
                  justifyContent: 'center',
                  borderRadius: 3
                }}
              >
                {feedback}
              </Alert>
            </Box>
          </Zoom>
        </Box>

        {/* Streak Display */}
        {streak > 0 && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: 'white',
              color: 'warning.main',
              px: 3,
              py: 2,
              borderRadius: 4,
              boxShadow: 3,
              border: '2px solid',
              borderColor: 'warning.main'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                🔥 متتالية: {streak}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Win Overlay */}
        {showWin && (
          <WinOverlay
            open={showWin}
            title={score >= totalRounds * 0.8 ? "🎉 ممتاز!" : "💪 حاول مرة أخرى"}
            subtitle={
              score >= totalRounds * 0.8 
                ? "لقد أتقنت تعلم الحروف العربية!" 
                : "تدرب أكثر على الحروف"
            }
            moves={score}
            errors={totalRounds - score}
            onRestart={restartGame}
            onBack={() => {
              restartGame();
              if (onBack) onBack();
            }}
          />
        )}
      </Container>
    </Box>
  );
}