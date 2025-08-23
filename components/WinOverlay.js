'use client'
import React, { useEffect, useRef } from 'react';
import { Button } from '@mui/material';

export default function WinOverlay({ boardPixel = 320, moves = 0, errors = 0, onPlayAgain = () => null }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = boardPixel;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    // spawn particles centered horizontally with a controlled spread
    const centerX = canvas.width / 2;
    const spread = canvas.width * 0.6; // how wide the spread is around center
    const particles = Array.from({ length: 80 }, () => ({
      x: centerX + (Math.random() - 0.5) * spread,
      y: Math.random() * -canvas.height * 0.5,
      size: 6 + Math.random() * 12,
      color: `hsl(${Math.random() * 360}, 85%, 55%)`,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      drot: (Math.random() - 0.5) * 0.2
    }));
    let frame;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.drot;
                if (p.y > canvas.height + 20) {
                  // respawn near center with same spread
                  p.x = centerX + (Math.random() - 0.5) * spread;
                  p.y = Math.random() * -canvas.height * 0.5;
                }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [boardPixel]);

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.36)', borderRadius: 6 }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', left: '50%', top: 0, pointerEvents: 'none', zIndex: 21, transform: 'translateX(-50%)' }} />
      <div style={{ zIndex: 22, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}>🎉 Congratulations! 🎉</div>
        <div style={{ marginBottom: 10, fontSize: 16, textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}>You solved the puzzle in {moves} moves{errors ? ` • ${errors} errors` : ''}.</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button variant="contained" color="secondary" onClick={onPlayAgain}>اعادة اللعب</Button>
        </div>
      </div>
    </div>
  );
}
