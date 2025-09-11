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
  // Enhanced difficulty progression
  let a,
    b,
    maxChoices = 4;

  if (level === "beginner") {
    a = randInt(1, 5);
    b = randInt(1, 5);
  } else if (level === "intermediate") {
    a = randInt(1, 12);
    b = randInt(1, 12);
  } else if (level === "advanced") {
    a = randInt(10, 25);
    b = randInt(10, 25);
  } else {
    // expert
    a = randInt(20, 50);
    b = randInt(20, 50);
    maxChoices = 6; // More challenging choices
  }

  const answer = a + b;
  let wrongs = [];

  while (wrongs.length < maxChoices - 1) {
    const delta = level === "expert" ? randInt(1, 8) : randInt(1, 5);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const wrong = answer + sign * delta;
    if (wrong > 0 && wrong !== answer && !wrongs.includes(wrong)) {
      wrongs.push(wrong);
    }
  }

  const choices = [answer, ...wrongs].sort(() => Math.random() - 0.5);
  return { a, b, answer, choices };
}

export default function AdditionGame() {
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [level, setLevel] = useState("beginner");
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
  const progressManager = useRef(new GameProgressionManager("addition-game"));

  const totalRounds = 10;
  const maxStreak = 10;

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

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((s) => s + 1);

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

      if (round + 1 >= totalRounds) {
        setShowWin(true);
        setTimerActive(false);
        playSfx("win");
        return;
      }

      setRound((r) => r + 1);
      setExpr(generateForLevel(level));
      setQuestionStartTime(Date.now());
      setFeedback("");
    }, 1500);
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
          minWidth: 380,
          maxWidth: 450,
          border: `3px solid ${difficultyLevels[level].color}`,
          boxShadow: `0 8px 32px ${difficultyLevels[level].color}40`,
          background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Difficulty indicator */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: "bold",
              color: difficultyLevels[level].color,
              flexGrow: 1,
            }}
          >
            تحدي الجمع {difficultyLevels[level].icon}
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
              {expr.a} + {expr.b} = ?
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
