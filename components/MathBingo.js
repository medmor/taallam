'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, Alert, Grid, Container, Chip, Zoom, Fade, LinearProgress } from '@mui/material';
import { preloadSfx, playSfx } from '@/lib/sfx';
import { GameProgressionManager } from '@/lib/gameEnhancements';
import { gameThemes, enhancedButtonStyles, cardAnimations, createFireworksEffect, enhancedSoundFeedback } from '@/lib/visualEnhancements';
import Timer from '@/components/Timer';

export default function MathBingo() {
  const [bingoCard, setBingoCard] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [markedCells, setMarkedCells] = useState(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [streak, setStreak] = useState(0);
  const [animatingCells, setAnimatingCells] = useState(new Set());
  const [showFireworks, setShowFireworks] = useState(false);
  
  const gameRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const gameManager = useRef(new GameProgressionManager('mathBingo')).current;

  const gridSize = 5; // 5x5 Bingo card
  const centerCell = Math.floor(gridSize / 2); // Free space in center
  const theme = gameThemes.math;

  useEffect(() => {
    try { preloadSfx(); } catch (e) {}
  }, []);

  // Generate a math problem that equals a specific answer with difficulty progression
  const generateProblemForAnswer = (answer) => {
    const currentLevel = gameManager.getCurrentLevel();
    const operations = gameManager.getOperationsForLevel(currentLevel);
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, problem;
    
    switch (operation) {
      case 'addition':
        num1 = Math.floor(Math.random() * answer) + 1;
        num2 = answer - num1;
        problem = `${num1} + ${num2}`;
        break;
      case 'subtraction':
        num1 = answer + Math.floor(Math.random() * 20) + 1;
        num2 = num1 - answer;
        problem = `${num1} - ${num2}`;
        break;
      case 'multiplication':
        if (answer <= 1) {
          num1 = 1;
          num2 = answer;
        } else {
          // Find factors of the answer
          const factors = [];
          for (let i = 1; i <= Math.min(answer, 12); i++) {
            if (answer % i === 0 && answer / i <= 12) {
              factors.push([i, answer / i]);
            }
          }
          if (factors.length > 0) {
            const [f1, f2] = factors[Math.floor(Math.random() * factors.length)];
            num1 = f1;
            num2 = f2;
          } else {
            // Fallback to addition
            num1 = Math.floor(Math.random() * answer) + 1;
            num2 = answer - num1;
            return `${num1} + ${num2}`;
          }
        }
        problem = `${num1} × ${num2}`;
        break;
      case 'division':
        // Create division problem where answer is the quotient
        const divisor = Math.floor(Math.random() * 9) + 2; // 2-10
        const dividend = answer * divisor;
        problem = `${dividend} ÷ ${divisor}`;
        break;
      default:
        num1 = Math.floor(Math.random() * answer) + 1;
        num2 = answer - num1;
        problem = `${num1} + ${num2}`;
    }
    
    return problem;
  };

  // Generate random numbers for bingo card (1-75)
  const generateBingoNumbers = () => {
    const numbers = new Set();
    while (numbers.size < gridSize * gridSize - 1) { // -1 for free space
      numbers.add(Math.floor(Math.random() * 75) + 1);
    }
    return Array.from(numbers);
  };

  // Create bingo card
  const createBingoCard = () => {
    const numbers = generateBingoNumbers();
    const card = [];
    let numberIndex = 0;
    
    for (let row = 0; row < gridSize; row++) {
      const cardRow = [];
      for (let col = 0; col < gridSize; col++) {
        if (row === centerCell && col === centerCell) {
          cardRow.push({ number: 'FREE', isFree: true });
        } else {
          cardRow.push({ number: numbers[numberIndex], isFree: false });
          numberIndex++;
        }
      }
      card.push(cardRow);
    }
    
    return card;
  };

  // Check for winning patterns
  const checkWin = (marked) => {
    const card = bingoCard;
    
    // Check rows
    for (let row = 0; row < gridSize; row++) {
      let rowComplete = true;
      for (let col = 0; col < gridSize; col++) {
        const cellKey = `${row}-${col}`;
        if (!card[row][col].isFree && !marked.has(cellKey)) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) return true;
    }
    
    // Check columns
    for (let col = 0; col < gridSize; col++) {
      let colComplete = true;
      for (let row = 0; row < gridSize; row++) {
        const cellKey = `${row}-${col}`;
        if (!card[row][col].isFree && !marked.has(cellKey)) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) return true;
    }
    
    // Check diagonals
    let diag1Complete = true;
    let diag2Complete = true;
    
    for (let i = 0; i < gridSize; i++) {
      const cellKey1 = `${i}-${i}`;
      const cellKey2 = `${i}-${gridSize - 1 - i}`;
      
      if (!card[i][i].isFree && !marked.has(cellKey1)) {
        diag1Complete = false;
      }
      if (!card[i][gridSize - 1 - i].isFree && !marked.has(cellKey2)) {
        diag2Complete = false;
      }
    }
    
    return diag1Complete || diag2Complete;
  };

  // Start new game with enhanced features
  const startGame = () => {
    const newCard = createBingoCard();
    setBingoCard(newCard);
    setCalledNumbers([]);
    setMarkedCells(new Set([`${centerCell}-${centerCell}`])); // Mark free space
    setGameStarted(true);
    setGameWon(false);
    setFeedback('');
    setTimerActive(true);
    setScore(0);
    setTotalProblems(0);
    setStreak(0);
    setAnimatingCells(new Set());
    setShowFireworks(false);
    
    // Initialize game manager
    gameManager.resetSession();
    
    generateNextProblem(newCard);
  };

  // Generate next math problem
  const generateNextProblem = (card = bingoCard) => {
    if (!card || card.length === 0) return;
    
    // Get all unmarked numbers
    const unmarkedNumbers = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!card[row][col].isFree && !markedCells.has(`${row}-${col}`)) {
          unmarkedNumbers.push(card[row][col].number);
        }
      }
    }
    
    if (unmarkedNumbers.length === 0) return;
    
    const targetNumber = unmarkedNumbers[Math.floor(Math.random() * unmarkedNumbers.length)];
    const problem = generateProblemForAnswer(targetNumber);
    
    setCurrentProblem({ problem, answer: targetNumber });
    // Don't add to calledNumbers here - only after player attempts
    setTotalProblems(prev => prev + 1);
  };

  // Handle cell click with enhanced feedback and animations
  const handleCellClick = (row, col) => {
    if (!gameStarted || gameWon || !currentProblem) return;
    
    const cellNumber = bingoCard[row][col].number;
    const cellKey = `${row}-${col}`;
    
    if (bingoCard[row][col].isFree || markedCells.has(cellKey)) return;
    
    // Add animation to clicked cell
    setAnimatingCells(prev => new Set([...prev, cellKey]));
    setTimeout(() => {
      setAnimatingCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    }, 600);
    
    // Add to called numbers when player makes an attempt (reveal the answer)
    setCalledNumbers(prev => [...prev, currentProblem.answer]);
    
    if (cellNumber === currentProblem.answer) {
      const newMarkedCells = new Set([...markedCells, cellKey]);
      setMarkedCells(newMarkedCells);
      
      // Update streak and score
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(prev => prev + 1);
      
      // Enhanced sound feedback based on streak
      enhancedSoundFeedback.playSuccess(newStreak);
      
      // Update game progression
      gameManager.recordAnswer(true);
      
      // Check for achievements
      if (newStreak === 5) {
        setFeedback('رائع! تسلسل من 5 إجابات صحيحة!');
        enhancedSoundFeedback.playAchievement();
      } else if (newStreak === 3) {
        setFeedback('ممتاز! تسلسل رائع!');
      } else {
        setFeedback('صحيح! أحسنت');
      }
      
      // Check for win
      if (checkWin(newMarkedCells)) {
        setGameWon(true);
        setTimerActive(false);
        setShowFireworks(true);
        setFeedback('مبروك! لقد فزت في البينغو!');
        
        // Trigger fireworks effect
        setTimeout(() => {
          if (particleCanvasRef.current) {
            createFireworksEffect(particleCanvasRef.current);
          }
        }, 300);
        
        enhancedSoundFeedback.playAchievement();
        gameManager.recordWin();
      } else {
        // Generate next problem after delay
        setTimeout(() => {
          generateNextProblem();
          setFeedback('');
        }, 1500);
      }
    } else {
      // Reset streak on wrong answer
      setStreak(0);
      gameManager.recordAnswer(false);
      
      setFeedback(`خطأ! الإجابة الصحيحة هي ${currentProblem.answer}`);
      enhancedSoundFeedback.playError();
      
      setTimeout(() => {
        generateNextProblem();
        setFeedback('');
      }, 2000);
    }
  };

  return (
    <Box 
      ref={gameRef}
      sx={{ 
        position: 'relative',
        minHeight: '100vh',
        background: theme.background,
        py: 3
      }}
    >
      {/* Particle Canvas for Effects */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000
        }}
        width={typeof window !== 'undefined' ? window.innerWidth : 1200}
        height={typeof window !== 'undefined' ? window.innerHeight : 800}
      />
      
      <Container maxWidth="md" sx={{width: '100%', position: 'relative', zIndex: 1}}>
        <Fade in timeout={800}>
          <Paper 
            elevation={8} 
            sx={{ 
              p: 4, 
              m: 2, 
              borderRadius: 4,
              background: theme.cardBg,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: theme.shadow
            }}
          >
            <Typography 
              variant="h4" 
              align="center" 
              sx={{ 
                mb: 3, 
                fontWeight: 'bold', 
                background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              لعبة البينغو الرياضي
            </Typography>
            
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                mb: 3, 
                color: 'text.secondary',
                fontSize: '1.1rem'
              }}
            >
              احسب المسألة واختر الإجابة الصحيحة من كارت البينغو
            </Typography>

            {!gameStarted ? (
              <Zoom in timeout={600}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={startGame}
                    sx={{
                      ...enhancedButtonStyles.primary(theme),
                      fontSize: '1.3rem', 
                      py: 3, 
                      px: 8,
                      minWidth: '200px'
                    }}
                  >
                    ابدأ اللعب
                  </Button>
                </Box>
              </Zoom>
        ) : (
          <>
            {/* Game Stats */}
            <Fade in timeout={600} style={{ transitionDelay: '200ms' }}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  textAlign: 'center', 
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 3,
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Grid container spacing={3} alignItems="center" justifyContent="center">
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                      النتيجة: {score}/{totalProblems}
                    </Typography>
                    {streak > 0 && (
                      <Typography variant="body2" sx={{ color: theme.accent, fontWeight: 'bold' }}>
                        تسلسل: {streak} 🔥
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                      المستوى
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.secondary }}>
                      {gameManager.getCurrentLevel()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                      الوقت
                    </Typography>
                    <Timer active={timerActive} />
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                      المحاولات: {calledNumbers.length}
                    </Typography>
                  </Grid>
                </Grid>
                
                {/* Progress Bar */}
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    تقدم المستوى: {gameManager.getLevelProgress()}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={gameManager.getLevelProgress()} 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`
                      }
                    }}
                  />
                </Box>
                
                {currentProblem && !gameWon && (
                  <Zoom in timeout={400}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        mt: 3, 
                        mb: 2, 
                        fontWeight: 'bold', 
                        background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        direction: 'ltr',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {currentProblem.problem} = ?
                    </Typography>
                  </Zoom>
                )}
                
                {feedback && (
                  <Zoom in timeout={300}>
                    <Alert 
                      severity={gameWon ? 'success' : (feedback.includes('صحيح') ? 'success' : 'error')} 
                      sx={{ 
                        mt: 2, 
                        fontSize: '1.1rem', 
                        borderRadius: 3,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {feedback}
                    </Alert>
                  </Zoom>
                )}
              </Paper>
            </Fade>

            {/* Enhanced Bingo Card */}
            <Fade in timeout={600} style={{ transitionDelay: '400ms' }}>
              <Paper 
                elevation={6} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(33, 150, 243, 0.1)'
                }}
              >
                <Typography 
                  variant="h5" 
                  align="center" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 'bold',
                    color: theme.primary,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  كارت البينغو
                </Typography>
                
                <Grid container spacing={1.5} sx={{ maxWidth: 420, mx: 'auto' }}>
                  {bingoCard.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const isMarked = markedCells.has(cellKey);
                      const isFree = cell.isFree;
                      const isAnimating = animatingCells.has(cellKey);
                      
                      return (
                        <Grid item xs={2.4} key={cellKey}>
                          <Zoom in timeout={400} style={{ transitionDelay: `${(rowIndex + colIndex) * 50}ms` }}>
                            <Button
                              variant={isMarked ? 'contained' : 'outlined'}
                              onClick={() => handleCellClick(rowIndex, colIndex)}
                              disabled={gameWon || isMarked}
                              sx={{
                                width: '100%',
                                height: '70px',
                                fontSize: isFree ? '11px' : '16px',
                                fontWeight: 'bold',
                                borderRadius: 3,
                                ...enhancedButtonStyles.choice(theme, isMarked, isMarked, false),
                                ...(isAnimating && cardAnimations.pulse),
                                background: isMarked 
                                  ? `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`
                                  : isFree 
                                  ? `linear-gradient(45deg, ${theme.accent}, #66bb6a)`
                                  : 'white',
                                color: isMarked || isFree ? 'white' : theme.primary,
                                border: `2px solid ${isMarked ? 'transparent' : theme.primary}`,
                                boxShadow: isMarked 
                                  ? `0 6px 20px ${theme.primary}40`
                                  : '0 4px 12px rgba(0,0,0,0.1)',
                                '&:hover': !isMarked && !gameWon ? {
                                  transform: 'translateY(-4px) scale(1.05)',
                                  boxShadow: `0 8px 25px ${theme.primary}30`,
                                  background: `linear-gradient(45deg, ${theme.primary}20, ${theme.secondary}20)`
                                } : {},
                                '&:disabled': {
                                  opacity: isMarked ? 1 : 0.6
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              {isFree ? 'مجاني' : cell.number}
                            </Button>
                          </Zoom>
                        </Grid>
                      );
                    })
                  )}
                </Grid>
              </Paper>
            </Fade>

            {/* Called Numbers */}
            <Fade in timeout={600} style={{ transitionDelay: '600ms' }}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 3,
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Typography 
                  variant="h6" 
                  align="center" 
                  sx={{ 
                    mb: 2, 
                    color: theme.primary,
                    fontWeight: 'bold'
                  }}
                >
                  الأرقام المطلوبة
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', direction: 'ltr' }}>
                  {calledNumbers.length > 0 ? (
                    calledNumbers.map((number, index) => (
                      <Zoom in timeout={300} style={{ transitionDelay: `${index * 50}ms` }} key={index}>
                        <Chip 
                          label={number} 
                          sx={{
                            background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            height: '36px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </Zoom>
                    ))
                  ) : (
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      لم يتم حل أي مسائل بعد
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Fade>

            {/* Enhanced Control Buttons */}
            <Fade in timeout={600} style={{ transitionDelay: '800ms' }}>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button 
                  variant="contained"
                  onClick={startGame}
                  sx={{
                    ...enhancedButtonStyles.primary(theme),
                    mr: 2,
                    fontSize: '1.1rem',
                    py: 2,
                    px: 4
                  }}
                >
                  لعبة جديدة
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => setGameStarted(false)}
                  sx={{
                    borderRadius: 3,
                    border: `2px solid ${theme.primary}`,
                    color: theme.primary,
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: theme.primary,
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  إنهاء اللعبة
                </Button>
              </Box>
            </Fade>
          </>
        )}
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
