"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import { Mouse, CheckCircle, EmojiEvents, Speed } from '@mui/icons-material';
import Timer from './Timer';
import { playSfx } from '@/lib/sfx';
import {
  difficultyLevels,
  createParticleEffect,
  createPulseAnimation,
  createShakeAnimation,
} from '@/lib/gameEnhancements';

// Difficulty presets
const difficultyPresets = {
  beginner: { rounds: 6, targetSize: 100, speed: 3000, timeLimit: null },
  intermediate: { rounds: 8, targetSize: 80, speed: 2500, timeLimit: null },
  advanced: { rounds: 10, targetSize: 60, speed: 2000, timeLimit: 120 }
};

// Game types
const GAME_TYPES = [
  'click', // Simple clicking
  'doubleClick', // Double click practice
  'dragDrop', // Drag and drop
  'hover' // Hover practice
];

export default function MouseControlGame({ level = 'beginner', onComplete, onBack }) {
  const preset = difficultyPresets[level];
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameType, setGameType] = useState('click');
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [dragSource, setDragSource] = useState({ x: 0, y: 0 });
  const [dragTarget, setDragTarget] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPosition, setDraggedPosition] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [timeLeft, setTimeLeft] = useState(preset.timeLimit);
  const gameAreaRef = useRef(null);
  const hoverIntervalRef = useRef(null);

  useEffect(() => {
    generateChallenge();
  }, [currentRound]);

  useEffect(() => {
    if (isHovering && gameType === 'hover') {
      hoverIntervalRef.current = setInterval(() => {
        setHoverTime(prev => {
          if (prev + 0.1 >= 2) {
            handleSuccess();
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
      if (!isHovering && gameType === 'hover') {
        setHoverTime(0);
      }
    }
    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, [isHovering, gameType]);

  const generateChallenge = () => {
    setFeedback(null);
    setClickCount(0);
    setHoverTime(0);
    setIsHovering(false);
    setIsDragging(false);
    setDraggedPosition(null);

    // Select random game type
    const randomType = GAME_TYPES[Math.floor(Math.random() * GAME_TYPES.length)];
    setGameType(randomType);

    // Generate random positions
    if (randomType === 'dragDrop') {
      setDragSource(getRandomPosition());
      setDragTarget(getRandomPosition());
    } else {
      setTargetPosition(getRandomPosition());
    }
  };

  const getRandomPosition = () => {
    const margin = preset.targetSize;
    return {
      x: margin + Math.random() * (600 - 2 * margin),
      y: margin + Math.random() * (400 - 2 * margin)
    };
  };

  const handleSuccess = () => {
    setFeedback('correct');
    setScore(score + 1);
    setStreak(streak + 1);
    playSfx('correct');

    setTimeout(() => {
      if (currentRound + 1 >= preset.rounds) {
        playSfx('win');
        onComplete(score + 1, preset.timeLimit ? preset.timeLimit - timeLeft : 0);
      } else {
        setCurrentRound(currentRound + 1);
      }
    }, 1000);
  };

  const handleClick = () => {
    if (gameType === 'click') {
      playSfx('click');
      handleSuccess();
    }
  };

  const handleDoubleClick = () => {
    if (gameType === 'doubleClick') {
      setClickCount(prev => {
        if (prev + 1 >= 2) {
          handleSuccess();
          return 0;
        }
        return prev + 1;
      });
    }
  };

  const handleMouseDown = (e) => {
    if (gameType === 'dragDrop' && !isDragging) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const distance = Math.sqrt(
        Math.pow(x - dragSource.x, 2) + Math.pow(y - dragSource.y, 2)
      );
      
      if (distance < preset.targetSize / 2) {
        setIsDragging(true);
        setDraggedPosition({ x, y });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && gameType === 'dragDrop') {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDraggedPosition({ x, y });
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging && gameType === 'dragDrop') {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const distance = Math.sqrt(
        Math.pow(x - dragTarget.x, 2) + Math.pow(y - dragTarget.y, 2)
      );
      
      if (distance < preset.targetSize / 2) {
        handleSuccess();
      } else {
        setFeedback('wrong');
        playSfx('wrong');
        setTimeout(() => setFeedback(null), 1000);
      }
      
      setIsDragging(false);
      setDraggedPosition(null);
    }
  };

  const getInstructionText = () => {
    switch(gameType) {
      case 'click':
        return '🖱️ اضغط على الدائرة';
      case 'doubleClick':
        return '🖱️🖱️ اضغط ضغطتين سريعتين';
      case 'dragDrop':
        return '↔️ اسحب الدائرة الزرقاء إلى الخضراء';
      case 'hover':
        return '👆 حوّم الفأرة فوق الدائرة لمدة ثانيتين';
      default:
        return '';
    }
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
            icon={<Mouse />} 
            label={`المستوى: ${level === 'beginner' ? 'مبتدئ' : level === 'intermediate' ? 'متوسط' : 'متقدم'}`}
            sx={{ bgcolor: 'white', fontWeight: 'bold' }}
          />
        </Box>

        {/* Progress & Stats */}
        <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">
                التحدي {currentRound + 1} من {preset.rounds}
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

        {/* Instruction */}
        <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.98)', textAlign: 'center', py: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 'bold' }}>
              {getInstructionText()}
            </Typography>
          </CardContent>
        </Card>

        {/* Game Area */}
        <Card 
          ref={gameAreaRef}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.98)', 
            position: 'relative',
            height: 500,
            overflow: 'hidden',
            cursor: gameType === 'dragDrop' ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Click/DoubleClick/Hover Target */}
          {(gameType === 'click' || gameType === 'doubleClick' || gameType === 'hover') && (
            <Box
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              sx={{
                position: 'absolute',
                left: targetPosition.x - preset.targetSize / 2,
                top: targetPosition.y - preset.targetSize / 2,
                width: preset.targetSize,
                height: preset.targetSize,
                borderRadius: '50%',
                bgcolor: gameType === 'hover' ? '#f59e0b' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <Typography variant="h4" sx={{ color: 'white' }}>
                {gameType === 'click' ? '👆' : gameType === 'doubleClick' ? '✌️' : '⏱️'}
              </Typography>
              {gameType === 'hover' && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: '#e5e7eb',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(hoverTime / 2) * 100}%`,
                      bgcolor: '#22c55e',
                      borderRadius: 2,
                      transition: 'width 0.1s linear',
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Drag & Drop */}
          {gameType === 'dragDrop' && (
            <>
              {/* Source (if not dragging) */}
              {!isDragging && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: dragSource.x - preset.targetSize / 2,
                    top: dragSource.y - preset.targetSize / 2,
                    width: preset.targetSize,
                    height: preset.targetSize,
                    borderRadius: '50%',
                    bgcolor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'white' }}>📦</Typography>
                </Box>
              )}
              
              {/* Dragged item */}
              {isDragging && draggedPosition && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: draggedPosition.x - preset.targetSize / 2,
                    top: draggedPosition.y - preset.targetSize / 2,
                    width: preset.targetSize,
                    height: preset.targetSize,
                    borderRadius: '50%',
                    bgcolor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grabbing',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    opacity: 0.8,
                    pointerEvents: 'none',
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'white' }}>📦</Typography>
                </Box>
              )}
              
              {/* Target */}
              <Box
                sx={{
                  position: 'absolute',
                  left: dragTarget.x - preset.targetSize / 2,
                  top: dragTarget.y - preset.targetSize / 2,
                  width: preset.targetSize,
                  height: preset.targetSize,
                  borderRadius: '50%',
                  border: '4px dashed #22c55e',
                  bgcolor: 'rgba(34, 197, 94, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4">🎯</Typography>
              </Box>
            </>
          )}

          {/* Feedback */}
          {feedback && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: feedback === 'correct' ? '#22c55e' : '#ef4444',
                color: 'white',
                px: 4,
                py: 2,
                borderRadius: 4,
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                zIndex: 1000,
              }}
            >
              {feedback === 'correct' ? '✅ أحسنت!' : '❌ حاول مرة أخرى'}
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
