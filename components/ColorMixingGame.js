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

// Define colors and mixing rules
const COLORS = {
  red:   { id: "red",   name: "أحمر",   hex: "#ef4444" },
  blue:  { id: "blue",  name: "أزرق",  hex: "#3b82f6" },
  yellow:{ id: "yellow",name: "أصفر",  hex: "#f59e0b" },
  green: { id: "green", name: "أخضر",  hex: "#22c55e" },
  orange:{ id: "orange",name: "برتقالي",hex: "#fb923c" },
  purple:{ id: "purple",name: "بنفسجي",hex: "#a855f7" },
  brown: { id: "brown", name: "بني",    hex: "#8b5a2b" },
  black: { id: "black", name: "أسود",   hex: "#111827" },
  white: { id: "white", name: "أبيض",   hex: "#ffffff", border: "#e5e7eb" },
};

// Basic subtractive mixing logic (education-friendly, not physically exact)
const MIX_RULES = {
  // primary + primary => secondary
  "red+blue": "purple",
  "blue+red": "purple",
  "red+yellow": "orange",
  "yellow+red": "orange",
  "blue+yellow": "green",
  "yellow+blue": "green",
  // Same color => same color
  "red+red": "red",
  "blue+blue": "blue",
  "yellow+yellow": "yellow",
  "green+green": "green",
  "orange+orange": "orange",
  "purple+purple": "purple",
  // Secondary + primary (simple heuristic)
  "green+red": "brown",
  "red+green": "brown",
  "orange+blue": "brown",
  "blue+orange": "brown",
  "purple+yellow": "brown",
  "yellow+purple": "brown",
  // With white/black as tints/shades (intro level)
  "white+red": "red",
  "red+white": "red",
  "white+blue": "blue",
  "blue+white": "blue",
  "white+yellow": "yellow",
  "yellow+white": "yellow",
  "black+red": "brown",
  "red+black": "brown",
  "black+blue": "brown",
  "blue+black": "brown",
  "black+yellow": "brown",
  "yellow+black": "brown",
};

const PALETTE = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.green, COLORS.orange, COLORS.purple, COLORS.white, COLORS.black];
const ANSWERS = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.green, COLORS.orange, COLORS.purple, COLORS.brown];

const difficultyPresets = {
  beginner: { name: "مبتدئ", rounds: 6 },
  intermediate: { name: "متوسط", rounds: 8 },
  advanced: { name: "متقدم", rounds: 10 },
};

function randFrom(arr, n) {
  const copy = [...arr];
  copy.sort(() => Math.random() - 0.5);
  return n ? copy.slice(0, n) : copy[0];
}

export default function ColorMixingGame({ level = "beginner", onComplete, onBack } = {}) {
  const initialDifficulty = difficultyPresets[level] ? level : "beginner";
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [finalTime, setFinalTime] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const progressManager = useRef(new GameProgressionManager("color-mixing"));
  const particleCanvasRef = useRef(null);
  const totalRounds = difficultyPresets[difficulty].rounds;

  useEffect(() => { try { require("@/lib/sfx").preloadSfx(); } catch {} }, []);

  useEffect(() => {
    // reset on difficulty
    setRound(1);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setShowFeedback(false);
    setTimerActive(true);
    setTimerKey(k => k + 1);
    makeQuestion();
  }, [difficulty]);

  const handleTimerStop = (seconds) => setFinalTime(seconds);

  function mix(a, b) {
    const key = `${a.id}+${b.id}`;
    const res = MIX_RULES[key];
    return res ? COLORS[res] : COLORS.brown; // default to brown for unknowns
  }

  function makeQuestion() {
    const [c1, c2] = randFrom(PALETTE, 2);
    const correct = mix(c1, c2);
    const wrong = randFrom(ANSWERS.filter(c => c.id !== correct.id), 3);
    setLeft(c1); setRight(c2); setAnswer(correct);
    setOptions(randFrom([[correct, ...wrong], [correct, ...wrong].reverse()], 1)[0].sort(() => Math.random() - 0.5));
    setSelected(null);
    setShowFeedback(false);
  }

  function handleAnswer(opt) {
    if (showFeedback) return;
    setSelected(opt);
    const correct = opt.id === answer.id;
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
      makeQuestion();
    }, 900);
  }

  const Swatch = ({ hex, border }) => (
    <Box sx={{ width: 64, height: 64, borderRadius: 2, backgroundColor: hex, border: `3px solid ${border || "#333"}${hex === "#ffffff" ? "20" : ""}`, boxShadow: "inset 0 0 6px rgba(0,0,0,0.15)" }} aria-label={`swatch-${hex}`} />
  );

  const MixIcon = () => (
    <Box sx={{ mx: 2, fontSize: 28, fontWeight: 800, color: "#555" }}>+</Box>
  );

  const EqualIcon = () => (
    <Box sx={{ mx: 2, fontSize: 28, fontWeight: 800, color: "#555" }}>=</Box>
  );

  const progress = useMemo(() => Math.min(100, (round - 1) * (100 / totalRounds)), [round, totalRounds]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4, position: "relative" }}>
      {/* Particle */}
      <canvas ref={particleCanvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }} width="800" height="600" />

      <Paper elevation={8} sx={{ p: 4, borderRadius: 4, minWidth: 480, maxWidth: 600, border: `3px solid ${difficultyLevels[difficulty].color}` , boxShadow: `0 8px 32px ${difficultyLevels[difficulty].color}40`, background: "linear-gradient(145deg, #ffffff, #f8f9fa)", position: "relative", overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          {onBack && (
            <Button variant="outlined" size="small" onClick={onBack} sx={{ minWidth: "auto", px: 1, borderRadius: 2, border: "2px solid #666", color: "#666", "&:hover": { border: "2px solid #333", color: "#333" } }}>← رجوع</Button>
          )}
          <Typography variant="h4" align="center" sx={{ fontWeight: "bold", color: difficultyLevels[difficulty].color, flexGrow: 1 }}>
            خلط الألوان 🧪
          </Typography>
          <Chip label={difficultyPresets[difficulty].name} sx={{ backgroundColor: difficultyLevels[difficulty].color, color: "white", fontWeight: "bold" }} />
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1 }}>
          <Chip label={`الجولة: ${round}/${totalRounds}`} color="primary" variant="outlined" />
          <Chip label={`النقاط: ${score}`} color="success" variant="outlined" />
          {streak > 0 && (<Chip label={`متتالية: ${streak} 🔥`} sx={{ backgroundColor: "#ff6b35", color: "white", ...createPulseAnimation() }} />)}
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>التقدم في اللعبة</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, backgroundColor: "#e0e0e0", "& .MuiLinearProgress-bar": { backgroundColor: difficultyLevels[difficulty].color, borderRadius: 4 } }} />
        </Box>

        {/* Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>مستوى الصعوبة</InputLabel>
              <Select value={difficulty} label="مستوى الصعوبة" onChange={(e) => setDifficulty(e.target.value)} disabled={showFeedback}>
                {Object.keys(difficultyPresets).map(k => (<MenuItem key={k} value={k}>{difficultyPresets[k].name}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Question */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: "center", backgroundColor: "#eef2ff", border: "2px solid #c7d2fe", borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1e3a8a", mb: 2 }}>ما لون الناتج عند خلط اللونين؟</Typography>
          {left && right && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Swatch hex={left.hex} border={left.border} />
              <MixIcon />
              <Swatch hex={right.hex} border={right.border} />
              <EqualIcon />
              <Box sx={{ width: 64, height: 64, borderRadius: 2, border: "3px dashed #bbb", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontWeight: 700 }}>؟</Box>
            </Box>
          )}
        </Paper>

        {/* Options */}
        {!showFeedback && (
          <Grid container spacing={2} justifyContent="center">
            {options.map((opt) => (
              <Grid item key={opt.id}>
                <Button onClick={() => handleAnswer(opt)} variant="outlined" sx={{ p: 1.5, borderRadius: 3, minWidth: 88, minHeight: 88, border: "2px solid #e0e0e0", "&:hover": { borderColor: difficultyLevels[difficulty].color } }}>
                  <Swatch hex={opt.hex} border={opt.border} />
                </Button>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Feedback */}
        {showFeedback && selected && (
          <Paper elevation={4} sx={{ p: 3, mt: 1, borderRadius: 3, textAlign: "center", backgroundColor: (selected.id === answer?.id) ? "#e8f5e8" : "#ffeaea", border: `2px solid ${(selected.id === answer?.id) ? "#4caf50" : "#f44336"}`, ...((selected.id === answer?.id) ? createPulseAnimation() : createShakeAnimation()) }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: (selected.id === answer?.id) ? "#2e7d32" : "#c62828" }}>
              {(selected.id === answer?.id) ? "✅ صحيح!" : `❌ الإجابة الصحيحة: ${answer?.name}`}
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
