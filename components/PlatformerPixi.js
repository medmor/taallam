"use client";
import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { preloadSfx, playSfx } from '@/lib/sfx';
import Game from '@/lib/pixi-games/learning-platform/game';

// ...existing code...

export default function PlatformerPixi({ width = '100%', height = 600 }) {
    const containerRef = useRef(null);
    const stateRef = useRef({ running: true });

    useEffect(() => {
        let game = null;

        // preload sounds (best-effort)
        try { preloadSfx(); } catch (e) { }

        let mounted = true;
        const init = async () => {
            if (!mounted) return;
            const appWidth = containerRef.current ? containerRef.current.clientWidth : 800;
            game = new Game(containerRef.current);
            await game.loadDependencies();
            await game.init({ width: appWidth, height, levelKey: 'level1' });
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
            try { if (game) { game.destroy().catch(() => { }); } } catch (e) { }
            try { if (engine) { engine.timing = null; /* clear references */ } } catch (e) { }
        };
    }, []);

    return (
        <Box sx={{ width, maxWidth: 1000, mx: 'auto', p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>تحدي الرياضيات : المنصة (Pixi + Matter)</Typography>
            <Box ref={containerRef} sx={{ width: '100%', boxShadow: 3, height: 600 }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button variant="contained" size="small" onClick={() => { try { playSfx('click'); } catch (e) { }; window.location.reload(); }}>إعادة تحميل المستوى</Button>
            </Box>
        </Box>
    );
}
