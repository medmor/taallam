"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Grid,
  Container,
  Chip,
} from "@mui/material";
import { preloadSfx, playSfx } from "@/lib/sfx";
import Timer from "@/components/Timer";

export default function ShapeClassifier() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalShapes, setTotalShapes] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState(null);
  const [shapesPerLevel] = useState(10);
  const [availableShapes, setAvailableShapes] = useState([]);

  // Shape definitions with properties
  const shapes = [
    {
      id: "triangle",
      name: "مثلث",
      sides: 3,
      angles: 3,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="40,10 10,70 70,70"
            fill="#e74c3c"
            stroke="#c0392b"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "square",
      name: "مربع",
      sides: 4,
      angles: 4,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <rect
            x="15"
            y="15"
            width="50"
            height="50"
            fill="#3498db"
            stroke="#2980b9"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "rectangle",
      name: "مستطيل",
      sides: 4,
      angles: 4,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <rect
            x="10"
            y="25"
            width="60"
            height="30"
            fill="#9b59b6"
            stroke="#8e44ad"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "pentagon",
      name: "خماسي",
      sides: 5,
      angles: 5,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="40,10 65,30 55,60 25,60 15,30"
            fill="#f39c12"
            stroke="#e67e22"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "hexagon",
      name: "سداسي",
      sides: 6,
      angles: 6,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="40,10 60,25 60,55 40,70 20,55 20,25"
            fill="#2ecc71"
            stroke="#27ae60"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "circle",
      name: "دائرة",
      sides: 0,
      angles: 0,
      type: "curve",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="#e67e22"
            stroke="#d35400"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "oval",
      name: "بيضاوي",
      sides: 0,
      angles: 0,
      type: "curve",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <ellipse
            cx="40"
            cy="40"
            rx="35"
            ry="20"
            fill="#1abc9c"
            stroke="#16a085"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "diamond",
      name: "معين",
      sides: 4,
      angles: 4,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="40,10 70,40 40,70 10,40"
            fill="#f1c40f"
            stroke="#f39c12"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "star",
      name: "نجمة",
      sides: 10,
      angles: 10,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="40,10 47,32 70,32 51,46 58,68 40,55 22,68 29,46 10,32 33,32"
            fill="#ffd700"
            stroke="#bfa600"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "heart",
      name: "قلب",
      sides: 0,
      angles: 0,
      type: "curve",
      svg: (
        <svg width="80px" height="80px" viewBox="0 0 80 80">
          <svg width="80" height="80" viewBox="0 0 24 24">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
           2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
           C13.09 3.81 14.76 3 16.5 3
           19.58 3 22 5.42 22 8.5
           c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#e74c3c"
              stroke="#c62828"
              strokeWidth="0.5"
            />
          </svg>
        </svg>
      ),
    },
    {
      id: "parallelogram",
      name: "متوازي الأضلاع",
      sides: 4,
      angles: 4,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="20,60 60,60 70,20 30,20"
            fill="#8d6e63"
            stroke="#5d4037"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "trapezoid",
      name: "شبه المنحرف",
      sides: 4,
      angles: 4,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="20,60 60,60 50,20 30,20"
            fill="#ba68c8"
            stroke="#6a1b9a"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "crescent",
      name: "هلال",
      sides: 0,
      angles: 0,
      type: "curve",
      svg: (
        <svg
          width="80"
          height="80"
          viewBox="0 -1 17 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.7066 0.00274765C7.50391 -0.0027381 7.31797 0.114737 7.23588 0.300147C7.15379 0.485558 7.19181 0.702186 7.33213 0.848565C8.36577 1.92686 9.00015 3.3888 9.00015 4.99996C9.00015 8.31366 6.31385 11 3.00015 11C2.5757 11 2.16207 10.956 1.76339 10.8725C1.56489 10.8309 1.36094 10.9133 1.2471 11.0812C1.13325 11.249 1.13207 11.469 1.2441 11.638C2.58602 13.663 4.88682 15 7.50012 15C11.6423 15 15.0001 11.6421 15.0001 7.49996C15.0001 3.42688 11.7534 0.112271 7.7066 0.00274765Z"
            fill="#fff176"
            stroke="#fbc02d"
            strokeWidth="0.5"
          />
        </svg>
      ),
    },
    {
      id: "arrow",
      name: "سهم",
      sides: 7,
      angles: 7,
      type: "polygon",
      svg: (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="40,10 70,40 55,40 55,70 25,70 25,40 10,40"
            fill="#64b5f6"
            stroke="#1976d2"
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ];

  // Classification criteria for different levels
  const criteria = [
    {
      level: 1,
      name: "عدد الأضلاع",
      description: "صنف الأشكال حسب عدد الأضلاع",
      categories: [
        {
          name: "3 أضلاع",
          test: (shape) => shape.sides === 3,
          color: "#e74c3c",
        },
        {
          name: "4 أضلاع",
          test: (shape) => shape.sides === 4,
          color: "#3498db",
        },
        {
          name: "أكثر من 4",
          test: (shape) => shape.sides > 4,
          color: "#2ecc71",
        },
        {
          name: "بدون أضلاع",
          test: (shape) => shape.sides === 0,
          color: "#f39c12",
        },
      ],
    },
    {
      level: 2,
      name: "نوع الشكل",
      description: "صنف الأشكال حسب النوع",
      categories: [
        {
          name: "مضلع",
          test: (shape) => shape.type === "polygon",
          color: "#9b59b6",
        },
        {
          name: "منحني",
          test: (shape) => shape.type === "curve",
          color: "#e67e22",
        },
      ],
    },
    {
      level: 3,
      name: "عدد الزوايا",
      description: "صنف الأشكال حسب عدد الزوايا",
      categories: [
        {
          name: "3 زوايا",
          test: (shape) => shape.angles === 3,
          color: "#e74c3c",
        },
        {
          name: "4 زوايا",
          test: (shape) => shape.angles === 4,
          color: "#3498db",
        },
        {
          name: "5+ زوايا",
          test: (shape) => shape.angles >= 5,
          color: "#2ecc71",
        },
        {
          name: "بدون زوايا",
          test: (shape) => shape.angles === 0,
          color: "#f39c12",
        },
      ],
    },
  ];

  useEffect(() => {
    try {
      preloadSfx();
    } catch (e) {}
  }, []);

  // Generate shapes for current level
  const generateLevelShapes = () => {
    const shuffledShapes = [...shapes].sort(() => Math.random() - 0.5);
    return shuffledShapes.slice(0, Math.min(shapesPerLevel, shapes.length));
  };

  // Start new game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTotalShapes(0);
    setCurrentLevel(1);
    setGameComplete(false);
    setFeedback("");
    setIsCorrect(null);
    setTimerActive(true);

    // Set initial criteria and shapes
    const levelCriteria = criteria.find((c) => c.level === 1);
    setCurrentCriteria(levelCriteria);
    setAvailableShapes(generateLevelShapes());
    setCurrentShape(generateLevelShapes()[0]);
  };

  // Get next shape
  const getNextShape = () => {
    if (availableShapes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableShapes.length);
    return availableShapes[randomIndex];
  };

  // Handle shape classification
  const classifyShape = (categoryIndex) => {
    if (!currentShape || !currentCriteria) return;

    const category = currentCriteria.categories[categoryIndex];
    const isShapeCorrect = category.test(currentShape);

    setIsCorrect(isShapeCorrect);

    if (isShapeCorrect) {
      setScore((prev) => prev + 1);
      setFeedback(`ممتاز! ${currentShape.name} ينتمي إلى "${category.name}"`);
      try {
        playSfx("correct");
      } catch (e) {}
    } else {
      const correctCategory = currentCriteria.categories.find((cat) =>
        cat.test(currentShape)
      );
      setFeedback(
        `خطأ! ${currentShape.name} ينتمي إلى "${
          correctCategory?.name || "فئة أخرى"
        }"`
      );
      try {
        playSfx("wrong");
      } catch (e) {}
    }

    const newTotalShapes = totalShapes + 1;
    setTotalShapes(newTotalShapes);

    // Check if level is complete
    if (newTotalShapes >= shapesPerLevel) {
      if (currentLevel >= criteria.length) {
        // Game complete
        setGameComplete(true);
        setTimerActive(false);
        setFeedback(
          `مبروك! أكملت جميع المستويات بنجاح! النتيجة النهائية: ${
            score + (isShapeCorrect ? 1 : 0)
          }/${shapesPerLevel * criteria.length}`
        );
        try {
          playSfx("win");
        } catch (e) {}
      } else {
        // Next level
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);
        setTotalShapes(0);
        const nextCriteria = criteria.find((c) => c.level === nextLevel);
        setCurrentCriteria(nextCriteria);
        setAvailableShapes(generateLevelShapes());
        setFeedback(
          `أحسنت! انتقلت للمستوى ${nextLevel}: ${nextCriteria?.name}`
        );
        setTimeout(() => {
          setCurrentShape(getNextShape());
          setFeedback("");
          setIsCorrect(null);
        }, 2000);
      }
    } else {
      // Next shape in same level
      setTimeout(() => {
        setCurrentShape(getNextShape());
        setFeedback("");
        setIsCorrect(null);
      }, 1500);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{ p: { xs: 1, sm: 4 }, m: 2, borderRadius: { xs: 1, sm: 3 } }}
      >
        {!gameStarted ? (
          <>
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
            >
              لعبة تصنيف الأشكال
            </Typography>

            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 3, color: "text.secondary" }}
            >
              صنف الأشكال حسب خصائصها المختلفة
            </Typography>

            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={startGame}
                sx={{ fontSize: "1.2rem", py: 2, px: 6, borderRadius: 3 }}
              >
                ابدأ اللعب
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Game Stats */}
            <Paper
              elevation={2}
              sx={{
                p: 1,
                mb: 1,
                textAlign: "center",
                backgroundColor: "background.default",
              }}
            >
              <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6">
                    المستوى: {currentLevel}/{criteria.length}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="h6">النتيجة: {score}</Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="h6">
                    الشكل: {totalShapes + 1}/{shapesPerLevel}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="h6">الوقت</Typography>
                  <Timer active={timerActive} />
                </Grid>
              </Grid>

              {currentCriteria && (
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {currentCriteria.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                  ></Typography>
                </Box>
              )}

              {feedback && (
                <Alert
                  severity={
                    gameComplete ? "success" : isCorrect ? "success" : "error"
                  }
                  sx={{ mt: 2, fontSize: "1.1rem", borderRadius: 2 }}
                >
                  {feedback}
                </Alert>
              )}
            </Paper>

            {!gameComplete && currentShape && currentCriteria && (
              <>
                {/* Current Shape Display */}
                <Paper elevation={2} sx={{ p: 1, mb: 1, textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {currentShape.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                    >
                      {currentShape.svg}
                    </Box>
                  </Box>
                </Paper>

                {/* Classification Categories */}
                <Paper elevation={2} sx={{ p: 1, mb: 1 }}>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    اختر الفئة المناسبة:
                  </Typography>

                  <Grid container spacing={2} justifyContent="center">
                    {currentCriteria.categories.map((category, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => classifyShape(index)}
                          disabled={isCorrect !== null}
                          sx={{
                            width: "100%",
                            borderColor: category.color,
                            color: category.color,
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            padding: 1,
                            borderRadius: 3,
                            "&:hover": {
                              backgroundColor: category.color,
                              color: "white",
                            },
                          }}
                        >
                          {category.name}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </>
            )}

            {/* Control Buttons */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={startGame}
                sx={{ mr: 2, borderRadius: 2 }}
              >
                لعبة جديدة
              </Button>
              <Button
                variant="outlined"
                onClick={() => setGameStarted(false)}
                sx={{ borderRadius: 2 }}
              >
                إنهاء اللعبة
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
