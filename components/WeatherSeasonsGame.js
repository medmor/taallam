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

const seasons = [
  { id: "spring", label: "الربيع", emoji: "🌸", color: "#66bb6a" },
  { id: "summer", label: "الصيف", emoji: "☀️", color: "#ffb300" },
  { id: "autumn", label: "الخريف", emoji: "🍂", color: "#ef6c00" },
  { id: "winter", label: "الشتاء", emoji: "❄️", color: "#29b6f6" },
];

const weather = [
  { id: "sunny", label: "مشمس", emoji: "☀️", color: "#fdd835" },
  { id: "cloudy", label: "غائم", emoji: "☁️", color: "#90a4ae" },
  { id: "rainy", label: "ممطر", emoji: "🌧️", color: "#42a5f5" },
  { id: "stormy", label: "عاصف", emoji: "🌪️", color: "#7e57c2" },
  { id: "snowy", label: "مثلج", emoji: "🌨️", color: "#80deea" },
  { id: "foggy", label: "ضبابي", emoji: "🌫️", color: "#b0bec5" },
];

const clothing = [
  { id: "coat", label: "معطف", emoji: "🧥", bestFor: ["winter"] },
  { id: "hat", label: "قبعة شمس", emoji: "👒", bestFor: ["summer"] },
  { id: "scarf", label: "وشاح", emoji: "🧣", bestFor: ["winter", "autumn"] },
  { id: "boots", label: "حذاء مطري", emoji: "👢", bestFor: ["autumn", "winter"] },
  { id: "tshirt", label: "قميص قطن", emoji: "👕", bestFor: ["summer", "spring"] },
  { id: "umbrella", label: "مظلة", emoji: "☂️", bestFor: ["autumn", "winter", "spring"] },
];

const difficultyPresets = {
  beginner: { name: "مبتدئ", rounds: 6, time: 90 },
  intermediate: { name: "متوسط", rounds: 8, time: 120 },
  advanced: { name: "متقدم", rounds: 10, time: 150 },
};

const modes = {
  seasons: { name: "الفصول", emoji: "🌱" },
  weather: { name: "الطقس", emoji: "🌦️" },
  clothing: { name: "الملابس المناسبة", emoji: "🧥" },
  mixed: { name: "مختلط", emoji: "🎲" },
};

function randFrom(arr, n) {
  const copy = [...arr];
  copy.sort(() => Math.random() - 0.5);
  return n ? copy.slice(0, n) : copy[0];
}

export default function WeatherSeasonsGame() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [difficulty, setDifficulty] = useState("beginner");
  const [mode, setMode] = useState("seasons");
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  // no final overlay per requirements

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
    // navigate back instead of showing overlay
    setTimeout(goBack, 600);
  };

  const handleTimeUp = () => {
    endGame();
  };

  function makeQuestion() {
    // Select actual mode
    const actualMode = mode === "mixed" ? randFrom(Object.keys(modes).filter(m => m !== "mixed")) : mode;

    let q = { text: "", type: actualMode, correct: null, hint: "" };

    if (actualMode === "seasons") {
      const correct = randFrom(seasons);
      q.text = `${correct.emoji} أي فصل تشير إليه هذه الصورة؟`;
      q.correct = correct.label;
      q.hint = `فصل ${correct.label} يتميز بـ ${correct.id === "spring" ? "تفتح الأزهار" : correct.id === "summer" ? "الحرارة والشمس" : correct.id === "autumn" ? "تساقط الأوراق" : "البرودة والثلج"}.`;
      const wrong = randFrom(seasons.filter(s => s.id !== correct.id), 3).map(s => s.label);
      setOptions(randFrom([[q.correct, ...wrong]], 1)[0].sort(() => Math.random() - 0.5));
      setQuestion(q);
    } else if (actualMode === "weather") {
      const correct = randFrom(weather);
      q.text = `${correct.emoji} ما نوع الطقس؟`;
      q.correct = correct.label;
      q.hint = `فكر في السماء: شمس، غيوم، مطر، ثلج…`;
      const wrong = randFrom(weather.filter(w => w.id !== correct.id), 3).map(w => w.label);
      setOptions([q.correct, ...wrong].sort(() => Math.random() - 0.5));
      setQuestion(q);
    } else if (actualMode === "clothing") {
      const season = randFrom(seasons);
      q.text = `${season.emoji} ما الملابس المناسبة لهذا الفصل؟`;
      const best = clothing.filter(c => c.bestFor.includes(season.id));
      const correct = randFrom(best);
      q.correct = `${correct.emoji} ${correct.label}`;
      q.hint = season.id === "winter" ? "اختر ما يمنحك الدفء" : season.id === "summer" ? "اختر ما يناسب الحر" : "اختر ما يناسب الرياح والمطر";
      const wrong = randFrom(
        clothing.filter(c => !c.bestFor.includes(season.id)),
        3
      ).map(c => `${c.emoji} ${c.label}`);
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
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
    } else {
      playSfx("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      if (round >= totalRounds) endGame();
      else {
        setRound(r => r + 1);
        makeQuestion();
      }
    }, 1200);
  }

  function start() {
    setScore(0);
    setStreak(0);
    setRound(1);
    setStarted(true);
  }
  // Build central illustration for current question
  const Illustration = () => {
    if (!question) return null;
    let mainEmoji = "";
    if (question.type === "seasons") {
      // extract emoji from text
      mainEmoji = question.text?.split(" ")[0] || "🌤️";
    } else if (question.type === "weather") {
      mainEmoji = question.text?.split(" ")[0] || "🌤️";
    } else if (question.type === "clothing") {
      mainEmoji = question.text?.split(" ")[0] || "🧥";
    }
    return (
      <Paper sx={{
        p: 2,
        height: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3fbf3",
        border: "2px solid #a5d6a7",
        borderRadius: 5,
      }}>
        <Typography sx={{ fontSize: "6rem" }}>{mainEmoji}</Typography>
      </Paper>
    );
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 1.5, md: 2 } }}>
      <Paper elevation={0} sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 6,
        backgroundColor: "#ffffff",
        border: "3px solid #81c784",
      }}>
        {/* Header row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Button variant="outlined" onClick={goBack} sx={{ borderRadius: 999, px: 2 }}>
            رجوع ←
          </Button>
          <Typography variant="h4" sx={{ color: "#2e7d32", fontWeight: "bold" }}>
            الطقس والفصول
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
                ابدأ التحدي
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Question text */}
            <Box sx={{ textAlign: "center", mb: 1 }}>
              <Typography variant="h6" sx={{ color: "#1b5e20" }}>
                {question?.type === "seasons" ? "تعرّف على الفصل" : question?.type === "weather" ? "ما نوع الطقس؟" : "اختر اللباس المناسب"}
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
                        fontSize: "1.1rem",
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
