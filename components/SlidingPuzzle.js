'use client'
import React, { useState, useEffect, useRef } from 'react';
import { learningCategories } from '@/lib/data';
import { Box, Grid, Button, FormControl, InputLabel, Select, MenuItem, Typography, Paper } from '@mui/material';
import Timer from './Timer';
import { preloadSfx, playSfx } from '@/lib/sfx';

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function countInversions(arr, getValue) {
    const values = arr.filter(v => v !== null).map(getValue);
    let inv = 0;
    for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
            if (values[i] > values[j]) inv++;
        }
    }
    return inv;
}

function isSolvable(arr, size, type) {
    const getValue = (v) => {
        if (type === 'alphabets') return v.charCodeAt(0) - 65 + 1;
        return v;
    };
    const inversions = countInversions(arr, getValue);
    if (size % 2 === 1) {
        return inversions % 2 === 0;
    } else {
        const emptyIndex = arr.findIndex(v => v === null);
        const rowFromBottom = size - Math.floor(emptyIndex / size);
        // If blank is on even row counting from bottom and inversions odd -> solvable
        return (rowFromBottom % 2 === 0) ? (inversions % 2 === 1) : (inversions % 2 === 0);
    }
}

function isSolvedArray(arr, type, size) {
    if (!arr || arr.length === 0) return false;
    if (type === 'numbers') {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== i + 1) return false;
        }
        return arr[arr.length - 1] === null;
    }
    if (type === 'alphabets') {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== String.fromCharCode(65 + i)) return false;
        }
        return arr[arr.length - 1] === null;
    }
    // image: values are indices 0..n-1
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] !== i) return false;
    }
    return arr[arr.length - 1] === null;
}

const getRandomImage = () => {
    // Pick a random category and item with an image
    const categories = learningCategories.filter(cat => cat.items && cat.items.length);
    const allItems = categories.flatMap(cat => cat.items);
    const itemsWithImages = allItems.filter(item => item.image && item.image !== '/globe.svg');
    const randomItem = itemsWithImages[Math.floor(Math.random() * itemsWithImages.length)];
    return randomItem.image;
};

const SlidingPuzzle = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [boardWidth, setBoardWidth] = useState(520);
    const [size, setSize] = useState(3);
    const [type, setType] = useState('numbers');
    const [tiles, setTiles] = useState([]);
    const [emptyIndex, setEmptyIndex] = useState(0);
    const [image, setImage] = useState(null);
    const [solved, setSolved] = useState(false);
    const [moves, setMoves] = useState(0);
    const [timerActive, setTimerActive] = useState(true);
    const [timerKey, setTimerKey] = useState(0);
    const [hovered, setHovered] = useState(null);

    // compute board metrics consistently in one place
    const computeBoardMetrics = () => {
        const avail = boardWidth || (containerRef.current ? containerRef.current.clientWidth : 420);
        const maxBoard = 420; // keep board reasonably small
        const board = Math.max(240, Math.min(maxBoard, avail - 16));
        const gap = 8; // px gap between tiles
        const totalGap = gap * (size - 1);
        const tilePx = Math.floor((board - totalGap) / size);
        const boardPixel = tilePx * size + totalGap;
        return { board, tilePx, gap, totalGap, boardPixel };
    };

    useEffect(() => {
        if (!solved) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { boardPixel } = computeBoardMetrics();
        canvas.width = boardPixel;
        canvas.height = boardPixel;
        const ctx = canvas.getContext('2d');
        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * boardPixel,
            y: Math.random() * -boardPixel,
            size: 6 + Math.random() * 12,
            color: `hsl(${Math.random() * 360}, 85%, 55%)`,
            vx: (Math.random() - 0.5) * 2,
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
                    p.x = Math.random() * canvas.width;
                    p.y = Math.random() * -canvas.height;
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
    }, [solved]);


    // create a solvable shuffled board
    const createShuffled = (baseArr) => {
        let shuffled = shuffle([...baseArr]);
        let attempts = 0;
        while ((isSolvedArray(shuffled, type, size) || !isSolvable(shuffled, size, type)) && attempts < 1000) {
            shuffled = shuffle([...baseArr]);
            attempts++;
        }
        return shuffled;
    };

    useEffect(() => {
        let arr = [];
        if (type === 'numbers') {
            arr = Array.from({ length: size * size }, (_, i) => i + 1);
        } else if (type === 'alphabets') {
            arr = Array.from({ length: size * size }, (_, i) => String.fromCharCode(65 + i));
        } else if (type === 'image') {
            arr = Array.from({ length: size * size }, (_, i) => i);
            setImage(getRandomImage());
        }
        arr[arr.length - 1] = null; // Last tile is empty
        const shuffled = createShuffled(arr);
        setTiles(shuffled);
        setEmptyIndex(shuffled.findIndex(t => t === null));
        setSolved(isSolvedArray(shuffled, type, size));
        setMoves(0);
    // reset timer when new board created
    setTimerKey(k => k + 1);
    setTimerActive(true);
    }, [size, type]);

    useEffect(() => { try { preloadSfx(); } catch (e) {} }, []);

    // responsive: measure container width
    useEffect(() => {
        const update = () => {
            if (containerRef.current) {
                setBoardWidth(containerRef.current.clientWidth);
            } else {
                setBoardWidth(Math.min(520, window.innerWidth - 48));
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const handleShuffle = () => {
        let base = [];
        if (type === 'numbers') base = Array.from({ length: size * size }, (_, i) => i + 1);
        else if (type === 'alphabets') base = Array.from({ length: size * size }, (_, i) => String.fromCharCode(65 + i));
        else base = Array.from({ length: size * size }, (_, i) => i);
        base[base.length - 1] = null;
        const shuffled = createShuffled(base);
        setTiles(shuffled);
        setEmptyIndex(shuffled.findIndex(t => t === null));
        setSolved(isSolvedArray(shuffled, type, size));
        setMoves(0);
    // reset timer
    setTimerKey(k => k + 1);
    setTimerActive(true);
    };

    const moveTile = (index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const emptyRow = Math.floor(emptyIndex / size);
        const emptyCol = emptyIndex % size;
        if ((Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1) {
            const newTiles = [...tiles];
            newTiles[emptyIndex] = newTiles[index];
            newTiles[index] = null;
            setTiles(newTiles);
            setEmptyIndex(index);
            setMoves(m => m + 1);
            // Check if solved
            let solvedArr;
            if (type === 'numbers') {
                solvedArr = Array.from({ length: size * size }, (_, i) => i + 1);
            } else if (type === 'alphabets') {
                solvedArr = Array.from({ length: size * size }, (_, i) => String.fromCharCode(65 + i));
            } else {
                solvedArr = Array.from({ length: size * size }, (_, i) => i);
            }
            solvedArr[solvedArr.length - 1] = null;
            setSolved(newTiles.every((v, i) => v === solvedArr[i]));
            // if solved stop timer
            if (newTiles.every((v, i) => v === solvedArr[i])) setTimerActive(false);
            try { playSfx('slide'); } catch (e) {}
        }
    };

    return (
        <Box ref={containerRef} sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }} dir="ltr">
            <Typography variant="h5" gutterBottom>لغز الانزلاق</Typography>
            <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                <Grid item>
                    <FormControl size="small">
                        <InputLabel id="size-label">الحجم</InputLabel>
                        <Select
                            labelId="size-label"
                            value={size}
                            label="Size"
                            onChange={e => setSize(Number(e.target.value))}
                        >
                            <MenuItem value={3}>3 x 3</MenuItem>
                            <MenuItem value={4}>4 x 4</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl size="small">
                        <InputLabel id="type-label">Type</InputLabel>
                        <Select
                            labelId="type-label"
                            value={type}
                            label="Type"
                            onChange={e => setType(e.target.value)}
                        >
                            <MenuItem value="numbers">أرقام</MenuItem>
                            <MenuItem value="alphabets">حروف</MenuItem>
                            <MenuItem value="image">صورة</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleShuffle}>خلط</Button>
                </Grid>
                <Grid item>
                    <Timer active={timerActive} resetKey={timerKey} onStop={(s) => { /* could log */ }} />
                </Grid>
                <Grid item xs />
                <Grid item>
                    <Typography variant="body2">التحركات: {moves}</Typography>
                </Grid>
            </Grid>
            {/** responsive board */}
            {(() => {
                // responsive board size measured from outer container (with sensible defaults)
                const avail = boardWidth || (containerRef.current ? containerRef.current.clientWidth : 420);
                const maxBoard = 420; // keep board reasonably small
                const board = Math.max(240, Math.min(maxBoard, avail - 16));
                const gap = 8; // px gap between tiles
                const totalGap = gap * (size - 1);
                const tilePx = Math.floor((board - totalGap) / size);
                const fontSize = Math.max(18, Math.floor(tilePx / 2.5));
                return (
                    <Box sx={{
                        width: tilePx * size + totalGap,
                        height: tilePx * size + totalGap,
                        borderRadius: '6px',
                        p: 0,
                        background: '#f5f5f7',
                        boxShadow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${size}, ${tilePx}px)`,
                            gap: `${gap}px`,
                            width: tilePx * size + totalGap,
                            height: tilePx * size + totalGap,
                            boxSizing: 'content-box'
                        }}>
                            {tiles.map((tile, idx) => {
                                const row = Math.floor(idx / size);
                                const col = idx % size;
                                const emptyRow = Math.floor(emptyIndex / size);
                                const emptyCol = emptyIndex % size;
                                const isMovable = tile !== null && ((Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1);
                                const isEmpty = tile === null;
                                return (
                                    <Paper
                                        key={idx}
                                        elevation={isMovable ? 6 : 2}
                                        onClick={() => moveTile(idx)}
                                        onMouseEnter={() => setHovered(idx)}
                                        onMouseLeave={() => setHovered(null)}
                                            sx={{
                        width: `${tilePx}px`,
                        height: `${tilePx}px`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '4px',
                                            cursor: isMovable ? 'pointer' : isEmpty ? 'default' : 'default',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            transition: 'transform 140ms ease, box-shadow 140ms ease',
                                            transform: hovered === idx && isMovable ? 'scale(1.04)' : 'scale(1)',
                                            background: isEmpty ? 'linear-gradient(180deg,#fff,#f0ebe6)' : 'linear-gradient(180deg,#ffffff,#fafafa)'
                                        }}
                                    >
                                        {type === 'image' && tile !== null && image && (
                                                    <img
                                                        src={image}
                                                        alt="puzzle"
                                                        style={{
                                                            position: 'absolute',
                                                            left: -((tile % size) * tilePx),
                                                            top: -(Math.floor(tile / size) * tilePx),
                                                            width: tilePx * size + totalGap,
                                                            height: tilePx * size + totalGap,
                                                            objectFit: 'cover',
                                                            pointerEvents: 'none'
                                                        }}
                                                    />
                                        )}
                                        {type !== 'image' && tile !== null && (
                                            <Typography sx={{ fontSize: fontSize, fontWeight: 700, color: isMovable ? '#1e293b' : '#223' }}>{tile}</Typography>
                                        )}
                                    </Paper>
                                );
                            })}
                        </div>

                        {/* solved overlay placed here so it appears above the board */}
                        {solved && (() => {
                            const { boardPixel } = computeBoardMetrics();
                            return (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 20,
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 6 }} />
                                    <canvas ref={canvasRef} width={boardPixel} height={boardPixel} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 21 }} />
                                    <div style={{ zIndex: 22, textAlign: 'center', color: '#fff' }}>
                                        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}>🎉 تهانينا! 🎉</div>
                                        <div style={{ marginBottom: 10, fontSize: 16, textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}>لقد حليت اللغز في {moves} تحركات.</div>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            <Button variant="contained" color="secondary" onClick={() => { try { playSfx('click'); } catch (e) {} ; handleShuffle(); }}>إعادة اللعب</Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </Box>
                );
            })()}
            {/* old solved overlay removed (now rendered above board) */}
        </Box>
    );
};

export default SlidingPuzzle;
