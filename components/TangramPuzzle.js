'use client'

import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Alert,
  LinearProgress,
  Chip
} from '@mui/material';
import Timer from './Timer';
import { playSfx } from '../lib/sfx';

export default function TangramPuzzle() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [pieces, setPieces] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  const svgRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Standard tangram pieces (7 pieces)
  const tangramPieces = [
    {
      id: 'large-triangle-1',
      name: 'مثلث كبير 1',
      path: 'M0,0 L100,0 L50,50 Z',
      color: '#e74c3c',
      originalX: 50,
      originalY: 50
    },
    {
      id: 'large-triangle-2',
      name: 'مثلث كبير 2',
      path: 'M0,0 L100,0 L50,50 Z',
      color: '#3498db',
      originalX: 150,
      originalY: 50
    },
    {
      id: 'medium-triangle',
      name: 'مثلث متوسط',
      path: 'M0,0 L70,0 L35,35 Z',
      color: '#2ecc71',
      originalX: 250,
      originalY: 50
    },
    {
      id: 'small-triangle-1',
      name: 'مثلث صغير 1',
      path: 'M0,0 L50,0 L25,25 Z',
      color: '#f39c12',
      originalX: 350,
      originalY: 50
    },
    {
      id: 'small-triangle-2',
      name: 'مثلث صغير 2',
      path: 'M0,0 L50,0 L25,25 Z',
      color: '#9b59b6',
      originalX: 450,
      originalY: 50
    },
    {
      id: 'square',
      name: 'مربع',
      path: 'M0,0 L35,0 L35,35 L0,35 Z',
      color: '#1abc9c',
      originalX: 550,
      originalY: 50
    },
    {
      id: 'parallelogram',
      name: 'متوازي أضلاع',
      path: 'M0,0 L50,0 L75,25 L25,25 Z',
      color: '#e67e22',
      originalX: 650,
      originalY: 50
    }
  ];

  // Puzzle targets (silhouettes to complete)
  const puzzles = [
    {
      id: 'house',
      name: 'بيت',
      description: 'اصنع شكل بيت باستخدام القطع',
      silhouette: [
        { path: 'M200,300 L300,200 L400,300 L400,350 L200,350 Z', color: '#bdc3c7' },
        { path: 'M250,320 L250,350 L280,350 L280,320 Z', color: '#ecf0f1' } // door
      ],
      targetArea: { x: 200, y: 200, width: 200, height: 150 }
    },
    {
      id: 'bird',
      name: 'طائر',
      description: 'اصنع شكل طائر باستخدام القطع',
      silhouette: [
        { path: 'M150,250 L200,200 L250,220 L300,200 L350,250 L320,280 L280,270 L250,290 L220,280 L180,290 Z', color: '#bdc3c7' }
      ],
      targetArea: { x: 150, y: 200, width: 200, height: 100 }
    },
    {
      id: 'cat',
      name: 'قطة',
      description: 'اصنع شكل قطة باستخدام القطع',
      silhouette: [
        { path: 'M200,280 L220,260 L240,280 L280,280 L300,300 L280,320 L200,320 Z', color: '#bdc3c7' }, // body
        { path: 'M180,250 L200,230 L210,250 Z', color: '#bdc3c7' }, // ear 1
        { path: 'M230,250 L250,230 L260,250 Z', color: '#bdc3c7' }  // ear 2
      ],
      targetArea: { x: 180, y: 230, width: 120, height: 90 }
    }
  ];

  const initializePieces = () => {
    const initialPieces = tangramPieces.map((piece, index) => ({
      ...piece,
      x: piece.originalX,
      y: piece.originalY,
      rotation: 0,
      flipped: false,
      zIndex: index
    }));
    setPieces(initialPieces);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentPuzzle(0);
    setGameComplete(false);
    setFeedback('');
    setTimerActive(true);
    initializePieces();
    try { playSfx('start'); } catch (e) {}
  };

  const nextPuzzle = () => {
    if (currentPuzzle < puzzles.length - 1) {
      setCurrentPuzzle(prev => prev + 1);
      setFeedback('');
      initializePieces();
    } else {
      setGameComplete(true);
      setTimerActive(false);
      setFeedback(`🎉 أحسنت! أكملت جميع الألغاز! النتيجة النهائية: ${score}/${puzzles.length}`);
      try { playSfx('win'); } catch (e) {}
    }
  };

  const checkPuzzleCompletion = () => {
    const puzzle = puzzles[currentPuzzle];
    const targetArea = puzzle.targetArea;
    
    // Check if all pieces are roughly within the target area
    const piecesInTarget = pieces.filter(piece => {
      return piece.x >= targetArea.x - 50 && 
             piece.x <= targetArea.x + targetArea.width + 50 &&
             piece.y >= targetArea.y - 50 && 
             piece.y <= targetArea.y + targetArea.height + 50;
    });

    if (piecesInTarget.length === pieces.length) {
      setScore(prev => prev + 1);
      setFeedback(`✅ ممتاز! أكملت شكل ${puzzle.name}`);
      try { playSfx('success'); } catch (e) {}
      
      setTimeout(() => {
        nextPuzzle();
      }, 2000);
      
      return true;
    }
    return false;
  };

  const handleMouseDown = (e, pieceId) => {
    e.preventDefault();
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    dragOffset.current = {
      x: mouseX - piece.x,
      y: mouseY - piece.y
    };

    setDraggedPiece(pieceId);
    
    // Bring to front
    setPieces(prev => prev.map(p => 
      p.id === pieceId 
        ? { ...p, zIndex: Math.max(...prev.map(piece => piece.zIndex)) + 1 }
        : p
    ));
  };

  const handleMouseMove = (e) => {
    if (!draggedPiece) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    setPieces(prev => prev.map(piece => 
      piece.id === draggedPiece
        ? {
            ...piece,
            x: mouseX - dragOffset.current.x,
            y: mouseY - dragOffset.current.y
          }
        : piece
    ));
  };

  const handleMouseUp = () => {
    if (draggedPiece) {
      setDraggedPiece(null);
      setTimeout(checkPuzzleCompletion, 100);
    }
  };

  const rotatePiece = (pieceId) => {
    setPieces(prev => prev.map(piece => 
      piece.id === pieceId
        ? { ...piece, rotation: (piece.rotation + 45) % 360 }
        : piece
    ));
    setTimeout(checkPuzzleCompletion, 100);
  };

  const flipPiece = (pieceId) => {
    setPieces(prev => prev.map(piece => 
      piece.id === pieceId
        ? { ...piece, flipped: !piece.flipped }
        : piece
    ));
    setTimeout(checkPuzzleCompletion, 100);
  };

  const resetPieces = () => {
    initializePieces();
    setFeedback('');
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (draggedPiece) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedPiece]);

  const renderPiece = (piece) => {
    const transform = `translate(${piece.x}, ${piece.y}) rotate(${piece.rotation}) ${piece.flipped ? 'scale(-1, 1)' : ''}`;
    
    return (
      <g key={piece.id} style={{ zIndex: piece.zIndex }}>
        <path
          d={piece.path}
          fill={piece.color}
          stroke="#2c3e50"
          strokeWidth="2"
          transform={transform}
          style={{ cursor: 'move' }}
          onMouseDown={(e) => handleMouseDown(e, piece.id)}
          onDoubleClick={() => rotatePiece(piece.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            flipPiece(piece.id);
          }}
        />
      </g>
    );
  };

  const renderSilhouette = (puzzle) => {
    return puzzle.silhouette.map((shape, index) => (
      <path
        key={index}
        d={shape.path}
        fill={shape.color}
        stroke="#95a5a6"
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity="0.5"
      />
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, m: 2, borderRadius: 3 }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          لعبة التانغرام
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          رتب القطع الهندسية لتكوين الصور المطلوبة
        </Typography>

        {!gameStarted ? (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={startGame}
              sx={{ fontSize: '1.2rem', py: 2, px: 6, borderRadius: 3 }}
            >
              ابدأ اللعب
            </Button>
          </Box>
        ) : (
          <>
            <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center', backgroundColor: 'background.default' }}>
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6">
                    النتيجة: {score}/{puzzles.length}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6">الوقت</Typography>
                  <Timer active={timerActive} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    اللغز: {puzzles[currentPuzzle]?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {puzzles[currentPuzzle]?.description}
                  </Typography>
                </Grid>
              </Grid>
              
              <LinearProgress 
                variant="determinate" 
                value={(currentPuzzle / puzzles.length) * 100} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />

              {feedback && (
                <Alert 
                  severity={feedback.includes('✅') || feedback.includes('🎉') ? 'success' : 'info'} 
                  sx={{ mt: 2, fontSize: '1.1rem', borderRadius: 2 }}
                >
                  {feedback}
                </Alert>
              )}
            </Paper>

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Button variant="outlined" onClick={resetPieces} size="small">
                  إعادة ترتيب القطع
                </Button>
                <Chip label="انقر مرتين للدوران" size="small" />
                <Chip label="انقر بالزر الأيمن للقلب" size="small" />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <svg
                  ref={svgRef}
                  width="800"
                  height="400"
                  viewBox="0 0 800 400"
                  style={{ 
                    border: '2px solid #bdc3c7', 
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                >
                  {/* Render silhouette */}
                  {puzzles[currentPuzzle] && renderSilhouette(puzzles[currentPuzzle])}
                  
                  {/* Render pieces */}
                  {pieces
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map(renderPiece)}
                </svg>
              </Box>
            </Paper>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={startGame}
                sx={{ mr: 2, borderRadius: 2 }}
              >
                لعبة جديدة
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setGameStarted(false)}
                sx={{ borderRadius: 2 }}
              >
                إنهاء اللعبة
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}