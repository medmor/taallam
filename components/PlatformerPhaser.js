"use client";
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import Game from "@/lib/phaser-games/learning-platform/game";

export default function PlatformerPhaser({ width = "100%", height = 600 }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!mounted) return;
      const appWidth = containerRef.current
        ? containerRef.current.clientWidth
        : 800;
      const g = new Game(containerRef.current);
      await g.loadDependencies();
      await g.init({ width: appWidth, height });
      gameRef.current = g;
      // listen for collect/win events
      g.on &&
        g.on("collect", ({ letter, order }) => {
          setCollected((c) => {
            const next = [...c, letter || "?"];
            return next;
          });
        });
      g.on &&
        g.on("win", () => {
          setWon(true);
        });
    };
    init({ camYOffset: -200 });
    return () => {
      mounted = false;
      try {
        if (gameRef.current) gameRef.current.destroy();
      } catch (e) {}
    };
  }, []);

  const [won, setWon] = useState(false);

  return (
    <Box sx={{ width, maxWidth: 1000, mx: "auto", p: 2 }}>
      <Box
        ref={containerRef}
        sx={{ width: "100%", boxShadow: 3, height: 600 }}
      />

      {won && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "success.main", color: "#fff" }}>
          <Typography variant="h6">Level Complete!</Typography>
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            try {
              window.location.reload();
            } catch (e) {}
          }}
        >
          إعادة تحميل المستوى
        </Button>
      </Box>
    </Box>
  );
}
