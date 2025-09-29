"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  LinearProgress,
  Fade,
  Zoom,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PatternIcon from "@mui/icons-material/GridOn";
import Timer from "./Timer";
import {
  GameProgressionManager,
  createParticleEffect,
  difficultyLevels,
} from "@/lib/gameEnhancements";
import { playSfx } from "@/lib/sfx";

// Pattern types and generators
const PATTERN_TYPES = {
  ARITHMETIC: "arithmetic",
  GEOMETRIC: "geometric",
  FIBONACCI: "fibonacci",
  SQUARED: "squared",
  MIXED: "mixed",
};

const generatePattern = (type, level) => {
  let sequence = [];
  let missingIndex = 0;
  let rule = "";

  switch (type) {
    case PATTERN_TYPES.ARITHMETIC:
      const diff =
        level === "beginner"
          ? Math.floor(Math.random() * 5) + 2
          : Math.floor(Math.random() * 10) + 3;
      const start = Math.floor(Math.random() * 20) + 1;
      sequence = Array.from({ length: 6 }, (_, i) => start + i * diff);
      missingIndex = Math.floor(Math.random() * 4) + 1; // Don't make first one missing
      rule = `يزيد بمقدار ${diff}`;
      break;

    case PATTERN_TYPES.GEOMETRIC:
      const ratio =
        level === "beginner" ? 2 : Math.floor(Math.random() * 3) + 2;
      const firstTerm = Math.floor(Math.random() * 5) + 1;
      sequence = Array.from(
        { length: 5 },
        (_, i) => firstTerm * Math.pow(ratio, i)
      );
      missingIndex = Math.floor(Math.random() * 3) + 1;
      rule = `يضرب في ${ratio}`;
      break;

    case PATTERN_TYPES.FIBONACCI:
      sequence = [1, 1, 2, 3, 5, 8];
      missingIndex = Math.floor(Math.random() * 4) + 2;
      rule = "فيبوناتشي: كل رقم = مجموع الرقمين السابقين";
      break;

    case PATTERN_TYPES.SQUARED:
      sequence = Array.from({ length: 5 }, (_, i) => Math.pow(i + 1, 2));
      missingIndex = Math.floor(Math.random() * 3) + 1;
      rule = "مربعات الأعداد (1², 2², 3², ...)";
      break;

    case PATTERN_TYPES.MIXED:
      // Alternating pattern
      const base = Math.floor(Math.random() * 10) + 5;
      const increment = Math.floor(Math.random() * 3) + 2;
      sequence = Array.from({ length: 6 }, (_, i) =>
        i % 2 === 0 ? base + i : base + i + increment
      );
      missingIndex = Math.floor(Math.random() * 4) + 1;
      rule = "نمط متناوب";
      break;
  }

  const answer = sequence[missingIndex];
  const displaySequence = [...sequence];
  displaySequence[missingIndex] = null;

  return {
    sequence: displaySequence,
    answer,
    missingIndex,
    rule,
    type,
  };
};

const LEVEL_CONFIG = {
  beginner: {
    rounds: 8,
    patterns: [PATTERN_TYPES.ARITHMETIC, PATTERN_TYPES.GEOMETRIC],
    timeLimit: 8 * 60, // 8 minutes
  },
  intermediate: {
    rounds: 10,
    patterns: [
      PATTERN_TYPES.ARITHMETIC,
      PATTERN_TYPES.GEOMETRIC,
      PATTERN_TYPES.SQUARED,
    ],
    timeLimit: 10 * 60, // 10 minutes
  },
  advanced: {
    rounds: 12,
    patterns: [
      PATTERN_TYPES.ARITHMETIC,
      PATTERN_TYPES.GEOMETRIC,
      PATTERN_TYPES.FIBONACCI,
      PATTERN_TYPES.SQUARED,
      PATTERN_TYPES.MIXED,
    ],
    timeLimit: 12 * 60, // 12 minutes
  },
};

export default function NumberPatternsGame({
  level: initialLevel = "intermediate",
  onComplete,
  onBack,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Game state
  const [level, setLevel] = useState(initialLevel);
  const [pattern, setPattern] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [timerActive, setTimerActive] = useState(true);
  const [finalTime, setFinalTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showRule, setShowRule] = useState(false);

  const config = LEVEL_CONFIG[level];
  const totalRounds = config.rounds;

  // Refs
  const progressManager = useRef(null);
  const particleCanvasRef = useRef(null);
  const scoreRef = useRef(null);

  // Initialize game
  useEffect(() => {
    progressManager.current = new GameProgressionManager();
    generateNewPattern();
    setQuestionStartTime(Date.now());
  }, [level]);

  // Handle level change
  const handleLevelChange = (newLevel) => {
    if (round === 1) {
      setLevel(newLevel);
      // Reset game state for new level
      setRound(1);
      setScore(0);
      setStreak(0);
      setShowFeedback(false);
      setShowRule(false);
      setUserAnswer("");
      setTimerActive(true);
      setFinalTime(0);
      generateNewPattern();
      setQuestionStartTime(Date.now());
    }
  };

  const generateNewPattern = () => {
    const availablePatterns = config.patterns;
    const randomType =
      availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    const newPattern = generatePattern(randomType, level);
    setPattern(newPattern);
    setUserAnswer("");
    setShowFeedback(false);
    setShowRule(false);
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const userNum = parseInt(userAnswer);
    const correct = userNum === pattern.answer;
    const responseTime = Date.now() - questionStartTime;

    setShowFeedback(true);

    let newScore = score;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      newScore = score + 1;
      setScore(newScore);

      // Enhanced feedback based on performance
      if (responseTime < 10000) {
        setFeedback("⚡ ممتاز! اكتشفت النمط بسرعة!");
        playSfx("streak");
      } else if (newStreak >= 3) {
        setFeedback(`🔥 متتالية رائعة! ${newStreak}`);
        playSfx("bonus");
      } else {
        setFeedback("✅ صحيح! أحسنت!");
        playSfx("correct");
      }

      // Create particle effect for correct answers
      createParticleEffect(particleCanvasRef.current, "success");

      // Update progress manager
      progressManager.current.updateScore(10, responseTime);
      progressManager.current.updateStreak(newStreak);
    } else {
      setStreak(0);
      setFeedback(`❌ خطأ! الإجابة الصحيحة: ${pattern.answer}`);
      setShowRule(true);
      playSfx("wrong");
    }

    // Continue to next round after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setShowRule(false);

      if (round >= totalRounds) {
        setTimerActive(false);
        playSfx("win");

        // Call onComplete callback with correct final score
        if (onComplete) {
          onComplete(newScore, finalTime || 0);
        }
        return;
      }

      setRound((r) => r + 1);
      generateNewPattern();
      setQuestionStartTime(Date.now());
    }, 3000);
  };

  const handleTimeUp = (time) => {
    setFinalTime(time);
    setTimerActive(false);
    playSfx("lose");

    if (onComplete) {
      onComplete(score, time);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !showFeedback) {
      checkAnswer();
    }
  };

  const restartGame = () => {
    setRound(1);
    setScore(0);
    setStreak(0);
    setTimerActive(true);
    setFinalTime(0);
    setShowFeedback(false);
    setShowRule(false);
    generateNewPattern();
    setQuestionStartTime(Date.now());
  };

  if (!pattern) {
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6">جاري تحضير النمط...</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative" }}>
        {/* Header Card */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 4,
            p: 3,
            mb: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: "3px solid",
            borderColor: `${difficultyLevels[level].color}`,
          }}
        >
          {/* Top Row: Back button, Title, Round indicator */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Button
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                borderColor: "grey.300",
                color: "text.primary",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "primary.light",
                },
              }}
            >
              رجوع
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PatternIcon sx={{ color: "primary.main", fontSize: 28 }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                أنماط الأرقام
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "primary.main",
                color: "white",
                px: 2,
                py: 1,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 60,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", lineHeight: 1 }}
              >
                {round}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1 }}>
                {totalRounds}
              </Typography>
            </Box>
          </Box>

          {/* Second Row: Game info */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "success.light",
                color: "success.contrastText",
                borderRadius: 3,
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2">النقاط:</Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {score}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "warning.light",
                color: "warning.contrastText",
                borderRadius: 3,
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2">الجولة:</Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {round}/{totalRounds}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Timer
                initialTime={config.timeLimit}
                isActive={timerActive}
                onTimeUp={handleTimeUp}
              />
            </Box>
          </Box>

          {/* Third Row: Progress and Difficulty */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                التقدم في اللعبة
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((round - 1) / totalRounds) * 100}
                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
              />
            </Box>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>مستوى الصعوبة</InputLabel>
              <Select
                value={level}
                onChange={(e) => handleLevelChange(e.target.value)}
                label="مستوى الصعوبة"
                disabled={round > 1}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="beginner">مبتدئ 🌱</MenuItem>
                <MenuItem value="intermediate">متوسط 🌿</MenuItem>
                <MenuItem value="advanced">متقدم 🌳</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Main Game Card */}
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 4,
              p: 4,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              mb: 3,
            }}
          >
            {/* Pattern Display */}
            <Fade in={!showFeedback}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 4, color: "text.primary", fontWeight: "bold" }}
                >
                  اكتشف النمط واملأ الفراغ:
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    mb: 4,
                    flexWrap: "wrap",
                  }}
                >
                  {pattern.sequence.map((num, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: isMobile ? 60 : 70,
                        height: isMobile ? 60 : 70,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: 3,
                        borderColor:
                          num === null ? "warning.main" : "primary.main",
                        borderRadius: 3,
                        backgroundColor:
                          num === null ? "warning.light" : "primary.light",
                        fontSize: isMobile ? "1.3rem" : "1.6rem",
                        fontWeight: "bold",
                        color:
                          num === null
                            ? "warning.contrastText"
                            : "primary.contrastText",
                        boxShadow: num === null ? 3 : 1,
                        animation: num === null ? "pulse 2s infinite" : "none",
                        "@keyframes pulse": {
                          "0%": { transform: "scale(1)", opacity: 1 },
                          "50%": { transform: "scale(1.05)", opacity: 0.8 },
                          "100%": { transform: "scale(1)", opacity: 1 },
                        },
                      }}
                    >
                      {num === null ? "?" : num}
                    </Box>
                  ))}
                </Box>

                {/* Input Section */}
                <Box sx={{ maxWidth: 400, mx: "auto" }}>
                  <TextField
                    fullWidth
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب الرقم المفقود"
                    disabled={showFeedback}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                        fontSize: "1.5rem",
                      },
                    }}
                    inputProps={{
                      style: { textAlign: "center", fontSize: "1.5rem" },
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim() || showFeedback}
                    size="large"
                    sx={{
                      py: 2,
                      fontSize: "1.2rem",
                      borderRadius: 4,
                      boxShadow: 3,
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    تحقق من الإجابة
                  </Button>
                </Box>
              </Box>
            </Fade>

            {/* Feedback */}
            <Zoom in={showFeedback}>
              <Box sx={{ textAlign: "center" }}>
                <Alert
                  severity={feedback.includes("✅") ? "success" : "error"}
                  icon={
                    feedback.includes("✅") ? (
                      <CheckCircleIcon />
                    ) : (
                      <ErrorIcon />
                    )
                  }
                  sx={{
                    fontSize: "1.2rem",
                    justifyContent: "center",
                    borderRadius: 3,
                    mb: showRule ? 2 : 0,
                  }}
                >
                  {feedback}
                </Alert>

                {showRule && (
                  <Alert
                    severity="info"
                    sx={{
                      fontSize: "1rem",
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="body1">
                      <strong>قاعدة النمط:</strong> {pattern.rule}
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Zoom>
          </Box>
        </Box>
        {/* Streak Display */}
        {streak > 0 && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                bgcolor: "white",
                color: "warning.main",
                px: 3,
                py: 2,
                borderRadius: 4,
                boxShadow: 3,
                border: "2px solid",
                borderColor: "warning.main",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                🔥 متتالية: {streak}
              </Typography>
            </Box>
          </Box>
        )}

        {/* No overlay; completion handled via onComplete */}
      </Container>
    </Box>
  );
}
