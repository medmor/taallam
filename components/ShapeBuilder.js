import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';

const ShapeBuilder = () => {
  const canvasRef = useRef(null);
  const [dots, setDots] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);
  const [targetShape, setTargetShape] = useState('triangle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const shapes = {
    triangle: { sides: 3, name: 'مثلث', points: 3 },
    square: { sides: 4, name: 'مربع', points: 4 },
    pentagon: { sides: 5, name: 'خماسي', points: 5 },
    hexagon: { sides: 6, name: 'سداسي', points: 6 }
  };

  const generateDots = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;
    
    const newDots = [];
    const requiredDots = shapes[targetShape].sides;
    const totalDots = requiredDots + Math.floor(Math.random() * 3) + 2; // Add extra dots
    
    // Generate target shape dots first
    for (let i = 0; i < requiredDots; i++) {
      const angle = (i * 2 * Math.PI) / requiredDots - Math.PI / 2;
      newDots.push({
        id: i,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        isTarget: true
      });
    }
    
    // Add random extra dots
    for (let i = requiredDots; i < totalDots; i++) {
      let validPosition = false;
      let attempts = 0;
      
      while (!validPosition && attempts < 20) {
        const x = 50 + Math.random() * (canvas.width - 100);
        const y = 50 + Math.random() * (canvas.height - 100);
        
        // Check distance from existing dots
        validPosition = newDots.every(dot => {
          const distance = Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
          return distance > 60;
        });
        
        if (validPosition) {
          newDots.push({
            id: i,
            x,
            y,
            isTarget: false
          });
        }
        attempts++;
      }
    }
    
    setDots(newDots);
    setConnections([]);
    setSelectedDot(null);
    setIsComplete(false);
    setShowResult(false);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 3;
    connections.forEach(connection => {
      const dot1 = dots.find(d => d.id === connection.from);
      const dot2 = dots.find(d => d.id === connection.to);
      if (dot1 && dot2) {
        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineTo(dot2.x, dot2.y);
        ctx.stroke();
      }
    });
    
    // Draw dots
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = selectedDot === dot.id ? '#ff9800' : 
                     dot.isTarget ? '#4caf50' : '#9e9e9e';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw dot number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dot.id + 1, dot.x, dot.y + 4);
    });
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find clicked dot
    const clickedDot = dots.find(dot => {
      const distance = Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
      return distance <= 15;
    });
    
    if (clickedDot) {
      if (selectedDot === null) {
        setSelectedDot(clickedDot.id);
      } else if (selectedDot === clickedDot.id) {
        setSelectedDot(null);
      } else {
        // Create connection
        const connectionExists = connections.some(c => 
          (c.from === selectedDot && c.to === clickedDot.id) ||
          (c.from === clickedDot.id && c.to === selectedDot)
        );
        
        if (!connectionExists) {
          const newConnections = [...connections, { from: selectedDot, to: clickedDot.id }];
          setConnections(newConnections);
          checkCompletion(newConnections);
        }
        setSelectedDot(null);
      }
    }
  };

  const checkCompletion = (currentConnections) => {
    const requiredSides = shapes[targetShape].sides;
    
    if (currentConnections.length === requiredSides) {
      // Check if connections form a closed shape
      const targetDots = dots.filter(d => d.isTarget).map(d => d.id);
      const usedDots = new Set();
      
      currentConnections.forEach(conn => {
        usedDots.add(conn.from);
        usedDots.add(conn.to);
      });
      
      // Check if all target dots are used and only target dots
      const allTargetDotsUsed = targetDots.every(id => usedDots.has(id));
      const onlyTargetDotsUsed = Array.from(usedDots).every(id => targetDots.includes(id));
      
      // Check if it forms a closed loop
      const isClosedLoop = checkClosedLoop(currentConnections, targetDots);
      
      if (allTargetDotsUsed && onlyTargetDotsUsed && isClosedLoop) {
        setIsComplete(true);
        setShowResult(true);
        setScore(prev => prev + shapes[targetShape].points);
        
        setTimeout(() => {
          nextLevel();
        }, 2000);
      }
    }
  };

  const checkClosedLoop = (connections, targetDots) => {
    if (connections.length === 0) return false;
    
    // Build adjacency list
    const graph = {};
    targetDots.forEach(id => graph[id] = []);
    
    connections.forEach(conn => {
      if (graph[conn.from]) graph[conn.from].push(conn.to);
      if (graph[conn.to]) graph[conn.to].push(conn.from);
    });
    
    // Check if each vertex has exactly 2 connections (closed loop)
    return targetDots.every(id => graph[id].length === 2);
  };

  const nextLevel = () => {
    const shapeKeys = Object.keys(shapes);
    const currentIndex = shapeKeys.indexOf(targetShape);
    const nextShape = shapeKeys[(currentIndex + 1) % shapeKeys.length];
    
    if (currentIndex === shapeKeys.length - 1) {
      setLevel(prev => prev + 1);
    }
    
    setTargetShape(nextShape);
    setTimeout(() => {
      generateDots();
    }, 500);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setTargetShape('triangle');
    generateDots();
  };

  const clearConnections = () => {
    setConnections([]);
    setSelectedDot(null);
    setIsComplete(false);
    setShowResult(false);
  };

  useEffect(() => {
    generateDots();
  }, [targetShape]);

  useEffect(() => {
    drawCanvas();
  }, [dots, connections, selectedDot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 500;
      canvas.height = 400;
      generateDots();
    }
  }, []);

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: 3, 
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: '20px'
    }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ color: '#2196f3', fontWeight: 'bold' }}>
        🔷 بناء الأشكال الهندسية
      </Typography>
      
      {/* Score and Level */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
      </Box>

      {/* Target Shape */}
      <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
        اربط النقاط الخضراء لتكوين: <strong>{shapes[targetShape].name}</strong>
      </Typography>

      {/* Canvas */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{ 
            border: '2px solid #ddd', 
            borderRadius: '10px',
            cursor: 'pointer',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </Paper>

      {/* Instructions */}
      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        انقر على نقطة خضراء ثم انقر على نقطة أخرى لربطهما
      </Typography>

      {/* Result Message */}
      {showResult && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 3,
            backgroundColor: isComplete ? '#e8f5e8' : '#ffeaea',
            border: `2px solid ${isComplete ? '#4caf50' : '#f44336'}`
          }}
        >
          <Typography variant="h6" sx={{ color: isComplete ? '#2e7d32' : '#d32f2f' }}>
            {isComplete ? '🎉 ممتاز! شكل مكتمل!' : '❌ حاول مرة أخرى'}
          </Typography>
        </Paper>
      )}

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          onClick={clearConnections}
          size="large"
        >
          مسح الخطوط
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={generateDots}
          size="large"
        >
          ترتيب جديد
        </Button>
        
        <Button 
          variant="contained" 
          onClick={resetGame}
          size="large"
          color="secondary"
        >
          إعادة تشغيل
        </Button>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🟢 النقاط الخضراء: نقاط الشكل المطلوب
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ⚪ النقاط الرمادية: نقاط إضافية (لا تستخدمها)
        </Typography>
        <Typography variant="body2">
          🟠 النقطة المحددة: النقطة التي اخترتها للربط
        </Typography>
      </Box>
    </Box>
  );
};

export default ShapeBuilder;
