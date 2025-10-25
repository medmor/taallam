"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, LinearProgress, Chip, Paper } from '@mui/material';
import { List, CheckCircle, Cancel, EmojiEvents, DragIndicator } from '@mui/icons-material';
import Timer from './Timer';
import { playSfx } from '@/lib/sfx';
import {
  difficultyLevels,
  createParticleEffect,
  createPulseAnimation,
  createShakeAnimation,
} from '@/lib/gameEnhancements';

// Sequences dataset
const SEQUENCES = [
  {
    id: 'brushTeeth',
    title: 'تنظيف الأسنان',
    emoji: '🦷',
    steps: [
      { id: 1, text: 'أحضر فرشاة الأسنان', icon: '🪥' },
      { id: 2, text: 'ضع معجون الأسنان', icon: '🧴' },
      { id: 3, text: 'نظف أسنانك', icon: '😁' },
      { id: 4, text: 'اشطف فمك بالماء', icon: '💧' }
    ]
  },
  {
    id: 'makeSandwich',
    title: 'صنع ساندويتش',
    emoji: '🥪',
    steps: [
      { id: 1, text: 'أحضر خبز', icon: '🍞' },
      { id: 2, text: 'ضع الجبن', icon: '🧀' },
      { id: 3, text: 'أضف الطماطم', icon: '🍅' },
      { id: 4, text: 'غطّه بخبزة أخرى', icon: '🥪' }
    ]
  },
  {
    id: 'washHands',
    title: 'غسل اليدين',
    emoji: '🧼',
    steps: [
      { id: 1, text: 'افتح الماء', icon: '🚰' },
      { id: 2, text: 'ضع الصابون', icon: '🧼' },
      { id: 3, text: 'افرك يديك جيداً', icon: '👏' },
      { id: 4, text: 'اشطف بالماء', icon: '💧' },
      { id: 5, text: 'جفف يديك', icon: '🧻' }
    ]
  },
  {
    id: 'plantSeed',
    title: 'زراعة بذرة',
    emoji: '🌱',
    steps: [
      { id: 1, text: 'احفر حفرة صغيرة', icon: '⛏️' },
      { id: 2, text: 'ضع البذرة', icon: '🌰' },
      { id: 3, text: 'غطّ البذرة بالتراب', icon: '🟫' },
      { id: 4, text: 'اسق بالماء', icon: '💧' }
    ]
  },
  {
    id: 'makeTea',
    title: 'صنع الشاي',
    emoji: '☕',
    steps: [
      { id: 1, text: 'اغلِ الماء', icon: '♨️' },
      { id: 2, text: 'ضع كيس الشاي', icon: '🫖' },
      { id: 3, text: 'اسكب الماء الساخن', icon: '☕' },
      { id: 4, text: 'انتظر دقيقتين', icon: '⏱️' },
      { id: 5, text: 'أخرج كيس الشاي', icon: '✅' }
    ]
  },
  {
    id: 'getReady',
    title: 'الاستعداد للمدرسة',
    emoji: '🎒',
    steps: [
      { id: 1, text: 'استيقظ من النوم', icon: '⏰' },
      { id: 2, text: 'ارتد ملابسك', icon: '👕' },
      { id: 3, text: 'تناول الإفطار', icon: '🥣' },
      { id: 4, text: 'احمل حقيبتك', icon: '🎒' },
      { id: 5, text: 'اذهب إلى المدرسة', icon: '🚌' }
    ]
  },
  {
    id: 'drawCircle',
    title: 'رسم دائرة',
    emoji: '⭕',
    steps: [
      { id: 1, text: 'أحضر ورقة وقلم', icon: '📝' },
      { id: 2, text: 'ضع نقطة في المنتصف', icon: '•' },
      { id: 3, text: 'ارسم خطاً دائرياً', icon: '⭕' },
      { id: 4, text: 'أغلق الدائرة', icon: '🔵' }
    ]
  },
  {
    id: 'cookRice',
    title: 'طبخ الأرز',
    emoji: '🍚',
    steps: [
      { id: 1, text: 'اغسل الأرز', icon: '💧' },
      { id: 2, text: 'ضعه في قدر', icon: '🍲' },
      { id: 3, text: 'أضف الماء', icon: '💧' },
      { id: 4, text: 'اطبخه على النار', icon: '🔥' },
      { id: 5, text: 'انتظر حتى ينضج', icon: '⏱️' }
    ]
  }
];

// Difficulty presets
const difficultyPresets = {
  beginner: { rounds: 6, maxSteps: 4, timeLimit: null },
  intermediate: { rounds: 8, maxSteps: 5, timeLimit: null },
  advanced: { rounds: 10, maxSteps: 5, timeLimit: 120 }
};

export default function SequenceStepsGame({ level = 'beginner', onComplete, onBack }) {
  const preset = difficultyPresets[level];
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentSequence, setCurrentSequence] = useState(null);
  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(preset.timeLimit);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    generateQuestion();
  }, [currentRound]);

  const generateQuestion = () => {
    setFeedback(null);
    setUserOrder([]);
    setDraggedItem(null);

    // Filter sequences by max steps
    const validSequences = SEQUENCES.filter(s => s.steps.length <= preset.maxSteps);
    const randomSeq = validSequences[Math.floor(Math.random() * validSequences.length)];
    setCurrentSequence(randomSeq);

    // Shuffle steps
    const shuffled = [...randomSeq.steps].sort(() => 0.5 - Math.random());
    setShuffledSteps(shuffled);
  };

  const handleStepClick = (step) => {
    if (userOrder.find(s => s.id === step.id)) {
      // Remove from order if already selected
      setUserOrder(userOrder.filter(s => s.id !== step.id));
      playSfx('click');
    } else {
      // Add to order
      setUserOrder([...userOrder, step]);
      playSfx('click');
    }
  };

  const handleSubmit = () => {
    if (userOrder.length !== currentSequence.steps.length) {
      return;
    }

    const isCorrect = userOrder.every((step, index) => 
      step.id === currentSequence.steps[index].id
    );

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
    }, 2000);
  };

  const handleReset = () => {
    setUserOrder([]);
  };

  if (!currentSequence) return null;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', py: 4 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button variant="outlined" onClick={onBack} sx={{ color: 'white', borderColor: 'white' }}>
            ← رجوع
          </Button>
          <Chip 
            icon={<List />} 
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
            <Typography variant="h6" sx={{ mb: 2, color: '#8b5cf6', fontWeight: 'bold' }}>
              رتّب الخطوات بالترتيب الصحيح
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {currentSequence.emoji}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              {currentSequence.title}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Steps to arrange */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.98)', minHeight: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#8b5cf6', fontWeight: 'bold', textAlign: 'center' }}>
                  الخطوات المتاحة
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {shuffledSteps.map((step) => {
                    const isSelected = userOrder.find(s => s.id === step.id);
                    return (
                      <Paper
                        key={step.id}
                        elevation={isSelected ? 0 : 3}
                        sx={{
                          p: 2,
                          cursor: isSelected ? 'default' : 'pointer',
                          opacity: isSelected ? 0.3 : 1,
                          bgcolor: isSelected ? '#f1f5f9' : 'white',
                          border: '2px solid',
                          borderColor: isSelected ? '#cbd5e1' : 'transparent',
                          '&:hover': {
                            bgcolor: isSelected ? '#f1f5f9' : '#f8fafc',
                            borderColor: isSelected ? '#cbd5e1' : '#8b5cf6',
                          },
                          transition: 'all 0.2s',
                          pointerEvents: isSelected ? 'none' : 'auto'
                        }}
                        onClick={() => !isSelected && handleStepClick(step)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h5">{step.icon}</Typography>
                          <Typography variant="body1" sx={{ flex: 1 }}>
                            {step.text}
                          </Typography>
                          <DragIndicator sx={{ color: '#94a3b8' }} />
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User's sequence */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.98)', minHeight: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#22c55e', fontWeight: 'bold', textAlign: 'center' }}>
                  الترتيب الصحيح
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {userOrder.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                      <Typography color="text.secondary">
                        اضغط على الخطوات بالترتيب
                      </Typography>
                    </Paper>
                  )}
                  {userOrder.map((step, index) => (
                    <Paper
                      key={step.id}
                      elevation={3}
                      sx={{
                        p: 2,
                        bgcolor: 'white',
                        border: '2px solid #22c55e',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#fee2e2',
                          borderColor: '#ef4444',
                        }
                      }}
                      onClick={() => handleStepClick(step)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={index + 1} 
                          size="small" 
                          sx={{ bgcolor: '#22c55e', color: 'white', fontWeight: 'bold' }}
                        />
                        <Typography variant="h5">{step.icon}</Typography>
                        <Typography variant="body1" sx={{ flex: 1 }}>
                          {step.text}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={userOrder.length === 0 || feedback !== null}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            إعادة تعيين
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={userOrder.length !== currentSequence.steps.length || feedback !== null}
            sx={{ 
              bgcolor: '#22c55e',
              '&:hover': { bgcolor: '#16a34a' },
              px: 4
            }}
          >
            تحقق من الإجابة ✓
          </Button>
        </Box>

        {/* Feedback */}
        {feedback && (
          <Card sx={{ mt: 3, bgcolor: feedback === 'correct' ? '#22c55e' : '#ef4444', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {feedback === 'correct' ? '✅ ممتاز! الترتيب صحيح!' : '❌ الترتيب غير صحيح'}
              </Typography>
              {feedback === 'wrong' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>الترتيب الصحيح:</Typography>
                  {currentSequence.steps.map((step, index) => (
                    <Typography key={step.id} variant="body2">
                      {index + 1}. {step.icon} {step.text}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
