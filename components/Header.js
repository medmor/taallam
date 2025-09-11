"use client";
import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import Image from "next/image";
import IconButton from "@mui/material/IconButton";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { isMuted, setMuted } from "@/lib/sfx";

export default function Header() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    try {
      setMutedState(!!isMuted());
    } catch (e) {}
  }, []);

  const toggleMute = () => {
    try {
      setMuted(!muted);
      setMutedState(!muted);
    } catch (e) {}
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <IconButton>
              <Image src="/logo.png" alt="Logo" width={60} height={60} />
            </IconButton>
          </Link>
        </Typography>

        <IconButton
          color="inherit"
          onClick={toggleMute}
          aria-label={muted ? "unmute" : "mute"}
        >
          {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
