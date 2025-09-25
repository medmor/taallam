"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Fade,
} from "@mui/material";
import { plantParts } from "@/lib/scienceData";
import {
  difficultyLevels,
  createParticleEffect,
  createPulseAnimation,
  createShakeAnimation,
} from "@/lib/gameEnhancements";
import Timer from "./Timer";
import { playSfx } from "@/lib/sfx";

/* Game: Identify plant parts by clicking them on an illustrative SVG plant.
  - Target shown as text ("انقر على: جذر").
  - Click the highlighted (dashed) part.
  - SVG groups (<g>) have data-part attributes (root, stem, leaf, flower).
  - Visual feedback: correct = green glow/pulse; wrong = red shake.
  - Rounds scale with difficulty; parts can repeat (reinforcement).
*/

const LEVELS = { beginner: 6, intermediate: 8, advanced: 10 };

// Map scienceData ids to svg part ids (currently identical)
const PART_ID_MAP = {
  root: "root",
  stem: "stem",
  leaf: "leaf",
  flower: "flower",
};

export default function PlantsPartsGame({
  level = "beginner",
  onComplete,
  onBack,
}) {
  const totalRounds = LEVELS[level] || LEVELS.beginner;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [targetPart, setTargetPart] = useState(null);
  const [feedback, setFeedback] = useState(null); // {type:'correct'|'wrong', id}
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const finishedRef = useRef(false);
  const canvasRef = useRef(null);

  const difficultyColor = difficultyLevels[level].color;

  const pickNewTarget = () => {
    const p = plantParts[Math.floor(Math.random() * plantParts.length)];
    setTargetPart(p);
  };

  useEffect(() => {
    pickNewTarget();
  }, [level]);

  const handleSelect = (partId) => {
    if (!targetPart || feedback) return;
    const mapped = PART_ID_MAP[targetPart.id];
    const correct = partId === mapped;
    const newScore = correct ? score + 1 : score;
    if (correct) {
      setScore(newScore);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", id: partId });
      playSfx("correct");
      createParticleEffect(canvasRef.current, "success");
    } else {
      setStreak(0);
      setFeedback({ type: "wrong", id: partId });
      playSfx("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= totalRounds) {
        if (!finishedRef.current) {
          finishedRef.current = true;
          setTimerActive(false);
          playSfx("win");
          if (onComplete) onComplete(newScore, 0);
          if (onBack) onBack();
        }
        return;
      }
      setRound((r) => r + 1);
      pickNewTarget();
    }, 900);
  };

  // Utility to compute visual state classes
  const partVisualState = (id) => {
    const isTarget = targetPart && PART_ID_MAP[targetPart.id] === id;
    const isCorrect =
      feedback && feedback.type === "correct" && feedback.id === id;
    const isWrong = feedback && feedback.type === "wrong" && feedback.id === id;
    return { isTarget, isCorrect, isWrong };
  };

  if (!targetPart) {
    return (
      <Typography sx={{ mt: 4, textAlign: "center" }}>
        جاري التحميل...
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 4,
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 380,
          maxWidth: 840,
          border: `3px solid ${difficultyColor}`,
          background: "linear-gradient(145deg,#ffffff,#f8f9fa)",
          position: "relative",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Button variant="outlined" size="small" onClick={onBack}>
            ← رجوع
          </Button>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: difficultyColor }}
          >
            النباتات وأجزاؤها
          </Typography>
          <Chip
            label={difficultyLevels[level].name}
            sx={{ bgcolor: difficultyColor, color: "#fff", fontWeight: "bold" }}
          />
        </Box>
        {/* Stats */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip label={`الجولة: ${round + 1}/${totalRounds}`} />
          <Chip label={`النقاط: ${score}`} color="success" />
          {streak > 1 && (
            <Chip
              label={`متتالية: ${streak}`}
              sx={{
                bgcolor: "#ff6b35",
                color: "#fff",
                ...createPulseAnimation(),
              }}
            />
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={(round / totalRounds) * 100}
          sx={{ height: 8, borderRadius: 4, mb: 3 }}
        />
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography variant="h6">انقر على الجزء المطلوب:</Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: difficultyColor }}
          >
            {targetPart.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({targetPart.function})
          </Typography>
        </Box>
        {/* Diagram area (responsive SVG) */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            mx: "auto",
            aspectRatio: "3/4",
            background: "linear-gradient(#f3faf3,#e4f3e4)",
            border: "2px solid #c8e6c9",
            borderRadius: 3,
            boxShadow: "inset 0 0 12px #00000010",
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          <svg viewBox="0 0 200 260" width="100%" height="100%" style={{ display:'block' }}>
            <defs>
              <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8d6e63" />
                <stop offset="100%" stopColor="#6d4c41" />
              </linearGradient>
              <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#66bb6a" />
                <stop offset="100%" stopColor="#2e7d32" />
              </linearGradient>
              <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#43a047" />
                <stop offset="100%" stopColor="#1b5e20" />
              </linearGradient>
              <radialGradient id="flowerPetalGrad" cx="50%" cy="40%" r="70%">
                <stop offset="0%" stopColor="#ff8abf" />
                <stop offset="100%" stopColor="#ec407a" />
              </radialGradient>
              <radialGradient id="flowerCenterGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff59d" />
                <stop offset="100%" stopColor="#fbc02d" />
              </radialGradient>
              <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <style>{`.part:hover { filter: brightness(1.1); cursor:pointer; }`}</style>
            </defs>
            {/* Soil */}
            <rect x="0" y="200" width="200" height="60" fill="url(#soilGrad)" />
            {/* Root */}
            {(() => { const {isCorrect,isWrong}=partVisualState('root'); return (
              <g data-part="root" onClick={()=>handleSelect('root')} className="part" filter={isCorrect? 'url(#glow)' : undefined}>
                {/* Main tap root (no target hint) */}
                <path d="M100 200 C100 212 99 225 100 238" stroke={isCorrect?'#4caf50': isWrong? '#c62828':'#5d4037'} strokeWidth={4} strokeLinecap="round" fill="none" />
                {/* Left lateral branches */}
                <path d="M100 212 C96 214 94 218 92 223" stroke={isCorrect?'#4caf50': isWrong? '#c62828':'#5d4037'} strokeWidth={3} strokeLinecap="round" fill="none" />
                <path d="M99 223 C95 226 93 231 91 235" stroke={isCorrect?'#4caf50': isWrong? '#c62828':'#5d4037'} strokeWidth={2.5} strokeLinecap="round" fill="none" />
                {/* Right lateral branches */}
                <path d="M100 215 C104 218 106 222 108 226" stroke={isCorrect?'#4caf50': isWrong? '#c62828':'#5d4037'} strokeWidth={3} strokeLinecap="round" fill="none" />
                <path d="M101 226 C105 229 107 233 109 236" stroke={isCorrect?'#4caf50': isWrong? '#c62828':'#5d4037'} strokeWidth={2.5} strokeLinecap="round" fill="none" />
              </g> ) })()}
            {/* Stem */}
            {(() => { const {isCorrect,isWrong}=partVisualState('stem'); return (
              <g data-part="stem" onClick={()=>handleSelect('stem')} className="part" filter={isCorrect? 'url(#glow)' : undefined}>
                <rect x="95" y="100" width="10" height="100" rx="5" fill={isCorrect? '#66bb6a': isWrong? '#ef5350':'url(#stemGrad)'} />
              </g> ) })()}
            {/* Leaf */}
            {(() => { const {isCorrect,isWrong}=partVisualState('leaf'); return (
              <g data-part="leaf" onClick={()=>handleSelect('leaf')} className="part" filter={isCorrect? 'url(#glow)' : undefined}>
                {/* Leaf moved 20px higher, no target hint */}
                <path d="M95 130 C70 118 58 154 83 174 C102 190 118 152 95 130 Z" fill={isCorrect? '#43a047': isWrong? '#ef5350':'url(#leafGrad)'} />
                <path d="M92 134 C86 146 86 158 94 168" stroke={isCorrect? '#e8f5e9':'#c8e6c9'} strokeWidth={2} fill="none" strokeLinecap="round" />
              </g> ) })()}
            {/* Flower */}
            {(() => { const {isCorrect,isWrong}=partVisualState('flower'); return (
              <g data-part="flower" onClick={()=>handleSelect('flower')} className="part" filter={isCorrect? 'url(#glow)' : undefined}>
                {/* Petals */}
                {Array.from({length:6}).map((_,i)=> {
                  const angle = (i/6)*Math.PI*2;
                  const cx = 100 + Math.cos(angle)*18;
                  const cy = 80 + Math.sin(angle)*18;
                  return <circle key={i} cx={cx} cy={cy} r={14} fill={isCorrect? '#ec407a': isWrong? '#ef5350':'url(#flowerPetalGrad)'} opacity={0.95} />
                })}
                {/* Center */}
                <circle cx="100" cy="80" r="15" fill="url(#flowerCenterGrad)" />
              </g> ) })()}
          </svg>
        </Box>
        {/* Feedback overlay (optional message) */}
        {feedback && (
          <Fade in>
            <Typography
              variant="h5"
              sx={{
                mt: 3,
                textAlign: "center",
                fontWeight: "bold",
                color: feedback.type === "correct" ? "#2e7d32" : "#c62828",
              }}
            >
              {feedback.type === "correct" ? "أحسنت!" : "حاول مرة أخرى"}
            </Typography>
          </Fade>
        )}
        {/* Timer */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "#666" }}>
            الوقت:
          </Typography>
          <Timer active={timerActive} resetKey={timerKey} />
        </Box>
      </Paper>
    </Box>
  );
}
