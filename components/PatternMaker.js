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
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const PatternMaker = () => {
  const canvasRef = useRef(null);
  const [pattern, setPattern] = useState(null);
  const [patternType, setPatternType] = useState("number"); // 'number', 'shape', 'color'
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(10);

  const patternColors = {
    background: "#f8f9fa",
    primary: "#2196f3",
    secondary: "#4caf50",
    accent: "#ff9800",
    correct: "#4caf50",
    incorrect: "#f44336",
    pattern: "#e3f2fd",
  };

  const shapes = [
    { type: "circle", color: "#2196f3" },
    { type: "square", color: "#4caf50" },
    { type: "triangle", color: "#ff9800" },
    { type: "diamond", color: "#9c27b0" },
    { type: "star", color: "#f44336" },
    { type: "hexagon", color: "#795548" },
  ];

  const colors = ["#ff5722", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#00bcd4", "#009688", "#4caf50", "#8bc34a"];

  const generateNumberPattern = () => {
    const patternTypes = ["arithmetic", "geometric", "square", "fibonacci", "custom"];
    const selectedType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    let sequence = [];
    let rule = "";
    let correctAnswer;

    if (selectedType === "arithmetic") {
      // Arithmetic progression: a, a+d, a+2d, ...
      const start = Math.floor(Math.random() * 10) + 1;
      const diff = level <= 2 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 10) + 1;
      
      for (let i = 0; i < 5; i++) {
        sequence.push(start + i * diff);
      }
      correctAnswer = sequence[sequence.length - 1] + diff;
      rule = `يزيد بـ ${diff}`;
    } else if (selectedType === "geometric") {
      // Geometric progression: a, a*r, a*r^2, ...
      const start = Math.floor(Math.random() * 3) + 1;
      const ratio = level <= 1 ? 2 : Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < 4; i++) {
        sequence.push(start * Math.pow(ratio, i));
      }
      correctAnswer = sequence[sequence.length - 1] * ratio;
      rule = `يضرب في ${ratio}`;
    } else if (selectedType === "square") {
      // Square numbers: 1, 4, 9, 16, 25, ...
      for (let i = 1; i <= 4; i++) {
        sequence.push(i * i);
      }
      correctAnswer = 25; // 5^2
      rule = "مربعات الأعداد";
    } else if (selectedType === "fibonacci") {
      // Fibonacci-like: each number is sum of previous two
      const a = Math.floor(Math.random() * 3) + 1;
      const b = Math.floor(Math.random() * 3) + 1;
      sequence = [a, b];
      
      for (let i = 2; i < 4; i++) {
        sequence.push(sequence[i-1] + sequence[i-2]);
      }
      correctAnswer = sequence[sequence.length - 1] + sequence[sequence.length - 2];
      rule = "مجموع العددين السابقين";
    } else {
      // Custom patterns
      const patterns = [
        { seq: [2, 4, 8, 16], next: 32, rule: "يضرب في 2" },
        { seq: [1, 3, 6, 10], next: 15, rule: "يزيد بـ 2، ثم 3، ثم 4..." },
        { seq: [100, 90, 80, 70], next: 60, rule: "يقل بـ 10" },
        { seq: [1, 4, 7, 10], next: 13, rule: "يزيد بـ 3" },
        { seq: [20, 18, 16, 14], next: 12, rule: "يقل بـ 2" },
      ];
      
      const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
      sequence = selectedPattern.seq;
      correctAnswer = selectedPattern.next;
      rule = selectedPattern.rule;
    }

    // Generate wrong options
    const wrongOptions = new Set();
    while (wrongOptions.size < 3) {
      let wrongAnswer;
      if (selectedType === "arithmetic") {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
      } else if (selectedType === "geometric") {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
      } else {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
      }
      
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0) {
        wrongOptions.add(wrongAnswer);
      }
    }

    return {
      type: "number",
      sequence: sequence,
      correctAnswer: correctAnswer,
      options: [correctAnswer, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5),
      rule: rule,
      explanation: `النمط: ${rule}`,
    };
  };

  const generateShapePattern = () => {
    const patternTypes = ["shape-sequence", "color-sequence", "size-sequence"];
    const selectedType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    let sequence = [];
    let correctAnswer;
    let rule = "";

    if (selectedType === "shape-sequence") {
      // Shape sequence: circle, square, triangle, circle, square, ?
      const shapeNames = ["دائرة", "مربع", "مثلث"];
      const baseShapes = [shapes[0], shapes[1], shapes[2]]; // circle, square, triangle
      
      for (let i = 0; i < 5; i++) {
        sequence.push(baseShapes[i % 3]);
      }
      correctAnswer = baseShapes[5 % 3];
      rule = "تتكرر الأشكال: دائرة، مربع، مثلث";
    } else if (selectedType === "color-sequence") {
      // Color sequence with same shape
      const baseShape = shapes[0]; // circle
      const patternColors = [colors[0], colors[1], colors[2]]; // first 3 colors
      
      for (let i = 0; i < 5; i++) {
        sequence.push({
          ...baseShape,
          color: patternColors[i % 3]
        });
      }
      correctAnswer = {
        ...baseShape,
        color: patternColors[5 % 3]
      };
      rule = "تتكرر الألوان";
    } else {
      // Size sequence
      const baseShape = shapes[0];
      const sizes = ["small", "medium", "large"];
      
      for (let i = 0; i < 5; i++) {
        sequence.push({
          ...baseShape,
          size: sizes[i % 3]
        });
      }
      correctAnswer = {
        ...baseShape,
        size: sizes[5 % 3]
      };
      rule = "تتكرر الأحجام: صغير، متوسط، كبير";
    }

    // Generate wrong options for shapes
    const wrongOptions = [];
    for (let i = 0; i < 3; i++) {
      let wrongShape;
      if (selectedType === "shape-sequence") {
        wrongShape = shapes[(shapes.findIndex(s => s.type === correctAnswer.type) + i + 1) % shapes.length];
      } else if (selectedType === "color-sequence") {
        wrongShape = {
          ...correctAnswer,
          color: colors[(colors.findIndex(c => c === correctAnswer.color) + i + 1) % colors.length]
        };
      } else {
        const sizes = ["small", "medium", "large"];
        const wrongSizeIndex = (sizes.findIndex(s => s === correctAnswer.size) + i + 1) % sizes.length;
        wrongShape = {
          ...correctAnswer,
          size: sizes[wrongSizeIndex]
        };
      }
      wrongOptions.push(wrongShape);
    }

    return {
      type: "shape",
      sequence: sequence,
      correctAnswer: correctAnswer,
      options: [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5),
      rule: rule,
      explanation: `النمط: ${rule}`,
    };
  };

  const generatePattern = () => {
    setSelectedAnswer(null);
    setShowResult(false);

    // Choose pattern type based on level
    const types = level <= 2 ? ["number", "shape"] : ["number", "shape", "color"];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    setPatternType(selectedType);

    let newPattern;
    if (selectedType === "number") {
      newPattern = generateNumberPattern();
    } else {
      newPattern = generateShapePattern();
    }

    setPattern(newPattern);
    setOptions(newPattern.options);
  };

  const drawShape = (ctx, shape, x, y, size = 30) => {
    ctx.fillStyle = shape.color;
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;

    // Adjust size based on size property
    if (shape.size === "small") size *= 0.7;
    else if (shape.size === "large") size *= 1.3;

    switch (shape.type) {
      case "circle":
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      
      case "square":
        ctx.fillRect(x - size/2, y - size/2, size, size);
        ctx.strokeRect(x - size/2, y - size/2, size, size);
        break;
      
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(x, y - size/2);
        ctx.lineTo(x - size/2, y + size/2);
        ctx.lineTo(x + size/2, y + size/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      
      case "diamond":
        ctx.beginPath();
        ctx.moveTo(x, y - size/2);
        ctx.lineTo(x + size/2, y);
        ctx.lineTo(x, y + size/2);
        ctx.lineTo(x - size/2, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      
      case "star":
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const outerX = x + Math.cos(angle) * size/2;
          const outerY = y + Math.sin(angle) * size/2;
          const innerAngle = angle + Math.PI / 5;
          const innerX = x + Math.cos(innerAngle) * size/4;
          const innerY = y + Math.sin(innerAngle) * size/4;
          
          if (i === 0) ctx.moveTo(outerX, outerY);
          else ctx.lineTo(outerX, outerY);
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      
      case "hexagon":
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x1 = x + Math.cos(angle) * size/2;
          const y1 = y + Math.sin(angle) * size/2;
          if (i === 0) ctx.moveTo(x1, y1);
          else ctx.lineTo(x1, y1);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      
      default:
        // Default to circle
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
    }
  };

  const drawPattern = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pattern) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = patternColors.background;
    ctx.fillRect(0, 0, width, height);

    if (pattern.type === "number") {
      // Draw number sequence
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Calculate spacing to fit all elements including question mark within canvas
      const totalElements = pattern.sequence.length + 1; // +1 for question mark
      const margin = 40; // margin from edges
      const availableWidth = width - (2 * margin);
      const spacing = availableWidth / (totalElements - 1);
      
      pattern.sequence.forEach((num, index) => {
        const x = margin + spacing * index;
        const y = height / 2;

        // Draw background circle
        ctx.fillStyle = patternColors.pattern;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, 2 * Math.PI);
        ctx.fill();

        // Draw number
        ctx.fillStyle = "#333";
        ctx.fillText(num.toString(), x, y);
      });

      // Draw question mark or correct answer for the missing element
      const questionX = margin + spacing * pattern.sequence.length;
      const questionY = height / 2;

      // Show correct answer after user answers, otherwise show question mark
      if (showResult) {
        ctx.fillStyle = isCorrect ? patternColors.correct : patternColors.pattern;
        ctx.beginPath();
        ctx.arc(questionX, questionY, 30, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = isCorrect ? "#fff" : "#333";
        ctx.font = "bold 24px Arial";
        ctx.fillText(pattern.correctAnswer.toString(), questionX, questionY);
      } else {
        ctx.fillStyle = patternColors.accent;
        ctx.beginPath();
        ctx.arc(questionX, questionY, 30, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 28px Arial";
        ctx.fillText("?", questionX, questionY);
      }

    } else {
      // Draw shape sequence
      const totalElements = pattern.sequence.length + 1; // +1 for question mark
      const margin = 40; // margin from edges
      const availableWidth = width - (2 * margin);
      const spacing = availableWidth / (totalElements - 1);
      
      pattern.sequence.forEach((shape, index) => {
        const x = margin + spacing * index;
        const y = height / 2;
        drawShape(ctx, shape, x, y);
      });

      // Draw question mark or correct answer for the missing element
      const questionX = margin + spacing * pattern.sequence.length;
      const questionY = height / 2;

      // Show correct answer after user answers, otherwise show question mark
      if (showResult) {
        // Draw the correct shape/answer
        drawShape(ctx, pattern.correctAnswer, questionX, questionY);
        
        // Add a green outline if correct, red if wrong
        ctx.strokeStyle = isCorrect ? patternColors.correct : patternColors.incorrect;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(questionX, questionY, 40, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        ctx.fillStyle = patternColors.accent;
        ctx.beginPath();
        ctx.arc(questionX, questionY, 35, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", questionX, questionY);
      }
    }
  };

  const handleAnswer = (answer) => {
    if (showResult) return;

    playSfx("click");
    setSelectedAnswer(answer);

    let correct = false;
    if (pattern.type === "number") {
      correct = answer === pattern.correctAnswer;
    } else {
      // For shapes, compare type and color
      correct = answer.type === pattern.correctAnswer.type && 
                answer.color === pattern.correctAnswer.color &&
                answer.size === pattern.correctAnswer.size;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSfx("correct");
      const points = level + (streak >= 3 ? 2 : 1);
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
    } else {
      playSfx("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        generatePattern();
      }
    }, 2000);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setPattern(null);
    setSelectedAnswer(null);
    generatePattern();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - أنماط بسيطة",
      2: "متوسط - أنماط أكثر تعقيداً",
      3: "متقدم - أنماط معقدة ومتنوعة",
    };
    return descriptions[level];
  };

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 15 === 0 && level < 3) {
      setLevel((prev) => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 600;
      canvas.height = 120;
      drawPattern();
    }
  }, [pattern, showResult, isCorrect]); // Added showResult and isCorrect to dependencies

  // Initialize first pattern
  useEffect(() => {
    generatePattern();
  }, []);

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
        sx={{ color: patternColors.primary, fontWeight: "bold" }}
      >
        🧩 صانع الأنماط
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

      {!isGameComplete && pattern && (
        <>
          {/* Pattern Display */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
              أكمل النمط:
            </Typography>
            
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                maxWidth: "600px",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "10px",
              }}
            />

            {pattern.explanation && (
              <Typography variant="body2" sx={{ mt: 2, color: "#666", fontStyle: "italic" }}>
                {pattern.explanation}
              </Typography>
            )}
          </Paper>

          {/* Answer Options */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            اختر الإجابة الصحيحة:
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            {options.map((option, index) => (
              <Grid item key={index}>
                <Card
                  sx={{
                    minWidth: 100,
                    minHeight: 100,
                    cursor: showResult ? "default" : "pointer",
                    border: selectedAnswer === option ? "3px solid #2196f3" : "1px solid #ddd",
                    backgroundColor: showResult
                      ? (pattern.type === "number" 
                          ? (option === pattern.correctAnswer ? "#e8f5e8" : selectedAnswer === option ? "#ffeaea" : "white")
                          : ((option.type === pattern.correctAnswer.type && 
                              option.color === pattern.correctAnswer.color && 
                              option.size === pattern.correctAnswer.size) ? "#e8f5e8" : 
                              selectedAnswer === option ? "#ffeaea" : "white"))
                      : "white",
                    "&:hover": {
                      transform: showResult ? "none" : "scale(1.05)",
                      boxShadow: showResult ? undefined : 3,
                    },
                    transition: "all 0.3s",
                  }}
                  onClick={() => handleAnswer(option)}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 80,
                      p: 2,
                    }}
                  >
                    {pattern.type === "number" ? (
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {option}
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <canvas
                          width={60}
                          height={60}
                          ref={(canvas) => {
                            if (canvas) {
                              const ctx = canvas.getContext("2d");
                              ctx.clearRect(0, 0, 60, 60);
                              drawShape(ctx, option, 30, 30, 25);
                            }
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Result Message */}
          {showResult && (
            <Alert
              severity={isCorrect ? "success" : "error"}
              sx={{ mb: 3, fontSize: "1.1rem" }}
            >
              {isCorrect
                ? "🎉 ممتاز! لقد أكملت النمط بشكل صحيح!"
                : "❌ إجابة خاطئة. حاول مرة أخرى في السؤال التالي!"}
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
            🏆 تهانينا! لقد أنهيت اللعبة!
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

        {pattern && !isGameComplete && (
          <Button
            variant="outlined"
            onClick={generatePattern}
            size="large"
          >
            نمط جديد
          </Button>
        )}
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          📚 تعلم الأنماط
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔢 <strong>الأنماط العددية:</strong> تسلسل من الأرقام يتبع قاعدة معينة
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔺 <strong>أنماط الأشكال:</strong> تسلسل من الأشكال أو الألوان يتكرر
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ➕ <strong>النمط الحسابي:</strong> يزيد أو يقل بعدد ثابت
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ✖️ <strong>النمط الهندسي:</strong> يضرب في عدد ثابت
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 نصيحة: ابحث عن القاعدة التي تربط العناصر ببعضها البعض!
        </Typography>
      </Box>
    </Box>
  );
};

export default PatternMaker;
