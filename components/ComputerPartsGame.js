"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, LinearProgress, Chip, Avatar } from '@mui/material';
import { Computer, CheckCircle, Cancel, EmojiEvents, Timer as TimerIcon } from '@mui/icons-material';
import Timer from './Timer';
import { playSfx } from '@/lib/sfx';
import {
  difficultyLevels,
  createParticleEffect,
  createPulseAnimation,
  createShakeAnimation,
} from '@/lib/gameEnhancements';

// Computer parts dataset
const COMPUTER_PARTS = [
  { 
    id: 'monitor', 
    name: 'الشاشة', 
    nameEn: 'Monitor',
    description: 'نشاهد عليها الصور والألعاب',
    function: 'عرض المعلومات والصور',
    emoji: '🖥️',
    category: 'output'
  },
  { 
    id: 'keyboard', 
    name: 'لوحة المفاتيح', 
    nameEn: 'Keyboard',
    description: 'نكتب بها الحروف والأرقام',
    function: 'كتابة النصوص والأوامر',
    emoji: '⌨️',
    category: 'input'
  },
  { 
    id: 'mouse', 
    name: 'الفأرة', 
    nameEn: 'Mouse',
    description: 'نحرك بها السهم على الشاشة',
    function: 'التحكم والنقر والتحديد',
    emoji: '🖱️',
    category: 'input'
  },
  { 
    id: 'cpu', 
    name: 'وحدة المعالجة', 
    nameEn: 'CPU',
    description: 'عقل الحاسوب - يفكر ويحسب',
    function: 'معالجة البيانات والحسابات',
    emoji: '🧠',
    category: 'processing'
  },
  { 
    id: 'speakers', 
    name: 'السماعات', 
    nameEn: 'Speakers',
    description: 'نسمع منها الأصوات والموسيقى',
    function: 'إخراج الصوت',
    emoji: '🔊',
    category: 'output'
  },
  { 
    id: 'printer', 
    name: 'الطابعة', 
    nameEn: 'Printer',
    description: 'تطبع الأوراق والصور',
    function: 'طباعة المستندات',
    emoji: '🖨️',
    category: 'output'
  },
  { 
    id: 'webcam', 
    name: 'الكاميرا', 
    nameEn: 'Webcam',
    description: 'نصور بها الفيديو',
    function: 'التقاط الصور والفيديو',
    emoji: '📷',
    category: 'input'
  },
  { 
    id: 'usb', 
    name: 'فلاشة USB', 
    nameEn: 'USB Drive',
    description: 'نحفظ فيها الملفات',
    function: 'تخزين البيانات',
    emoji: '💾',
    category: 'storage'
  }
];

// Game modes
const GAME_MODES = {
  identifyPart: 'اختر اسم الجزء الصحيح',
  identifyFunction: 'ما وظيفة هذا الجزء؟',
  matchCategory: 'اختر الفئة الصحيحة',
  selectByFunction: 'أي جزء يقوم بهذه الوظيفة؟'
};

// Difficulty presets
const difficultyPresets = {
  beginner: { rounds: 6, partsCount: 4, timeLimit: null },
  intermediate: { rounds: 8, partsCount: 5, timeLimit: null },
  advanced: { rounds: 10, partsCount: 6, timeLimit: 120 }
};

export default function ComputerPartsGame({ level = 'beginner', onComplete, onBack }) {
  const preset = difficultyPresets[level];
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameMode, setGameMode] = useState('identifyPart');
  const [currentPart, setCurrentPart] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(preset.timeLimit);

  useEffect(() => {
    generateQuestion();
  }, [currentRound]);

  const generateQuestion = () => {
    setSelectedAnswer(null);
    setFeedback(null);

    // Randomly select game mode
    const modes = Object.keys(GAME_MODES);
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    setGameMode(randomMode);

    // Select random computer part
    const randomPart = COMPUTER_PARTS[Math.floor(Math.random() * COMPUTER_PARTS.length)];
    setCurrentPart(randomPart);

    // Generate options based on mode
    let correctAnswer, wrongAnswers;
    
    switch(randomMode) {
      case 'identifyPart':
        correctAnswer = randomPart.name;
        wrongAnswers = COMPUTER_PARTS
          .filter(p => p.id !== randomPart.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, preset.partsCount - 1)
          .map(p => p.name);
        break;
        
      case 'identifyFunction':
        correctAnswer = randomPart.function;
        wrongAnswers = COMPUTER_PARTS
          .filter(p => p.id !== randomPart.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, preset.partsCount - 1)
          .map(p => p.function);
        break;
        
      case 'matchCategory':
        const categories = {
          input: 'جهاز إدخال',
          output: 'جهاز إخراج',
          processing: 'معالجة',
          storage: 'تخزين'
        };
        correctAnswer = categories[randomPart.category];
        wrongAnswers = Object.values(categories)
          .filter(c => c !== correctAnswer)
          .sort(() => 0.5 - Math.random())
          .slice(0, preset.partsCount - 1);
        break;
        
      case 'selectByFunction':
        correctAnswer = randomPart.name;
        wrongAnswers = COMPUTER_PARTS
          .filter(p => p.id !== randomPart.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, preset.partsCount - 1)
          .map(p => p.name);
        break;
    }

    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    
    let correctAnswer;
    switch(gameMode) {
      case 'identifyPart':
      case 'selectByFunction':
        correctAnswer = currentPart.name;
        break;
      case 'identifyFunction':
        correctAnswer = currentPart.function;
        break;
      case 'matchCategory':
        const categories = {
          input: 'جهاز إدخال',
          output: 'جهاز إخراج',
          processing: 'معالجة',
          storage: 'تخزين'
        };
        correctAnswer = categories[currentPart.category];
        break;
    }
    
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

  const getQuestionText = () => {
    switch(gameMode) {
      case 'identifyPart':
        return GAME_MODES.identifyPart;
      case 'identifyFunction':
        return GAME_MODES.identifyFunction;
      case 'matchCategory':
        return GAME_MODES.matchCategory;
      case 'selectByFunction':
        return GAME_MODES.selectByFunction;
      default:
        return '';
    }
  };

  const getMainDisplay = () => {
    switch(gameMode) {
      case 'identifyPart':
      case 'identifyFunction':
      case 'matchCategory':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '8rem', mb: 2 }}>
              {currentPart.emoji}
            </Typography>
            {gameMode === 'identifyPart' && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {currentPart.description}
              </Typography>
            )}
          </>
        );
      case 'selectByFunction':
        return (
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#8b5cf6' }}>
            {currentPart.function}
          </Typography>
        );
      default:
        return null;
    }
  };

  if (!currentPart) return null;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button variant="outlined" onClick={onBack} sx={{ color: 'white', borderColor: 'white' }}>
            ← رجوع
          </Button>
          <Chip 
            icon={<Computer />} 
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
        <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.98)', textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, color: '#8b5cf6', fontWeight: 'bold' }}>
              {getQuestionText()}
            </Typography>
            {getMainDisplay()}
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
                    fontSize: '1.1rem',
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
                  الإجابة الصحيحة: {
                    gameMode === 'identifyFunction' ? currentPart.function :
                    gameMode === 'matchCategory' ? 
                      ({'input': 'جهاز إدخال', 'output': 'جهاز إخراج', 'processing': 'معالجة', 'storage': 'تخزين'}[currentPart.category]) :
                    currentPart.name
                  }
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
