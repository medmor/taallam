"use client";
import React, { Suspense } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";

const WeatherSeasonsGame = dynamic(() => import("@/components/WeatherSeasonsGame"), {
  loading: () => <CircularProgress />,
});

export default function WeatherSeasonsPage() {
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
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="primary">
            جاري تحميل درس الطقس والفصول...
          </Typography>
        </Box>
      }
    >
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 4, px: 2 }}>
        <WeatherSeasonsGame />
      </Box>
    </Suspense>
  );
}