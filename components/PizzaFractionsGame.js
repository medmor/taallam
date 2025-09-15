"use client";
import React, { useEffect, useState, useRef } from "react";
import Timer from "./Timer";
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Zoom,
  Grid,
} from "@mui/material";
import WinOverlay from "./WinOverlay";
import { playSfx } from "@/lib/sfx";
import {
  GameProgressionManager,
  difficultyLevels,
  createParticleEffect,
  animateNumber,
  createPulseAnimation,
  createShakeAnimation,
} from "@/lib/gameEnhancements";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateForLevel(level) {
  // Enhanced difficulty progression for fractions
  let numerator, denominator, maxChoices = 4;

  if (level === "beginner") {
    // Simple fractions like 1/2, 1/4, 3/4
    const denominators = [2, 4, 8];
    denominator = denominators[randInt(0, denominators.length - 1)];
    numerator = randInt(1, Math.max(1, denominator - 1));
  } else if (level === "intermediate") {
    // More complex fractions
    const denominators = [3, 5, 6, 8, 10];
    denominator = denominators[randInt(0, denominators.length - 1)];
    numerator = randInt(1, Math.max(1, denominator - 1));
  } else if (level === "advanced") {
    // Complex fractions with larger denominators
    denominator = randInt(6, 12);
    numerator = randInt(1, Math.max(1, denominator - 1));
  } else {
    // expert - very complex fractions
    denominator = randInt(8, 16);
    numerator = randInt(1, Math.max(1, denominator - 1));
    maxChoices = 6;
  }

  // Ensure valid fraction (numerator < denominator and both > 0)
  if (numerator <= 0) numerator = 1;
  if (denominator <= 1) denominator = 2;
  if (numerator >= denominator) numerator = denominator - 1;

  // Generate wrong answer choices with safety mechanism
  let wrongs = [];
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops
  
  while (wrongs.length < maxChoices - 1 && attempts < maxAttempts) {
    attempts++;
    
    // Generate wrong numerator with same denominator
    if (wrongs.length < maxChoices - 1) {
      const wrongNumerator = randInt(1, Math.max(1, denominator - 1));
      if (wrongNumerator !== numerator) {
        const fractionText = `${wrongNumerator}/${denominator}`;
        if (!wrongs.includes(fractionText)) {
          wrongs.push(fractionText);
        }
      }
    }
    
    // Generate wrong answers with different denominators
    if (wrongs.length < maxChoices - 1) {
      const commonDenominators = [2, 3, 4, 6, 8];
      const altDenominator = commonDenominators[randInt(0, commonDenominators.length - 1)];
      const altNumerator = randInt(1, Math.max(1, altDenominator - 1));
      
      if (altDenominator !== denominator || altNumerator !== numerator) {
        const fractionText = `${altNumerator}/${altDenominator}`;
        if (!wrongs.includes(fractionText)) {
          wrongs.push(fractionText);
        }
      }
    }
    
    // Add some simple wrong fractions as fallback
    if (wrongs.length < maxChoices - 1) {
      const simpleFractions = ['1/2', '1/3', '1/4', '2/3', '3/4', '1/5', '2/5', '3/5', '4/5'];
      const randomFraction = simpleFractions[randInt(0, simpleFractions.length - 1)];
      if (randomFraction !== `${numerator}/${denominator}` && !wrongs.includes(randomFraction)) {
        wrongs.push(randomFraction);
      }
    }
  }
  
  // If we still don't have enough wrong answers, add some guaranteed different ones
  while (wrongs.length < maxChoices - 1) {
    const fallbackNumerator = (numerator % denominator) + 1;
    const fallbackFraction = `${fallbackNumerator}/${denominator}`;
    if (fallbackFraction !== `${numerator}/${denominator}` && !wrongs.includes(fallbackFraction)) {
      wrongs.push(fallbackFraction);
    } else {
      // Last resort: add a completely different fraction
      wrongs.push(`${randInt(1, 3)}/${randInt(4, 8)}`);
    }
  }

  const correctAnswer = `${numerator}/${denominator}`;
  const choices = [correctAnswer, ...wrongs].sort(() => Math.random() - 0.5);
  
  return { 
    numerator, 
    denominator, 
    answer: correctAnswer, 
    choices,
    visualSlices: denominator // Number of pizza slices
  };
}

export default function PizzaFractionsGame({ level: initialLevel = "beginner", onComplete, onBack }) {
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [level, setLevel] = useState(initialLevel);
  const [round, setRound] = useState(0);
  const [expr, setExpr] = useState(() => generateForLevel("beginner"));
  const [score, setScore] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);

  const particleCanvasRef = useRef(null);
  const scoreRef = useRef(null);
  const progressManager = useRef(new GameProgressionManager("pizza-fractions-game"));

  const totalRounds = 10;

  useEffect(() => {
    setExpr(generateForLevel(level));
    setRound(0);
    setScore(0);
    setStreak(0);
    setShowWin(false);
    setTimerActive(true);
    setTimerKey((k) => k + 1);
    setFinalTime(null);
    setQuestionStartTime(Date.now());
    setFeedback("");
    setSelectedAnswer(null);
  }, [level]);

  const nextRound = (selectedChoice) => {
    const correct = selectedChoice === expr.answer;
    const responseTime = Date.now() - questionStartTime;

    setSelectedAnswer(selectedChoice);
    setShowFeedback(true);

    let newScore = score;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      newScore = score + 1;
      setScore(newScore);

      // Enhanced feedback based on performance
      if (responseTime < 5000) {
        setFeedback("⚡ رائع!");
        playSfx("streak");
      } else if (newStreak >= 3) {
        setFeedback(`🔥 متتالية ممتازة! ${newStreak}`);
        playSfx("bonus");
      } else {
        setFeedback("✅ ممتاز!");
        playSfx("correct");
      }

      // Create particle effect for correct answers
      createParticleEffect(particleCanvasRef.current, "success");

      // Update progress manager
      progressManager.current.updateScore(10, responseTime);
      progressManager.current.updateStreak(newStreak);
    } else {
      setStreak(0);
      setFeedback(`❌ الإجابة الصحيحة: ${expr.answer}`);
      playSfx("wrong");
    }

    // Continue to next round after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      if (round + 1 >= totalRounds) {
        setShowWin(true);
        setTimerActive(false);
        playSfx("win");
        
        // Call onComplete callback with correct final score
        if (onComplete) {
          onComplete(newScore, finalTime || 0);
        }
        return;
      }

      setRound((r) => r + 1);
      setExpr(generateForLevel(level));
      setQuestionStartTime(Date.now());
      setFeedback("");
    }, 2000);
  };

  // Preload sound effects on mount
  React.useEffect(() => {
    try {
      require("@/lib/sfx").preloadSfx();
    } catch (e) {}
  }, []);

  // Timer stop handler
  const handleTimerStop = (seconds) => {
    setFinalTime(seconds);
  };

  // Function to render pizza visual (memoized to prevent unnecessary re-renders)
  const renderPizzaVisual = React.useMemo(() => {
    const { numerator, denominator } = expr;
    
    // Limit denominator to reasonable values to prevent performance issues
    const safeDenominator = Math.min(Math.max(denominator, 2), 16);
    const safeNumerator = Math.min(Math.max(numerator, 1), safeDenominator - 1);
    
    const sliceAngle = 360 / safeDenominator;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    const slices = [];
    for (let i = 0; i < safeDenominator; i++) {
      const startAngle = (i * sliceAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const isColored = i < safeNumerator;
      
      slices.push(
        <g key={i}>
          <path
            d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
            fill={isColored ? "#ff6b35" : "#f5f5f5"}
            stroke="#333"
            strokeWidth="2"
          />
        </g>
      );
    }

    return (
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: "20px auto" }}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 5}
          fill="#8B4513"
          stroke="#654321"
          strokeWidth="3"
        />
        {slices}
        <circle
          cx={centerX}
          cy={centerY}
          r="8"
          fill="#ff6b35"
        />
      </svg>
    );
  }, [expr.numerator, expr.denominator]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
        position: "relative",
      }}
    >
      {/* Particle effect canvas */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10,
        }}
        width="800"
        height="600"
      />

      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 450,
          maxWidth: 500,
          border: `3px solid ${difficultyLevels[level].color}`,
          boxShadow: `0 8px 32px ${difficultyLevels[level].color}40`,
          background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Difficulty indicator with back button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {onBack && (
            <Button
              variant="outlined"
              size="small"
              onClick={onBack}
              sx={{
                minWidth: 'auto',
                px: 1,
                borderRadius: 2,
                border: '2px solid #666',
                color: '#666',
                '&:hover': {
                  border: '2px solid #333',
                  color: '#333'
                }
              }}
            >
              ← رجوع
            </Button>
          )}
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: "bold",
              color: difficultyLevels[level].color,
              flexGrow: 1,
            }}
          >
            كسور البيتزا 🍕 {difficultyLevels[level].icon}
          </Typography>
          <Chip
            label={difficultyLevels[level].name}
            sx={{
              backgroundColor: difficultyLevels[level].color,
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>

        {/* Game stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Chip
            label={`الجولة: ${round + 1}/${totalRounds}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            ref={scoreRef}
            label={`النقاط: ${score}`}
            color="success"
            variant="outlined"
          />
          {streak > 0 && (
            <Chip
              label={`متتالية: ${streak} 🔥`}
              sx={{
                backgroundColor: "#ff6b35",
                color: "white",
                ...createPulseAnimation(),
              }}
            />
          )}
        </Box>

        {/* Progress bar */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            التقدم في اللعبة
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(round / totalRounds) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: difficultyLevels[level].color,
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Difficulty selector */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>مستوى الصعوبة</InputLabel>
            <Select
              value={level}
              label="مستوى الصعوبة"
              onChange={(e) => setLevel(e.target.value)}
              disabled={showFeedback}
            >
              {Object.entries(difficultyLevels).map(([key, config]) => (
                <MenuItem
                  key={key}
                  value={key}
                  disabled={
                    !progressManager.current
                      .getProgress()
                      .difficultyUnlocked.includes(key)
                  }
                >
                  {config.icon} {config.name}
                  {!progressManager.current
                    .getProgress()
                    .difficultyUnlocked.includes(key) && " 🔒"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Pizza visual and question */}
        <Zoom in={!showFeedback} timeout={500}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              backgroundColor: "#fff8f0",
              border: "2px solid #ff6b35",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#2c3e50",
                mb: 2,
              }}
            >
              ما هو الكسر الممثل في البيتزا؟
            </Typography>
            
            {renderPizzaVisual}
            
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                mt: 1,
              }}
            >
              القطع الملونة من إجمالي القطع
            </Typography>
          </Paper>
        </Zoom>

        {/* Feedback display */}
        {showFeedback && (
          <Fade in={showFeedback} timeout={300}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                backgroundColor:
                  selectedAnswer === expr.answer ? "#e8f5e8" : "#ffeaea",
                border: `2px solid ${
                  selectedAnswer === expr.answer ? "#4caf50" : "#f44336"
                }`,
                textAlign: "center",
                ...(selectedAnswer === expr.answer
                  ? createPulseAnimation()
                  : createShakeAnimation()),
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: selectedAnswer === expr.answer ? "#2e7d32" : "#c62828",
                  mb: 1,
                }}
              >
                {feedback}
              </Typography>
            </Paper>
          </Fade>
        )}

        {!showFeedback && (
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {expr.choices.map((choice, index) => (
              <Grid item xs={6} key={choice}>
                <Zoom
                  in={true}
                  timeout={300}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => nextRound(choice)}
                    disabled={showFeedback}
                    sx={{
                      py: 3,
                      minWidth: 120,
                      fontSize: "1.8rem",
                      fontWeight: "bold",
                      borderRadius: 3,
                      border: "2px solid #e0e0e0",
                      backgroundColor: "white",
                      color: "#333",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: difficultyLevels[level].color,
                        color: "white",
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 16px ${difficultyLevels[level].color}40`,
                        border: `2px solid ${difficultyLevels[level].color}`,
                      },
                      "&:active": {
                        transform: "translateY(0px)",
                      },
                    }}
                  >
                    {choice}
                  </Button>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Timer display */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Stack
            direction="row"
            gap={2}
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h6" sx={{ color: "#666" }}>
              الوقت:
            </Typography>
            <Timer
              active={timerActive}
              key={timerKey}
              onStop={handleTimerStop}
              sx={{ fontSize: "1.2rem", fontWeight: "bold" }}
            />
          </Stack>
          {finalTime !== null && (
            <Typography
              sx={{
                mt: 1,
                fontSize: 16,
                color: "#00838f",
                textAlign: "center",
              }}
            >
              الوقت المستغرق:{" "}
              {Math.floor(finalTime / 60)
                .toString()
                .padStart(2, "0")}
              :{(finalTime % 60).toString().padStart(2, "0")}
            </Typography>
          )}
        </Box>
      </Paper>

      {showWin && (
        <WinOverlay
          boardPixel={320}
          moves={score}
          errors={totalRounds - score}
          onPlayAgain={() => {
            setShowWin(false);
            setRound(0);
            setScore(0);
            setStreak(0);
            setExpr(generateForLevel(level));
            setTimerActive(true);
            setTimerKey((k) => k + 1);
            setQuestionStartTime(Date.now());
            setFeedback("");
            setSelectedAnswer(null);
            setShowFeedback(false);
          }}
        />
      )}
    </Box>
  );
}