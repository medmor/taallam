'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, Grid, Container, Chip } from '@mui/material';
import { preloadSfx, playSfx } from '@/lib/sfx';
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

  const gridSize = 5; // 5x5 Bingo card
  const centerCell = Math.floor(gridSize / 2); // Free space in center

  useEffect(() => {
    try { preloadSfx(); } catch (e) {}
  }, []);

  // Generate a math problem that equals a specific answer
  const generateProblemForAnswer = (answer) => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, problem;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * answer) + 1;
        num2 = answer - num1;
        problem = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = answer + Math.floor(Math.random() * 20) + 1;
        num2 = num1 - answer;
        problem = `${num1} - ${num2}`;
        break;
      case '*':
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

  // Start new game
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

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (!gameStarted || gameWon || !currentProblem) return;
    
    const cellNumber = bingoCard[row][col].number;
    const cellKey = `${row}-${col}`;
    
    if (bingoCard[row][col].isFree || markedCells.has(cellKey)) return;
    
    // Add to called numbers when player makes an attempt (reveal the answer)
    setCalledNumbers(prev => [...prev, currentProblem.answer]);
    
    if (cellNumber === currentProblem.answer) {
      const newMarkedCells = new Set([...markedCells, cellKey]);
      setMarkedCells(newMarkedCells);
      setScore(prev => prev + 1);
      setFeedback('صحيح! أحسنت');
      try { playSfx('correct'); } catch (e) {}
      
      // Check for win
      if (checkWin(newMarkedCells)) {
        setGameWon(true);
        setTimerActive(false);
        setFeedback('مبروك! لقد فزت في البينغو!');
        try { playSfx('win'); } catch (e) {}
      } else {
        // Generate next problem after delay
        setTimeout(() => {
          generateNextProblem();
          setFeedback('');
        }, 1500);
      }
    } else {
      setFeedback(`خطأ! الإجابة الصحيحة هي ${currentProblem.answer}`);
      try { playSfx('wrong'); } catch (e) {}
      
      setTimeout(() => {
        generateNextProblem();
        setFeedback('');
      }, 2000);
    }
  };

  return (
    <Container maxWidth="md" sx={{width: '100%'}}>
      <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 3 }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          لعبة البينغو الرياضي
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          احسب المسألة واختر الإجابة الصحيحة من كارت البينغو
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
            {/* Game Stats */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center', backgroundColor: 'background.default' }}>
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">
                    النتيجة: {score}/{totalProblems}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">
                    الوقت
                  </Typography>
                  <Timer active={timerActive} />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">
                    مسائل محلولة: {calledNumbers.length}
                  </Typography>
                </Grid>
              </Grid>
              
              {currentProblem && !gameWon && (
                <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold', color: 'primary.main', direction: 'ltr' }}>
                  {currentProblem.problem} = ?
                </Typography>
              )}
              
              {feedback && (
                <Alert 
                  severity={gameWon ? 'success' : (feedback.includes('صحيح') ? 'success' : 'error')} 
                  sx={{ mt: 2, fontSize: '1.1rem', borderRadius: 2 }}
                >
                  {feedback}
                </Alert>
              )}
            </Paper>

            {/* Bingo Card */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                كارت البينغو
              </Typography>
              
              <Grid container spacing={1} sx={{ maxWidth: 400, mx: 'auto' }}>
                {bingoCard.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`;
                    const isMarked = markedCells.has(cellKey);
                    const isFree = cell.isFree;
                    
                    return (
                      <Grid item xs={2.4} key={cellKey}>
                        <Button
                          variant={isMarked ? 'contained' : 'outlined'}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          disabled={gameWon || isMarked}
                          sx={{
                            width: '100%',
                            height: '60px',
                            fontSize: isFree ? '10px' : '14px',
                            fontWeight: 'bold',
                            backgroundColor: isMarked ? '#1976d2' : 'transparent',
                            color: isMarked ? 'white' : 'inherit',
                            border: isMarked ? 'none' : '2px solid #1976d2',
                            '&:hover': {
                              backgroundColor: isMarked ? '#1565c0' : '#e3f2fd',
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isFree ? 'مجاني' : cell.number}
                        </Button>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            </Paper>

            {/* Called Numbers */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                الأرقام المطلوبة
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', direction: 'ltr' }}>
                {calledNumbers.length > 0 ? (
                  calledNumbers.map((number, index) => (
                    <Chip 
                      key={index} 
                      label={number} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    لم يتم حل أي مسائل بعد
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Control Buttons */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={startGame}
                sx={{ mr: 2, borderRadius: 2 }}
              >
                لعبة جديدة
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
