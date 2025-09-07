"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { games, gameCategories, learningCategories } from "@/lib/data";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Badge,
  Fade,
  CircularProgress,
} from "@mui/material";

// Dynamic imports for all game components with loading states
const gameComponents = {
  "sliding-puzzle": dynamic(() => import("@/components/SlidingPuzzle"), {
    loading: () => <CircularProgress />,
  }),
  "matching-cards": dynamic(() => import("@/components/MatchingGame"), {
    loading: () => <CircularProgress />,
  }),
  "sound-matching": dynamic(() => import("@/components/SoundMatching"), {
    loading: () => <CircularProgress />,
  }),
  "drag-labeling": dynamic(() => import("@/components/DragLabeling"), {
    loading: () => <CircularProgress />,
  }),
  "sequence-builder": dynamic(() => import("@/components/SequenceBuilder"), {
    loading: () => <CircularProgress />,
  }),
  "puzzle-assembly": dynamic(() => import("@/components/PuzzleAssembly"), {
    loading: () => <CircularProgress />,
  }),
  "addition-game": dynamic(() => import("@/components/AdditionGame"), {
    loading: () => <CircularProgress />,
  }),
  "multiplication-game": dynamic(() => import("@/components/MultiplicationGame"), {
    loading: () => <CircularProgress />,
  }),
  "number-line-jump": dynamic(() => import("@/components/NumberLineJump"), {
    loading: () => <CircularProgress />,
  }),
  "math-bingo": dynamic(() => import("@/components/MathBingo"), {
    loading: () => <CircularProgress />,
  }),
  "equation-balance": dynamic(() => import("@/components/EquationBalance"), {
    loading: () => <CircularProgress />,
  }),
  "missing-number-game": dynamic(() => import("@/components/MissingNumberGame"), {
    loading: () => <CircularProgress />,
  }),
  "shape-builder": dynamic(() => import("@/components/ShapeBuilder"), {
    loading: () => <CircularProgress />,
  }),
  "shape-classifier": dynamic(() => import("@/components/ShapeClassifier"), {
    loading: () => <CircularProgress />,
  }),
  "area-calculator": dynamic(() => import("@/components/AreaCalculator"), {
    loading: () => <CircularProgress />,
  }),
  "angle-hunter": dynamic(() => import("@/components/AngleHunter"), {
    loading: () => <CircularProgress />,
  }),
  "pizza-fractions": dynamic(() => import("@/components/PizzaFractions"), {
    loading: () => <CircularProgress />,
  }),
  "fraction-comparison": dynamic(() => import("@/components/FractionComparison"), {
    loading: () => <CircularProgress />,
  }),
  "decimal-race": dynamic(() => import("@/components/DecimalRace"), {
    loading: () => <CircularProgress />,
  }),
  "pattern-maker": dynamic(() => import("@/components/PatternMaker"), {
    loading: () => <CircularProgress />,
  }),
  "number-pyramid": dynamic(() => import("@/components/NumberPyramid"), {
    loading: () => <CircularProgress />,
  }),
  "math-sudoku": dynamic(() => import("@/components/MathSudoku"), {
    loading: () => <CircularProgress />,
  }),
  "cash-register": dynamic(() => import("@/components/CashRegister"), {
    loading: () => <CircularProgress />,
  }),
  "unit-converter": dynamic(() => import("@/components/UnitConverter"), {
    loading: () => <CircularProgress />,
  }),
  "time-teacher": dynamic(() => import("@/components/TimeTeacher"), {
    loading: () => <CircularProgress />,
  }),
  "story-math": dynamic(() => import("@/components/StoryMath"), {
    loading: () => <CircularProgress />,
  }),
  "graph-maker": dynamic(() => import("@/components/GraphMaker"), {
    loading: () => <CircularProgress />,
  }),
};

// Game-specific props configuration
const getGameProps = (gameId) => {
  switch (gameId) {
    case "matching-cards":
      return { size: 4, type: "numbers" };
    case "sound-matching":
      return {
        items: learningCategories?.[0]?.items || [],
        count: 4,
        language: "ar"
      };
    case "drag-labeling":
      return {
        items: learningCategories?.[0]?.items || [],
        level: 1
      };
    case "sequence-builder":
      return { initialLength: 3 };
    default:
      return {};
  }
};

// Main component that uses useSearchParams
const GamesPageContent = () => {
  const [selected, setSelected] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (
      categoryFromUrl &&
      gameCategories.find((cat) => cat.id === categoryFromUrl)
    ) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Filter games based on selected category
  const filteredGames =
    selectedCategory === "all"
      ? games
      : games.filter((game) => game.category === selectedCategory);

  // Update URL when category changes
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    const params = new URLSearchParams(searchParams);
    if (newCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }
    router.replace(`/games?${params.toString()}`);
  };

  // Get category data for current selection
  const getCurrentCategory = () => {
    return (
      gameCategories.find((cat) => cat.id === selectedCategory) ||
      gameCategories[0]
    );
  };

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      {!selected && (
        <>
          {/* Category Selector */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: "bold",
                background: "linear-gradient(45deg, #2196F3, #21CBF3)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🎮 الألعاب التعليمية
            </Typography>

            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: "#f8f9fa",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
                اختر نوع اللعبة:
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                {gameCategories.map((category) => {
                  const gamesInCategory =
                    category.id === "all"
                      ? games.length
                      : games.filter((game) => game.category === category.id)
                          .length;

                  return (
                    <Chip
                      key={category.id}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>{category.emoji}</span>
                          <span>{category.name}</span>
                          <Badge
                            badgeContent={gamesInCategory}
                            color="primary"
                            sx={{ mx: 1 }}
                          />
                        </Box>
                      }
                      onClick={() => handleCategoryChange(category.id)}
                      variant={
                        selectedCategory === category.id ? "filled" : "outlined"
                      }
                      sx={{
                        fontSize: "0.9rem",
                        height: 40,
                        backgroundColor:
                          selectedCategory === category.id
                            ? category.color
                            : "transparent",
                        color:
                          selectedCategory === category.id
                            ? "white"
                            : category.color,
                        borderColor: category.color,
                        "&:hover": {
                          backgroundColor: category.color,
                          color: "white",
                        },
                        transition: "all 0.3s ease",
                      }}
                    />
                  );
                })}
              </Box>
            </Paper>

            {/* Category Description */}
            <Fade in={true} timeout={500}>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: getCurrentCategory().color,
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  {getCurrentCategory().emoji} {getCurrentCategory().name}
                </Typography>
                <Typography variant="body1" sx={{ color: "#666" }}>
                  {filteredGames.length} {filteredGames.length === 1 ? "لعبة" : "ألعاب"} متاحة في هذه الفئة
                </Typography>
              </Box>
            </Fade>
          </Box>

          {/* Games Grid */}
          <Fade in={true} timeout={700}>
            <Grid container spacing={3} justifyContent="center">
              {filteredGames.map((game, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
                  <Fade in={true} timeout={300 + index * 100}>
                    <Paper
                      onClick={() => setSelected(game.id)}
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        alignItems: "center",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px) scale(1.02)",
                          boxShadow: 8,
                        },
                        cursor: "pointer",
                        borderRadius: 3,
                        height: "100%",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Category Badge */}
                      <Chip
                        size="small"
                        label={
                          gameCategories.find((cat) => cat.id === game.category)
                            ?.emoji
                        }
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: getCurrentCategory().color,
                          color: "white",
                        }}
                      />

                      <Box
                        component="img"
                        src={"/images/games/" + game.id + ".png"}
                        alt={game.name}
                        sx={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 2,
                          transition: "transform 0.3s ease",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                      />

                      <Box sx={{ flex: 1, width: "100%" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            mb: 1,
                          }}
                        >
                          {game.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 2,
                            color: "#666",
                            lineHeight: 1.4,
                          }}
                        >
                          {game.description}
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(game.id);
                          }}
                          sx={{
                            mt: "auto",
                            backgroundColor: getCurrentCategory().color,
                            "&:hover": {
                              backgroundColor: getCurrentCategory().color,
                              filter: "brightness(0.9)",
                            },
                            transition: "all 0.2s ease",
                            "&:active": { transform: "scale(0.98)" },
                          }}
                        >
                          العب الآن
                        </Button>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Fade>
        </>
      )}

      {selected && (
        <div style={{ textAlign: "center" }}>
          <Button
            variant="outlined"
            color="secondary"
            endIcon={<span style={{ fontSize: 22, marginRight: 8 }}>←</span>}
            sx={{
              mb: 2,
              fontWeight: "bold",
              fontSize: 18,
            }}
            onClick={() => setSelected(null)}
          >
            العودة للألعاب
          </Button>
        </div>
      )}

      {/* Dynamic Game Rendering */}
      {selected && gameComponents[selected] && (
        <Suspense 
          fallback={
            <Box 
              sx={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                minHeight: "400px",
                flexDirection: "column",
                gap: 2
              }}
            >
              <CircularProgress size={60} />
              <Typography variant="h6" color="primary">
                جاري تحميل اللعبة...
              </Typography>
            </Box>
          }
        >
          {React.createElement(gameComponents[selected], getGameProps(selected))}
        </Suspense>
      )}
    </Box>
  );
};

// Wrapper component with Suspense boundary
const GamesPage = () => {
  return (
    <Suspense 
      fallback={
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            minHeight: "400px",
            flexDirection: "column",
            gap: 2
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="primary">
            جاري تحميل صفحة الألعاب...
          </Typography>
        </Box>
      }
    >
      <GamesPageContent />
    </Suspense>
  );
};

export default GamesPage;
