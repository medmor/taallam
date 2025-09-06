import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const NumberPyramid = () => {
  const canvasRef = useRef(null);
  const [pyramid, setPyramid] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [missingCells, setMissingCells] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(8);
  const [pyramidSize, setPyramidSize] = useState(4); // Start with 4 rows

  const pyramidColors = {
    background: "#f8f9fa",
    primary: "#2196f3",
    secondary: "#4caf50",
    accent: "#ff9800",
    correct: "#4caf50",
    incorrect: "#f44336",
    block: "#e3f2fd",
    missing: "#fff3e0",
    input: "#ffffff",
  };

  const generatePyramid = () => {
    // Determine pyramid size based on level
    const size = level <= 2 ? 4 : level <= 4 ? 5 : 6;
    setPyramidSize(size);

    // Generate base row with random numbers
    const baseRow = [];
    for (let i = 0; i < size; i++) {
      baseRow.push(Math.floor(Math.random() * 20) + 1);
    }

    // Build pyramid from bottom up
    const newPyramid = [baseRow];
    for (let row = 1; row < size; row++) {
      const currentRow = [];
      const prevRow = newPyramid[row - 1];
      
      for (let col = 0; col < size - row; col++) {
        const sum = prevRow[col] + prevRow[col + 1];
        currentRow.push(sum);
      }
      newPyramid.push(currentRow);
    }

    // Reverse to have tip at top
    newPyramid.reverse();

    // Determine which cells to hide (make them missing)
    const missing = [];
    const totalCells = size * (size + 1) / 2;
    const numMissing = Math.min(Math.floor(totalCells * 0.3), level + 2); // 30% or level+2, whichever is smaller

    // Choose random cells to hide, but ensure some are solvable
    const availableCells = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < newPyramid[row].length; col++) {
        availableCells.push({ row, col });
      }
    }

    // Shuffle and pick cells to hide
    availableCells.sort(() => Math.random() - 0.5);
    for (let i = 0; i < numMissing && i < availableCells.length; i++) {
      missing.push(availableCells[i]);
    }

    setPyramid(newPyramid);
    setMissingCells(missing);
    setUserInputs({});
    setShowResult(false);
  };

  const drawPyramid = () => {
    const canvas = canvasRef.current;
    if (!canvas || pyramid.length === 0) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = pyramidColors.background;
    ctx.fillRect(0, 0, width, height);

    const blockSize = 60;
    const blockSpacing = 70;
    const startY = 50; // Increased from 20 to give more space at top

    pyramid.forEach((row, rowIndex) => {
      const rowWidth = row.length * blockSpacing;
      const startX = (width - rowWidth) / 2 + blockSpacing / 2;

      row.forEach((value, colIndex) => {
        const x = startX + colIndex * blockSpacing;
        const y = startY + rowIndex * blockSpacing;

        const cellKey = `${rowIndex}-${colIndex}`;
        const isMissing = missingCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
        const userValue = userInputs[cellKey];

        // Choose block color
        let blockColor = pyramidColors.block;
        let textColor = "#333";
        
        if (isMissing) {
          if (showResult) {
            const isUserCorrect = parseInt(userValue) === value;
            blockColor = isUserCorrect ? pyramidColors.correct : pyramidColors.incorrect;
            textColor = "#fff";
          } else {
            blockColor = pyramidColors.missing;
          }
        }

        // Draw block
        ctx.fillStyle = blockColor;
        ctx.fillRect(x - blockSize/2, y - blockSize/2, blockSize, blockSize);

        // Draw border
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - blockSize/2, y - blockSize/2, blockSize, blockSize);

        // Draw value or letter label
        ctx.fillStyle = textColor;
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (isMissing && !showResult) {
          // Show Arabic letter label instead of user input
          const letterIndex = missingCells.findIndex(cell => cell.row === rowIndex && cell.col === colIndex);
          const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];
          const letter = arabicLetters[letterIndex] || '؟';
          ctx.fillStyle = "#ff6b35";
          ctx.font = "bold 24px Arial";
          ctx.fillText(letter, x, y);
        } else if (isMissing && showResult) {
          // Show correct answer
          ctx.fillText(value.toString(), x, y);
        } else {
          // Show actual value
          ctx.fillText(value.toString(), x, y);
        }
      });
    });

    // Draw pyramid structure lines (optional visual enhancement)
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    pyramid.forEach((row, rowIndex) => {
      if (rowIndex < pyramid.length - 1) {
        const rowWidth = row.length * blockSpacing;
        const startX = (width - rowWidth) / 2 + blockSpacing / 2;
        const y = startY + rowIndex * blockSpacing;

        row.forEach((value, colIndex) => {
          if (colIndex < row.length - 1) {
            const x1 = startX + colIndex * blockSpacing;
            const x2 = startX + (colIndex + 1) * blockSpacing;
            const nextY = startY + (rowIndex + 1) * blockSpacing;
            const nextX = (width - (row.length - 1) * blockSpacing) / 2 + blockSpacing / 2 + colIndex * blockSpacing;

            // Draw lines to blocks below
            ctx.beginPath();
            ctx.moveTo(x1, y + blockSize/2);
            ctx.lineTo(nextX, nextY - blockSize/2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x2, y + blockSize/2);
            ctx.lineTo(nextX + blockSpacing, nextY - blockSize/2);
            ctx.stroke();
          }
        });
      }
    });
  };

  const handleInputChange = (rowIndex, colIndex, value) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    const numericValue = value.replace(/[^0-9]/g, ''); // Only allow numbers
    
    setUserInputs(prev => ({
      ...prev,
      [cellKey]: numericValue
    }));
  };

  const checkAnswer = () => {
    if (showResult) return;

    playSfx("click");

    let allCorrect = true;
    const results = {};

    missingCells.forEach(cell => {
      const cellKey = `${cell.row}-${cell.col}`;
      const userValue = parseInt(userInputs[cellKey]);
      const correctValue = pyramid[cell.row][cell.col];
      
      results[cellKey] = userValue === correctValue;
      if (userValue !== correctValue) {
        allCorrect = false;
      }
    });

    setIsCorrect(allCorrect);
    setShowResult(true);

    if (allCorrect) {
      playSfx("correct");
      const points = level + (streak >= 3 ? 3 : 1) + missingCells.length;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      playSfx("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        generatePyramid();
      }
    }, 3000);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setPyramid([]);
    setUserInputs({});
    setMissingCells([]);
    generatePyramid();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - هرم 4 طوابق",
      2: "مبتدئ متقدم - هرم 4 طوابق",
      3: "متوسط - هرم 5 طوابق",
      4: "متوسط متقدم - هرم 5 طوابق",
      5: "متقدم - هرم 6 طوابق",
    };
    return descriptions[level] || `متقدم - المستوى ${level}`;
  };

  const getHint = () => {
    return "كل مربع يساوي مجموع المربعين اللذين تحته";
  };

  const isFormComplete = () => {
    return missingCells.every(cell => {
      const cellKey = `${cell.row}-${cell.col}`;
      return userInputs[cellKey] && userInputs[cellKey].trim() !== '';
    });
  };

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 25 === 0 && level < 6) {
      setLevel(prev => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 500;
      canvas.height = pyramidSize * 70 + 80; // Increased from +40 to +80 for more top space
      drawPyramid();
    }
  }, [pyramid, userInputs, showResult, pyramidSize]);

  // Initialize first pyramid
  useEffect(() => {
    generatePyramid();
  }, []);

  const isGameComplete = currentQuestionIndex >= totalQuestions;

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: 3,
        textAlign: "center",
        backgroundColor: "white",
        borderRadius: "20px",
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: pyramidColors.primary, fontWeight: "bold" }}
      >
        🔺 هرم الأرقام
      </Typography>

      {/* Game Stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip
          label={`السؤال: ${currentQuestionIndex + 1}/${totalQuestions}`}
          color="info"
          size="large"
        />
        <Chip label={`المتتالية: ${streak}🔥`} color="success" size="large" />
      </Box>

      {/* Level Description */}
      <Typography variant="body1" sx={{ mb: 2, color: "#666" }}>
        {getLevelDescription()}
      </Typography>

      {!isGameComplete && pyramid.length > 0 && (
        <>
          {/* Pyramid Display */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
              أكمل الهرم:
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                💡 {getHint()}
              </Alert>
            </Box>

            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "10px",
              }}
            />
                          <Grid container spacing={2} justifyContent="center">
                {missingCells.map((cell, index) => {
                  const cellKey = `${cell.row}-${cell.col}`;
                  const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];
                  const letter = arabicLetters[index] || '؟';
                  
                  return (
                    <Grid item key={cellKey}>
                      <Card sx={{ minWidth: 120 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: '#ff6b35' }}>
                            الخانة {letter}
                          </Typography>
                          <TextField
                            type="text"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            value={userInputs[cellKey] || ''}
                            onChange={(e) => handleInputChange(cell.row, cell.col, e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{
                              width: 80,
                              '& .MuiOutlinedInput-root': {
                                textAlign: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                              }
                            }}
                            placeholder="?"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
                <Button
                  variant="contained"
                  size="large"
                  onClick={checkAnswer}
                  disabled={!isFormComplete()}
                  sx={{
                    fontSize: "1.1rem",
                    px: 4,
                    py: 1.5,
                    mt: 3,
                  }}
                >
                  تحقق من الإجابة
                </Button>
          </Paper>

          {/* Result Message */}
          {showResult && (
            <Alert
              severity={isCorrect ? "success" : "error"}
              sx={{ mb: 3, fontSize: "1.1rem" }}
            >
              {isCorrect
                ? "🎉 ممتاز! لقد بنيت الهرم بشكل صحيح!"
                : "❌ بعض الإجابات خاطئة. راجع الحلول الصحيحة أعلاه!"}
              {isCorrect && streak >= 3 && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  🔥 متتالية رائعة! نقاط إضافية!
                </Typography>
              )}
            </Alert>
          )}
        </>
      )}

      {/* Game Complete */}
      {isGameComplete && (
        <Paper
          sx={{
            p: 4,
            mb: 3,
            backgroundColor: "#e8f5e8",
            border: "2px solid #4caf50",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: "#2e7d32", mb: 2, fontWeight: "bold" }}
          >
            🏆 تهانينا! لقد أنهيت لعبة هرم الأرقام!
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            النتيجة النهائية: {score} نقطة
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            المستوى النهائي: {level} | أفضل متتالية: {streak}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={resetGame}
            sx={{ mt: 2 }}
          >
            لعب مرة أخرى
          </Button>
        </Paper>
      )}

      {/* Control Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          onClick={resetGame}
          size="large"
          color="secondary"
        >
          إعادة تشغيل
        </Button>

        {pyramid.length > 0 && !isGameComplete && (
          <Button
            variant="outlined"
            onClick={generatePyramid}
            size="large"
          >
            هرم جديد
          </Button>
        )}
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          📚 تعلم الأهرام الرقمية
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔺 <strong>قاعدة الهرم:</strong> كل رقم يساوي مجموع الرقمين اللذين تحته
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ➕ <strong>مثال:</strong> إذا كان 3 + 5 = 8، فإن 8 يوضع فوق 3 و 5
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🧮 <strong>استراتيجية:</strong> ابدأ بالصفوف السفلية واعمل نحو الأعلى
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🎯 <strong>نصيحة:</strong> استخدم المعلومات المعطاة لحساب القيم المفقودة
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 هذه اللعبة تطور مهارات الجمع والتفكير المنطقي!
        </Typography>
      </Box>
    </Box>
  );
};

export default NumberPyramid;
