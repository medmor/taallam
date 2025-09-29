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
  // Enhanced difficulty progression for division
  let dividend, divisor, maxChoices = 4;

  if (level === "beginner") {
    // Simple division (2-20 ÷ 2-5)
    divisor = randInt(2, 5);
    const quotient = randInt(2, 4); // Keep quotients small for beginners
    dividend = divisor * quotient; // Ensure no remainder
  } else if (level === "intermediate") {
    // Medium division (6-50 ÷ 2-8)
    divisor = randInt(2, 8);
    const quotient = randInt(2, 8);
    dividend = divisor * quotient;
  } else if (level === "advanced") {
    // Advanced division (10-100 ÷ 2-12)
    divisor = randInt(2, 12);
    const quotient = randInt(3, 12);
    dividend = divisor * quotient;
  } else {
    // expert - complex division (20-200 ÷ 2-15)
    divisor = randInt(2, 15);
    const quotient = randInt(4, 15);
    dividend = divisor * quotient;
    maxChoices = 6; // More challenging choices
  }

  const answer = dividend / divisor;
  let wrongs = [];

  // Generate wrong answers with safety mechanism
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops

  while (wrongs.length < maxChoices - 1 && attempts < maxAttempts) {
    attempts++;
    
    // Generate wrong answers using common division mistakes
    const wrongAnswer1 = answer + 1; // Off by one
    const wrongAnswer2 = Math.max(1, answer - 1); // Off by one (other direction)
    const wrongAnswer3 = dividend - divisor; // Subtraction instead of division
    const wrongAnswer4 = dividend + divisor; // Addition instead of division
    const wrongAnswer5 = divisor; // Just the divisor
    const wrongAnswer6 = dividend; // Just the dividend
    const wrongAnswer7 = answer * 2; // Double the answer
    const wrongAnswer8 = Math.max(1, Math.floor(answer / 2)); // Half the answer
    
    const potentialWrongs = [wrongAnswer1, wrongAnswer2, wrongAnswer3, wrongAnswer4, wrongAnswer5, wrongAnswer6, wrongAnswer7, wrongAnswer8];
    
    for (const wrong of potentialWrongs) {
      if (wrongs.length >= maxChoices - 1) break;
      if (wrong !== answer && wrong > 0 && wrong <= 50 && !wrongs.includes(wrong)) {
        wrongs.push(wrong);
      }
    }
    
    // Add some random nearby numbers as fallback
    if (wrongs.length < maxChoices - 1) {
      const randomWrong = Math.max(1, answer + randInt(-3, 3));
      if (randomWrong !== answer && !wrongs.includes(randomWrong)) {
        wrongs.push(randomWrong);
      }
    }
  }

  // If we still don't have enough wrong answers, add some guaranteed different ones
  while (wrongs.length < maxChoices - 1) {
    const fallbackWrong = Math.max(1, answer + (wrongs.length + 1));
    if (!wrongs.includes(fallbackWrong)) {
      wrongs.push(fallbackWrong);
    }
  }

  const choices = [answer, ...wrongs].sort(() => Math.random() - 0.5);
  return { dividend, divisor, answer, choices };
}

// Visual distribution component
const DistributionVisual = React.memo(({ dividend, divisor, showResult = false }) => {
  const itemSize = 20;
  const groupSpacing = 10;
  const maxItemsPerRow = 2;
  
  // Calculate visual layout
  const quotient = dividend / divisor;
  const totalGroups = divisor;
  const itemsPerGroup = quotient;
  
  const renderGroup = (groupIndex) => {
    const items = [];
    const itemsInThisGroup = showResult ? itemsPerGroup : 0;
    
    for (let i = 0; i < itemsInThisGroup; i++) {
      const row = Math.floor(i / maxItemsPerRow);
      const col = i % maxItemsPerRow;
      
      items.push(
        <circle
          key={`${groupIndex}-${i}`}
          cx={col * (itemSize + 5) + itemSize/2 + 5} // Adjusted for new padding
          cy={row * (itemSize + 5) + itemSize/2 + 5} // Adjusted for new padding
          r={itemSize/3}
          fill="#4CAF50"
          stroke="#2E7D32"
          strokeWidth="2"
          style={{
            animation: showResult ? `fadeIn 0.5s ease-in-out ${(groupIndex * itemsPerGroup + i) * 0.1}s both` : 'none'
          }}
        />
      );
    }
    
    // Group container
    const groupHeight = Math.ceil(itemsPerGroup / maxItemsPerRow) * (itemSize + 5) + 10; // Increased padding
    const groupWidth = Math.min(itemsPerGroup, maxItemsPerRow) * (itemSize + 5) + 10; // Increased padding
    
    return (
      <g key={groupIndex}>
        <rect
          x={0}
          y={0}
          width={groupWidth}
          height={groupHeight}
          fill="none"
          stroke="#FF9800"
          strokeWidth="3"
          strokeDasharray="5,5"
          rx="5"
        />
        {items}
        <text
          x={groupWidth / 2}
          y={groupHeight + 20}
          textAnchor="middle"
          fill="#FF9800"
          fontSize="14"
          fontWeight="bold"
        >
          مجموعة {groupIndex + 1}
        </text>
      </g>
    );
  };
  
  // Calculate SVG dimensions
  const maxGroupWidth = Math.min(itemsPerGroup, maxItemsPerRow) * (itemSize + 5) + 30; // Increased padding
  const groupHeight = Math.ceil(itemsPerGroup / maxItemsPerRow) * (itemSize + 5) + 50; // Increased height
  const groupsPerRow = Math.min(totalGroups, 3); // Keep 3 per row
  const rows = Math.ceil(totalGroups / groupsPerRow);
  
  // Calculate total width needed with proper margins
  const leftMargin = 30;
  const rightMargin = 30;
  const totalContentWidth = groupsPerRow * maxGroupWidth + (groupsPerRow - 1) * groupSpacing;
  const svgWidth = totalContentWidth + leftMargin + rightMargin;
  const svgHeight = rows * (groupHeight + 40) + 40; // Added more spacing
  
  return (
    <Box sx={{ textAlign: 'center', mb: 2 }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
      
      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
        {showResult 
          ? `توزيع ${dividend} عنصر على ${divisor} مجموعات = ${quotient} في كل مجموعة`
          : `كيف نوزع ${dividend} عنصر على ${divisor} مجموعات؟`
        }
      </Typography>
      
      <svg width={svgWidth} height={svgHeight} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        {Array.from({ length: totalGroups }, (_, i) => {
          const row = Math.floor(i / groupsPerRow);
          const col = i % groupsPerRow;
          
          // Calculate positioning with proper spacing and margins
          const leftMargin = 30;
          const xPos = leftMargin + col * (maxGroupWidth + groupSpacing);
          const yPos = 20 + row * (groupHeight + 40);
          
          return (
            <g 
              key={i} 
              transform={`translate(${xPos}, ${yPos})`}
            >
              {renderGroup(i)}
            </g>
          );
        })}
      </svg>
    </Box>
  );
});

export default function DivisionGame({ level: initialLevel = "beginner", onComplete, onBack }) {
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
  const [showVisualResult, setShowVisualResult] = useState(false);

  const particleCanvasRef = useRef(null);
  const scoreRef = useRef(null);
  const progressManager = useRef(new GameProgressionManager("division-game"));

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
    setShowVisualResult(false);
  }, [level]);

  const nextRound = (selectedChoice) => {
    const correct = selectedChoice === expr.answer;
    const responseTime = Date.now() - questionStartTime;

    setSelectedAnswer(selectedChoice);
    setShowFeedback(true);
    setShowVisualResult(true);

    let newScore = score;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      newScore = score + 1;
      setScore(newScore);

      // Enhanced feedback based on performance
      if (responseTime < 3000) {
        setFeedback("⚡ سريع جداً!");
        playSfx("streak");
      } else if (newStreak >= 5) {
        setFeedback(`🔥 متتالية رائعة! ${newStreak}`);
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
      setShowVisualResult(false);

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
    }, 2500); // Longer delay to show visual result
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
            تحدي القسمة ➗ {difficultyLevels[level].icon}
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

        {/* Visual distribution display */}
        {(expr.dividend <= 50) && ( // Only show for reasonable numbers
          <Box sx={{ mb: 3 }}>
            <DistributionVisual 
              dividend={expr.dividend} 
              divisor={expr.divisor} 
              showResult={showVisualResult}
            />
          </Box>
        )}

        {/* Main question display */}
        <Zoom in={!showFeedback} timeout={500}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              backgroundColor: "#f8f9fa",
              border: "2px solid #e9ecef",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                color: "#2c3e50",
                fontFamily: "'Amiri', serif",
                mb: 1,
                direction: "ltr",
              }}
            >
              {expr.dividend} ÷ {expr.divisor} = ?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontSize: "0.9rem",
                mt: 1,
              }}
            >
              كم عدد العناصر في كل مجموعة؟
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
              <Grid item key={choice}>
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
                      py: 2,
                      minWidth: 100,
                      fontSize: "1.4rem",
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

      {/* WinOverlay removed: parent handles navigation on completion */}
    </Box>
  );
}