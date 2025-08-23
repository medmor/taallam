"use client";
import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { preloadSfx, playSfx } from '@/lib/sfx';

// Lightweight Pixi + Matter integration component
export default function PlatformerPixi({ width = '100%', height = 360 }) {
    const containerRef = useRef(null);
    const stateRef = useRef({ running: true });

    useEffect(() => {
        let app = null;
        let engine = null;
        let world = null;
        let playerBody = null;
        let groundBody = null;
        let playerGfx = null;
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
            await app.init({ background: '#1099bb', resizeTo: window })

            containerRef.current.appendChild(app.canvas);

            // create matter engine
            engine = Matter.Engine.create();
            world = engine.world;
            world.gravity.y = 1; // tune later

            // create player body
            const pw = 32, ph = 48;
            const groundW = Math.floor(app.canvas.width);
            playerBody = Matter.Bodies.rectangle(80, 60, pw, ph, { friction: 0.001, restitution: 0.0 });
            groundBody = Matter.Bodies.rectangle(groundW / 2, height - 20, groundW, 40, { isStatic: true });
            Matter.World.add(world, [playerBody, groundBody]);

            // create player container
            const playerContainer = new PIXI.Container();
            playerGfx = new PIXI.Graphics();
            playerGfx.fill({ color: 0x2b6cb0 });
            playerGfx.circle(0, 0, 24);
            playerGfx.setStrokeStyle(2, 0xff0000, 1);
            playerGfx.circle(0, 0, 24);
            const playerLabel = new PIXI.Text({
                text: 'PLAYER',
                style: { fill: 0xffffff, fontSize: 14 }
            });
            playerLabel.anchor.set(0.5);
            playerLabel.x = 0;
            playerLabel.y = 36;
            playerContainer.addChild(playerGfx);
            playerContainer.addChild(playerLabel);
            playerContainer.x = playerBody.position.x;
            playerContainer.y = playerBody.position.y;
            app.stage.addChild(playerContainer);

            // create ground container
            const groundContainer = new PIXI.Container();
            groundGfx = new PIXI.Graphics();
            groundGfx.fill({ color: 0x654321 });
            groundGfx.rect(-groundW / 2, -20, groundW, 40);
            groundGfx.setStrokeStyle(2, 0x222222, 1);
            groundGfx.rect(-groundW / 2, -20, groundW, 40);
            const groundLabel = new PIXI.Text({
                text: 'GROUND',
                style: { fill: 0xffffff, fontSize: 14 }
            });
            groundLabel.anchor.set(0.5);
            groundLabel.x = 0;
            groundLabel.y = -30;
            groundContainer.addChild(groundGfx);
            groundContainer.addChild(groundLabel);
            groundContainer.x = groundBody.position.x;
            groundContainer.y = groundBody.position.y;
            app.stage.addChild(groundContainer);

            // Ensure player is rendered on top
            app.stage.removeChild(playerContainer);
            app.stage.addChild(playerContainer);

            // Add debug background to player container
            const debugBackground = new PIXI.Graphics();
            debugBackground.beginFill(0xffff00, 0.5); // Semi-transparent yellow
            debugBackground.drawRect(-pw / 2, -ph / 2, pw, ph);
            debugBackground.endFill();
            playerContainer.addChildAt(debugBackground, 0);

            // Update debug rectangle to use PixiJS v8 API
            const largeDebugRect = new PIXI.Graphics();
            largeDebugRect.fill({ color: 0xff0000, alpha: 0.5 }); // Semi-transparent red
            largeDebugRect.rect(-50, -50, 100, 100); // Larger dimensions
            playerContainer.addChildAt(largeDebugRect, 0);

            // simple camera: translate stage slightly to keep player on screen for wide levels later
            const applyControls = () => {
                const speed = 5.5; // pixels per tick
                const jumpPower = -12; // set as velocity
                if (keys.left) {
                    Matter.Body.setVelocity(playerBody, { x: -speed, y: playerBody.velocity.y });
                } else if (keys.right) {
                    Matter.Body.setVelocity(playerBody, { x: speed, y: playerBody.velocity.y });
                } else {
                    Matter.Body.setVelocity(playerBody, { x: 0, y: playerBody.velocity.y });
                }
                if (keys.up) {
                    // allow a jump only when roughly on ground (vy small and near ground)
                    const onGround = Math.abs(playerBody.velocity.y) < 1 && (playerBody.position.y + ph / 2) >= (groundBody.position.y - 30);
                    if (onGround) {
                        Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: jumpPower });
                        try { playSfx('jump'); } catch (e) { }
                    }
                    keys.up = false; // single jump per press
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
                if (playerContainer && playerBody) {
                    playerContainer.x = playerBody.position.x;
                    playerContainer.y = playerBody.position.y;
                    playerContainer.rotation = playerBody.angle;
                }
                if (groundContainer && groundBody) {
                    groundContainer.x = groundBody.position.x;
                    groundContainer.y = groundBody.position.y;
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
