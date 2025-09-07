import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const MathRace = () => {
  const canvasRef = useRef(null);
  const [question, setQuestion] = useState(null);
  const [mathSubject, setMathSubject] = useState("addition"); // addition, subtraction, multiplication, division, mixed
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [raceProgress, setRaceProgress] = useState(0);
  const [aiProgress1, setAiProgress1] = useState(0);
  const [aiProgress2, setAiProgress2] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for kids
  const [isRacing, setIsRacing] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [aiSpeeds, setAiSpeeds] = useState({ ai1: 0, ai2: 0 });
  const [raceResult, setRaceResult] = useState(null);

  const raceColors = {
    track: "#2E5BBA", // Blue road color
    car: "#ff6b35",
    finish: "#4caf50",
    background: "#f0f8ff",
    progress: "#2196f3",
  };

  // Math subjects configuration
  const mathSubjects = {
    addition: {
      name: "الجمع",
      emoji: "➕",
      color: "#4CAF50",
      symbol: "+",
    },
    subtraction: {
      name: "الطرح", 
      emoji: "➖",
      color: "#FF9800",
      symbol: "-",
    },
    multiplication: {
      name: "الضرب",
      emoji: "✖️",
      color: "#E91E63",
      symbol: "×",
    },
    division: {
      name: "القسمة",
      emoji: "➗",
      color: "#9C27B0",
      symbol: "÷",
    },
    mixed: {
      name: "مختلط",
      emoji: "🎲",
      color: "#607D8B",
      symbol: "?",
    },
  };

  const generateQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);

    let operation = mathSubject;
    if (mathSubject === "mixed") {
      const operations = ["addition", "subtraction", "multiplication", "division"];
      operation = operations[Math.floor(Math.random() * operations.length)];
    }

    let num1, num2, answer, questionText, symbol;

    switch (operation) {
      case "addition":
        if (level <= 2) {
          num1 = Math.floor(Math.random() * 10) + 1; // 1-10
          num2 = Math.floor(Math.random() * 10) + 1; // 1-10
        } else if (level <= 4) {
          num1 = Math.floor(Math.random() * 25) + 1; // 1-25
          num2 = Math.floor(Math.random() * 25) + 1; // 1-25
        } else {
          num1 = Math.floor(Math.random() * 50) + 1; // 1-50
          num2 = Math.floor(Math.random() * 50) + 1; // 1-50
        }
        answer = num1 + num2;
        symbol = "+";
        break;

      case "subtraction":
        if (level <= 2) {
          num1 = Math.floor(Math.random() * 15) + 5; // 5-19
          num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1
        } else if (level <= 4) {
          num1 = Math.floor(Math.random() * 30) + 10; // 10-39
          num2 = Math.floor(Math.random() * num1) + 1;
        } else {
          num1 = Math.floor(Math.random() * 60) + 20; // 20-79
          num2 = Math.floor(Math.random() * num1) + 1;
        }
        answer = num1 - num2;
        symbol = "-";
        break;

      case "multiplication":
        if (level <= 2) {
          num1 = Math.floor(Math.random() * 5) + 1; // 1-5
          num2 = Math.floor(Math.random() * 5) + 1; // 1-5
        } else if (level <= 4) {
          num1 = Math.floor(Math.random() * 8) + 1; // 1-8
          num2 = Math.floor(Math.random() * 8) + 1; // 1-8
        } else {
          num1 = Math.floor(Math.random() * 12) + 1; // 1-12
          num2 = Math.floor(Math.random() * 12) + 1; // 1-12
        }
        answer = num1 * num2;
        symbol = "×";
        break;

      case "division":
        // Generate division by creating multiplication first
        if (level <= 2) {
          answer = Math.floor(Math.random() * 8) + 1; // 1-8
          num2 = Math.floor(Math.random() * 5) + 1; // 1-5
        } else if (level <= 4) {
          answer = Math.floor(Math.random() * 10) + 1; // 1-10
          num2 = Math.floor(Math.random() * 8) + 1; // 1-8
        } else {
          answer = Math.floor(Math.random() * 12) + 1; // 1-12
          num2 = Math.floor(Math.random() * 10) + 1; // 1-10
        }
        num1 = answer * num2;
        symbol = "÷";
        break;
    }

    questionText = `${num1} ${symbol} ${num2} = ؟`;

    // Generate wrong options
    const wrongOptions = new Set();
    
    // Add some close wrong answers
    wrongOptions.add(answer + 1);
    wrongOptions.add(answer - 1);
    wrongOptions.add(answer + 2);
    wrongOptions.add(answer - 2);
    
    // Add some random wrong answers
    const range = Math.max(answer, 10);
    while (wrongOptions.size < 6) {
      const wrongAnswer = Math.floor(Math.random() * range * 2) + 1;
      if (wrongAnswer !== answer && wrongAnswer > 0) {
        wrongOptions.add(wrongAnswer);
      }
    }

    // Remove the correct answer if it got added
    wrongOptions.delete(answer);
    
    // Take 3 wrong options
    const finalWrongOptions = Array.from(wrongOptions).slice(0, 3);
    
    // Combine and shuffle
    const allOptions = [answer, ...finalWrongOptions].sort(() => Math.random() - 0.5);

    setOptions(allOptions);
    setQuestion({
      text: questionText,
      num1,
      num2,
      operation,
      symbol,
      correctAnswer: answer,
    });
  };

  const drawRaceTrack = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw track background
    ctx.fillStyle = raceColors.background;
    ctx.fillRect(0, 0, width, height);

    // Draw track with 3 lanes
    ctx.fillStyle = raceColors.track;
    ctx.fillRect(0, height * 0.25, width, height * 0.5);

    // Draw track borders
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.setLineDash([]);

    // Top and bottom borders
    ctx.beginPath();
    ctx.moveTo(0, height * 0.25);
    ctx.lineTo(width, height * 0.25);
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width, height * 0.75);
    ctx.stroke();

    // Draw lane dividers (dashed lines)
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);

    ctx.beginPath();
    ctx.moveTo(0, height * 0.42);
    ctx.lineTo(width, height * 0.42);
    ctx.moveTo(0, height * 0.58);
    ctx.lineTo(width, height * 0.58);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw finish line
    const finishX = width * 0.9;
    ctx.strokeStyle = raceColors.finish;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(finishX, height * 0.25);
    ctx.lineTo(finishX, height * 0.75);
    ctx.stroke();

    // Draw vehicles
    const drawVehicle = (progress, laneY, color, label, isPlayer = false) => {
      const vehicleX = (progress / 100) * (finishX - 30) + 20;

      // Vehicle body
      ctx.fillStyle = color;
      ctx.fillRect(vehicleX - 18, laneY - 7.5, 36, 15);

      // Vehicle wheels
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(vehicleX - 10, laneY + 6, 5, 0, Math.PI);
      ctx.arc(vehicleX + 10, laneY + 6, 5, 0, Math.PI);
      ctx.arc(vehicleX - 10, laneY - 6, 5, Math.PI, 2 * Math.PI);
      ctx.arc(vehicleX + 10, laneY - 6, 5, Math.PI, 2 * Math.PI);
      ctx.fill();

      // Speed lines if moving
      if (progress > 0) {
        ctx.strokeStyle = isPlayer ? "#ffeb3b" : "#fff";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(vehicleX - 25 - i * 6, laneY - 4 + i * 4);
          ctx.lineTo(vehicleX - 30 - i * 6, laneY - 4 + i * 4);
          ctx.stroke();
        }
      }

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(label, vehicleX, laneY + 4);
    };

    // Draw vehicles in lanes
    const opponents = getRandomArabicNames();
    drawVehicle(aiProgress1, height * 0.33, "#4caf50", opponents[0]);
    drawVehicle(raceProgress, height * 0.5, raceColors.car, "أنت", true);
    drawVehicle(aiProgress2, height * 0.67, "#9c27b0", opponents[1]);

    // Draw checkered finish flags
    ctx.fillStyle = "#000";
    for (let i = 0; i < 6; i++) {
      const flagY = height * 0.27 + i * 12;
      ctx.fillRect(finishX + 5, flagY, 12, 10);
      ctx.fillStyle = i % 2 === 0 ? "#000" : "#fff";
      ctx.fillRect(finishX + 5, flagY, 6, 5);
      ctx.fillRect(finishX + 11, flagY + 5, 6, 5);
      ctx.fillStyle = "#000";
    }
  };

  const handleAnswer = (answer) => {
    if (showResult) return;

    playSfx("click");
    setSelectedAnswer(answer);

    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSfx("correct");
      const points = level + (streak >= 3 ? 3 : 2);
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setRaceProgress((prev) => {
        const boost = 10 + streak * 2; // More progress for streaks
        const newProgress = Math.min(prev + boost, 100);

        // Check if player wins
        if (newProgress >= 100 && !raceResult) {
          setIsRacing(false);
          setRaceResult({ winner: "أنت", playerPosition: 1 });
        }

        return newProgress;
      });
    } else {
      playSfx("wrong");
      setStreak(0);
      setRaceProgress((prev) => Math.max(prev - 3, 0)); // Small penalty
    }

    setQuestionsAnswered((prev) => prev + 1);

    setTimeout(() => {
      if (timeLeft > 0 && raceProgress < 100 && !raceResult) {
        generateQuestion();
      }
    }, 1500);
  };

  const startRace = () => {
    setIsRacing(true);
    setTimeLeft(120); // 2 minutes for kids
    setRaceProgress(0);
    setAiProgress1(0);
    setAiProgress2(0);
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setRaceResult(null);

    // Set AI speeds - make them beatable for kids
    const ai1FinishTime = 30 + Math.random() * 30; // 1-1.5 minutes
    const ai2FinishTime = 60 + Math.random() * 40; // 1.3-2 minutes

    setAiSpeeds({
      ai1: 100 / ai1FinishTime,
      ai2: 100 / ai2FinishTime,
    });

    generateQuestion();
  };

  const resetRace = () => {
    setIsRacing(false);
    setTimeLeft(120);
    setRaceProgress(0);
    setAiProgress1(0);
    setAiProgress2(0);
    setScore(0);
    setLevel(1);
    setQuestionsAnswered(0);
    setStreak(0);
    setShowResult(false);
    setQuestion(null);
    setRaceResult(null);
    setAiSpeeds({ ai1: 0, ai2: 0 });
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - أرقام صغيرة",
      2: "مبتدئ متقدم - أرقام متوسطة", 
      3: "متوسط - أرقام أكبر",
      4: "متوسط متقدم - تحدي أكبر",
      5: "متقدم - أرقام كبيرة",
    };
    return descriptions[level] || `متقدم - المستوى ${level}`;
  };

  // Timer effect with AI movement
  useEffect(() => {
    let timer;
    if (isRacing && timeLeft > 0 && !raceResult) {
      timer = setInterval(() => {
        // Move AI vehicles
        setAiProgress1((prev) => {
          const newProgress = prev + aiSpeeds.ai1;
          if (newProgress >= 100 && !raceResult) {
            setRaceResult({ winner: "الخصم 1", playerPosition: 2 });
            setIsRacing(false);
          }
          return Math.min(newProgress, 100);
        });

        setAiProgress2((prev) => {
          const newProgress = prev + aiSpeeds.ai2;
          if (newProgress >= 100 && !raceResult && aiProgress1 < 100) {
            setRaceResult({
              winner: "الخصم 2",
              playerPosition: aiProgress1 >= 100 ? 3 : 2,
            });
            setIsRacing(false);
          }
          return Math.min(newProgress, 100);
        });

        // Update timer
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (!raceResult) {
              // Determine final positions
              const scores = [
                { name: "أنت", progress: raceProgress },
                { name: "الخصم 1", progress: aiProgress1 },
                { name: "الخصم 2", progress: aiProgress2 },
              ].sort((a, b) => b.progress - a.progress);

              const playerPosition =
                scores.findIndex((s) => s.name === "أنت") + 1;
              setRaceResult({ winner: scores[0].name, playerPosition });
            }
            setIsRacing(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [
    isRacing,
    timeLeft,
    aiSpeeds,
    raceResult,
    raceProgress,
    aiProgress1,
    aiProgress2,
  ]);

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 25 === 0 && level < 6) {
      setLevel((prev) => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 400;
      canvas.height = 150;
      drawRaceTrack();
    }
  }, [raceProgress, aiProgress1, aiProgress2]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: 3,
        textAlign: "center",
        backgroundColor: "white",
        borderRadius: "20px",
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#2196f3", fontWeight: "bold" }}
      >
        🏎️ سباق الرياضيات
      </Typography>

      {/* Math Subject Selector */}
      {!isRacing && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
            اختر موضوع الرياضيات:
          </Typography>
          
          <FormControl sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel>الموضوع</InputLabel>
            <Select
              value={mathSubject}
              label="الموضوع"
              onChange={(e) => setMathSubject(e.target.value)}
              sx={{ textAlign: "right" }}
            >
              {Object.entries(mathSubjects).map(([key, subject]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{subject.emoji}</span>
                    <span>{subject.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{mathSubjects[mathSubject].emoji} {mathSubjects[mathSubject].name}:</strong>
              {mathSubject === "mixed" 
                ? " تحدي شامل بكل العمليات الحسابية!"
                : ` أجب بسرعة ودقة لتفوز في السباق!`
              }
            </Typography>
          </Alert>
        </Paper>
      )}

      {/* Game Stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Chip 
          label={`${mathSubjects[mathSubject].emoji} ${mathSubjects[mathSubject].name}`} 
          sx={{ 
            backgroundColor: mathSubjects[mathSubject].color, 
            color: "white",
            fontSize: "1rem"
          }} 
          size="large" 
        />
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip
          label={`الوقت: ${formatTime(timeLeft)}`}
          color="info"
          size="large"
        />
        <Chip label={`المتتالية: ${streak}🔥`} color="success" size="large" />
      </Box>

      {/* Level Description */}
      <Typography variant="body1" sx={{ mb: 2, color: "#666" }}>
        {getLevelDescription()}
      </Typography>

      {/* Race Track */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "auto",
            border: "2px solid #ddd",
            borderRadius: "10px",
          }}
        />

        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            تقدم السباق: {raceProgress.toFixed(0)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={raceProgress}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: raceColors.progress,
              },
            }}
          />
        </Box>
      </Paper>

      {!isRacing && !question && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            أجب على مسائل {mathSubjects[mathSubject].name} للفوز في السباق!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={startRace}
            sx={{ 
              fontSize: "1.2rem", 
              py: 1.5, 
              px: 4,
              backgroundColor: mathSubjects[mathSubject].color,
              "&:hover": {
                backgroundColor: mathSubjects[mathSubject].color,
                filter: "brightness(0.9)",
              },
            }}
          >
            🏁 ابدأ السباق
          </Button>
        </Box>
      )}

      {(timeLeft === 0 || raceResult) && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor:
              raceResult?.winner === "أنت" ? "#e8f5e8" : "#fff3e0",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: raceResult?.winner === "أنت" ? "#2e7d32" : "#f57c00",
              mb: 2,
              fontWeight: "bold",
            }}
          >
            {raceResult?.winner === "أنت"
              ? "🏆 تهانينا! لقد فزت في السباق!"
              : raceResult
              ? `🏁 انتهى السباق - الفائز: ${raceResult.winner}`
              : "⏰ انتهى الوقت!"}
          </Typography>

          {raceResult && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                نتائج السباق:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={`أنت: ${raceProgress.toFixed(0)}%`}
                  color={raceResult.winner === "أنت" ? "success" : "default"}
                  size="large"
                  sx={{ fontSize: "1rem" }}
                />
                <Chip
                  label={`الخصم 1: ${aiProgress1.toFixed(0)}%`}
                  color={
                    raceResult.winner === "الخصم 1" ? "success" : "default"
                  }
                  size="large"
                  sx={{ fontSize: "1rem" }}
                />
                <Chip
                  label={`الخصم 2: ${aiProgress2.toFixed(0)}%`}
                  color={
                    raceResult.winner === "الخصم 2" ? "success" : "default"
                  }
                  size="large"
                  sx={{ fontSize: "1rem" }}
                />
              </Box>
              {raceResult.playerPosition && (
                <Typography variant="body1" sx={{ mt: 1, fontWeight: "bold" }}>
                  ترتيبك: المركز {raceResult.playerPosition}
                </Typography>
              )}
            </Box>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>
            النقاط النهائية: {score} | الأسئلة المجابة: {questionsAnswered}
            {streak > 0 && ` | أفضل متتالية: ${streak}`}
          </Typography>

          <Button variant="contained" onClick={resetRace} sx={{ mt: 1 }}>
            سباق جديد
          </Button>
        </Paper>
      )}

      {/* Question Section */}
      {question && isRacing && timeLeft > 0 && !raceResult && (
        <>
          <Typography variant="h6" sx={{ mb: 3, color: "#333", fontSize: "1.5rem" }}>
            {question.text}
          </Typography>

          {/* Answer Options */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            {options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "contained" : "outlined"}
                size="large"
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                sx={{
                  minWidth: 120,
                  height: 60,
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  backgroundColor: showResult
                    ? option === question.correctAnswer
                      ? "#4caf50"
                      : selectedAnswer === option
                      ? "#f44336"
                      : undefined
                    : undefined,
                  color:
                    showResult && option === question.correctAnswer
                      ? "white"
                      : undefined,
                  "&:hover": {
                    transform: showResult ? "none" : "scale(1.05)",
                  },
                }}
              >
                {option}
              </Button>
            ))}
          </Box>

          {/* Result Message */}
          {showResult && (
            <Paper
              elevation={2}
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: isCorrect ? "#e8f5e8" : "#ffeaea",
                border: `2px solid ${isCorrect ? "#4caf50" : "#f44336"}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: isCorrect ? "#2e7d32" : "#d32f2f" }}
              >
                {isCorrect
                  ? "🎉 ممتاز! السيارة تتقدم!"
                  : "❌ حاول مرة أخرى في السؤال التالي"}
              </Typography>
              {isCorrect && streak >= 3 && (
                <Typography
                  variant="body1"
                  sx={{ mt: 1, color: "#ff6b35", fontWeight: "bold" }}
                >
                  🔥 متتالية رائعة! تسريع إضافي!
                </Typography>
              )}
            </Paper>
          )}
        </>
      )}

      {/* Control Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {isRacing && (
          <Button
            variant="outlined"
            onClick={() => setIsRacing(false)}
            size="large"
          >
            إيقاف السباق
          </Button>
        )}

        <Button
          variant="contained"
          onClick={resetRace}
          size="large"
          color="secondary"
        >
          إعادة تشغيل
        </Button>
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          📚 نصائح لسباق الرياضيات
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🏃‍♂️ <strong>السرعة:</strong> أجب بسرعة للتقدم في السباق
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ✅ <strong>الدقة:</strong> الإجابات الصحيحة تعطي نقاط أكثر
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔥 <strong>المتتالية:</strong> الإجابات المتتالية الصحيحة تعطي سرعة إضافية
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🎯 <strong>التنوع:</strong> جرب موضوعات مختلفة لتطوير مهاراتك
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 نصيحة: ابدأ بموضوع واحد ثم جرب الوضع المختلط للتحدي الأكبر!
        </Typography>
      </Box>
    </Box>
  );
};

// Helper function for random names
function getRandomArabicNames() {
  const names = [
    "أحمد",
    "فاطمة", 
    "علي",
    "عائشة",
    "محمد",
    "زينب",
    "يوسف",
    "مريم",
    "عمر",
    "نور",
    "خالد",
    "سارة",
    "طارق",
    "ريم",
    "حمزة",
    "هند"
  ];
  
  const shuffled = names.sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export default MathRace;
