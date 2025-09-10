import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography, Paper, Chip, Zoom, Fade, LinearProgress } from "@mui/material";
import { GameProgressionManager } from "@/lib/gameEnhancements";
import { gameThemes, enhancedButtonStyles, cardAnimations, createFireworksEffect, enhancedSoundFeedback } from "@/lib/visualEnhancements";
import Timer from "./Timer";

const MissingNumberGame = () => {
  const [sequence, setSequence] = useState([]);
  const [missingIndex, setMissingIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [lastTime, setLastTime] = useState(null);
  const [streak, setStreak] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [animatingSequence, setAnimatingSequence] = useState(false);
  
  const gameRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const gameManager = useRef(new GameProgressionManager('missingNumber')).current;
  const theme = gameThemes.math;

  useEffect(() => {
    generateNewSequence();
  }, [level]);

  const generateNewSequence = () => {
    const currentLevel = gameManager.getCurrentLevel();
    let seq = [];
    let start = Math.floor(Math.random() * 10) + 1;

    // Enhanced sequence generation based on difficulty level
    switch (currentLevel) {
      case 'beginner':
        // Simple counting sequences (1,2,3,?,5)
        seq = Array.from({ length: 5 }, (_, i) => start + i);
        break;
        
      case 'intermediate':
        // Skip counting by 2s or 3s
        const skipBy = Math.random() > 0.5 ? 2 : 3;
        seq = Array.from({ length: 5 }, (_, i) => start + i * skipBy);
        break;
        
      case 'advanced':
        // Skip counting by 5s, 10s, or backwards counting
        const patterns = [
          Array.from({ length: 5 }, (_, i) => start * 5 + i * 5), // Skip by 5s
          Array.from({ length: 5 }, (_, i) => start * 10 + i * 10), // Skip by 10s
          Array.from({ length: 5 }, (_, i) => start + 15 - i), // Backwards counting
        ];
        seq = patterns[Math.floor(Math.random() * patterns.length)];
        break;
        
      case 'expert':
        // Complex patterns: Fibonacci-like, squares, or arithmetic sequences
        const complexPatterns = [
          Array.from({ length: 5 }, (_, i) => start + i * i), // Squares pattern
          Array.from({ length: 5 }, (_, i) => start + i * 4), // Skip by 4s
          [start, start+3, start+6, start+9, start+12], // Skip by 3s but larger
          [start, start*2, start*3, start*4, start*5], // Multiplication table
        ];
        seq = complexPatterns[Math.floor(Math.random() * complexPatterns.length)];
        break;
        
      default:
        seq = Array.from({ length: 5 }, (_, i) => start + i);
    }

    const missingIdx = Math.floor(Math.random() * seq.length);
    const correctAnswer = seq[missingIdx];

    // Generate wrong options
    const wrongOptions = [];
    while (wrongOptions.length < 3) {
      const wrong =
        correctAnswer +
        (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      if (
        wrong !== correctAnswer &&
        !wrongOptions.includes(wrong) &&
        wrong > 0
      ) {
        wrongOptions.push(wrong);
      }
    }

    const allOptions = [correctAnswer, ...wrongOptions].sort(
      () => Math.random() - 0.5
    );

    setSequence(seq);
    setMissingIndex(missingIdx);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    setTimerActive(false);
    setSelectedAnswer(answer);
    const correct = answer === sequence[missingIndex];
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((prev) => prev + 1);
      setTimeout(() => {
        if (score > 0 && score % 3 === 2) {
          setLevel((prev) => Math.min(prev + 1, 4));
        }
        generateNewSequence();
      }, 1500);
    }
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setResetKey((k) => k + 1);
    setTimerActive(true);
    generateNewSequence();
  };

  const getLevelName = () => {
    const names = {
      1: "العد البسيط",
      2: "العد بالثنائيات",
      3: "العد بالخمسات",
      4: "أنماط متقدمة",
    };
    return names[level] || "متقدم";
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 3,
        textAlign: "center",
        backgroundColor: "white",
        borderRadius: "40px",
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#2196f3", fontWeight: "bold" }}
      >
        🔢 لعبة الأرقام المفقودة
      </Typography>
      {/* Timer */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, color: "#fa9601ff" }}>
        <Timer active={timerActive} resetKey={resetKey} onStop={setLastTime} />
      </Box>

      {/* Score and Level */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
        <Chip
          label={`النقاط : ${score}`}
          color="primary"
          size="large"
          sx={{ color: "white",  fontSize: "1.1rem" }}
        />
        <Chip
          label={`المستوى : ${level} - ${getLevelName()}`}
          color="secondary"
          size="large"
          sx={{ color: "white", fontSize: "1.1rem" }}
        />
      </Box>

      {/* Instructions */}
      <Typography variant="h6" sx={{ mb: 3, color: "#666" }}>
        ما هو الرقم المفقود في هذا التسلسل؟
      </Typography>

      {/* Sequence Display */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: "white" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {sequence.map((num, index) => (
            <Box
              key={index}
              sx={{
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                fontSize: "1.5rem",
                fontWeight: "bold",
                backgroundColor: index === missingIndex ? "#ffeb3b" : "#e3f2fd",
                border:
                  index === missingIndex
                    ? "3px dashed #ff9800"
                    : "2px solid #2196f3",
                color: index === missingIndex ? "#ff6f00" : "#1976d2",
              }}
            >
              {index === missingIndex ? "?" : num}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Answer Options */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        اختر الإجابة الصحيحة:
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        {options.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswer === option ? "contained" : "outlined"}
            size="large"
            onClick={() => handleAnswerSelect(option)}
            disabled={showResult}
            sx={{
              width: 80,
              height: 60,
              fontSize: "1.5rem",
              fontWeight: "bold",
              backgroundColor: showResult
                ? option === sequence[missingIndex]
                  ? "#4caf50"
                  : selectedAnswer === option
                  ? "#f44336"
                  : undefined
                : undefined,
              color:
                showResult && option === sequence[missingIndex]
                  ? "white"
                  : undefined,
              "&:hover": {
                transform: showResult ? "none" : "scale(1.05)",
              },
            }}
          >
            {option}
          </Button>
        ))}
      </Box>

      {/* Result Message */}
      {showResult && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: isCorrect ? "#e8f5e8" : "#ffeaea",
            border: `2px solid ${isCorrect ? "#4caf50" : "#f44336"}`,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: isCorrect ? "#2e7d32" : "#d32f2f" }}
          >
            {isCorrect
              ? "🎉 أحسنت! إجابة صحيحة!"
              : "❌ حاول مرة أخرى في المرة القادمة"}
          </Typography>
          {!isCorrect && (
            <Typography variant="body1" sx={{ mt: 1, color: "#666" }}>
              الإجابة الصحيحة كانت: {sequence[missingIndex]}
            </Typography>
          )}
        </Paper>
      )}

      {/* Control Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        {!showResult && (
          <Button variant="outlined" onClick={generateNewSequence} size="large">
            تسلسل جديد
          </Button>
        )}

        <Button
          variant="contained"
          onClick={resetGame}
          size="large"
          color="secondary"
        >
          إعادة تشغيل اللعبة
        </Button>
      </Box>

      {/* Level Progress */}
      {score > 0 && (
        <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
          {3 - (score % 3)} إجابات صحيحة أخرى للانتقال للمستوى التالي
        </Typography>
      )}
    </Box>
  );
};

export default MissingNumberGame;
