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
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const CashRegister = () => {
  const canvasRef = useRef(null);
  const [gameMode, setGameMode] = useState("counting"); // 'counting', 'change', 'purchase'
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [userAmount, setUserAmount] = useState(0);
  const [selectedCoins, setSelectedCoins] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(8);

  const registerColors = {
    background: "#f8f9fa",
    primary: "#2196f3",
    secondary: "#4caf50",
    accent: "#ff9800",
    correct: "#4caf50",
    incorrect: "#f44336",
    money: "#ffd700",
    coinSilver: "#c0c0c0",
    coinGold: "#ffd700",
    bill: "#90ee90",
  };

  // Currency denominations (in centimes - 1 Dirham = 100 Centimes)
  const denominations = [
    { value: 1, type: "coin", name: "سنتيم", color: "#cd7f32" },
    { value: 5, type: "coin", name: "5 سنتيم", color: "#c0c0c0" },
    { value: 10, type: "coin", name: "10 سنتيم", color: "#c0c0c0" },
    { value: 20, type: "coin", name: "20 سنتيم", color: "#c0c0c0" },
    { value: 50, type: "coin", name: "50 سنتيم", color: "#ffd700" },
    { value: 100, type: "bill", name: "درهم واحد", color: "#90ee90" },
    { value: 500, type: "bill", name: "5 دراهم", color: "#87ceeb" },
    { value: 1000, type: "bill", name: "10 دراهم", color: "#dda0dd" },
    { value: 2000, type: "bill", name: "20 درهم", color: "#ffa07a" },
    { value: 5000, type: "bill", name: "50 درهم", color: "#da70d6" },
  ];

  const items = [
    { name: "تفاحة", price: 150, emoji: "🍎" },
    { name: "موزة", price: 75, emoji: "🍌" },
    { name: "خبز", price: 200, emoji: "🍞" },
    { name: "حليب", price: 350, emoji: "🥛" },
    { name: "بسكويت", price: 125, emoji: "🍪" },
    { name: "عصير", price: 250, emoji: "🧃" },
    { name: "شوكولاتة", price: 300, emoji: "🍫" },
    { name: "آيس كريم", price: 400, emoji: "🍦" },
    { name: "كيك", price: 500, emoji: "🍰" },
    { name: "دونت", price: 175, emoji: "🍩" },
  ];

  const generateQuestion = () => {
    const modes = level <= 2 ? ["counting"] : level <= 4 ? ["counting", "purchase"] : ["counting", "purchase", "change"];
    const selectedMode = modes[Math.floor(Math.random() * modes.length)];
    setGameMode(selectedMode);

    if (selectedMode === "counting") {
      generateCountingQuestion();
    } else if (selectedMode === "purchase") {
      generatePurchaseQuestion();
    } else {
      generateChangeQuestion();
    }

    setUserAmount(0);
    setSelectedCoins({});
    setShowResult(false);
  };

  const generateCountingQuestion = () => {
    // Generate random amounts using different denominations
    const targetAmount = Math.floor(Math.random() * (level * 400)) + 50; // 50 to level*400 centimes
    
    setCurrentPurchase({
      type: "counting",
      targetAmount: targetAmount,
      description: `عد المبلغ المطلوب: ${formatMoney(targetAmount)}`,
    });
  };

  const generatePurchaseQuestion = () => {
    const item = items[Math.floor(Math.random() * items.length)];
    const priceAdjustment = level > 2 ? Math.floor(Math.random() * 100) : 0;
    const finalPrice = item.price + priceAdjustment;

    setCurrentPurchase({
      type: "purchase",
      item: item,
      price: finalPrice,
      description: `كم تحتاج لشراء ${item.name}؟`,
      emoji: item.emoji,
    });
  };

  const generateChangeQuestion = () => {
    const item = items[Math.floor(Math.random() * items.length)];
    const price = item.price;
    
    // Generate amount paid (always more than price)
    const possiblePayments = [500, 1000, 2000, 5000];
    const paidAmount = possiblePayments.find(amount => amount > price) || price + 500;
    const changeNeeded = paidAmount - price;

    setCurrentPurchase({
      type: "change",
      item: item,
      price: price,
      paidAmount: paidAmount,
      changeNeeded: changeNeeded,
      description: `احسب الباقي: دفع ${formatMoney(paidAmount)} مقابل ${item.name} (${formatMoney(price)})`,
      emoji: item.emoji,
    });
  };

  const formatMoney = (centimes) => {
    const dirhams = Math.floor(centimes / 100);
    const remainingCentimes = centimes % 100;
    
    if (dirhams === 0) {
      return `${remainingCentimes} سنتيم`;
    } else if (remainingCentimes === 0) {
      return `${dirhams} درهم`;
    } else {
      return `${dirhams} درهم و ${remainingCentimes} سنتيم`;
    }
  };

  const drawCashRegister = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPurchase) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = registerColors.background;
    ctx.fillRect(0, 0, width, height);

    // Draw cash register
    ctx.fillStyle = "#333";
    ctx.fillRect(50, 50, width - 100, height - 100);
    
    // Draw screen
    ctx.fillStyle = "#000";
    ctx.fillRect(70, 70, width - 140, 60);

    // Draw display amount
    ctx.fillStyle = "#00ff00";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatMoney(userAmount), width / 2, 100);

    // Draw item if it's a purchase/change question
    if (currentPurchase.emoji) {
      ctx.font = "60px Arial";
      ctx.fillText(currentPurchase.emoji, width / 2, height / 2);
      
      ctx.fillStyle = "#333";
      ctx.font = "bold 18px Arial";
      ctx.fillText(
        `${currentPurchase.item.name}: ${formatMoney(currentPurchase.price)}`,
        width / 2,
        height / 2 + 50
      );
    }

    // Draw target amount or change needed
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    let targetText = "";
    
    if (currentPurchase.type === "counting") {
      targetText = `الهدف: ${formatMoney(currentPurchase.targetAmount)}`;
    } else if (currentPurchase.type === "purchase") {
      targetText = `السعر: ${formatMoney(currentPurchase.price)}`;
    } else if (currentPurchase.type === "change") {
      targetText = `الباقي المطلوب: ${formatMoney(currentPurchase.changeNeeded)}`;
    }
    
    ctx.fillText(targetText, width / 2, height - 30);
  };

  const handleCoinClick = (denomination) => {
    if (showResult) return;

    const newSelected = { ...selectedCoins };
    newSelected[denomination.value] = (newSelected[denomination.value] || 0) + 1;
    setSelectedCoins(newSelected);

    const newAmount = userAmount + denomination.value;
    setUserAmount(newAmount);

    playSfx("click");
  };

  const handleCoinRemove = (denomination) => {
    if (showResult) return;
    if (!selectedCoins[denomination.value] || selectedCoins[denomination.value] === 0) return;

    const newSelected = { ...selectedCoins };
    newSelected[denomination.value] = newSelected[denomination.value] - 1;
    if (newSelected[denomination.value] === 0) {
      delete newSelected[denomination.value];
    }
    setSelectedCoins(newSelected);

    const newAmount = userAmount - denomination.value;
    setUserAmount(Math.max(0, newAmount));

    playSfx("click");
  };

  const clearAmount = () => {
    setUserAmount(0);
    setSelectedCoins({});
    playSfx("click");
  };

  const checkAnswer = () => {
    if (showResult) return;

    let correct = false;
    let targetAmount = 0;

    if (currentPurchase.type === "counting") {
      targetAmount = currentPurchase.targetAmount;
      correct = userAmount === targetAmount;
    } else if (currentPurchase.type === "purchase") {
      targetAmount = currentPurchase.price;
      correct = userAmount >= targetAmount; // Can pay exact or more
    } else if (currentPurchase.type === "change") {
      targetAmount = currentPurchase.changeNeeded;
      correct = userAmount === targetAmount;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSfx("correct");
      let points = level + (streak >= 3 ? 3 : 1);
      
      // Bonus for exact amount in purchase mode
      if (currentPurchase.type === "purchase" && userAmount === targetAmount) {
        points += 2;
      }
      
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
    setUserAmount(0);
    setSelectedCoins({});
    setCurrentPurchase(null);
    generateQuestion();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - عد النقود البسيط",
      2: "مبتدئ متقدم - عد النقود",
      3: "متوسط - عد النقود والشراء",
      4: "متوسط متقدم - عد والشراء",
      5: "متقدم - عد وشراء وحساب الباقي",
    };
    return descriptions[level] || `متقدم - المستوى ${level}`;
  };

  const getHint = () => {
    if (currentPurchase?.type === "counting") {
      return "استخدم العملات المختلفة للوصول للمبلغ المطلوب بالضبط";
    } else if (currentPurchase?.type === "purchase") {
      return "ادفع مبلغاً يساوي أو يزيد عن سعر السلعة";
    } else if (currentPurchase?.type === "change") {
      return "احسب الفرق بين المبلغ المدفوع وسعر السلعة";
    }
    return "استخدم العملات لتكوين المبلغ الصحيح";
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
    if (canvas) {
      canvas.width = 400;
      canvas.height = 250;
      drawCashRegister();
    }
  }, [currentPurchase, userAmount]);

  // Initialize first question
  useEffect(() => {
    generateQuestion();
  }, []);

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
        sx={{ color: registerColors.primary, fontWeight: "bold" }}
      >
        💰 صندوق النقود
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

      {!isGameComplete && currentPurchase && (
        <>
          {/* Question Display */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
              {currentPurchase.description}
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
                maxWidth: "400px",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "10px",
              }}
            />

            <Typography variant="h6" sx={{ mt: 2, color: registerColors.primary }}>
              المبلغ الحالي: {formatMoney(userAmount)}
            </Typography>
          </Paper>

          {/* Money Selection */}
          {!showResult && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                اختر العملات:
              </Typography>
              
              <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                {denominations.map((denom) => (
                  <Grid item key={denom.value}>
                    <Card 
                      sx={{ 
                        minWidth: 120, 
                        backgroundColor: denom.color,
                        cursor: "pointer",
                        "&:hover": { transform: "scale(1.05)" },
                        border: selectedCoins[denom.value] ? "3px solid #2196f3" : "1px solid #ddd"
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ color: "#333", fontWeight: "bold" }}>
                          {denom.type === "coin" ? "🪙" : "💵"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: "#333" }}>
                          {denom.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                          {formatMoney(denom.value)}
                        </Typography>
                        
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleCoinClick(denom)}
                            sx={{ minWidth: 30, px: 1 }}
                          >
                            +
                          </Button>
                          {selectedCoins[denom.value] > 0 && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleCoinRemove(denom)}
                              sx={{ minWidth: 30, px: 1 }}
                            >
                              -
                            </Button>
                          )}
                        </Box>
                        
                        {selectedCoins[denom.value] > 0 && (
                          <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold", color: "#2196f3" }}>
                            العدد: {selectedCoins[denom.value]}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={checkAnswer}
                  disabled={userAmount === 0}
                  sx={{ fontSize: "1.1rem", px: 4 }}
                >
                  تأكيد المبلغ
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={clearAmount}
                  sx={{ fontSize: "1.1rem", px: 3 }}
                >
                  مسح الكل
                </Button>
              </Box>
            </Paper>
          )}

          {/* Result Message */}
          {showResult && (
            <Alert
              severity={isCorrect ? "success" : "error"}
              sx={{ mb: 3, fontSize: "1.1rem" }}
            >
              {isCorrect
                ? "🎉 ممتاز! لقد عددت النقود بشكل صحيح!"
                : `❌ إجابة خاطئة. ${
                    currentPurchase.type === "counting" 
                      ? `المبلغ الصحيح: ${formatMoney(currentPurchase.targetAmount)}`
                      : currentPurchase.type === "purchase"
                      ? `تحتاج على الأقل: ${formatMoney(currentPurchase.price)}`
                      : `الباقي الصحيح: ${formatMoney(currentPurchase.changeNeeded)}`
                  }`}
              {isCorrect && streak >= 3 && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  🔥 متتالية رائعة! نقاط إضافية!
                </Typography>
              )}
              {isCorrect && currentPurchase.type === "purchase" && userAmount === currentPurchase.price && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  🎯 مبلغ مضبوط! نقاط إضافية!
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
            🏆 تهانينا! لقد أنهيت لعبة صندوق النقود!
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

        {currentPurchase && !isGameComplete && (
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
          📚 تعلم العد والنقود المغربية
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🪙 <strong>السنتيمات:</strong> 1، 5، 10، 20، 50 سنتيم
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          💵 <strong>الدراهم:</strong> 1، 5، 10، 20، 50 درهم (100 سنتيم = 1 درهم)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🛒 <strong>الشراء:</strong> تحتاج مبلغاً يساوي أو يزيد عن السعر
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          💰 <strong>حساب الباقي:</strong> المبلغ المدفوع - سعر السلعة = الباقي
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 نصيحة: استخدم العملات الكبيرة أولاً ثم الصغيرة لتوفير الوقت!
        </Typography>
      </Box>
    </Box>
  );
};

export default CashRegister;
