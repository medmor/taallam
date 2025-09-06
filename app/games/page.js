"use client";
import React, { useState } from "react";
import SlidingPuzzle from "@/components/SlidingPuzzle";
import MatchingGame from "@/components/MatchingGame";
import SoundMatching from "@/components/SoundMatching";
import DragLabeling from "@/components/DragLabeling";
import SequenceBuilder from "@/components/SequenceBuilder";
import PuzzleAssembly from "@/components/PuzzleAssembly";
import AdditionGame from "@/components/AdditionGame";
import MultiplicationGame from "@/components/MultiplicationGame";
import NumberLineJump from "@/components/NumberLineJump";
import MathBingo from "@/components/MathBingo";
import EquationBalance from "@/components/EquationBalance";
import MissingNumberGame from "@/components/MissingNumberGame";
import ShapeBuilder from "@/components/ShapeBuilder";
import ShapeClassifier from "@/components/ShapeClassifier";
import AreaCalculator from "@/components/AreaCalculator";
import AngleHunter from "@/components/AngleHunter";
import PizzaFractions from "@/components/PizzaFractions";
import FractionComparison from "@/components/FractionComparison";
import DecimalRace from "@/components/DecimalRace";
import PatternMaker from "@/components/PatternMaker";
import NumberPyramid from "@/components/NumberPyramid";
import MathSudoku from "@/components/MathSudoku";
import CashRegister from "@/components/CashRegister";
import { games, learningCategories } from "@/lib/data";
import { Box, Grid, Paper, Typography, Button } from "@mui/material";

const GamesPage = () => {
  const [selected, setSelected] = useState(null);
  return (
    <Box sx={{ width: "100%", py: 2 }}>
      {!selected && (
        <Grid container spacing={2} justifyContent="center">
          {games.map((g) => (
            <Grid item xs={12} sm={6} md={4} key={g.id}>
              <Paper
                onClick={() => setSelected(g.id)}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: "center",
                  textAlign: "center",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  "&:hover": {
                    transform: "translateY(-6px) scale(1.02)",
                    boxShadow: 6,
                  },
                  cursor: "pointer",
                  minWidth: 400,
                }}
              >
                <Box
                  component="img"
                  src={"/images/games/" + g.id + ".png"}
                  alt={g.name}
                  sx={{
                    minWidth: 300,
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 2,
                    transition: "transform 0.18s ease",
                    "&:hover": { transform: "scale(1.06)" },
                    mx: "auto",
                  }}
                />

                <div style={{ width: "100%" }}>
                  <Typography variant="h6">{g.name}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {g.description}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setSelected(g.id)}
                    sx={{
                      mt: 1,
                      transition: "transform 0.12s ease, box-shadow 0.12s",
                      "&:active": { transform: "scale(0.98)" },
                    }}
                  >
                    العب
                  </Button>
                </div>
              </Paper>
            </Grid>
          ))}
        </Grid>
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
          ></Button>
        </div>
      )}
      {selected === "sliding-puzzle" && (
        <div>
          <SlidingPuzzle />
        </div>
      )}
      {selected === "matching-cards" && (
        <div>
          <MatchingGame size={4} type="numbers" />
        </div>
      )}
      {selected === "sound-matching" && (
        <div>
          <SoundMatching
            items={
              (learningCategories &&
                learningCategories[0] &&
                learningCategories[0].items) ||
              []
            }
            count={4}
            language="ar"
          />
        </div>
      )}
      {selected === "drag-labeling" && (
        <div>
          <DragLabeling
            items={
              (learningCategories &&
                learningCategories[0] &&
                learningCategories[0].items) ||
              []
            }
            level={1}
          />
        </div>
      )}
      {selected === "sequence-builder" && (
        <div>
          <SequenceBuilder initialLength={3} />
        </div>
      )}
      {selected === "puzzle-assembly" && (
        <div>
          <PuzzleAssembly />
        </div>
      )}
      {selected === "addition-game" && (
        <div>
          <AdditionGame />
        </div>
      )}
      {selected === "multiplication-game" && (
        <div>
          <MultiplicationGame />
        </div>
      )}
      {selected === "number-line-jump" && (
        <div>
          <NumberLineJump />
        </div>
      )}
      {selected === "math-bingo" && (
        <div>
          <MathBingo />
        </div>
      )}
      {selected === "equation-balance" && (
        <div>
          <EquationBalance />
        </div>
      )}
      {selected === "missing-number-game" && (
        <div>
          <MissingNumberGame />
        </div>
      )}
      {selected === "shape-builder" && (
        <div>
          <ShapeBuilder />
        </div>
      )}
      {selected === "shape-classifier" && (
        <div>
          <ShapeClassifier />
        </div>
      )}
      {selected === "area-calculator" && (
        <div>
          <AreaCalculator />
        </div>
      )}
      {selected === "angle-hunter" && (
        <div>
          <AngleHunter />
        </div>
      )}
      {selected === "pizza-fractions" && (
        <div>
          <PizzaFractions />
        </div>
      )}
      {selected === "fraction-comparison" && (
        <div>
          <FractionComparison />
        </div>
      )}
      {selected === "decimal-race" && (
        <div>
          <DecimalRace />
        </div>
      )}
      {selected === "pattern-maker" && (
        <div>
          <PatternMaker />
        </div>
      )}
      {selected === "number-pyramid" && (
        <div>
          <NumberPyramid />
        </div>
      )}
      {selected === "math-sudoku" && (
        <div>
          <MathSudoku />
        </div>
      )}
      {selected === "cash-register" && (
        <div>
          <CashRegister />
        </div>
      )}
    </Box>
  );
};

export default GamesPage;
