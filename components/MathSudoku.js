import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  Grid,
  Alert,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const MathSudoku = () => {
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState([]);
  const [solution, setSolution] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [gameMode, setGameMode] = useState("numbers"); // 'numbers' or 'pictures'
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(6);
  const [mistakes, setMistakes] = useState(0);
  const [maxMistakes] = useState(3);

  const sudokuColors = {
    background: "#f8f9fa",
    primary: "#2196f3",
    secondary: "#4caf50",
    accent: "#ff9800",
    correct: "#4caf50",
    incorrect: "#f44336",
    cell: "#ffffff",
    selected: "#e3f2fd",
    given: "#f5f5f5",
    conflict: "#ffebee",
  };

  // Picture symbols for picture mode
  const pictureSymbols = [
    { symbol: "🍎", name: "تفاحة" },
    { symbol: "🌟", name: "نجمة" },
    { symbol: "🎈", name: "بالون" },
    { symbol: "🏠", name: "منزل" },
  ];

  const generateSudoku = () => {
    // Create a valid 4x4 Sudoku solution
    const newSolution = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 3, 4, 1],
      [4, 1, 2, 3],
    ];

    // Shuffle the solution to create variety
    const shuffledSolution = shuffleSudoku(newSolution);
    setSolution(shuffledSolution);

    // Create puzzle by removing some numbers
    const puzzle = JSON.parse(JSON.stringify(shuffledSolution));
    const difficulty = level <= 2 ? 6 : level <= 4 ? 8 : 10; // Number of cells to remove

    // Remove random cells
    const cellsToRemove = [];
    for (let i = 0; i < 16; i++) {
      cellsToRemove.push({ row: Math.floor(i / 4), col: i % 4 });
    }

    // Shuffle and take first 'difficulty' cells
    cellsToRemove.sort(() => Math.random() - 0.5);
    for (let i = 0; i < difficulty; i++) {
      const { row, col } = cellsToRemove[i];
      puzzle[row][col] = 0; // 0 represents empty cell
    }

    setGrid(puzzle);
    setUserGrid(JSON.parse(JSON.stringify(puzzle)));
    setSelectedCell(null);
    setShowResult(false);
    setMistakes(0);
  };

  const shuffleSudoku = (grid) => {
    // Simple shuffle by swapping rows and columns within constraints
    let shuffled = JSON.parse(JSON.stringify(grid));

    // Randomly swap numbers 1-4
    const mapping = [1, 2, 3, 4].sort(() => Math.random() - 0.5);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        shuffled[row][col] = mapping[grid[row][col] - 1];
      }
    }

    return shuffled;
  };

  const drawSudoku = () => {
    const canvas = canvasRef.current;
    if (!canvas || userGrid.length === 0) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = sudokuColors.background;
    ctx.fillRect(0, 0, width, height);

    const cellSize = 80;
    const gridSize = 4 * cellSize;
    const startX = (width - gridSize) / 2;
    const startY = (height - gridSize) / 2;

    // Draw grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = startX + col * cellSize;
        const y = startY + row * cellSize;

        // Determine cell background color
        let cellColor = sudokuColors.cell;
        if (
          selectedCell &&
          selectedCell.row === row &&
          selectedCell.col === col
        ) {
          cellColor = sudokuColors.selected;
        } else if (grid[row][col] !== 0) {
          cellColor = sudokuColors.given; // Given numbers
        } else if (hasConflict(row, col)) {
          cellColor = sudokuColors.conflict;
        }

        // Draw cell background
        ctx.fillStyle = cellColor;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Draw cell border
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellSize, cellSize);

        // Draw 2x2 block borders (thicker)
        if (row === 1 || row === 2) {
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
          ctx.stroke();
        }
        if (col === 1 || col === 2) {
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
        }

        // Draw content
        const value = userGrid[row][col];
        if (value !== 0) {
          ctx.fillStyle = grid[row][col] !== 0 ? "#333" : "#2196f3"; // Given numbers dark, user numbers blue
          ctx.font = gameMode === "numbers" ? "bold 32px Arial" : "40px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const centerX = x + cellSize / 2;
          const centerY = y + cellSize / 2;

          if (gameMode === "numbers") {
            ctx.fillText(value.toString(), centerX, centerY);
          } else {
            // Picture mode
            const symbol =
              pictureSymbols[value - 1]?.symbol || value.toString();
            ctx.fillText(symbol, centerX, centerY);
          }
        }
      }
    }

    // Draw outer border
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 6;
    ctx.strokeRect(startX, startY, gridSize, gridSize);
  };

  const hasConflict = (row, col) => {
    const value = userGrid[row][col];
    if (value === 0) return false;

    // Check row
    for (let c = 0; c < 4; c++) {
      if (c !== col && userGrid[row][c] === value) return true;
    }

    // Check column
    for (let r = 0; r < 4; r++) {
      if (r !== row && userGrid[r][col] === value) return true;
    }

    // Check 2x2 block
    const blockRow = Math.floor(row / 2) * 2;
    const blockCol = Math.floor(col / 2) * 2;

    for (let r = blockRow; r < blockRow + 2; r++) {
      for (let c = blockCol; c < blockCol + 2; c++) {
        if ((r !== row || c !== col) && userGrid[r][c] === value) return true;
      }
    }

    return false;
  };

  const handleCellClick = (row, col) => {
    if (grid[row][col] !== 0) return; // Can't modify given numbers
    if (showResult) return;

    setSelectedCell({ row, col });
    playSfx("click");
  };

  const handleNumberInput = (number) => {
    if (!selectedCell || showResult) return;
    if (grid[selectedCell.row][selectedCell.col] !== 0) return;

    const newGrid = [...userGrid];
    newGrid[selectedCell.row][selectedCell.col] = number;
    setUserGrid(newGrid);

    playSfx("click");

    // Check if this creates a conflict
    if (hasConflict(selectedCell.row, selectedCell.col)) {
      setMistakes((prev) => prev + 1);
      playSfx("wrong");
    }

    // Check if puzzle is complete
    checkCompletion(newGrid);
  };

  const clearCell = () => {
    if (!selectedCell || showResult) return;
    if (grid[selectedCell.row][selectedCell.col] !== 0) return;

    const newGrid = [...userGrid];
    newGrid[selectedCell.row][selectedCell.col] = 0;
    setUserGrid(newGrid);
    playSfx("click");
  };

  const checkCompletion = (currentGrid) => {
    // Check if all cells are filled
    let allFilled = true;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentGrid[row][col] === 0) {
          allFilled = false;
          break;
        }
      }
      if (!allFilled) break;
    }

    if (allFilled) {
      // Check if solution is correct
      let isCorrectSolution = true;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (currentGrid[row][col] !== solution[row][col]) {
            isCorrectSolution = false;
            break;
          }
        }
        if (!isCorrectSolution) break;
      }

      setIsCorrect(isCorrectSolution);
      setShowResult(true);

      if (isCorrectSolution) {
        playSfx("correct");
        const points =
          level +
          (streak >= 3 ? 5 : 2) +
          Math.max(0, maxMistakes - mistakes) * 2;
        setScore((prev) => prev + points);
        setStreak((prev) => prev + 1);
      } else {
        playSfx("wrong");
        setStreak(0);
      }

      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          generateSudoku();
        }
      }, 3000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setMistakes(0);
    setSelectedCell(null);
    generateSudoku();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - 6 خانات فارغة",
      2: "مبتدئ متقدم - 6 خانات فارغة",
      3: "متوسط - 8 خانات فارغة",
      4: "متوسط متقدم - 8 خانات فارغة",
      5: "متقدم - 10 خانات فارغة",
    };
    return descriptions[level] || `متقدم - المستوى ${level}`;
  };

  const getHint = () => {
    if (gameMode === "numbers") {
      return "كل صف وعمود ومربع 2×2 يجب أن يحتوي على الأرقام 1، 2، 3، 4";
    } else {
      return "كل صف وعمود ومربع 2×2 يجب أن يحتوي على كل رمز مرة واحدة";
    }
  };

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 30 === 0 && level < 6) {
      setLevel((prev) => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 400;
      canvas.height = 400;

      // Add click event listener
      const handleCanvasClick = (event) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const cellSize = 80;
        const gridSize = 4 * cellSize;
        const startX = (canvas.width - gridSize) / 2;
        const startY = (canvas.height - gridSize) / 2;

        if (
          x >= startX &&
          x < startX + gridSize &&
          y >= startY &&
          y < startY + gridSize
        ) {
          const col = Math.floor((x - startX) / cellSize);
          const row = Math.floor((y - startY) / cellSize);

          if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            handleCellClick(row, col);
          }
        }
      };

      canvas.addEventListener("click", handleCanvasClick);
      drawSudoku();

      return () => {
        canvas.removeEventListener("click", handleCanvasClick);
      };
    }
  }, [userGrid, selectedCell, gameMode, grid]);

  // Initialize first puzzle
  useEffect(() => {
    generateSudoku();
  }, []);

  const isGameComplete = currentQuestionIndex >= totalQuestions;

  return (
    <Box
      sx={{
        maxWidth: 800,
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
        sx={{ color: sudokuColors.primary, fontWeight: "bold" }}
      >
        🧩 سودوكو الرياضيات
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
        <Chip
          label={`الأخطاء: ${mistakes}/${maxMistakes}`}
          color={mistakes >= maxMistakes ? "error" : "default"}
          size="large"
        />
        <Chip label={`المتتالية: ${streak}🔥`} color="success" size="large" />
      </Box>

      {/* Game Mode Toggle */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={gameMode}
          exclusive
          onChange={(e, newMode) => newMode && setGameMode(newMode)}
          size="large"
        >
          <ToggleButton value="numbers">🔢 أرقام</ToggleButton>
          <ToggleButton value="pictures">🎨 صور</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Level Description */}
      <Typography variant="body1" sx={{ mb: 2, color: "#666" }}>
        {getLevelDescription()}
      </Typography>

      {!isGameComplete && userGrid.length > 0 && (
        <>
          {/* Sudoku Grid */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
              أكمل السودوكو:
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
                maxWidth: "400px",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            />

            {selectedCell && (
              <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                الخانة المحددة: الصف {selectedCell.row + 1}، العمود{" "}
                {selectedCell.col + 1}
              </Typography>
            )}
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              {[1, 2, 3, 4].map((number) => (
                <Grid item key={number}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleNumberInput(number)}
                    disabled={!selectedCell}
                    sx={{
                      width: 80,
                      height: 80,
                      fontSize: gameMode === "numbers" ? "2rem" : "2.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {gameMode === "numbers"
                      ? number
                      : pictureSymbols[number - 1]?.symbol || number}
                  </Button>
                </Grid>
              ))}
            </Grid>
            <Button
              variant="outlined"
              onClick={clearCell}
              disabled={!selectedCell}
              size="large"
            >
              محو الخانة
            </Button>
          </Paper>


          {/* Result Message */}
          {showResult && (
            <Alert
              severity={isCorrect ? "success" : "error"}
              sx={{ mb: 3, fontSize: "1.1rem" }}
            >
              {isCorrect
                ? "🎉 ممتاز! لقد حللت السودوكو بشكل صحيح!"
                : "❌ الحل غير صحيح. حاول مرة أخرى!"}
              {isCorrect && streak >= 3 && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  🔥 متتالية رائعة! نقاط إضافية!
                </Typography>
              )}
              {isCorrect && mistakes === 0 && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  🌟 حل مثالي بدون أخطاء!
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
            🏆 تهانينا! لقد أنهيت لعبة سودوكو الرياضيات!
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

        {userGrid.length > 0 && !isGameComplete && (
          <Button variant="outlined" onClick={generateSudoku} size="large">
            لغز جديد
          </Button>
        )}
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          📚 تعلم السودوكو
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🎯 <strong>الهدف:</strong> ملء كل الخانات الفارغة بالأرقام أو الصور
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📏 <strong>قواعد الصف:</strong> كل صف يجب أن يحتوي على 1، 2، 3، 4 (مرة
          واحدة لكل رقم)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📐 <strong>قواعد العمود:</strong> كل عمود يجب أن يحتوي على 1، 2، 3، 4
          (مرة واحدة لكل رقم)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔳 <strong>قواعد المربع:</strong> كل مربع 2×2 يجب أن يحتوي على 1، 2،
          3، 4
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 نصيحة: ابحث عن الصفوف أو الأعمدة التي تحتوي على 3 أرقام فقط!
        </Typography>
      </Box>
    </Box>
  );
};

export default MathSudoku;
