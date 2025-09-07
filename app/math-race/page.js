"use client";
import React, { Suspense } from "react";
import MathRace from "@/components/MathRace";
import { Box, CircularProgress, Typography } from "@mui/material";

const MathRacePageContent = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        py: 4,
        px: 2,
      }}
    >
      <MathRace />
    </Box>
  );
};

const MathRacePage = () => {
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
            جاري تحميل سباق الرياضيات...
          </Typography>
        </Box>
      }
    >
      <MathRacePageContent />
    </Suspense>
  );
};

export default MathRacePage;
