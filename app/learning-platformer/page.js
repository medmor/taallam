"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import PlatformerPhaser from "@/components/PlatformerPhaser";

export default function Page() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        تعلم مع مغامرات الدائرة
      </Typography>
      <Box>
        <PlatformerPhaser />
      </Box>
    </Box>
  );
}
