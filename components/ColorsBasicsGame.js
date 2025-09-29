"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Timer from "./Timer";
import { playSfx } from "@/lib/sfx";
import {
  difficultyLevels,
  createParticleEffect,
  GameProgressionManager,
  createPulseAnimation,
  createShakeAnimation,
} from "@/lib/gameEnhancements";

// Core color dataset
const COLORS = [
  { id: "red", name: "أحمر", hex: "#ef4444", category: "primary" },
  { id: "blue", name: "أزرق", hex: "#3b82f6", category: "primary" },
  { id: "yellow", name: "أصفر", hex: "#d4ff00ff", category: "primary" },
  { id: "green", name: "أخضر", hex: "#22c55e", category: "secondary" },
  { id: "orange", name: "برتقالي", hex: "#fb923c", category: "secondary" },
  { id: "purple", name: "بنفسجي", hex: "#a855f7", category: "secondary" },
  { id: "black", name: "أسود", hex: "#111827", category: "neutral" },
  { id: "white", name: "أبيض", hex: "#ffffff", category: "neutral", border: "#e5e7eb" },
  { id: "brown", name: "بني", hex: "#8b5a2b", category: "other" },
  { id: "pink", name: "وردي", hex: "#fb7185", category: "other" },
];

const difficultyPresets = {
  beginner: { name: "مبتدئ", rounds: 6 },
  intermediate: { name: "متوسط", rounds: 8 },
  advanced: { name: "متقدم", rounds: 10 },
};

const modes = {
  nameToColor: { name: "اختر اللون الصحيح", emoji: "🎨" },
  colorToName: { name: "اختر الاسم الصحيح", emoji: "🖍️" },
  isPrimary: { name: "هل هو لون أساسي؟", emoji: "🔺" },
  mixed: { name: "مختلط", emoji: "🎲" },
};

function randFrom(arr, n) {
  const copy = [...arr];
  copy.sort(() => Math.random() - 0.5);
  return n ? copy.slice(0, n) : copy[0];
}

export default function ColorsBasicsGame({ level = "beginner", onComplete, onBack } = {}) {
  const initialDifficulty = difficultyPresets[level] ? level : "beginner";
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [mode, setMode] = useState("nameToColor");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [finalTime, setFinalTime] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const progressManager = useRef(new GameProgressionManager("colors-basics"));
  const particleCanvasRef = useRef(null);
  const totalRounds = difficultyPresets[difficulty].rounds;

  const progress = useMemo(
    () => Math.min(100, (round - 1) * (100 / totalRounds)),
    [round, totalRounds]
  );

  useEffect(() => {
    // preload sfx
    try { require("@/lib/sfx").preloadSfx(); } catch {}
  }, []);

  useEffect(() => {
    // reset on difficulty change
    setRound(1);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setShowFeedback(false);
    setTimerActive(true);
    setTimerKey(k => k + 1);
    makeQuestion(difficulty, mode);
  }, [difficulty]);

  useEffect(() => {
    // change mode mid-game only between rounds
    if (!showFeedback) makeQuestion(difficulty, mode);
  }, [mode]);

  const handleTimerStop = (seconds) => {
    setFinalTime(seconds);
  };

  function makeQuestion(diff, m) {
    const actualMode = m === "mixed" ? randFrom(["nameToColor", "colorToName", "isPrimary"]) : m;

    if (actualMode === "nameToColor") {
      // show Arabic name, options are color swatches
      const pool = COLORS;
      const correct = randFrom(pool);
      const wrong = randFrom(pool.filter(c => c.id !== correct.id), 3);
      setQuestion({ type: actualMode, text: `اختر اللون: «${correct.name}»`, correct });
      setOptions(randFrom([ [correct, ...wrong], [correct, ...wrong].reverse() ], 1)[0].sort(() => Math.random() - 0.5));
    } else if (actualMode === "colorToName") {
      // show color swatch, options are Arabic names
      const pool = COLORS;
      const correct = randFrom(pool);
      const wrong = randFrom(pool.filter(c => c.id !== correct.id), 3);
      setQuestion({ type: actualMode, text: `ما اسم هذا اللون؟`, correct });
      setOptions(randFrom([ [correct, ...wrong], [correct, ...wrong].reverse() ], 1)[0]
        .map(c => ({ id: c.id, name: c.name }))
        .sort(() => Math.random() - 0.5));
    } else if (actualMode === "isPrimary") {
      // yes/no for primaries on a swatch
      const pool = COLORS;
      const correct = randFrom(pool);
      setQuestion({ type: actualMode, text: `هل هذا اللون أساسي؟`, correct });
      setOptions([
        { id: "yes", name: "لون أساسي" },
        { id: "no", name: "ليس أساسيًا" },
      ]);
    }

    setSelected(null);
    setShowFeedback(false);
  }

  function isCorrectChoice(opt) {
    if (!question) return false;
    if (question.type === "nameToColor") return opt.id === question.correct.id;
    if (question.type === "colorToName") return opt.id === question.correct.id;
    if (question.type === "isPrimary") {
      const primary = question.correct.category === "primary";
      return (opt.id === "yes" && primary) || (opt.id === "no" && !primary);
    }
    return false;
  }

  function handleAnswer(opt) {
    if (showFeedback) return;
    setSelected(opt);
    const correct = isCorrectChoice(opt);
    setShowFeedback(true);

    let newScore = score;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      newScore = score + 1;
      setScore(newScore);
      playSfx("correct");
      createParticleEffect(particleCanvasRef.current, "success");
      progressManager.current.updateScore(10, 0);
      progressManager.current.updateStreak(newStreak);
    } else {
      setStreak(0);
      playSfx("wrong");
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
      if (round >= totalRounds) {
        setTimerActive(false);
        playSfx("win");
        if (typeof onComplete === "function") onComplete(newScore, finalTime || 0);
        return;
      }
      setRound(r => r + 1);
      makeQuestion(difficulty, mode);
    }, 900);
  }

  // UI helpers
  const Swatch = ({ hex, border }) => (
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: 2,
        backgroundColor: hex,
        border: `3px solid ${border || "#333"}${hex === "#ffffff" ? "20" : ""}`,
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.15)",
      }}
      aria-label={`swatch-${hex}`}
    />
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4, position: "relative" }}>
      {/* Particle canvas */}
      <canvas
        ref={particleCanvasRef}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }}
        width="800"
        height="600"
      />

      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 460,
          maxWidth: 560,
          border: `3px solid ${difficultyLevels[difficulty].color}`,
          boxShadow: `0 8px 32px ${difficultyLevels[difficulty].color}40`,
          background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          {onBack && (
            <Button
              variant="outlined"
              size="small"
              onClick={onBack}
              sx={{ minWidth: "auto", px: 1, borderRadius: 2, border: "2px solid #666", color: "#666", "&:hover": { border: "2px solid #333", color: "#333" } }}
            >
              ← رجوع
            </Button>
          )}
          <Typography variant="h4" align="center" sx={{ fontWeight: "bold", color: difficultyLevels[difficulty].color, flexGrow: 1 }}>
            الألوان الأساسية 🎨
          </Typography>
          <Chip label={difficultyPresets[difficulty].name} sx={{ backgroundColor: difficultyLevels[difficulty].color, color: "white", fontWeight: "bold" }} />
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1 }}>
          <Chip label={`الجولة: ${round}/${totalRounds}`} color="primary" variant="outlined" />
          <Chip label={`النقاط: ${score}`} color="success" variant="outlined" />
          {streak > 0 && (
            <Chip label={`متتالية: ${streak} 🔥`} sx={{ backgroundColor: "#ff6b35", color: "white", ...createPulseAnimation() }} />
          )}
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>التقدم في اللعبة</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, backgroundColor: "#e0e0e0", "& .MuiLinearProgress-bar": { backgroundColor: difficultyLevels[difficulty].color, borderRadius: 4 } }} />
        </Box>

        {/* Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={7}>
            <FormControl fullWidth size="small">
              <InputLabel>مستوى الصعوبة</InputLabel>
              <Select value={difficulty} label="مستوى الصعوبة" onChange={(e) => setDifficulty(e.target.value)} disabled={showFeedback}>
                {Object.keys(difficultyPresets).map(k => (
                  <MenuItem key={k} value={k}>{difficultyPresets[k].name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <FormControl fullWidth size="small">
              <InputLabel>الوضع</InputLabel>
              <Select value={mode} label="الوضع" onChange={(e) => setMode(e.target.value)} disabled={showFeedback}>
                {Object.keys(modes).map(k => (
                  <MenuItem key={k} value={k}>{modes[k].emoji} {modes[k].name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Question */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: "center", backgroundColor: "#fff7ed", border: "2px solid #fdba74", borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#7c2d12", mb: 2 }}>{question?.text || ""}</Typography>
          {question?.type === "colorToName" && question?.correct && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Swatch hex={question.correct.hex} border={question.correct.border} />
            </Box>
          )}
          {question?.type === "isPrimary" && question?.correct && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Swatch hex={question.correct.hex} border={question.correct.border} />
            </Box>
          )}
        </Paper>

        {/* Options */}
        {!showFeedback && (
          <Grid container spacing={2} justifyContent="center">
            {options.map((opt, idx) => (
              <Grid item key={opt.id}>
                {question?.type === "nameToColor" ? (
                  <Button onClick={() => handleAnswer(opt)} variant="outlined" sx={{ p: 1.5, borderRadius: 3, minWidth: 88, minHeight: 88, border: "2px solid #e0e0e0", "&:hover": { borderColor: difficultyLevels[difficulty].color } }}>
                    <Swatch hex={opt.hex} border={opt.border} />
                  </Button>
                ) : (
                  <Button onClick={() => handleAnswer(opt)} variant="outlined" sx={{ py: 2, px: 3, borderRadius: 3, border: "2px solid #e0e0e0", fontSize: "1.2rem", fontWeight: "bold", "&:hover": { backgroundColor: difficultyLevels[difficulty].color, color: "white", borderColor: difficultyLevels[difficulty].color } }}>
                    {opt.name}
                  </Button>
                )}
              </Grid>
            ))}
          </Grid>
        )}

        {/* Feedback */}
        {showFeedback && selected && (
          <Paper elevation={4} sx={{ p: 3, mt: 1, borderRadius: 3, textAlign: "center", backgroundColor: isCorrectChoice(selected) ? "#e8f5e8" : "#ffeaea", border: `2px solid ${isCorrectChoice(selected) ? "#4caf50" : "#f44336"}`, ...(isCorrectChoice(selected) ? createPulseAnimation() : createShakeAnimation()) }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: isCorrectChoice(selected) ? "#2e7d32" : "#c62828" }}>
              {isCorrectChoice(selected) ? "✅ صحيح!" : `❌ الإجابة الصحيحة: ${question.type === "colorToName" ? question.correct.name : question.type === "isPrimary" ? (question.correct.category === "primary" ? "لون أساسي" : "ليس أساسيًا") : question.correct.name}`}
            </Typography>
          </Paper>
        )}

        {/* Timer */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Stack direction="row" gap={2} justifyContent="center" alignItems="center">
            <Typography variant="h6" sx={{ color: "#666" }}>الوقت:</Typography>
            <Timer active={timerActive} resetKey={timerKey} onStop={handleTimerStop} sx={{ fontSize: "1.2rem", fontWeight: "bold" }} />
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
