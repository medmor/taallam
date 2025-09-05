import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip, TextField } from '@mui/material';
import { playSfx } from '@/lib/sfx';

const AreaCalculator = () => {
  const canvasRef = useRef(null);
  const [gridSize, setGridSize] = useState(10);
  const [cellSize, setCellSize] = useState(30);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [gameMode, setGameMode] = useState('area'); // 'area' or 'perimeter'
  const [targetValue, setTargetValue] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionType, setQuestionType] = useState('calculate'); // 'calculate' or 'draw'

  const generateNewChallenge = () => {
    const modes = ['area', 'perimeter'];
    const types = ['calculate', 'draw'];
    
    const newMode = modes[Math.floor(Math.random() * modes.length)];
    const newType = types[Math.floor(Math.random() * types.length)];
    
    setGameMode(newMode);
    setQuestionType(newType);
    setSelectedCells(new Set());
    setUserAnswer('');
    setShowResult(false);
    
    if (newType === 'calculate') {
      // Generate a random shape and ask for area/perimeter
      generateRandomShape();
    } else {
      // Ask user to draw a shape with specific area/perimeter
      let target;
      if (newMode === 'area') {
        target = Math.floor(Math.random() * (10 + level * 3)) + 4;
      } else {
        // For perimeter, ensure it's even (impossible to create odd perimeter shapes in grid)
        target = (Math.floor(Math.random() * (5 + level * 2)) + 2) * 2;
      }
      setTargetValue(target);
    }
  };

  const generateRandomShape = () => {
    const newSelectedCells = new Set();
    const numCells = Math.floor(Math.random() * (8 + level * 2)) + 3;
    
    // Start with a random cell
    let startRow = Math.floor(Math.random() * (gridSize - 4)) + 2;
    let startCol = Math.floor(Math.random() * (gridSize - 4)) + 2;
    
    const queue = [`${startRow},${startCol}`];
    newSelectedCells.add(`${startRow},${startCol}`);
    
    // Generate connected shape
    while (newSelectedCells.size < numCells && queue.length > 0) {
      const current = queue.shift();
      const [row, col] = current.split(',').map(Number);
      
      // Try to add adjacent cells
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];
      
      directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        const cellKey = `${newRow},${newCol}`;
        
        if (newRow >= 0 && newRow < gridSize && 
            newCol >= 0 && newCol < gridSize && 
            !newSelectedCells.has(cellKey) &&
            Math.random() > 0.5) {
          newSelectedCells.add(cellKey);
          queue.push(cellKey);
        }
      });
    }
    
    setSelectedCells(newSelectedCells);
  };

  const calculateArea = (cells) => {
    return cells.size;
  };

  const calculatePerimeter = (cells) => {
    let perimeter = 0;
    
    cells.forEach(cellKey => {
      const [row, col] = cellKey.split(',').map(Number);
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];
      
      directions.forEach(([dr, dc]) => {
        const adjacentKey = `${row + dr},${col + dc}`;
        if (!cells.has(adjacentKey)) {
          perimeter++;
        }
      });
    });
    
    return perimeter;
  };

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }
    
    // Draw selected cells
    selectedCells.forEach(cellKey => {
      const [row, col] = cellKey.split(',').map(Number);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(col * cellSize + 1, row * cellSize + 1, 
                   cellSize - 2, cellSize - 2);
    });
    
    // Highlight perimeter for perimeter mode
    if (gameMode === 'perimeter' && questionType === 'calculate') {
      ctx.strokeStyle = '#f44336';
      ctx.lineWidth = 3;
      
      selectedCells.forEach(cellKey => {
        const [row, col] = cellKey.split(',').map(Number);
        const directions = [
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ];
        
        directions.forEach(([dr, dc]) => {
          const adjacentKey = `${row + dr},${col + dc}`;
          if (!selectedCells.has(adjacentKey)) {
            // Draw perimeter edge
            if (dr === -1) { // Top edge
              ctx.beginPath();
              ctx.moveTo(col * cellSize, row * cellSize);
              ctx.lineTo((col + 1) * cellSize, row * cellSize);
              ctx.stroke();
            } else if (dr === 1) { // Bottom edge
              ctx.beginPath();
              ctx.moveTo(col * cellSize, (row + 1) * cellSize);
              ctx.lineTo((col + 1) * cellSize, (row + 1) * cellSize);
              ctx.stroke();
            } else if (dc === -1) { // Left edge
              ctx.beginPath();
              ctx.moveTo(col * cellSize, row * cellSize);
              ctx.lineTo(col * cellSize, (row + 1) * cellSize);
              ctx.stroke();
            } else if (dc === 1) { // Right edge
              ctx.beginPath();
              ctx.moveTo((col + 1) * cellSize, row * cellSize);
              ctx.lineTo((col + 1) * cellSize, (row + 1) * cellSize);
              ctx.stroke();
            }
          }
        });
      });
    }
  };

  const handleCanvasClick = (event) => {
    if (questionType === 'calculate') return;
    
    playSfx('click'); // Add click sound
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      const cellKey = `${row},${col}`;
      const newSelectedCells = new Set(selectedCells);
      
      if (newSelectedCells.has(cellKey)) {
        newSelectedCells.delete(cellKey);
      } else {
        newSelectedCells.add(cellKey);
      }
      
      setSelectedCells(newSelectedCells);
    }
  };

  const checkAnswer = () => {
    let correct = false;
    
    if (questionType === 'calculate') {
      const actualValue = gameMode === 'area' 
        ? calculateArea(selectedCells)
        : calculatePerimeter(selectedCells);
      correct = parseInt(userAnswer) === actualValue;
    } else {
      const userValue = gameMode === 'area'
        ? calculateArea(selectedCells)
        : calculatePerimeter(selectedCells);
      correct = userValue === targetValue;
    }
    
    setIsCorrect(correct);
    setShowResult(true);
    
    // Play sound effect
    playSfx(correct ? 'correct' : 'wrong');
    
    if (correct) {
      setScore(prev => prev + level);
      setTimeout(() => {
        if (score > 0 && score % 10 === 9) {
          setLevel(prev => prev + 1);
        }
        generateNewChallenge();
      }, 2000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setSelectedCells(new Set());
    setUserAnswer('');
    setShowResult(false);
    generateNewChallenge();
  };

  const clearGrid = () => {
    playSfx('slide'); // Add clear sound
    setSelectedCells(new Set());
    setUserAnswer('');
    setShowResult(false);
  };

  useEffect(() => {
    generateNewChallenge();
  }, []);

  useEffect(() => {
    drawGrid();
  }, [selectedCells, gameMode, questionType]);

  const getQuestionText = () => {
    if (questionType === 'calculate') {
      return gameMode === 'area' 
        ? 'احسب المساحة (عدد المربعات الخضراء):'
        : 'احسب المحيط (عدد الخطوط الحمراء حول الشكل):';
    } else {
      return gameMode === 'area'
        ? `ارسم شكلاً مساحته ${targetValue} مربع:`
        : `ارسم شكلاً محيطه ${targetValue} وحدة:`;
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 900, 
      mx: 'auto', 
      p: 3, 
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: '20px'
    }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ color: '#2196f3', fontWeight: 'bold' }}>
        📐 حاسبة المساحة والمحيط
      </Typography>
      
      {/* Score and Level */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip 
          label={gameMode === 'area' ? 'المساحة' : 'المحيط'} 
          color="success" 
          size="large" 
        />
      </Box>

      {/* Question */}
      <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
        {getQuestionText()}
      </Typography>

      {/* Grid Canvas */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{ 
            border: '2px solid #ddd', 
            borderRadius: '8px',
            cursor: questionType === 'draw' ? 'pointer' : 'default'
          }}
        />
      </Paper>

      {/* Answer Input for Calculate Mode */}
      {questionType === 'calculate' && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="الإجابة"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            type="number"
            variant="outlined"
            size="medium"
            sx={{ mr: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={checkAnswer}
            size="large"
            disabled={!userAnswer.trim()}
          >
            تحقق
          </Button>
        </Box>
      )}

      {/* Submit Button for Draw Mode */}
      {questionType === 'draw' && (
        <Box sx={{ mb: 3 }}>
          {/* <Typography variant="body1" sx={{ mb: 1, color: '#666' }}>
            {gameMode === 'area' 
              ? `المساحة الحالية: ${calculateArea(selectedCells)}`
              : `المحيط الحالي: ${calculatePerimeter(selectedCells)}`
            }
          </Typography> */}
          <Button 
            variant="contained" 
            onClick={checkAnswer}
            size="large"
            disabled={selectedCells.size === 0}
          >
            تحقق من الرسم
          </Button>
        </Box>
      )}

      {/* Instructions */}
      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        {questionType === 'draw' 
          ? 'انقر على المربعات لتحديدها أو إلغاء تحديدها'
          : gameMode === 'area'
            ? 'عد المربعات الخضراء لحساب المساحة'
            : 'عد الخطوط الحمراء حول الشكل لحساب المحيط'
        }
      </Typography>

      {/* Result Message */}
      {showResult && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 3,
            backgroundColor: isCorrect ? '#e8f5e8' : '#ffeaea',
            border: `2px solid ${isCorrect ? '#4caf50' : '#f44336'}`
          }}
        >
          <Typography variant="h6" sx={{ color: isCorrect ? '#2e7d32' : '#d32f2f' }}>
            {isCorrect ? '🎉 ممتاز! إجابة صحيحة!' : '❌ حاول مرة أخرى'}
          </Typography>
          {!isCorrect && questionType === 'calculate' && (
            <Typography variant="body1" sx={{ mt: 1, color: '#666' }}>
              الإجابة الصحيحة: {gameMode === 'area' 
                ? calculateArea(selectedCells)
                : calculatePerimeter(selectedCells)
              }
            </Typography>
          )}
        </Paper>
      )}

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          onClick={clearGrid}
          size="large"
        >
          مسح الشبكة
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={generateNewChallenge}
          size="large"
        >
          تحدي جديد
        </Button>
        
        <Button 
          variant="contained" 
          onClick={resetGame}
          size="large"
          color="secondary"
        >
          إعادة تشغيل
        </Button>
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f7ff', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          💡 معلومات مفيدة
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📏 <strong>المساحة:</strong> عدد المربعات داخل الشكل
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔲 <strong>المحيط:</strong> طول الخط المحيط بالشكل من الخارج
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🎯 <strong>نصيحة:</strong> في الشبكة، كل مربع مساحته = 1، وكل ضلع طوله = 1
        </Typography>
        <Typography variant="body2" sx={{ color: '#e65100' }}>
          ⚠️ <strong>ملاحظة:</strong> المحيط في الشبكة دائماً رقم زوجي
        </Typography>
      </Box>
    </Box>
  );
};

export default AreaCalculator;
