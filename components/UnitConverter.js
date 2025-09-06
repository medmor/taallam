import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  Grid,
  Alert,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const UnitConverter = () => {
  const canvasRef = useRef(null);
  const [category, setCategory] = useState("length");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(10);
  const [gameMode, setGameMode] = useState("practice"); // practice, quiz

  const converterColors = {
    background: "#f8f9fa",
    primary: "#2196f3",
    secondary: "#4caf50",
    accent: "#ff9800",
    correct: "#4caf50",
    incorrect: "#f44336",
    length: "#3f51b5",
    weight: "#e91e63",
    volume: "#00bcd4",
    time: "#ff5722",
  };

  // Unit conversion data
  const unitSystems = {
    length: {
      name: "الأطوال",
      emoji: "📏",
      color: converterColors.length,
      units: {
        mm: { name: "ملليمتر", symbol: "مم", baseValue: 1 },
        cm: { name: "سنتيمتر", symbol: "سم", baseValue: 10 },
        m: { name: "متر", symbol: "م", baseValue: 1000 },
        km: { name: "كيلومتر", symbol: "كم", baseValue: 1000000 },
      },
      conversions: [
        { from: "cm", to: "mm", factor: 10, examples: ["5 سم = 50 مم", "12 سم = 120 مم"] },
        { from: "m", to: "cm", factor: 100, examples: ["2 م = 200 سم", "1.5 م = 150 سم"] },
        { from: "m", to: "mm", factor: 1000, examples: ["1 م = 1000 مم", "0.5 م = 500 مم"] },
        { from: "km", to: "m", factor: 1000, examples: ["1 كم = 1000 م", "2.5 كم = 2500 م"] },
        { from: "km", to: "cm", factor: 100000, examples: ["1 كم = 100000 سم"] },
      ]
    },
    weight: {
      name: "الأوزان",
      emoji: "⚖️",
      color: converterColors.weight,
      units: {
        g: { name: "جرام", symbol: "ج", baseValue: 1 },
        kg: { name: "كيلوجرام", symbol: "كج", baseValue: 1000 },
        t: { name: "طن", symbol: "طن", baseValue: 1000000 },
      },
      conversions: [
        { from: "kg", to: "g", factor: 1000, examples: ["1 كج = 1000 ج", "2.5 كج = 2500 ج"] },
        { from: "t", to: "kg", factor: 1000, examples: ["1 طن = 1000 كج", "0.5 طن = 500 كج"] },
        { from: "t", to: "g", factor: 1000000, examples: ["1 طن = 1000000 ج"] },
      ]
    },
    volume: {
      name: "الأحجام",
      emoji: "🥤",
      color: converterColors.volume,
      units: {
        ml: { name: "ملليلتر", symbol: "مل", baseValue: 1 },
        l: { name: "لتر", symbol: "ل", baseValue: 1000 },
      },
      conversions: [
        { from: "l", to: "ml", factor: 1000, examples: ["1 ل = 1000 مل", "2.5 ل = 2500 مل"] },
        { from: "ml", to: "l", factor: 0.001, examples: ["1000 مل = 1 ل", "500 مل = 0.5 ل"] },
      ]
    },
    time: {
      name: "الوقت",
      emoji: "⏰",
      color: converterColors.time,
      units: {
        s: { name: "ثانية", symbol: "ث", baseValue: 1 },
        min: { name: "دقيقة", symbol: "د", baseValue: 60 },
        h: { name: "ساعة", symbol: "س", baseValue: 3600 },
        day: { name: "يوم", symbol: "يوم", baseValue: 86400 },
      },
      conversions: [
        { from: "min", to: "s", factor: 60, examples: ["1 د = 60 ث", "5 د = 300 ث"] },
        { from: "h", to: "min", factor: 60, examples: ["1 س = 60 د", "2 س = 120 د"] },
        { from: "h", to: "s", factor: 3600, examples: ["1 س = 3600 ث"] },
        { from: "day", to: "h", factor: 24, examples: ["1 يوم = 24 س", "2 يوم = 48 س"] },
        { from: "day", to: "min", factor: 1440, examples: ["1 يوم = 1440 د"] },
      ]
    }
  };

  const generateQuestion = () => {
    const system = unitSystems[category];
    const conversions = system.conversions;
    const randomConversion = conversions[Math.floor(Math.random() * conversions.length)];
    
    // Generate values based on level
    let baseValue;
    if (level <= 2) {
      baseValue = Math.floor(Math.random() * 10) + 1; // 1-10
    } else if (level <= 4) {
      baseValue = Math.floor(Math.random() * 50) + 1; // 1-50
    } else {
      baseValue = (Math.random() * 100 + 1).toFixed(1); // 0.1-100.1 (decimals)
    }

    const correctAnswer = (parseFloat(baseValue) * randomConversion.factor).toString();
    
    setCurrentQuestion({
      value: baseValue,
      fromUnit: randomConversion.from,
      toUnit: randomConversion.to,
      factor: randomConversion.factor,
      correctAnswer: correctAnswer,
      category: category,
      description: `حول ${baseValue} ${system.units[randomConversion.from].name} إلى ${system.units[randomConversion.to].name}`,
      fromSymbol: system.units[randomConversion.from].symbol,
      toSymbol: system.units[randomConversion.to].symbol,
    });

    setUserAnswer("");
    setShowResult(false);
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const userValue = parseFloat(userAnswer);
    const correctValue = parseFloat(currentQuestion.correctAnswer);
    
    // Allow small tolerance for decimal answers
    const tolerance = correctValue * 0.01; // 1% tolerance
    const isAnswerCorrect = Math.abs(userValue - correctValue) <= tolerance;

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    if (isAnswerCorrect) {
      playSfx("correct");
      let points = level + (streak >= 3 ? 3 : 1);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      playSfx("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        generateQuestion();
      }
    }, 3000);
  };

  const drawConverter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentQuestion) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f0f8ff");
    gradient.addColorStop(1, "#e6f3ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw conversion visualization
    const system = unitSystems[currentQuestion.category];
    
    // Draw category icon
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(system.emoji, width / 2, 80);

    // Draw conversion arrow
    ctx.strokeStyle = system.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    // Left box (from unit)
    ctx.roundRect(50, 120, 120, 60, 10);
    ctx.stroke();
    
    // Right box (to unit)
    ctx.roundRect(230, 120, 120, 60, 10);
    ctx.stroke();
    
    // Arrow
    ctx.beginPath();
    ctx.moveTo(180, 150);
    ctx.lineTo(220, 150);
    ctx.moveTo(210, 140);
    ctx.lineTo(220, 150);
    ctx.moveTo(210, 160);
    ctx.lineTo(220, 150);
    ctx.stroke();

    // Draw values and units
    ctx.fillStyle = "#333";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    
    // From value
    ctx.fillText(currentQuestion.value, 110, 145);
    ctx.font = "14px Arial";
    ctx.fillText(currentQuestion.fromSymbol, 110, 165);
    
    // To value (question mark)
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#ff6b35";
    ctx.fillText("?", 290, 150);
    ctx.font = "14px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText(currentQuestion.toSymbol, 290, 170);

    // Show conversion factor hint if level is low
    if (level <= 2) {
      ctx.font = "12px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.fillText(`(×${currentQuestion.factor})`, width / 2, 210);
    }
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setUserAnswer("");
    setCurrentQuestion(null);
    generateQuestion();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - تحويلات بسيطة",
      2: "مبتدئ متقدم - تحويلات مع إرشادات",
      3: "متوسط - تحويلات متنوعة",
      4: "متوسط متقدم - قيم أكبر",
      5: "متقدم - تحويلات مع الكسور العشرية",
    };
    return descriptions[level] || `متقدم - المستوى ${level}`;
  };

  const getHint = () => {
    if (!currentQuestion) return "";
    
    const hints = {
      length: "تذكر: 1 متر = 100 سم، 1 سم = 10 مم، 1 كم = 1000 م",
      weight: "تذكر: 1 كيلوجرام = 1000 جرام، 1 طن = 1000 كيلوجرام",
      volume: "تذكر: 1 لتر = 1000 ملليلتر",
      time: "تذكر: 1 دقيقة = 60 ثانية، 1 ساعة = 60 دقيقة، 1 يوم = 24 ساعة"
    };
    
    return hints[currentQuestion.category];
  };

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 30 === 0 && level < 6) {
      setLevel(prev => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 400;
      canvas.height = 250;
      drawConverter();
    }
  }, [currentQuestion]);

  // Initialize first question
  useEffect(() => {
    generateQuestion();
  }, [category, level]);

  const isGameComplete = currentQuestionIndex >= totalQuestions;

  return (
    <Box
      sx={{
        maxWidth: 800,
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
        sx={{ color: converterColors.primary, fontWeight: "bold" }}
      >
        📐 محول الوحدات
      </Typography>

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
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip
          label={`السؤال: ${currentQuestionIndex + 1}/${totalQuestions}`}
          color="info"
          size="large"
        />
        <Chip label={`المتتالية: ${streak}🔥`} color="success" size="large" />
      </Box>

      {/* Level Description */}
      <Typography variant="body1" sx={{ mb: 2, color: "#666" }}>
        {getLevelDescription()}
      </Typography>

      {/* Category Selection */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          اختر نوع الوحدات:
        </Typography>
        
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={(e, newCategory) => {
            if (newCategory) {
              setCategory(newCategory);
              setCurrentQuestionIndex(0);
            }
          }}
          sx={{ mb: 2 }}
        >
          {Object.entries(unitSystems).map(([key, system]) => (
            <ToggleButton
              key={key}
              value={key}
              sx={{
                color: system.color,
                "&.Mui-selected": {
                  backgroundColor: system.color,
                  color: "white",
                },
              }}
            >
              {system.emoji} {system.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      {!isGameComplete && currentQuestion && (
        <>
          {/* Question Display */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                💡 {getHint()}
              </Alert>
            </Box>
            <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
              {currentQuestion.description}
            </Typography>
            

            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                maxWidth: "400px",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            />

            {/* Answer Input */}
            {!showResult && (
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="أدخل الإجابة"
                  type="number"
                  inputProps={{ step: "any" }}
                  sx={{ minWidth: 200 }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      checkAnswer();
                    }
                  }}
                />
                
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {unitSystems[currentQuestion.category].units[currentQuestion.toUnit].symbol}
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  sx={{ fontSize: "1.1rem", px: 4 }}
                >
                  تحقق
                </Button>
              </Box>
            )}
          </Paper>

          {/* Result Message */}
          {showResult && (
            <Alert
              severity={isCorrect ? "success" : "error"}
              sx={{ mb: 3, fontSize: "1.1rem" }}
            >
              {isCorrect
                ? "🎉 ممتاز! إجابة صحيحة!"
                : `❌ إجابة خاطئة. الإجابة الصحيحة: ${currentQuestion.correctAnswer} ${unitSystems[currentQuestion.category].units[currentQuestion.toUnit].symbol}`}
              {isCorrect && streak >= 3 && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  🔥 متتالية رائعة! نقاط إضافية!
                </Typography>
              )}
            </Alert>
          )}
        </>
      )}

      {/* Game Complete */}
      {isGameComplete && (
        <Paper
          sx={{
            p: 4,
            mb: 3,
            backgroundColor: "#e8f5e8",
            border: "2px solid #4caf50",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: "#2e7d32", mb: 2, fontWeight: "bold" }}
          >
            🏆 تهانينا! لقد أنهيت لعبة محول الوحدات!
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            النتيجة النهائية: {score} نقطة
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            المستوى النهائي: {level} | أفضل متتالية: {streak}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={resetGame}
            sx={{ mt: 2 }}
          >
            لعب مرة أخرى
          </Button>
        </Paper>
      )}

      {/* Control Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          onClick={resetGame}
          size="large"
          color="secondary"
        >
          إعادة تشغيل
        </Button>

        {currentQuestion && !isGameComplete && (
          <Button
            variant="outlined"
            onClick={generateQuestion}
            size="large"
          >
            سؤال جديد
          </Button>
        )}
      </Box>

      {/* Educational Reference */}
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {Object.entries(unitSystems).map(([key, system]) => (
            <Grid item xs={12} md={6} key={key}>
              <Card sx={{ backgroundColor: `${system.color}15`, border: `2px solid ${system.color}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: system.color }}>
                    {system.emoji} {system.name}
                  </Typography>
                  
                  {system.conversions.slice(0, 3).map((conv, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                      • {conv.examples[0]}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          📚 تعلم تحويل الوحدات
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📏 <strong>الأطوال:</strong> مم ← سم ← م ← كم (كل وحدة أكبر بـ 10 أو 100 أو 1000 مرة)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ⚖️ <strong>الأوزان:</strong> جرام ← كيلوجرام ← طن (1000 مرة لكل تحويل)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🥤 <strong>الأحجام:</strong> ملليلتر ← لتر (1000 مل = 1 لتر)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ⏰ <strong>الوقت:</strong> ثانية ← دقيقة ← ساعة ← يوم
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 نصيحة: للتحويل من وحدة كبيرة لصغيرة نضرب، ومن صغيرة لكبيرة نقسم!
        </Typography>
      </Box>
    </Box>
  );
};

export default UnitConverter;
