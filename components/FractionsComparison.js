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
  Card,
  CardContent,
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

function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function generateFraction(level) {
  let numerator, denominator;
  
  if (level === "beginner") {
    // Simple fractions with small denominators
    denominator = randInt(2, 6);
    numerator = randInt(1, denominator - 1);
  } else if (level === "intermediate") {
    // Medium complexity fractions
    denominator = randInt(3, 10);
    numerator = randInt(1, denominator - 1);
  } else if (level === "advanced") {
    // More complex fractions
    denominator = randInt(4, 16);
    numerator = randInt(1, denominator - 1);
  } else {
    // Expert - complex fractions, some improper
    denominator = randInt(5, 20);
    numerator = randInt(1, Math.min(denominator + 5, 25));
  }
  
  return { numerator, denominator };
}

function generateForLevel(level) {
  const numFractions = level === "beginner" ? 3 : level === "expert" ? 5 : 4;
  const fractions = [];
  
  // Generate unique fractions
  const attempts = 50; // Prevent infinite loops
  let attempt = 0;
  
  while (fractions.length < numFractions && attempt < attempts) {
    attempt++;
    const fraction = generateFraction(level);
    const value = fraction.numerator / fraction.denominator;
    
    // Check if this fraction value already exists (avoid duplicates)
    const exists = fractions.some(f => Math.abs((f.numerator / f.denominator) - value) < 0.001);
    
    if (!exists && fraction.numerator > 0) {
      fractions.push(fraction);
    }
  }
  
  // If we don't have enough unique fractions, fill with some guaranteed different ones
  while (fractions.length < numFractions) {
    const factor = fractions.length + 1;
    fractions.push({ 
      numerator: factor, 
      denominator: factor * 2 + randInt(1, 3) 
    });
  }
  
  // Sort fractions by value to get the correct order
  const sortedFractions = [...fractions].sort((a, b) => 
    (a.numerator / a.denominator) - (b.numerator / b.denominator)
  );
  
  // Shuffle the display order
  const shuffledFractions = [...fractions].sort(() => Math.random() - 0.5);
  
  return {
    fractions: shuffledFractions,
    correctOrder: sortedFractions.map(f => 
      shuffledFractions.findIndex(sf => 
        sf.numerator === f.numerator && sf.denominator === f.denominator
      )
    )
  };
}

// Visual fraction component
const FractionVisual = React.memo(({ fraction, size = 100, type = "bar" }) => {
  const { numerator, denominator } = fraction;
  const percentage = (numerator / denominator) * 100;
  
  if (type === "bar") {
    return (
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {numerator}/{denominator}
        </Typography>
        <Box 
          sx={{ 
            width: size, 
            height: 20, 
            border: '2px solid #333',
            borderRadius: 1,
            backgroundColor: '#f0f0f0',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.5s ease-in-out'
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
    );
  } else {
    // Pie chart representation
    const radius = size / 2 - 5;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    
    return (
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {numerator}/{denominator}
        </Typography>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={circumference / 4}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
          />
        </svg>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
    );
  }
});

export default function FractionsComparison({ level: initialLevel = "beginner", onComplete, onBack }) {
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [level, setLevel] = useState(initialLevel);
  const [round, setRound] = useState(0);
  const [gameData, setGameData] = useState(() => generateForLevel("beginner"));
  const [score, setScore] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [userOrder, setUserOrder] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [visualType, setVisualType] = useState("bar");

  const particleCanvasRef = useRef(null);
  const scoreRef = useRef(null);
  const progressManager = useRef(new GameProgressionManager("fractions-comparison"));

  const totalRounds = 8;

  useEffect(() => {
    setGameData(generateForLevel(level));
    setRound(0);
    setScore(0);
    setStreak(0);
    setShowWin(false);
    setTimerActive(true);
    setTimerKey((k) => k + 1);
    setFinalTime(null);
    setQuestionStartTime(Date.now());
    setFeedback("");
    setUserOrder([]);
  }, [level]);

  const handleFractionClick = (index) => {
    if (showFeedback || userOrder.includes(index)) return;
    
    const newOrder = [...userOrder, index];
    setUserOrder(newOrder);
    
    // Check if ordering is complete
    if (newOrder.length === gameData.fractions.length) {
      checkAnswer(newOrder);
    }
  };

  const checkAnswer = (order) => {
    const isCorrect = JSON.stringify(order) === JSON.stringify(gameData.correctOrder);
    const responseTime = Date.now() - questionStartTime;

    setShowFeedback(true);

    let newScore = score;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      newScore = score + 1;
      setScore(newScore);

      // Enhanced feedback based on performance
      if (responseTime < 10000) {
        setFeedback("⚡ ترتيب سريع ومتقن!");
        playSfx("streak");
      } else if (newStreak >= 3) {
        setFeedback(`🔥 متتالية رائعة! ${newStreak}`);
        playSfx("bonus");
      } else {
        setFeedback("✅ ترتيب صحيح!");
        playSfx("correct");
      }

      // Create particle effect for correct answers
      createParticleEffect(particleCanvasRef.current, "success");

      // Update progress manager
      progressManager.current.updateScore(15, responseTime);
      progressManager.current.updateStreak(newStreak);
    } else {
      setStreak(0);
      setFeedback("❌ الترتيب الصحيح: من الأصغر للأكبر");
      playSfx("wrong");
    }

    // Continue to next round after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setUserOrder([]);

      if (round + 1 >= totalRounds) {
        setShowWin(true);
        setTimerActive(false);
        playSfx("win");
        
        // Call onComplete callback with the correct final score
        if (onComplete) {
          onComplete(newScore, finalTime || 0);
        }
        return;
      }

      setRound((r) => r + 1);
      setGameData(generateForLevel(level));
      setQuestionStartTime(Date.now());
      setFeedback("");
    }, 3000);
  };

  const resetOrder = () => {
    if (!showFeedback) {
      setUserOrder([]);
    }
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
          minWidth: 500,
          maxWidth: 700,
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
            مقارنة الكسور 📊 {difficultyLevels[level].icon}
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
          <Grid container spacing={2}>
            <Grid item xs={8}>
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
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>نوع العرض</InputLabel>
                <Select
                  value={visualType}
                  label="نوع العرض"
                  onChange={(e) => setVisualType(e.target.value)}
                  disabled={showFeedback}
                >
                  <MenuItem value="bar">أشرطة</MenuItem>
                  <MenuItem value="pie">دوائر</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Instructions */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "#e3f2fd",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: "#1976d2" }}>
            رتب الكسور من الأصغر إلى الأكبر
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            انقر على الكسور بالترتيب الصحيح (من الأصغر للأكبر)
          </Typography>
        </Paper>

        {/* Feedback display */}
        {showFeedback && (
          <Fade in={showFeedback} timeout={300}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                backgroundColor: userOrder.length === gameData.correctOrder.length && 
                  JSON.stringify(userOrder) === JSON.stringify(gameData.correctOrder) 
                  ? "#e8f5e8" : "#ffeaea",
                border: `2px solid ${
                  userOrder.length === gameData.correctOrder.length && 
                  JSON.stringify(userOrder) === JSON.stringify(gameData.correctOrder) 
                  ? "#4caf50" : "#f44336"
                }`,
                textAlign: "center",
                ...(userOrder.length === gameData.correctOrder.length && 
                   JSON.stringify(userOrder) === JSON.stringify(gameData.correctOrder)
                  ? createPulseAnimation()
                  : createShakeAnimation()),
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: userOrder.length === gameData.correctOrder.length && 
                    JSON.stringify(userOrder) === JSON.stringify(gameData.correctOrder) 
                    ? "#2e7d32" : "#c62828",
                  mb: 1,
                }}
              >
                {feedback}
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Fractions display */}
        {!showFeedback && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} justifyContent="center">
              {gameData.fractions.map((fraction, index) => {
                const isSelected = userOrder.includes(index);
                const orderPosition = userOrder.indexOf(index) + 1;
                
                return (
                  <Grid item key={index}>
                    <Card
                      elevation={isSelected ? 8 : 2}
                      sx={{
                        cursor: isSelected ? 'default' : 'pointer',
                        borderRadius: 3,
                        border: isSelected ? '3px solid #4CAF50' : '2px solid #e0e0e0',
                        backgroundColor: isSelected ? '#e8f5e8' : 'white',
                        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                        opacity: isSelected ? 0.8 : 1,
                        '&:hover': !isSelected ? {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 16px ${difficultyLevels[level].color}40`,
                          border: `2px solid ${difficultyLevels[level].color}`,
                        } : {},
                        position: 'relative'
                      }}
                      onClick={() => handleFractionClick(index)}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <FractionVisual 
                          fraction={fraction} 
                          size={80} 
                          type={visualType}
                        />
                        {isSelected && (
                          <Chip
                            label={orderPosition}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            {/* Reset button */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetOrder}
                disabled={showFeedback || userOrder.length === 0}
                sx={{ borderRadius: 3 }}
              >
                إعادة تعيين الترتيب
              </Button>
            </Box>
          </Box>
        )}

        {/* Show correct order during feedback */}
        {showFeedback && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#1976d2' }}>
              الترتيب الصحيح:
            </Typography>
            <Grid container spacing={1} justifyContent="center">
              {gameData.correctOrder.map((fractionIndex, position) => {
                const fraction = gameData.fractions[fractionIndex];
                return (
                  <Grid item key={position}>
                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {position + 1}
                        </Typography>
                        <FractionVisual 
                          fraction={fraction} 
                          size={60} 
                          type={visualType}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
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
            setGameData(generateForLevel(level));
            setTimerActive(true);
            setTimerKey((k) => k + 1);
            setQuestionStartTime(Date.now());
            setFeedback("");
            setUserOrder([]);
            setShowFeedback(false);
          }}
        />
      )}
    </Box>
  );
}