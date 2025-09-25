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
          <svg
            viewBox="0 0 200 260"
            width="100%"
            height="100%"
            style={{ display: "block" }}
          >
            {/* Soil */}
            <rect x="0" y="200" width="200" height="60" fill="#8d6e63" />
            {/* Root */}
            <g
              data-part="root"
              onClick={() => handleSelect("root")}
              style={{ cursor: "pointer" }}
            >
              {(() => {
                const { isTarget, isCorrect, isWrong } =
                  partVisualState("root");
                return (
                  <g>
                    <path
                      d="M100 200 C95 215 95 225 90 235 M100 200 C103 213 107 225 110 235"
                      stroke={
                        isCorrect ? "#2e7d32" : isWrong ? "#c62828" : "#5d4037"
                      }
                      strokeWidth={isTarget ? 4 : 3}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle
                      cx="100"
                      cy="198"
                      r={isTarget ? 11 : 9}
                      fill={
                        isCorrect ? "#4caf50" : isWrong ? "#ef5350" : "#6d4c41"
                      }
                      stroke={isTarget ? difficultyColor : "transparent"}
                      strokeWidth={isTarget ? 2 : 0}
                    />
                  </g>
                );
              })()}
            </g>
            {/* Stem */}
            <g
              data-part="stem"
              onClick={() => handleSelect("stem")}
              style={{ cursor: "pointer" }}
            >
              {(() => {
                const { isTarget, isCorrect, isWrong } =
                  partVisualState("stem");
                return (
                  <rect
                    x="95"
                    y="110"
                    width="10"
                    height="90"
                    rx="4"
                    fill={
                      isCorrect ? "#66bb6a" : isWrong ? "#ef5350" : "#4caf50"
                    }
                    stroke={isTarget ? difficultyColor : "transparent"}
                    strokeWidth={isTarget ? 3 : 0}
                  />
                );
              })()}
            </g>
            {/* Leaf */}
            <g
              data-part="leaf"
              onClick={() => handleSelect("leaf")}
              style={{ cursor: "pointer" }}
            >
              {(() => {
                const { isTarget, isCorrect, isWrong } =
                  partVisualState("leaf");
                return (
                  <path
                    d="M110 140 C145 120 165 155 140 175 C120 190 95 170 110 140 Z"
                    fill={
                      isCorrect ? "#43a047" : isWrong ? "#ef5350" : "#388e3c"
                    }
                    stroke={isTarget ? difficultyColor : "transparent"}
                    strokeWidth={isTarget ? 3 : 0}
                  />
                );
              })()}
            </g>
            {/* Flower */}
            <g
              data-part="flower"
              onClick={() => handleSelect("flower")}
              style={{ cursor: "pointer" }}
            >
              {(() => {
                const { isTarget, isCorrect, isWrong } =
                  partVisualState("flower");
                return (
                  <g>
                    <circle
                      cx="100"
                      cy="80"
                      r="28"
                      fill={
                        isCorrect ? "#ec407a" : isWrong ? "#ef5350" : "#f06292"
                      }
                      stroke={isTarget ? difficultyColor : "transparent"}
                      strokeWidth={isTarget ? 4 : 0}
                    />
                    <circle cx="100" cy="80" r="10" fill="#ffeb3b" />
                  </g>
                );
              })()}
            </g>
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
