'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, Grid, Container, LinearProgress } from '@mui/material';
import { preloadSfx, playSfx } from '@/lib/sfx';
import Timer from '@/components/Timer';

export default function NumberLineJump() {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [operationsInRound, setOperationsInRound] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const maxNumber = 20; // Number line goes from 0 to 20
  const operationsPerRound = 10;

  useEffect(() => {
    try { preloadSfx(); } catch (e) {}
  }, []);

  // Generate a random addition/subtraction problem
  const generateProblem = () => {
    const isAddition = Math.random() > 0.5;
    let num1, num2, answer;
    
    if (isAddition) {
      num1 = Math.floor(Math.random() * 8) + 1;
      num2 = Math.floor(Math.random() * 8) + 1;
      answer = num1 + num2;
      // Ensure answer doesn't exceed our number line
      if (answer > maxNumber) {
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
        answer = num1 + num2;
      }
    } else {
      num1 = Math.floor(Math.random() * 15) + 5;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
    }
    
    return {
      expression: `${num1} ${isAddition ? '+' : '-'} ${num2}`,
      answer,
      operation: isAddition ? 'addition' : 'subtraction',
      num1,
      num2
    };
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentRound(1);
    setOperationsInRound(0);
    setGameComplete(false);
    setPlayerPosition(0);
    setFeedback('');
    setIsCorrect(null);
    setTimerKey(k => k + 1);
    setTimerActive(true);
    setCurrentProblem(generateProblem());
  };

  const jumpToPosition = (position) => {
    if (!currentProblem || isJumping) return;
    
    setIsJumping(true);
    setPlayerPosition(position);
    
    // Animate jump effect
    setTimeout(() => {
      setIsJumping(false);
      
      if (position === currentProblem.answer) {
        setIsCorrect(true);
        setFeedback('صحيح! أحسنت');
        setScore(prev => prev + 1);
        try { playSfx('correct'); } catch (e) {}
      } else {
        setIsCorrect(false);
        setFeedback(`خطأ! الإجابة الصحيحة هي ${currentProblem.answer}`);
        try { playSfx('wrong'); } catch (e) {}
      }
      
      const newOperationsCount = operationsInRound + 1;
      setOperationsInRound(newOperationsCount);
      
      // Check if round is complete
      if (newOperationsCount >= operationsPerRound) {
        setGameComplete(true);
        setTimerActive(false);
        setFeedback(`انتهت الجولة! النتيجة: ${score + (position === currentProblem.answer ? 1 : 0)}/${operationsPerRound}`);
        try { playSfx('win'); } catch (e) {}
      } else {
        // Generate new problem after a delay
        setTimeout(() => {
          setCurrentProblem(generateProblem());
          setPlayerPosition(0);
          setFeedback('');
          setIsCorrect(null);
        }, 1500);
      }
    }, 300); // Animation duration
  };

  const renderNumberLine = () => {
    const numbers = Array.from({ length: maxNumber + 1 }, (_, i) => i);
    
    return (
      <Box sx={{ width: '100%', mb: 3 }}>
        <Grid container spacing={1} justifyContent="center">
          {numbers.map((num) => (
            <Grid item key={num} xs={2} sm={1.2} md={1}>
              <Button
                variant={playerPosition === num ? 'contained' : 'outlined'}
                color={playerPosition === num ? 'primary' : 'default'}
                onClick={() => jumpToPosition(num)}
                sx={{ 
                  width: '100%',
                  minWidth: '40px',
                  height: '50px', 
                  fontSize: { xs: '10px', sm: '12px' },
                  mb: 1,
                  backgroundColor: playerPosition === num ? '#1976d2' : 'transparent',
                  transform: playerPosition === num && isJumping ? 'translateY(-10px) scale(1.2)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: playerPosition === num ? 'translateY(-5px) scale(1.1)' : 'translateY(-2px)',
                  }
                }}
                disabled={!gameStarted || !currentProblem || gameComplete}
              >
                {playerPosition === num ? '🐸' : num}
              </Button>
            </Grid>
          ))}
        </Grid>
        
        {/* Visual number line */}
        <Box sx={{ 
          height: '4px', 
          backgroundColor: '#ccc', 
          position: 'relative',
          width: '100%',
          mt: 2,
          borderRadius: '2px'
        }}>
          {numbers.map((num) => (
            <Box
              key={num}
              sx={{
                position: 'absolute',
                left: `${(num / maxNumber) * 100}%`,
                top: '-8px',
                width: '2px',
                height: '20px',
                backgroundColor: '#666',
                transform: 'translateX(-50%)'
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 3 }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          لعبة القفز على خط الأرقام
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          اقفز إلى الرقم الصحيح لحل المسألة الحسابية
        </Typography>

        {!gameStarted ? (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={startGame}
              sx={{ fontSize: '1.2rem', py: 2, px: 6, borderRadius: 3 }}
            >
              ابدأ اللعب
            </Button>
          </Box>
        ) : (
          <>
            <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center', backgroundColor: 'background.default' }}>
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    النتيجة: {score}/{operationsPerRound}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(score / operationsPerRound) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    السؤال: {operationsInRound + 1}/{operationsPerRound}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(operationsInRound / operationsPerRound) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color="secondary"
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    الوقت
                  </Typography>
                  <Timer active={timerActive} key={timerKey} />
                </Grid>
              </Grid>
              
              {currentProblem && !gameComplete && (
                <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold', color: 'primary.main', direction:'ltr' }}>
                  {currentProblem.expression} = ?
                </Typography>
              )}
              
              {feedback && (
                <Alert 
                  severity={gameComplete ? 'info' : (isCorrect ? 'success' : 'error')} 
                  sx={{ mt: 2, fontSize: '1.1rem', borderRadius: 2 }}
                >
                  {feedback}
                </Alert>
              )}
            </Paper>

            {!gameComplete && renderNumberLine()}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={startGame}
                sx={{ mr: 2, borderRadius: 2 }}
              >
                إعادة تشغيل
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setGameStarted(false)}
                sx={{ borderRadius: 2 }}
              >
                إنهاء اللعبة
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
