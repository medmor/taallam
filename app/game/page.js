"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function GameEmbedPage() {
  const router = useRouter();
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 3 }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <span />
        </Box>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            // 16:9 container with min height for desktop
            pt: "56.25%",
            backgroundColor: "#000",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
          }}
        >
          <iframe
            title="Taallam RPG"
            frameBorder="0"
            src="https://itch.io/embed-upload/15212880?color=333333"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <a href="https://medmor.itch.io/taallam-rpg">
              Play Taallam_rpg on itch.io
            </a>
          </iframe>
        </Box>
      </Box>
    </Box>
  );
}
