"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Grid,
  Container,
  Chip,
  IconButton,
  Zoom,
  Fade,
  LinearProgress,
} from "@mui/material";
import { preloadSfx, playSfx } from "@/lib/sfx";
import { GameProgressionManager } from "@/lib/gameEnhancements";
import { gameThemes, enhancedButtonStyles, cardAnimations, createFireworksEffect, enhancedSoundFeedback } from "@/lib/visualEnhancements";
import Timer from "@/components/Timer";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function EquationBalance() {
  const [currentEquation, setCurrentEquation] = useState(null);
  const [leftSide, setLeftSide] = useState(0);
  const [rightSide, setRightSide] = useState(0);
  const [userAnswer, setUserAnswer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [problemsPerRound] = useState(10);
  const [gameComplete, setGameComplete] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [animatingEquation, setAnimatingEquation] = useState(false);
  
  const gameRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const gameManager = useRef(new GameProgressionManager('equationBalance')).current;
  const theme = gameThemes.math;

  useEffect(() => {
    try {
      preloadSfx();
    } catch (e) {}
  }, []);

  // Generate a balanced equation with one missing value and difficulty progression
  const generateEquation = () => {
    const currentLevel = gameManager.getCurrentLevel();
    const operations = gameManager.getOperationsForLevel(currentLevel);
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, result, missingPosition;
    let maxNumber;
    
    // Set difficulty based on level
    switch (currentLevel) {
      case 'beginner':
        maxNumber = 10;
        break;
      case 'intermediate':
        maxNumber = 20;
        break;
      case 'advanced':
        maxNumber = 50;
        break;
      case 'expert':
        maxNumber = 100;
        break;
      default:
        maxNumber = 10;
    }

    // First, decide which position will be missing
    missingPosition = Math.floor(Math.random() * 3);

    switch (operation) {
      case 'addition':
        if (missingPosition === 0) {
          // Missing first number: ? + num2 = result
          num2 = Math.floor(Math.random() * maxNumber) + 1;
          result = Math.floor(Math.random() * maxNumber) + num2 + 1;
          num1 = result - num2;
        } else if (missingPosition === 1) {
          // Missing second number: num1 + ? = result
          num1 = Math.floor(Math.random() * maxNumber) + 1;
          result = Math.floor(Math.random() * maxNumber) + num1 + 1;
          num2 = result - num1;
        } else {
          // Missing result: num1 + num2 = ?
          num1 = Math.floor(Math.random() * maxNumber) + 1;
          num2 = Math.floor(Math.random() * maxNumber) + 1;
          result = num1 + num2;
        }
        break;
      case 'subtraction':
        if (missingPosition === 0) {
          // Missing first number: ? - num2 = result
          result = Math.floor(Math.random() * maxNumber) + 1;
          num2 = Math.floor(Math.random() * result) + 1;
          num1 = result + num2;
        } else if (missingPosition === 1) {
          // Missing second number: num1 - ? = result
          result = Math.floor(Math.random() * 20) + 1;
          num1 = result + Math.floor(Math.random() * 20) + 1;
          num2 = num1 - result;
        } else {
          // Missing result: num1 - num2 = ?
          num1 = Math.floor(Math.random() * 30) + 10;
          num2 = Math.floor(Math.random() * num1) + 1;
          result = num1 - num2;
        }
        break;
      case "×":
        if (missingPosition === 0) {
          // Missing first number: ? × num2 = result
          num2 = Math.floor(Math.random() * 9) + 2; // 2-10
          num1 = Math.floor(Math.random() * 9) + 2; // 2-10
          result = num1 * num2;
        } else if (missingPosition === 1) {
          // Missing second number: num1 × ? = result
          num1 = Math.floor(Math.random() * 9) + 2; // 2-10
          num2 = Math.floor(Math.random() * 9) + 2; // 2-10
          result = num1 * num2;
        } else {
          // Missing result: num1 × num2 = ?
          num1 = Math.floor(Math.random() * 9) + 2; // 2-10
          num2 = Math.floor(Math.random() * 9) + 2; // 2-10
          result = num1 * num2;
        }
        break;
      default:
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        result = num1 + num2;
    }

    let equation, answer, leftExpression, rightValue;

    switch (missingPosition) {
      case 0: // Missing first number
        equation = `? ${operation} ${num2} = ${result}`;
        answer = num1;
        leftExpression = `? ${operation} ${num2}`;
        rightValue = result;
        break;
      case 1: // Missing second number
        equation = `${num1} ${operation} ? = ${result}`;
        answer = num2;
        leftExpression = `${num1} ${operation} ?`;
        rightValue = result;
        break;
      case 2: // Missing result
        equation = `${num1} ${operation} ${num2} = ?`;
        answer = result;
        leftExpression = `${num1} ${operation} ${num2}`;
        rightValue = "?";
        break;
      default:
        equation = `? ${operation} ${num2} = ${result}`;
        answer = num1;
        leftExpression = `? ${operation} ${num2}`;
        rightValue = result;
    }

    return {
      equation,
      answer,
      leftExpression,
      rightValue,
      operation,
      missingPosition,
      num1,
      num2,
      result,
    };
  };

  // Calculate the balance based on current values
  const calculateBalance = () => {
    const left = evaluateExpression(
      currentEquation.leftExpression.replace("?", userAnswer)
    );
    const right =
      currentEquation.rightValue === "?" ? userAnswer : currentEquation.result;
    return { left, right };
  };

  // Simple expression evaluator
  const evaluateExpression = (expr) => {
    try {
      // Replace × with * for evaluation
      const cleanExpr = expr.replace(/×/g, "*").replace(/\s*x\s*/g, " * ");
      return eval(cleanExpr);
    } catch (e) {
      return 0;
    }
  };

  // Start new game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTotalProblems(0);
    setCurrentRound(1);
    setGameComplete(false);
    setUserAnswer(0);
    setFeedback("");
    setIsCorrect(null);
    setTimerActive(true);
    generateNewProblem();
  };

  // Generate new problem
  const generateNewProblem = () => {
    const newEquation = generateEquation();
    setCurrentEquation(newEquation);
    setUserAnswer(0);
    setLeftSide(0);
    setRightSide(0);
    setFeedback("");
    setIsCorrect(null);
    setShowBalance(false);
  };

  // Check if the equation is balanced
  const checkBalance = () => {
    if (!currentEquation) return;

    setShowBalance(true);
    const isAnswerCorrect = userAnswer === currentEquation.answer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore((prev) => prev + 1);
      setFeedback("ممتاز! الميزان متوازن");
      try {
        playSfx("correct");
      } catch (e) {}
    } else {
      setFeedback(`خطأ! الإجابة الصحيحة هي ${currentEquation.answer}`);
      try {
        playSfx("wrong");
      } catch (e) {}
    }

    setTimeout(() => {
      const newTotalProblems = totalProblems + 1;
      if (newTotalProblems < problemsPerRound)
        setTotalProblems(newTotalProblems);

      // Check if round is complete
      if (newTotalProblems >= problemsPerRound) {
        setGameComplete(true);
        setTimerActive(false);
        setFeedback(
          `انتهت الجولة! النتيجة النهائية: ${
            score + (isAnswerCorrect ? 1 : 0)
          }/${problemsPerRound}`
        );
        try {
          playSfx("win");
        } catch (e) {}
      } else {

          generateNewProblem();
      }
    }, 2000);
  };

  // Adjust user answer
  const adjustAnswer = (delta) => {
    setUserAnswer((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  // Get balance visual state
  const getBalanceState = () => {
    const { left, right } = calculateBalance();
    if (left === right) return "balanced";
    if (left > right) return "left-heavy";
    return "right-heavy";
  };

  // Render the balance scale
  const renderBalanceScale = () => {
    const balanceState = showBalance ? getBalanceState() : "unbalanced";
    const { left, right } = calculateBalance();

    // Determine what to show in each pan based on the missing position and whether balance was checked
    const getLeftPanContent = () => {
      if (!currentEquation) return "";

      if (currentEquation.missingPosition === 2) {
        // Missing result case: show the left expression (e.g., "3 + 5")
        return `${currentEquation.num1} ${currentEquation.operation} ${currentEquation.num2}`;
      } else if (currentEquation.missingPosition === 0) {
        // Missing first operand: show "? + 5" or "7 + 5"
        return `${showBalance ? userAnswer : "?"} ${
          currentEquation.operation
        } ${currentEquation.num2}`;
      } else {
        // Missing second operand: show "3 + ?" or "3 + 7"
        return `${currentEquation.num1} ${currentEquation.operation} ${
          showBalance ? userAnswer : "?"
        }`;
      }
    };

    const getRightPanContent = () => {
      if (!currentEquation) return "";

      if (currentEquation.missingPosition === 2) {
        // Missing result case: show the answer or ?
        return showBalance ? userAnswer : "?";
      } else {
        // Missing operand case: show the result
        return currentEquation.result;
      }
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* Scale Arms */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            width: "400px",
            height: "120px",
          }}
        >
          {/* Left Pan */}
          <Box
            sx={{
              width: "140px",
              height: "50px",
              backgroundColor: "#e3f2fd",
              border: "3px solid #1976d2",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px",
              transform: showBalance
                ? balanceState === "left-heavy"
                  ? "translateY(20px)"
                  : balanceState === "right-heavy"
                  ? "translateY(-20px)"
                  : "translateY(0)"
                : "translateY(-10px)",
              transition: "transform 0.5s ease",
            }}
          >
            {getLeftPanContent()}
          </Box>

          {/* Fulcrum */}
          <Box
            sx={{
              width: "40px",
              height: "6px",
              backgroundColor: "#666",
              position: "relative",
              mx: 1,
              "&::after": {
                content: '""',
                position: "absolute",
                left: "50%",
                bottom: "-10px",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                borderBottom: "20px solid #666",
              },
            }}
          />

          {/* Right Pan */}
          <Box
            sx={{
              width: "140px",
              height: "50px",
              backgroundColor: "#fff3e0",
              border: "3px solid #f57c00",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px",
              transform: showBalance
                ? balanceState === "right-heavy"
                  ? "translateY(20px)"
                  : balanceState === "left-heavy"
                  ? "translateY(-20px)"
                  : "translateY(0)"
                : "translateY(10px)",
              transition: "transform 0.5s ease",
            }}
          >
            {getRightPanContent()}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 3 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
        >
          لعبة ميزان المعادلات
        </Typography>

        <Typography
          variant="body1"
          align="center"
          sx={{ mb: 3, color: "text.secondary" }}
        >
          أوجد القيمة المفقودة لتوازن الميزان
        </Typography>

        {!gameStarted ? (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={startGame}
              sx={{ fontSize: "1.2rem", py: 2, px: 6, borderRadius: 3 }}
            >
              ابدأ اللعب
            </Button>
          </Box>
        ) : (
          <>
            {/* Game Stats */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 3,
                textAlign: "center",
                backgroundColor: "background.default",
              }}
            >
              <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">
                    النتيجة: {score}/{problemsPerRound}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">
                    السؤال: {totalProblems + 1}/{problemsPerRound}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">الوقت</Typography>
                  <Timer active={timerActive} />
                </Grid>
              </Grid>

              {feedback && (
                <Alert
                  severity={
                    gameComplete ? "info" : isCorrect ? "success" : "error"
                  }
                  sx={{ mt: 2, fontSize: "1.1rem", borderRadius: 2 }}
                >
                  {feedback}
                </Alert>
              )}
            </Paper>

            {!gameComplete && (
              <>
                {/* Balance Scale */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, direction: "ltr" }}>
                  {renderBalanceScale()}
                </Paper>

                {/* Answer Controls */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                    اختر القيمة المفقودة
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      direction: "ltr",
                    }}
                  >
                    <IconButton
                      onClick={() => adjustAnswer(-10)}
                      sx={{ backgroundColor: "#f5f5f5" }}
                    >
                      <Typography variant="h6">-10</Typography>
                    </IconButton>

                    <IconButton
                      onClick={() => adjustAnswer(-1)}
                      sx={{ backgroundColor: "#f5f5f5" }}
                    >
                      <RemoveIcon />
                    </IconButton>

                    <Chip
                      label={userAnswer}
                      sx={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        minWidth: "80px",
                        height: "50px",
                      }}
                      color="primary"
                    />

                    <IconButton
                      onClick={() => adjustAnswer(1)}
                      sx={{ backgroundColor: "#f5f5f5" }}
                    >
                      <AddIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => adjustAnswer(10)}
                      sx={{ backgroundColor: "#f5f5f5" }}
                    >
                      <Typography variant="h6">+10</Typography>
                    </IconButton>
                  </Box>

                  <Box sx={{ textAlign: "center", mt: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={checkBalance}
                      disabled={isCorrect !== null}
                      sx={{
                        fontSize: "1.1rem",
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                      }}
                    >
                      تحقق من التوازن
                    </Button>
                  </Box>
                </Paper>
              </>
            )}

            {/* Control Buttons */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
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
