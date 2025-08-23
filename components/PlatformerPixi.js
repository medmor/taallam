"use client";
import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { preloadSfx, playSfx } from '@/lib/sfx';
import { Player } from '@/lib/pixi-games/learning-platform/player';

// ...existing code...

export default function PlatformerPixi({ width = '100%', height = 360 }) {
    const containerRef = useRef(null);
    const stateRef = useRef({ running: true });

    useEffect(() => {
        let app = null;
        let engine = null;
        let world = null;
        let player = null;
        let groundBody = null;
        let groundGfx = null;
        let keys = { left: false, right: false, up: false };
        let onKeyDown = null;
        let onKeyUp = null;

        // preload sounds (best-effort)
        try { preloadSfx(); } catch (e) { }

        let mounted = true;
        const init = async () => {
            const PIXI = await import('pixi.js');
            const Matter = await import('matter-js');


            if (!mounted) return;

            const appWidth = containerRef.current ? containerRef.current.clientWidth : 800;
            // Use new Application() for both v7 and v8, with minimal options
            if (!PIXI.Application) {
                if (containerRef.current) {
                    containerRef.current.innerHTML = 'PixiJS Application API not found.';
                }
                return;
            }
            app = new PIXI.Application();
            await app.init({ background: '#1099bb', width: appWidth, height });

            containerRef.current.appendChild(app.canvas);

            // create matter engine
            engine = Matter.Engine.create();
            world = engine.world;
            world.gravity.y = 1; // tune later

            // create player and ground
            const pw = 32, ph = 48;
            const groundW = Math.floor(app.canvas.width);
            groundBody = Matter.Bodies.rectangle(groundW / 2, height - 20, groundW, 40, { isStatic: true });
            Matter.World.add(world, [groundBody]);

            // create ground graphics
            groundGfx = new PIXI.Graphics();
            groundGfx.rect(-groundW / 2, -20, groundW, 40);
            groundGfx.fill({ color: 0x654321 });
            groundGfx.stroke({ color: 0x222222, width: 2 });
            groundGfx.x = groundBody.position.x;
            groundGfx.y = groundBody.position.y;
            app.stage.addChild(groundGfx);

            // create player instance
            player = new Player(Matter, PIXI, 80, 60, pw, ph, world, app.stage);

            // OOP: use player methods for controls
            const applyControls = () => {
                const speed = 5.5;
                const jumpPower = -12;
                if (player) {
                    if (keys.left) {
                        player.move(-1, speed);
                    } else if (keys.right) {
                        player.move(1, speed);
                    } else {
                        player.move(0, speed);
                    }
                    if (keys.up) {
                        player.jump(jumpPower, groundBody.position.y);
                        keys.up = false;
                    }
                }
            };

            // keyboard handlers
            const onKeyDown = (e) => {
                if (['ArrowLeft', 'a'].includes(e.key)) keys.left = true;
                if (['ArrowRight', 'd'].includes(e.key)) keys.right = true;
                if (['ArrowUp', 'w', ' '].includes(e.key)) keys.up = true;
            };
            const onKeyUp = (e) => {
                if (['ArrowLeft', 'a'].includes(e.key)) keys.left = false;
                if (['ArrowRight', 'd'].includes(e.key)) keys.right = false;
                if (['ArrowUp', 'w', ' '].includes(e.key)) keys.up = false;
            };
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);

            // Main loop: advance physics and sync visuals
            const loopFn = () => {
                if (!engine) return;
                applyControls();
                Matter.Engine.update(engine, 1000 / 60);
                if (player) player.updateGraphics();
                if (groundGfx && groundBody) {
                    groundGfx.x = groundBody.position.x;
                    groundGfx.y = groundBody.position.y;
                }
            };
            app.ticker.add(loopFn);
        };

        init();

        return () => {
            mounted = false;
            try { if (onKeyDown) window.removeEventListener('keydown', onKeyDown); if (onKeyUp) window.removeEventListener('keyup', onKeyUp); } catch (e) { }
            try {
                if (app) {
                    if (app.ticker && app.ticker.remove) app.ticker.remove(loopFn);
                    try { app.destroy && app.destroy(true, { children: true }); } catch (e) { try { app.destroy && app.destroy(); } catch (e) { } }
                    if (containerRef.current && app.canvas && app.canvas.parentNode === containerRef.current) containerRef.current.removeChild(app.canvas);
                }
            } catch (e) { }
            try { if (engine) { engine.timing = null; /* clear references */ } } catch (e) { }
        };
    }, []);

    return (
        <Box sx={{ width, maxWidth: 1000, mx: 'auto', p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>تحدي الرياضيات : المنصة (Pixi + Matter)</Typography>
            <Box ref={containerRef} sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button variant="contained" size="small" onClick={() => { try { playSfx('click'); } catch (e) { }; window.location.reload(); }}>إعادة تحميل المستوى</Button>
            </Box>
        </Box>
    );
}
