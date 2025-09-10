"use client";
import React, { useEffect, useState, useRef } from "react";
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
  Zoom
} from "@mui/material";
import WinOverlay from "./WinOverlay";
import Timer from "./Timer";
import { playSfx } from "@/lib/sfx";
import { 
  GameProgressionManager, 
  difficultyLevels, 
  createParticleEffect, 
  createPulseAnimation,
  createShakeAnimation
} from "@/lib/gameEnhancements";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateForLevel(level) {
  let a, b, maxChoices = 4;
  
  if (level === "beginner") {
    a = randInt(1, 5);
    b = randInt(1, 5);
  } else if (level === "intermediate") {
    a = randInt(2, 9);
    b = randInt(2, 9);
  } else if (level === "advanced") {
    a = randInt(6, 12);
    b = randInt(6, 12);
  } else { // expert
    a = randInt(10, 15);
    b = randInt(10, 15);
    maxChoices = 6;
  }
  
  const answer = a * b;
  let wrongs = [];
  
  while (wrongs.length < maxChoices - 1) {
    const delta = level === "expert" ? randInt(5, 15) : randInt(1, 8);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const wrong = answer + sign * delta;
    if (wrong > 0 && wrong !== answer && !wrongs.includes(wrong)) {
      wrongs.push(wrong);
    }
  }
  
  const choices = [answer, ...wrongs].sort(() => Math.random() - 0.5);
  return { a, b, answer, choices };
}

export default function MultiplicationGame() {
  const [level, setLevel] = useState("easy");
  const [round, setRound] = useState(0);
  const [expr, setExpr] = useState(() => generateForLevel("easy"));
  const [score, setScore] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const totalRounds = 10;

  useEffect(() => {
    setExpr(generateForLevel(level));
    setRound(0);
    setScore(0);
    setShowWin(false);
    setTimerActive(true);
    setTimerKey((k) => k + 1);
    setFinalTime(null);
  }, [level]);

  const nextRound = (correct) => {
    if (correct) {
      setScore((s) => s + 1);
      try {
        playSfx("correct");
      } catch (e) {}
    } else {
      try {
        playSfx("wrong");
      } catch (e) {}
    }
    if (round + 1 >= totalRounds) {
      setShowWin(true);
      setTimerActive(false);
      try {
        playSfx("win");
      } catch (e) {}
      return;
    }
    setRound((r) => r + 1);
    setExpr(generateForLevel(level));
  };

  React.useEffect(() => {
    try {
      require("@/lib/sfx").preloadSfx();
    } catch (e) {}
  }, []);

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
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 350,
          maxWidth: 400,
          border: "2px solid #80deea",
          boxShadow: "0 4px 24px #b2ebf2",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 2, fontWeight: "bold", color: "#00838f" }}
        >
          تحدي الرياضيات : الضرب
        </Typography>
        <Stack direction="row" gap={3} justifyContent="center" sx={{ mb: 3 }}>
          <Button
            variant={level === "easy" ? "contained" : "outlined"}
            color="success"
            onClick={() => {
              playSfx("click");
              setLevel("easy");
            }}
          >
            سهل
          </Button>
          <Button
            variant={level === "medium" ? "contained" : "outlined"}
            color="warning"
            onClick={() => {
              playSfx("click");
              setLevel("medium");
            }}
          >
            متوسط
          </Button>
          <Button
            variant={level === "hard" ? "contained" : "outlined"}
            color="error"
            onClick={() => {
              playSfx("click");
              setLevel("hard");
            }}
          >
            صعب
          </Button>
        </Stack>
        <Box sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ height: 10, background: "#b2ebf2", borderRadius: 5 }}>
            <Box
              sx={{
                width: `${((round + 1) / totalRounds) * 100}%`,
                height: "100%",
                background: "#00838f",
                borderRadius: 5,
                transition: "width 0.3s",
              }}
            />
          </Box>
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 1, color: "#00838f" }}
          >
            الجولة {round + 1} من {totalRounds}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              mb: 1,
              color: "#006064",
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            {expr.a} × {expr.b}
          </Typography>
          <Typography variant="h5" sx={{ mb: 2, color: "#00838f" }}>
            =
          </Typography>
          <Stack direction="row" gap={3} justifyContent="center">
            {expr.choices.map((c) => (
              <Button
                key={c}
                onClick={() => {
                  playSfx("click");
                  nextRound(c === expr.answer);
                }}
                variant="contained"
                color={Math.random() < 0.5 ? "primary" : "secondary"}
                sx={{
                  minWidth: 80,
                  fontSize: 22,
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px #b2ebf2",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  transition: "transform 0.1s",
                  ":active": { transform: "scale(1.1)" },
                }}
              >
                {c}
              </Button>
            ))}
          </Stack>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
            gap: 3,
          }}
        >
          <Typography
            sx={{ fontSize: 18, color: "#006064", fontWeight: "bold" }}
          >
            النتيجة: <span style={{ color: "#43a047" }}>{score}</span> /{" "}
            {totalRounds}
          </Typography>
          <Timer
            active={timerActive}
            resetKey={timerKey}
            onStop={handleTimerStop}
          />
        </Box>
        {finalTime !== null && (
          <Typography
            sx={{ mt: 1, fontSize: 16, color: "#00838f", textAlign: "center" }}
          >
            الوقت المستغرق:{" "}
            {Math.floor(finalTime / 60)
              .toString()
              .padStart(2, "0")}
            :{(finalTime % 60).toString().padStart(2, "0")}
          </Typography>
        )}
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
            setExpr(generateForLevel(level));
            setTimerActive(true);
            setTimerKey((k) => k + 1);
            setFinalTime(null);
          }}
        />
      )}
    </Box>
  );
}
