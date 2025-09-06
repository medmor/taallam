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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const GraphMaker = () => {
  const canvasRef = useRef(null);
  const [gameMode, setGameMode] = useState("create"); // create, read, analyze
  const [currentData, setCurrentData] = useState(null);
  const [userGraph, setUserGraph] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(8);
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);

  const graphColors = {
    background: "#f8f9fa",
    primary: "#2196f3",
    secondary: "#4caf50",
    accent: "#ff9800",
    correct: "#4caf50",
    incorrect: "#f44336",
    gridLines: "#e0e0e0",
    axisLines: "#333333",
    bars: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8", "#f7dc6f"],
    text: "#333333",
  };

  // Data sets for different topics
  const dataTopics = [
    {
      topic: "الفواكه المفضلة",
      emoji: "🍎",
      categories: ["تفاح", "موز", "برتقال", "عنب", "فراولة"],
      emojis: ["🍎", "🍌", "🍊", "🍇", "🍓"],
      unit: "تلميذ",
      questions: [
        "أي فاكهة هي الأكثر تفضيلاً؟",
        "كم تلميذ يفضل {category}؟",
        "ما مجموع التلاميذ الذين يفضلون التفاح والموز؟",
        "أي فاكهة هي الأقل تفضيلاً؟"
      ]
    },
    {
      topic: "الحيوانات الأليفة",
      emoji: "🐕",
      categories: ["كلب", "قطة", "أرنب", "سمك", "عصفور"],
      emojis: ["🐕", "🐱", "🐰", "🐠", "🐦"],
      unit: "عائلة",
      questions: [
        "أي حيوان أليف هو الأكثر شيوعاً؟",
        "كم عائلة تربي {category}؟",
        "ما الفرق بين عدد العائلات التي تربي الكلاب والقطط؟",
        "كم عائلة تربي حيوانات أليفة في المجموع؟"
      ]
    },
    {
      topic: "الألوان المفضلة",
      emoji: "🎨",
      categories: ["أحمر", "أزرق", "أخضر", "أصفر", "بنفسجي"],
      emojis: ["🔴", "🔵", "🟢", "🟡", "🟣"],
      unit: "طفل",
      questions: [
        "أي لون هو الأكثر تفضيلاً؟",
        "كم طفل يفضل اللون {category}؟",
        "ما مجموع الأطفال الذين يفضلون الأحمر والأزرق؟",
        "أي لون هو الأقل تفضيلاً؟"
      ]
    },
    {
      topic: "الرياضات المفضلة",
      emoji: "⚽",
      categories: ["كرة قدم", "سباحة", "تنس", "كرة سلة", "جري"],
      emojis: ["⚽", "🏊", "🎾", "🏀", "🏃"],
      unit: "لاعب",
      questions: [
        "أي رياضة هي الأكثر ممارسة؟",
        "كم لاعب يمارس {category}؟",
        "ما الفرق بين عدد لاعبي كرة القدم والسباحة؟",
        "كم لاعب يمارس الرياضة في المجموع؟"
      ]
    },
    {
      topic: "المواد الدراسية",
      emoji: "📚",
      categories: ["رياضيات", "علوم", "عربي", "إنجليزي", "تاريخ"],
      emojis: ["🔢", "🔬", "📖", "🅰️", "📜"],
      unit: "طالب",
      questions: [
        "أي مادة هي الأكثر تفضيلاً؟",
        "كم طالب يفضل مادة {category}؟",
        "ما مجموع الطلاب الذين يفضلون الرياضيات والعلوم؟",
        "أي مادة هي الأقل تفضيلاً؟"
      ]
    }
  ];

  const generateDataSet = () => {
    const topic = dataTopics[Math.floor(Math.random() * dataTopics.length)];
    const numCategories = level <= 2 ? 3 : level <= 4 ? 4 : 5;
    const selectedCategories = topic.categories.slice(0, numCategories);
    const selectedEmojis = topic.emojis.slice(0, numCategories);
    
    const data = selectedCategories.map((category, index) => {
      let value;
      if (level <= 2) {
        value = Math.floor(Math.random() * 8) + 2; // 2-9
      } else if (level <= 4) {
        value = Math.floor(Math.random() * 15) + 5; // 5-19
      } else {
        value = Math.floor(Math.random() * 25) + 10; // 10-34
      }
      
      return {
        category,
        emoji: selectedEmojis[index],
        value,
        color: graphColors.bars[index % graphColors.bars.length]
      };
    });

    // Generate mode-specific content
    if (gameMode === "create") {
      setCurrentData({
        ...topic,
        data,
        instruction: `ارسم الرسم البياني للبيانات التالية حول ${topic.topic}:`,
        mode: "create"
      });
      setUserGraph(new Array(data.length).fill(0));
    } else if (gameMode === "read") {
      const questionTemplate = topic.questions[Math.floor(Math.random() * topic.questions.length)];
      let question = questionTemplate;
      let correctAnswer;
      
      if (question.includes("{category}")) {
        const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
        question = question.replace("{category}", randomCategory);
        correctAnswer = data.find(d => d.category === randomCategory).value;
      } else if (question.includes("الأكثر")) {
        const maxData = data.reduce((max, curr) => curr.value > max.value ? curr : max);
        correctAnswer = maxData.category;
      } else if (question.includes("الأقل")) {
        const minData = data.reduce((min, curr) => curr.value < min.value ? curr : min);
        correctAnswer = minData.category;
      } else if (question.includes("مجموع")) {
        if (question.includes("التفاح والموز") || question.includes("الرياضيات والعلوم") || question.includes("الأحمر والأزرق")) {
          correctAnswer = data[0].value + data[1].value;
        } else if (question.includes("المجموع")) {
          correctAnswer = data.reduce((sum, d) => sum + d.value, 0);
        }
      } else if (question.includes("الفرق")) {
        correctAnswer = Math.abs(data[0].value - data[1].value);
      }

      setCurrentData({
        ...topic,
        data,
        question,
        correctAnswer,
        mode: "read"
      });
    } else if (gameMode === "analyze") {
      const analysisQuestions = [
        {
          question: "ما هو أعلى قيمة في البيانات؟",
          answer: Math.max(...data.map(d => d.value))
        },
        {
          question: "ما هو أقل قيمة في البيانات؟", 
          answer: Math.min(...data.map(d => d.value))
        },
        {
          question: "ما هو مجموع جميع القيم؟",
          answer: data.reduce((sum, d) => sum + d.value, 0)
        },
        {
          question: "كم عدد الفئات في البيانات؟",
          answer: data.length
        }
      ];
      
      const randomQuestion = analysisQuestions[Math.floor(Math.random() * analysisQuestions.length)];
      
      setCurrentData({
        ...topic,
        data,
        question: randomQuestion.question,
        correctAnswer: randomQuestion.answer,
        mode: "analyze"
      });
    }

    setSelectedAnswer("");
    setShowResult(false);
    setIsDrawingComplete(false);
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentData) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = graphColors.background;
    ctx.fillRect(0, 0, width, height);

    // Graph dimensions
    const margin = 60;
    const graphWidth = width - 2 * margin;
    const graphHeight = height - 2 * margin;
    const graphX = margin;
    const graphY = margin;

    // Find max value for scaling
    const maxValue = Math.max(...currentData.data.map(d => d.value));
    const maxScale = Math.ceil(maxValue / 5) * 5; // Round up to nearest 5

    // Draw grid lines
    ctx.strokeStyle = graphColors.gridLines;
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = graphY + graphHeight - (i * graphHeight / 5);
      ctx.beginPath();
      ctx.moveTo(graphX, y);
      ctx.lineTo(graphX + graphWidth, y);
      ctx.stroke();
      
      // Y-axis labels
      ctx.fillStyle = graphColors.text;
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText((i * maxScale / 5).toString(), graphX - 10, y);
    }

    // Draw axes
    ctx.strokeStyle = graphColors.axisLines;
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(graphX, graphY);
    ctx.lineTo(graphX, graphY + graphHeight);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphHeight);
    ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
    ctx.stroke();

    // Draw bars
    const barWidth = graphWidth / (currentData.data.length * 1.5);
    const barSpacing = barWidth * 0.5;

    currentData.data.forEach((item, index) => {
      const barX = graphX + index * (barWidth + barSpacing) + barSpacing;
      let barHeight;
      
      if (currentData.mode === "create") {
        // Use user-drawn height
        barHeight = (userGraph[index] / maxScale) * graphHeight;
      } else {
        // Use actual data
        barHeight = (item.value / maxScale) * graphHeight;
      }
      
      const barY = graphY + graphHeight - barHeight;

      // Draw bar
      ctx.fillStyle = item.color;
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Draw bar outline
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Draw category label
      ctx.fillStyle = graphColors.text;
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(item.category, barX + barWidth / 2, graphY + graphHeight + 10);
      
      // Draw emoji
      ctx.font = "16px Arial";
      ctx.fillText(item.emoji, barX + barWidth / 2, graphY + graphHeight + 30);
      
      // Draw value on top of bar
      if (barHeight > 20) {
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.textBaseline = "middle";
        const displayValue = currentData.mode === "create" ? userGraph[index] : item.value;
        ctx.fillText(displayValue.toString(), barX + barWidth / 2, barY + barHeight / 2);
      }
    });

    // Draw title
    ctx.fillStyle = graphColors.text;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(currentData.topic, width / 2, 30);

    // Draw Y-axis label
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`عدد ${currentData.unit}`, 0, 0);
    ctx.restore();
  };

  const handleBarClick = (event) => {
    if (currentData?.mode !== "create" || showResult) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    // Graph dimensions
    const margin = 60;
    const graphWidth = canvas.width - 2 * margin;
    const graphHeight = canvas.height - 2 * margin;
    const graphX = margin;
    const graphY = margin;

    // Check if click is within graph area
    if (canvasX < graphX || canvasX > graphX + graphWidth || 
        canvasY < graphY || canvasY > graphY + graphHeight) return;

    // Determine which bar was clicked
    const barWidth = graphWidth / (currentData.data.length * 1.5);
    const barSpacing = barWidth * 0.5;
    
    for (let i = 0; i < currentData.data.length; i++) {
      const barX = graphX + i * (barWidth + barSpacing) + barSpacing;
      
      if (canvasX >= barX && canvasX <= barX + barWidth) {
        // Calculate new height based on click position
        const maxValue = Math.max(...currentData.data.map(d => d.value));
        const maxScale = Math.ceil(maxValue / 5) * 5;
        const relativeY = canvasY - graphY;
        const newValue = Math.round((1 - relativeY / graphHeight) * maxScale);
        const clampedValue = Math.max(0, Math.min(maxScale, newValue));
        
        const newGraph = [...userGraph];
        newGraph[i] = clampedValue;
        setUserGraph(newGraph);
        
        playSfx("click");
        break;
      }
    }
  };

  const checkAnswer = () => {
    if (currentData.mode === "create") {
      // Check if user graph matches data
      const correct = userGraph.every((value, index) => value === currentData.data[index].value);
      setIsCorrect(correct);
      setIsDrawingComplete(true);
    } else {
      // Check selected answer
      const userValue = parseInt(selectedAnswer) || selectedAnswer;
      const correct = userValue === currentData.correctAnswer;
      setIsCorrect(correct);
    }

    setShowResult(true);

    if (isCorrect) {
      playSfx("correct");
      let points = level * 3 + (streak >= 3 ? 5 : 2);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      playSfx("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        generateDataSet();
      }
    }, 3000);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setSelectedAnswer("");
    setUserGraph([]);
    setCurrentData(null);
    setIsDrawingComplete(false);
    generateDataSet();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - رسوم بيانية بسيطة",
      2: "مبتدئ متقدم - قراءة البيانات",
      3: "متوسط - تحليل الرسوم البيانية",
      4: "متوسط متقدم - بيانات أكثر تعقيداً",
      5: "متقدم - تحليل وإنشاء متقدم",
    };
    return descriptions[level] || `متقدم - المستوى ${level}`;
  };

  const getHint = () => {
    const hints = {
      create: "انقر على الأعمدة لضبط ارتفاعها حسب القيم المطلوبة",
      read: "انظر إلى ارتفاع الأعمدة لمعرفة القيم",
      analyze: "احسب من البيانات المعروضة في الرسم البياني"
    };
    
    return hints[currentData?.mode] || "استخدم الرسم البياني للإجابة على السؤال";
  };

  const generateAnswerChoices = () => {
    if (!currentData || currentData.mode === "create") return [];
    
    const correct = currentData.correctAnswer;
    const choices = [correct];
    
    // Generate wrong choices
    while (choices.length < 4) {
      let wrong;
      if (typeof correct === "number") {
        wrong = Math.max(1, correct + Math.floor(Math.random() * 10) - 5);
      } else {
        // For category answers, use other categories
        const otherCategories = currentData.data
          .map(d => d.category)
          .filter(cat => cat !== correct);
        wrong = otherCategories[Math.floor(Math.random() * otherCategories.length)];
      }
      
      if (!choices.includes(wrong)) {
        choices.push(wrong);
      }
    }
    
    return choices.sort(() => Math.random() - 0.5);
  };

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 35 === 0 && level < 6) {
      setLevel(prev => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 600;
      canvas.height = 400;
      drawGraph();
    }
  }, [currentData, userGraph]);

  // Initialize first dataset
  useEffect(() => {
    generateDataSet();
  }, [gameMode, level]);

  const isGameComplete = currentQuestionIndex >= totalQuestions;

  return (
    <Box
      sx={{
        maxWidth: 1000,
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
        sx={{ color: graphColors.primary, fontWeight: "bold" }}
      >
        📊 صانع الرسوم البيانية
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
          نوع التمرين:
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
          <ToggleButton value="create">
            🎨 إنشاء رسم بياني
          </ToggleButton>
          <ToggleButton value="read">
            📖 قراءة البيانات
          </ToggleButton>
          <ToggleButton value="analyze">
            🔍 تحليل البيانات
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {!isGameComplete && currentData && (
        <>
          {/* Question/Instruction Display */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
              {currentData.mode === "create" ? currentData.instruction : currentData.question}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                💡 {getHint()}
              </Alert>
            </Box>

            {/* Data Table for Create Mode */}
            {currentData.mode === "create" && (
              <TableContainer component={Paper} sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">الفئة</TableCell>
                      <TableCell align="center">العدد</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentData.data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell align="center">
                          {item.emoji} {item.category}
                        </TableCell>
                        <TableCell align="center">{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              onClick={handleBarClick}
              style={{
                width: "100%",
                maxWidth: "600px",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
                cursor: currentData.mode === "create" ? "pointer" : "default",
              }}
            />

            {/* Answer Input for Read/Analyze Modes */}
            {currentData.mode !== "create" && !showResult && (
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h6">الإجابة:</Typography>
                
                <Grid container spacing={1} justifyContent="center" sx={{ maxWidth: 400 }}>
                  {generateAnswerChoices().map((choice, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Button
                        variant={selectedAnswer === choice ? "contained" : "outlined"}
                        onClick={() => setSelectedAnswer(choice)}
                        sx={{ minWidth: 80, fontSize: "0.9rem" }}
                      >
                        {choice}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Check Answer Button */}
            {!showResult && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={checkAnswer}
                  disabled={
                    currentData.mode === "create" 
                      ? userGraph.every(val => val === 0)
                      : !selectedAnswer
                  }
                  sx={{ fontSize: "1.1rem", px: 4 }}
                >
                  {currentData.mode === "create" ? "تحقق من الرسم" : "تحقق"}
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
                : `❌ إجابة خاطئة. الإجابة الصحيحة: ${currentData.correctAnswer}`}
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
            🏆 تهانينا! لقد أنهيت لعبة صانع الرسوم البيانية!
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

        {currentData && !isGameComplete && (
          <Button
            variant="outlined"
            onClick={generateDataSet}
            size="large"
          >
            بيانات جديدة
          </Button>
        )}
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          📚 تعلم الرسوم البيانية
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📊 <strong>الرسم البياني:</strong> طريقة لعرض البيانات بصرياً
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📏 <strong>المحور الرأسي:</strong> يظهر القيم والأرقام
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📐 <strong>المحور الأفقي:</strong> يظهر الفئات أو المجموعات
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔍 <strong>قراءة البيانات:</strong> انظر لارتفاع الأعمدة لمعرفة القيم
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 نصيحة: الرسوم البيانية تساعدنا على فهم البيانات ومقارنتها بسهولة!
        </Typography>
      </Box>
    </Box>
  );
};

export default GraphMaker;
