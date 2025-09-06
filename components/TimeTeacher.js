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
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const TimeTeacher = () => {
  const canvasRef = useRef(null);
  const [gameMode, setGameMode] = useState("analog-reading"); // analog-reading, digital-reading, duration
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(10);

  const timeColors = {
    background: "#f8f9fa",
    primary: "#2196f3",
    secondary: "#4caf50",
    accent: "#ff9800",
    correct: "#4caf50",
    incorrect: "#f44336",
    clockFace: "#ffffff",
    clockBorder: "#333333",
    hourHand: "#333333",
    minuteHand: "#666666",
    numbers: "#000000",
    digitalBg: "#000000",
    digitalText: "#00ff00",
  };

  const generateTime = () => {
    let hour, minute;
    
    if (level <= 2) {
      // Simple times - on the hour or half hour
      hour = Math.floor(Math.random() * 12) + 1;
      minute = Math.random() < 0.5 ? 0 : 30;
    } else if (level <= 4) {
      // Quarter hours
      hour = Math.floor(Math.random() * 12) + 1;
      const quarters = [0, 15, 30, 45];
      minute = quarters[Math.floor(Math.random() * quarters.length)];
    } else {
      // Any time
      hour = Math.floor(Math.random() * 12) + 1;
      minute = Math.floor(Math.random() * 12) * 5; // 5-minute intervals
    }
    
    return { hour, minute };
  };

  const generateQuestion = () => {
    const time = generateTime();
    
    if (gameMode === "analog-reading") {
      setCurrentQuestion({
        type: "analog-reading",
        hour: time.hour,
        minute: time.minute,
        description: "ما الوقت المعروض على الساعة؟",
      });
    } else if (gameMode === "digital-reading") {
      setCurrentQuestion({
        type: "digital-reading",
        hour: time.hour,
        minute: time.minute,
        description: "اقرأ الوقت الرقمي واختر الإجابة الصحيحة",
      });
    } else if (gameMode === "duration") {
      const startTime = generateTime();
      const durationHours = Math.floor(Math.random() * 3);
      const durationMinutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      
      let endHour = startTime.hour + durationHours;
      let endMinute = startTime.minute + durationMinutes;
      
      if (endMinute >= 60) {
        endMinute -= 60;
        endHour += 1;
      }
      if (endHour > 12) {
        endHour -= 12;
      }
      
      setCurrentQuestion({
        type: "duration",
        startHour: startTime.hour,
        startMinute: startTime.minute,
        endHour: endHour,
        endMinute: endMinute,
        durationHours: durationHours,
        durationMinutes: durationMinutes,
        description: `كم من الوقت مر من ${formatTime(startTime.hour, startTime.minute)} إلى ${formatTime(endHour, endMinute)}؟`,
      });
    }

    setSelectedHour("");
    setSelectedMinute("");
    setUserAnswer("");
    setShowResult(false);
  };

  const formatTime = (hour, minute) => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatTimeArabic = (hour, minute) => {
    if (minute === 0) {
      return `الساعة ${hour}`;
    } else if (minute === 15) {
      return `${hour} والربع`;
    } else if (minute === 30) {
      return `${hour} والنصف`;
    } else if (minute === 45) {
      return `${hour} إلا الربع`;
    } else {
      return `${hour}:${minute.toString().padStart(2, "0")}`;
    }
  };

  const drawAnalogClock = (hour, minute, isMain = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const centerX = isMain ? 200 : 100;
    const centerY = isMain ? 150 : 100;
    const radius = isMain ? 80 : 50;

    if (isMain) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2);
      gradient.addColorStop(0, "#f0f8ff");
      gradient.addColorStop(1, "#e6f3ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw clock face
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = timeColors.clockFace;
    ctx.fill();
    ctx.strokeStyle = timeColors.clockBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw hour markers and numbers
    ctx.fillStyle = timeColors.numbers;
    ctx.font = `${isMain ? 16 : 12}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 1; i <= 12; i++) {
      const angle = (i * Math.PI) / 6 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius - (isMain ? 20 : 15));
      const y = centerY + Math.sin(angle) * (radius - (isMain ? 20 : 15));
      ctx.fillText(i.toString(), x, y);

      // Draw hour markers
      const markerStartX = centerX + Math.cos(angle) * (radius - (isMain ? 10 : 8));
      const markerStartY = centerY + Math.sin(angle) * (radius - (isMain ? 10 : 8));
      const markerEndX = centerX + Math.cos(angle) * (radius - (isMain ? 5 : 3));
      const markerEndY = centerY + Math.sin(angle) * (radius - (isMain ? 5 : 3));
      
      ctx.beginPath();
      ctx.moveTo(markerStartX, markerStartY);
      ctx.lineTo(markerEndX, markerEndY);
      ctx.strokeStyle = timeColors.clockBorder;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw minute markers
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) { // Skip hour markers
        const angle = (i * Math.PI) / 30 - Math.PI / 2;
        const markerStartX = centerX + Math.cos(angle) * (radius - (isMain ? 5 : 3));
        const markerStartY = centerY + Math.sin(angle) * (radius - (isMain ? 5 : 3));
        const markerEndX = centerX + Math.cos(angle) * (radius - (isMain ? 2 : 1));
        const markerEndY = centerY + Math.sin(angle) * (radius - (isMain ? 2 : 1));
        
        ctx.beginPath();
        ctx.moveTo(markerStartX, markerStartY);
        ctx.lineTo(markerEndX, markerEndY);
        ctx.strokeStyle = timeColors.clockBorder;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Calculate hand angles
    const hourAngle = ((hour % 12) + minute / 60) * (Math.PI / 6) - Math.PI / 2;
    const minuteAngle = (minute * Math.PI) / 30 - Math.PI / 2;

    // Draw hour hand
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(hourAngle) * (radius * 0.5),
      centerY + Math.sin(hourAngle) * (radius * 0.5)
    );
    ctx.strokeStyle = timeColors.hourHand;
    ctx.lineWidth = isMain ? 6 : 4;
    ctx.lineCap = "round";
    ctx.stroke();

    // Draw minute hand
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(minuteAngle) * (radius * 0.8),
      centerY + Math.sin(minuteAngle) * (radius * 0.8)
    );
    ctx.strokeStyle = timeColors.minuteHand;
    ctx.lineWidth = isMain ? 4 : 2;
    ctx.lineCap = "round";
    ctx.stroke();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, isMain ? 8 : 5, 0, 2 * Math.PI);
    ctx.fillStyle = timeColors.clockBorder;
    ctx.fill();
  };

  const drawDigitalClock = (hour, minute) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1a1a1a");
    gradient.addColorStop(1, "#333333");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw digital display
    const displayX = 100;
    const displayY = 100;
    const displayWidth = 200;
    const displayHeight = 100;

    ctx.fillStyle = timeColors.digitalBg;
    ctx.fillRect(displayX, displayY, displayWidth, displayHeight);

    // Draw border
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 3;
    ctx.strokeRect(displayX, displayY, displayWidth, displayHeight);

    // Draw time
    ctx.fillStyle = timeColors.digitalText;
    ctx.font = "bold 48px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const timeString = formatTime(hour, minute);
    ctx.fillText(timeString, displayX + displayWidth / 2, displayY + displayHeight / 2);

    // Draw blinking colon effect
    const colonX = displayX + displayWidth / 2;
    ctx.fillStyle = timeColors.digitalText;
    ctx.font = "bold 48px monospace";
    ctx.fillText(":", colonX, displayY + displayHeight / 2);
  };

  const checkAnswer = () => {
    if (!selectedHour && !userAnswer) return;

    let correct = false;
    
    if (currentQuestion.type === "analog-reading") {
      const userHour = parseInt(selectedHour);
      const userMin = parseInt(selectedMinute);
      correct = userHour === currentQuestion.hour && userMin === currentQuestion.minute;
    } else if (currentQuestion.type === "digital-reading") {
      const userHour = parseInt(selectedHour);
      const userMin = parseInt(selectedMinute);
      correct = userHour === currentQuestion.hour && userMin === currentQuestion.minute;
    } else if (currentQuestion.type === "duration") {
      // Check duration answer
      const expectedDuration = currentQuestion.durationHours * 60 + currentQuestion.durationMinutes;
      const userDuration = parseInt(userAnswer);
      correct = userDuration === expectedDuration;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
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

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setSelectedHour("");
    setSelectedMinute("");
    setUserAnswer("");
    setCurrentQuestion(null);
    generateQuestion();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - الساعات الكاملة والنصف",
      2: "مبتدئ متقدم - الساعات والنصف",
      3: "متوسط - الربع ساعة",
      4: "متوسط متقدم - الربع والنصف",
      5: "متقدم - جميع الأوقات",
    };
    return descriptions[level] || `متقدم - المستوى ${level}`;
  };

  const getHint = () => {
    const hints = {
      "analog-reading": "العقرب القصير يشير للساعة، والعقرب الطويل يشير للدقائق",
      "digital-reading": "الرقم الأول هو الساعة، والرقم الثاني هو الدقائق",
      "duration": "احسب الفرق بين الوقت الأول والوقت الثاني"
    };
    
    return hints[currentQuestion?.type] || "انتبه للوقت المعروض";
  };

  const generateAnswerChoices = () => {
    if (!currentQuestion) return [];
    
    const correctHour = currentQuestion.hour;
    const correctMinute = currentQuestion.minute;
    
    const choices = [
      { hour: correctHour, minute: correctMinute, correct: true }
    ];
    
    // Generate wrong choices
    while (choices.length < 4) {
      let wrongHour = Math.floor(Math.random() * 12) + 1;
      let wrongMinute = Math.floor(Math.random() * 12) * 5;
      
      if (wrongHour !== correctHour || wrongMinute !== correctMinute) {
        const exists = choices.some(c => c.hour === wrongHour && c.minute === wrongMinute);
        if (!exists) {
          choices.push({ hour: wrongHour, minute: wrongMinute, correct: false });
        }
      }
    }
    
    // Shuffle choices
    return choices.sort(() => Math.random() - 0.5);
  };

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 25 === 0 && level < 6) {
      setLevel(prev => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && currentQuestion) {
      canvas.width = 400;
      canvas.height = 300;
      
      if (currentQuestion.type === "analog-reading") {
        drawAnalogClock(currentQuestion.hour, currentQuestion.minute);
      } else if (currentQuestion.type === "digital-reading") {
        drawDigitalClock(currentQuestion.hour, currentQuestion.minute);
      } else if (currentQuestion.type === "duration") {
        // Draw both start and end times
        canvas.width = 500;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#f0f8ff");
        gradient.addColorStop(1, "#e6f3ff");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw start time clock at position (100, 150)
        ctx.save();
        ctx.translate(-100, 0);
        drawAnalogClock(currentQuestion.startHour, currentQuestion.startMinute, false);
        ctx.restore();
        
        // Draw end time clock at position (350, 150)
        ctx.save();
        ctx.translate(150, 0);
        drawAnalogClock(currentQuestion.endHour, currentQuestion.endMinute, false);
        ctx.restore();
        
        // Draw arrow and labels
        ctx.fillStyle = "#333";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        
        ctx.fillText("من", 100, 220);
        ctx.fillText("إلى", 350, 220);
        ctx.fillText(formatTimeArabic(currentQuestion.startHour, currentQuestion.startMinute), 100, 240);
        ctx.fillText(formatTimeArabic(currentQuestion.endHour, currentQuestion.endMinute), 350, 240);
        
        // Draw arrow
        ctx.strokeStyle = "#ff6b35";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(300, 150);
        ctx.moveTo(290, 140);
        ctx.lineTo(300, 150);
        ctx.moveTo(290, 160);
        ctx.lineTo(300, 150);
        ctx.stroke();
      }
    }
  }, [currentQuestion]);

  // Initialize first question
  useEffect(() => {
    generateQuestion();
  }, [gameMode, level]);

  const isGameComplete = currentQuestionIndex >= totalQuestions;

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
        sx={{ color: timeColors.primary, fontWeight: "bold" }}
      >
        🕐 معلم الوقت
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

      {/* Game Mode Selection */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          اختر نوع التمرين:
        </Typography>
        
        <ToggleButtonGroup
          value={gameMode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode) {
              setGameMode(newMode);
              setCurrentQuestionIndex(0);
            }
          }}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="analog-reading">
            🕐 قراءة الساعة التناظرية
          </ToggleButton>
          <ToggleButton value="digital-reading">
            🔢 قراءة الساعة الرقمية
          </ToggleButton>
          <ToggleButton value="duration">
            ⏱️ حساب المدة الزمنية
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {!isGameComplete && currentQuestion && (
        <>
          {/* Question Display */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
              {currentQuestion.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                💡 {getHint()}
              </Alert>
            </Box>

            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                maxWidth: currentQuestion.type === "duration" ? "500px" : "400px",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            />

            {/* Answer Input */}
            {!showResult && (
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                {currentQuestion.type === "duration" ? (
                  <>
                    <Typography variant="body1">المدة بالدقائق:</Typography>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>الدقائق</InputLabel>
                      <Select
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        label="الدقائق"
                      >
                        {[15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180].map(duration => (
                          <MenuItem key={duration} value={duration}>{duration}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                ) : (
                  <>
                    <FormControl sx={{ minWidth: 100 }}>
                      <InputLabel>الساعة</InputLabel>
                      <Select
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(e.target.value)}
                        label="الساعة"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <MenuItem key={hour} value={hour}>{hour}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography variant="h5">:</Typography>

                    <FormControl sx={{ minWidth: 100 }}>
                      <InputLabel>الدقيقة</InputLabel>
                      <Select
                        value={selectedMinute}
                        onChange={(e) => setSelectedMinute(e.target.value)}
                        label="الدقيقة"
                      >
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                          <MenuItem key={minute} value={minute}>
                            {minute.toString().padStart(2, "0")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={checkAnswer}
                  disabled={
                    currentQuestion.type === "duration" 
                      ? !userAnswer 
                      : !selectedHour || selectedMinute === ""
                  }
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
                : `❌ إجابة خاطئة. ${
                    currentQuestion.type === "duration"
                      ? `المدة الصحيحة: ${currentQuestion.durationHours * 60 + currentQuestion.durationMinutes} دقيقة`
                      : `الوقت الصحيح: ${formatTimeArabic(currentQuestion.hour, currentQuestion.minute)}`
                  }`}
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
            🏆 تهانينا! لقد أنهيت لعبة معلم الوقت!
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

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          📚 تعلم قراءة الوقت
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🕐 <strong>العقرب القصير:</strong> يشير إلى الساعة (يتحرك ببطء)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🕐 <strong>العقرب الطويل:</strong> يشير إلى الدقائق (يتحرك بسرعة)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔢 <strong>الساعة الرقمية:</strong> الساعة:الدقائق (مثل 3:30)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ⏱️ <strong>المدة الزمنية:</strong> الفرق بين وقتين (60 دقيقة = ساعة واحدة)
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 نصيحة: تذكر أن العقرب القصير يتحرك تدريجياً بين الأرقام!
        </Typography>
      </Box>
    </Box>
  );
};

export default TimeTeacher;
