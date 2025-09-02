"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { playSfx } from "@/lib/sfx";
import WinOverlay from "./WinOverlay";
import { learningCategories } from "@/lib/data";

// Puzzle Assembly (shape jigsaw) — simple implementation using SVG shapes.
// - pieces: array of shape objects with target positions
// - drag with pointer (mouse/touch)
// - snaps when within threshold
// - responsive: scales board down on small screens

export default function PuzzleAssembly({ snapThreshold = 40 }) {
  const boardW = 800;
  const boardH = 533;
  const boardRef = useRef(null);
  const [pieces, setPieces] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [gridSize, setGridSize] = useState(2); // 2x2 default
  const draggingRef = useRef({
    id: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [startedAt, setStartedAt] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [showWin, setShowWin] = useState(false);
  const winPlayedRef = useRef(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // generate pieces for gridSize x gridSize, matching boardW x boardH
    const colors = [
      "#ef4444",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
      "#6366f1",
      "#e11d48",
      "#059669",
      "#fbbf24",
      "#0ea5e9",
      "#a21caf",
      "#f43f5e",
      "#22d3ee",
      "#f87171",
      "#65a30d",
      "#facc15",
      "#2563eb",
    ];
    let t = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        t.push({
          id: `p${row * gridSize + col + 1}`,
          color: colors[(row * gridSize + col) % colors.length],
          targetX: col * (boardW / gridSize),
          targetY: row * (boardH / gridSize),
          w: boardW / gridSize,
          h: boardH / gridSize,
        });
      }
    }

    // pick a random image from learningCategories (prefer items that have image paths)
    let chosenImage = null;
    try {
      const allItems = (learningCategories || []).flatMap((c) => c.items || []);
      const valid = allItems.filter(
        (it) => it && it.image && !it.image.includes("globe.svg")
      );
      if (valid.length > 0) {
        const pick = valid[Math.floor(Math.random() * valid.length)];
        chosenImage = pick.image;
      } else if (allItems.length > 0) {
        chosenImage =
          allItems[Math.floor(Math.random() * allItems.length)].image;
      }
    } catch (e) {
      chosenImage = null;
    }

    // place them randomly inside the board area (but not snapped to targets)
    const placed = t.map((p, i) => ({
      ...p,
      x: Math.random() * (boardW - p.w - 8) + 4,
      y: Math.random() * (boardH - p.h - 8) + 4,
      snapped: false,
    }));
    setPieces(placed);
    setImageSrc(chosenImage || null);
    // compute initial scale based on container width
    const resize = () => {
      try {
        const w =
          boardRef.current?.parentElement?.clientWidth || window.innerWidth;
        const maxW = Math.min(w - 48, boardW);
        setScale(maxW / boardW);
      } catch (e) {
        setScale(1);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  useEffect(() => {
    // when all snapped, mark completion
    if (pieces.length > 0 && pieces.every((p) => p.snapped)) {
      if (!completedAt) setCompletedAt(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieces]);

  // show win overlay and play sound once
  useEffect(() => {
    if (completedAt && !winPlayedRef.current) {
      try {
        playSfx("win");
      } catch (e) {}
      setShowWin(true);
      winPlayedRef.current = true;
    }
  }, [completedAt]);

  const toBoardCoords = (clientX, clientY) => {
    const rect = boardRef.current.getBoundingClientRect();
    const bx = (clientX - rect.left) / scale;
    const by = (clientY - rect.top) / scale;
    return { bx, by };
  };

  const onPointerDown = (e, id) => {
    e.preventDefault();
    const p = pieces.find((x) => x.id === id);
    if (!p || p.snapped) return;
    const pt = toBoardCoords(e.clientX, e.clientY);
    draggingRef.current = {
      id,
      startX: pt.bx,
      startY: pt.by,
      offsetX: pt.bx - p.x,
      offsetY: pt.by - p.y,
    };
    if (!startedAt) setStartedAt(Date.now());
    // capture pointer movements
    e.target.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current.id) return;
    e.preventDefault();
    const { id, offsetX, offsetY } = draggingRef.current;
    const pt = toBoardCoords(e.clientX, e.clientY);
    // ensure timer starts when user actually moves a piece
    if (!startedAt) setStartedAt(Date.now());
    setPieces((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, x: pt.bx - offsetX, y: pt.by - offsetY } : p
      )
    );
  };

  const onPointerUp = (e) => {
    if (!draggingRef.current.id) return;
    e.preventDefault();
    const { id } = draggingRef.current;
    const p = pieces.find((x) => x.id === id);
    if (!p) {
      draggingRef.current = { id: null };
      return;
    }
    // check snap
    const dx = p.x - p.targetX;
    const dy = p.y - p.targetY;
    const dist = Math.hypot(dx, dy);
    if (dist <= snapThreshold) {
      
      // snap into place
      setPieces((prev) =>
        prev.map((pp) =>
          pp.id === id
            ? { ...pp, x: pp.targetX, y: pp.targetY, snapped: true }
            : pp
        )
      );
      try {
        playSfx("slide");
      } catch (e) {}
    } else {
      // leave at current location
      setPieces((prev) => prev.map((pp) => (pp.id === id ? { ...pp } : pp)));
    }
    draggingRef.current = { id: null };
  };

  const reset = () => {
    setShowWin(false);
    winPlayedRef.current = false;
    setCompletedAt(null);
    setStartedAt(null);
    // shuffle positions again (within board area)
    setPieces((prev) =>
      prev.map((p, i) => ({
        ...p,
        x: Math.random() * (boardW - p.w - 8) + 4,
        y: Math.random() * (boardH - p.h - 8) + 4,
        snapped: false,
      }))
    );
  };

  const handleSizeChange = (e) => {
    setGridSize(Number(e.target.value));
    setCompletedAt(null);
    setStartedAt(null);
  };

  // pick a random image (try to differ from current)
  const pickRandomImageSrc = () => {
    try {
      const allItems = (learningCategories || []).flatMap((c) => c.items || []);
      const valid = allItems.filter(
        (it) => it && it.image && !it.image.includes("globe.svg")
      );
      if (valid.length === 0) return null;
      // try to pick a different image than current
      for (let i = 0; i < 6; i++) {
        const pick = valid[Math.floor(Math.random() * valid.length)].image;
        if (pick !== imageSrc) return pick;
      }
      return valid[Math.floor(Math.random() * valid.length)].image;
    } catch (e) {
      return null;
    }
  };

  const changeImage = () => {
    const next = pickRandomImageSrc();
    if (!next) return;
    setImageSrc(next);
    // reshuffle pieces and reset timer/win state
    setShowWin(false);
    winPlayedRef.current = false;
    setCompletedAt(null);
    setStartedAt(null);
    setPieces((prev) =>
      prev.map((p) => ({
        ...p,
        x: Math.random() * (boardW - p.w - 8) + 4,
        y: Math.random() * (boardH - p.h - 8) + 4,
        snapped: false,
      }))
    );
  };

  const formatMs = (ms) => {
    if (!ms) return "--:--";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{ width: "100%", maxWidth: 760, mx: "auto", position: "relative" }}
    >
      <Typography variant="h5" sx={{ mb: 1, textAlign: "center" }}>
        Puzzle Assembly — تركيب الأشكال
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
        اسحب القطع إلى الداخل حتى تتطابق مع الشكل الظل. ستلتصق القطع عندما تكون
        قريبة بما فيه الكفاية.
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography>
            الوقت:{" "}
            {formatMs(
              startedAt && completedAt
                ? completedAt - startedAt
                : startedAt
                ? Date.now() - startedAt
                : 0
            )}
          </Typography>
          <Typography>الحالة: {completedAt ? "مكتمل" : "قيد اللعب"}</Typography>
          <Button variant="contained" color="primary" onClick={reset}>
            إعادة ضبط
          </Button>
          <Button variant="outlined" sx={{ ml: 1 }} onClick={changeImage}>
            تغيير الصورة
          </Button>
          <FormControl sx={{ minWidth: 140, ml: 2 }} size="small">
            <InputLabel id="size-select-label">الحجم</InputLabel>
            <Select
              labelId="size-select-label"
              id="size-select"
              value={gridSize}
              label="الحجم"
              onChange={handleSizeChange}
            >
              <MenuItem value={2}>2 × 2</MenuItem>
              <MenuItem value={3}>3 × 3</MenuItem>
              <MenuItem value={4}>4 × 4</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <div
        ref={boardRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          width: boardW * scale,
          height: boardH * scale,
          margin: "0 auto",
          touchAction: "none",
        }}
      >
        <svg
          width={boardW * scale}
          height={boardH * scale}
          viewBox={`0 0 ${boardW} ${boardH}`}
          style={{ display: "block" }}
        >
          {/* silhouette */}
          <rect
            x={0}
            y={0}
            width={boardW}
            height={boardH}
            fill="#fff"
            stroke="#ccc"
            strokeWidth={2}
          />
          {/* ghost targets */}
          {pieces.map((p) => (
            <rect
              key={`t-${p.id}`}
              x={p.targetX}
              y={p.targetY}
              width={p.w}
              height={p.h}
              fill="none"
              stroke="#999"
              strokeDasharray="4 4"
            />
          ))}

          {/* pieces (render on top) */}
          <defs>
            {pieces.map((p) => (
              <clipPath
                id={`clip-${p.id}`}
                key={`clip-${p.id}`}
                clipPathUnits="userSpaceOnUse"
              >
                <rect x={0} y={0} width={p.w} height={p.h} rx={8} ry={8} />
              </clipPath>
            ))}
          </defs>

          {/* Sort pieces so unsnapped tiles are rendered on top */}
          {(() => {
            const sortedPieces = [...pieces].sort(
              (a, b) => a.snapped - b.snapped
            );
            return sortedPieces.map((p) => (
              <g
                key={p.id}
                transform={`translate(${p.x},${p.y})`}
                style={{ pointerEvents: p.snapped ? "none" : "auto" }}
              >
                {imageSrc ? (
                  <g
                    onPointerDown={(e) => onPointerDown(e, p.id)}
                    style={{ cursor: p.snapped ? "default" : "grab" }}
                  >
                    {(() => {
                      // Ensure precise alignment of tiles with the image
                      const imgW = 800,
                        imgH = 533;
                      return (
                        <image
                          href={imageSrc}
                          x={-p.targetX}
                          y={-p.targetY}
                          width={imgW}
                          height={imgH}
                          preserveAspectRatio="none"
                          clipPath={`url(#clip-${p.id})`}
                        />
                      );
                    })()}
                    <rect
                      x={0}
                      y={0}
                      width={p.w}
                      height={p.h}
                      rx={8}
                      ry={8}
                      fill="none"
                      stroke={p.snapped ? "#444" : "#222"}
                      strokeWidth={p.snapped ? 3 : 1}
                    />
                  </g>
                ) : (
                  <rect
                    x={0}
                    y={0}
                    width={p.w}
                    height={p.h}
                    rx={8}
                    ry={8}
                    fill={p.color}
                    stroke={p.snapped ? "#444" : "#222"}
                    strokeWidth={p.snapped ? 3 : 1}
                    onPointerDown={(e) => onPointerDown(e, p.id)}
                    style={{ cursor: p.snapped ? "default" : "grab" }}
                  />
                )}
              </g>
            ));
          })()}
        </svg>
      </div>

      {showWin && (
        <WinOverlay
          boardPixel={Math.min(boardW, 320)}
          moves={0}
          errors={0}
          onPlayAgain={() => {
            reset();
          }}
        />
      )}
    </Box>
  );
}
