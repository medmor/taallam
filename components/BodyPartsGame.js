"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { bodyParts as bodyPartsData } from "@/lib/scienceData";

const difficultyPresets = {
  beginner: { name: "مبتدئ", rounds: 6, time: 90 },
  intermediate: { name: "متوسط", rounds: 8, time: 120 },
  advanced: { name: "متقدم", rounds: 10, time: 150 },
};

const modes = {
  parts: { name: "أجزاء الجسم", emoji: "🧍" },
  functions: { name: "وظائف الأعضاء", emoji: "🧠" },
  mixed: { name: "مختلط", emoji: "🎲" },
};

const emojiMap = {
  head: "🙂",
  hand: "✋",
  eye: "👁️",
  ear: "👂",
  leg: "🦵",
};

function randFrom(arr, n) {
  const copy = [...arr];
  copy.sort(() => Math.random() - 0.5);
  return n ? copy.slice(0, n) : copy[0];
}

export default function BodyPartsGame({ level = "beginner", onComplete, onBack } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDifficulty = difficultyPresets[level] ? level : "beginner";
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [mode, setMode] = useState("parts");
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const totalRounds = difficultyPresets[difficulty].rounds;
  const totalTime = difficultyPresets[difficulty].time;

  const progress = useMemo(
    () => Math.min(100, (round - 1) * (100 / totalRounds)),
    [round, totalRounds]
  );

  useEffect(() => {
    if (started) makeQuestion();
  }, [started, mode, difficulty]);

  const goBack = () => {
    if (typeof onBack === "function") {
      try { onBack(); } catch {}
      return;
    }
    const qpBack = searchParams?.get("back") || searchParams?.get("from") || searchParams?.get("path");
    const normalized = typeof qpBack === "string" && qpBack.startsWith("/") ? qpBack : null;
    try {
      if (normalized) router.push(normalized);
      else if (typeof window !== "undefined" && window.history.length > 1) router.back();
      else router.push("/");
    } catch (e) {
      router.push(normalized || "/");
    }
  };

  const endGame = () => {
    setStarted(false);
    playSfx("win");
    try {
      if (typeof onComplete === "function") {
        const accuracy = Math.round(((correctCount || 0) / (totalRounds || 1)) * 100);
        onComplete(score, accuracy);
      }
    } catch {}
    setTimeout(goBack, 600);
  };

  const handleTimeUp = () => endGame();

  function makeQuestion() {
    const actualMode = mode === "mixed" ? randFrom(["parts", "functions"]) : mode;

    let q = { text: "", type: actualMode, correct: null, hint: "" };

    if (actualMode === "parts") {
      const correct = randFrom(bodyPartsData);
      const emoji = emojiMap[correct.id] || "🧍";
      q.text = `${emoji} ما اسم هذا الجزء؟`;
      q.correct = correct.name;
      q.hint = `فكر في مكانه ووظيفته في الجسم`;
      const wrong = randFrom(bodyPartsData.filter(b => b.id !== correct.id), 3).map(b => b.name);
      setOptions([q.correct, ...wrong].sort(() => Math.random() - 0.5));
      setQuestion(q);
    } else if (actualMode === "functions") {
      const correct = randFrom(bodyPartsData);
      q.text = `ما وظيفة «${correct.name}»؟`;
      q.correct = correct.function;
      q.hint = `وظيفة ${correct.name} الأساسية`;
      const wrong = randFrom(bodyPartsData.filter(b => b.id !== correct.id), 3).map(b => b.function);
      setOptions([q.correct, ...wrong].sort(() => Math.random() - 0.5));
      setQuestion(q);
    }

    setSelected(null);
    setShowResult(false);
  }

  function handleAnswer(opt) {
    if (showResult) return;
    setSelected(opt);
    const correct = opt === question.correct;
    setShowResult(true);

    if (correct) {
      playSfx("correct");
      setScore((s) => s + 10 + streak * 2);
      setStreak((s) => s + 1);
      setCorrectCount((c) => c + 1);
    } else {
      playSfx("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      if (round >= totalRounds) endGame();
      else {
        setRound((r) => r + 1);
        makeQuestion();
      }
    }, 1000);
  }

  function start() {
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setRound(1);
    setStarted(true);
  }

  const Illustration = () => {
    if (!question) return null;
    let mainEmoji = "🧍";
    if (question.type === "parts") {
      mainEmoji = (question.text || "").split(" ")[0] || "🧍";
    } else if (question.type === "functions") {
      // show generic body emoji
      mainEmoji = "🧍";
    }
    return (
      <Paper
        sx={{
          p: 2,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3fbf3",
          border: "2px solid #a5d6a7",
          borderRadius: 5,
        }}
      >
        <Typography sx={{ fontSize: "6rem" }}>{mainEmoji}</Typography>
      </Paper>
    );
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 1.5, md: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 6,
          backgroundColor: "#ffffff",
          border: "3px solid #81c784",
        }}
      >
        {/* Header row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Button variant="outlined" onClick={goBack} sx={{ borderRadius: 999, px: 2 }}>
            رجوع ←
          </Button>
          <Typography variant="h4" sx={{ color: "#2e7d32", fontWeight: "bold" }}>
            أعضاء الجسم
          </Typography>
          <Chip label={difficultyPresets[difficulty].name} color="success" />
        </Box>

        {/* Progress row */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip label={`الجولة ${round}/${totalRounds}`} variant="outlined" />
          <Chip label={`النقاط ${score}`} color="success" variant="outlined" />
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5, mb: 2, backgroundColor: "#e8f5e9" }} />

        {!started ? (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: "#2e7d32" }}>إعدادات الدرس</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>المستوى</InputLabel>
                  <Select value={difficulty} label="المستوى" onChange={(e) => setDifficulty(e.target.value)}>
                    {Object.entries(difficultyPresets).map(([k, v]) => (
                      <MenuItem key={k} value={k}>{v.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>الوضع</InputLabel>
                  <Select value={mode} label="الوضع" onChange={(e) => setMode(e.target.value)}>
                    {Object.entries(modes).map(([k, v]) => (
                      <MenuItem key={k} value={k}>{v.emoji} {v.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ textAlign: "center" }}>
              <Button variant="contained" color="success" size="large" onClick={start} sx={{ borderRadius: 999, px: 4, py: 1.2 }}>
                ابدأ الدرس
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Question text */}
            <Box sx={{ textAlign: "center", mb: 1 }}>
              <Typography variant="h6" sx={{ color: "#1b5e20" }}>
                {question?.type === "parts" ? "اسم الجزء" : "ما وظيفته؟"}
              </Typography>
              <Typography dir="rtl" sx={{ fontSize: "1.6rem", color: "#2e7d32", fontWeight: "bold" }}>
                {question?.text || "..."}
              </Typography>
              {question?.hint && (
                <Typography variant="body2" sx={{ color: "#607d8b" }}>( {question.hint} )</Typography>
              )}
            </Box>

            {/* Illustration card */}
            <Illustration />

            {/* Options */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {options.map((opt, idx) => {
                const isCorrect = showResult && opt === question?.correct;
                const isWrong = showResult && selected === opt && !isCorrect;
                return (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Button
                      fullWidth
                      variant={selected === opt ? "contained" : "outlined"}
                      onClick={() => handleAnswer(opt)}
                      sx={{
                        height: 56,
                        fontSize: "1.05rem",
                        fontWeight: "bold",
                        borderRadius: 999,
                        backgroundColor: isCorrect ? "#4caf50" : isWrong ? "#f44336" : undefined,
                        color: isCorrect ? "white" : undefined,
                      }}
                      disabled={showResult}
                    >
                      {opt}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {/* Timer row */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" sx={{ color: "#455a64", mb: 0.5 }}>الوقت:</Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Timer timeLeft={totalTime} onTimeUp={handleTimeUp} color="warning" />
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}