import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import { playSfx } from '@/lib/sfx';

const AngleHunter = () => {
  const canvasRef = useRef(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [angleType, setAngleType] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameMode, setGameMode] = useState('identify'); // 'identify' or 'measure'

  const angleTypes = {
    acute: { name: 'حادة', range: [1, 89], color: '#4caf50' },
    right: { name: 'قائمة', range: [90, 90], color: '#2196f3' },
    obtuse: { name: 'منفرجة', range: [91, 179], color: '#ff9800' },
    straight: { name: 'مستقيمة', range: [180, 180], color: '#9c27b0' },
    reflex: { name: 'منعكسة', range: [181, 359], color: '#f44336' }
  };

  const generateNewAngle = () => {
    const newMode = Math.random() > 0.2 ? 'identify' : 'measure';
    setGameMode(newMode);

    let angle;
    let type;

    if (level === 1) {
      // Easy: only acute, right, obtuse
      const easyTypes = ['acute', 'right', 'obtuse'];
      type = easyTypes[Math.floor(Math.random() * easyTypes.length)];
    } else if (level === 2) {
      // Medium: add straight angles
      const mediumTypes = ['acute', 'right', 'obtuse', 'straight'];
      type = mediumTypes[Math.floor(Math.random() * mediumTypes.length)];
    } else {
      // Hard: all types including reflex
      const allTypes = Object.keys(angleTypes);
      type = allTypes[Math.floor(Math.random() * allTypes.length)];
    }

    const [min, max] = angleTypes[type].range;
    if (min === max) {
      angle = min;
    } else {
      angle = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    setCurrentAngle(angle);
    setAngleType(type);
    setSelectedAnswer(null);
    setShowResult(false);

    if (newMode === 'identify') {
      generateTypeOptions(type);
    } else {
      generateMeasureOptions(angle);
    }
  };

  const generateTypeOptions = (correctType) => {
    const correctName = angleTypes[correctType].name;
    const allTypes = Object.keys(angleTypes);
    const wrongTypes = allTypes.filter(t => t !== correctType);
    
    // Select 3 wrong options
    const wrongOptions = [];
    while (wrongOptions.length < 3 && wrongTypes.length > 0) {
      const randomIndex = Math.floor(Math.random() * wrongTypes.length);
      const wrongType = wrongTypes.splice(randomIndex, 1)[0];
      wrongOptions.push(angleTypes[wrongType].name);
    }

    const allOptions = [correctName, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const generateMeasureOptions = (correctAngle) => {
    const wrongOptions = [];
    while (wrongOptions.length < 3) {
      let wrong;
      if (Math.random() > 0.5) {
        wrong = correctAngle + Math.floor(Math.random() * 30) + 5;
      } else {
        wrong = correctAngle - Math.floor(Math.random() * 30) - 5;
      }
      
      if (wrong > 0 && wrong <= 360 && wrong !== correctAngle && !wrongOptions.includes(wrong)) {
        wrongOptions.push(wrong);
      }
    }

    const allOptions = [correctAngle, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions.map(opt => `${opt}°`));
  };

  const drawAngle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw angle
    const startAngle = 0;
    const endAngle = (currentAngle * Math.PI) / 180;
    
    // Draw the two rays
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    
    // First ray (horizontal reference line)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();
    
    // Second ray
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + radius * Math.cos(endAngle),
      centerY - radius * Math.sin(endAngle)
    );
    ctx.stroke();

    // Draw arc to show the angle
    const arcRadius = radius * 0.4;
    ctx.strokeStyle = angleTypes[angleType]?.color || '#666';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, arcRadius, -endAngle, 0);
    ctx.stroke();

    // Fill arc for better visibility
    ctx.fillStyle = angleTypes[angleType]?.color || '#666';
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, arcRadius, -endAngle, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw center point
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw angle measurement text
    if ( showResult) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      const textX = centerX;
      const textY = 20;
      ctx.fillText(`${currentAngle}°`, textX, textY);
    }

    // Draw right angle indicator for 90-degree angles
    if (currentAngle === 90) {
      const squareSize = 20;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX, centerY - squareSize, squareSize, squareSize);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    
    playSfx('click');
    setSelectedAnswer(answer);
    
    let correct = false;
    if (gameMode === 'identify') {
      correct = answer === angleTypes[angleType].name;
    } else {
      correct = answer === `${currentAngle}°`;
    }
    
    setIsCorrect(correct);
    setShowResult(true);
    
    playSfx(correct ? 'correct' : 'wrong');
    
    if (correct) {
      setScore(prev => prev + level);
      setTimeout(() => {
        if (score > 0 && score % 15 === 14) {
          setLevel(prev => Math.min(prev + 1, 3));
        }
        generateNewAngle();
      }, 2000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setGameMode('identify');
    generateNewAngle();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: 'مبتدئ - زوايا بسيطة',
      2: 'متوسط - مع الزوايا المستقيمة',
      3: 'متقدم - جميع أنواع الزوايا'
    };
    return descriptions[level];
  };

  const getQuestionText = () => {
    if (gameMode === 'identify') {
      return 'ما نوع هذه الزاوية؟';
    } else {
      return 'كم تبلغ قياس هذه الزاوية؟';
    }
  };

  useEffect(() => {
    generateNewAngle();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 400;
      canvas.height = 300;
      drawAngle();
    }
  }, [currentAngle, angleType, gameMode, showResult]);

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
        📐 صياد الزوايا
      </Typography>
      
      {/* Score and Level */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip 
          label={gameMode === 'identify' ? 'تحديد النوع' : 'قياس الزاوية'} 
          color="success" 
          size="large" 
        />
      </Box>

      {/* Level Description */}
      <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
        {getLevelDescription()}
      </Typography>

      {/* Question */}
      <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
        {getQuestionText()}
      </Typography>

      {/* Angle Canvas */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          style={{ 
            border: '2px solid #ddd', 
            borderRadius: '10px',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </Paper>

      {/* Answer Options */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        اختر الإجابة الصحيحة:
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 2, 
        mb: 3,
        flexWrap: 'wrap'
      }}>
        {options.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswer === option ? "contained" : "outlined"}
            size="large"
            onClick={() => handleAnswerSelect(option)}
            disabled={showResult}
            sx={{
              minWidth: 120,
              height: 60,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              backgroundColor: showResult 
                ? (option === (gameMode === 'identify' ? angleTypes[angleType].name : `${currentAngle}°`)
                    ? '#4caf50' 
                    : (selectedAnswer === option ? '#f44336' : undefined))
                : undefined,
              color: showResult && option === (gameMode === 'identify' ? angleTypes[angleType].name : `${currentAngle}°`) ? 'white' : undefined,
              '&:hover': {
                transform: showResult ? 'none' : 'scale(1.05)',
              }
            }}
          >
            {option}
          </Button>
        ))}
      </Box>

      {/* Result Message */}
      {showResult && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 3,
            backgroundColor: isCorrect ? '#e8f5e8' : '#ffeaea',
            border: `2px solid ${isCorrect ? '#4caf50' : '#f44336'}`
          }}
        >
          <Typography variant="h6" sx={{ color: isCorrect ? '#2e7d32' : '#d32f2f' }}>
            {isCorrect ? '🎉 ممتاز! إجابة صحيحة!' : '❌ حاول مرة أخرى'}
          </Typography>
          {!isCorrect && (
            <Typography variant="body1" sx={{ mt: 1, color: '#666' }}>
              الإجابة الصحيحة: {gameMode === 'identify' 
                ? angleTypes[angleType].name 
                : `${currentAngle}°`
              }
            </Typography>
          )}
        </Paper>
      )}

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          onClick={generateNewAngle}
          size="large"
        >
          زاوية جديدة
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

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f7ff', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          📚 أنواع الزوايا
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          {Object.entries(angleTypes).map(([key, type]) => (
            <Box key={key} sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="body2" sx={{ 
                color: type.color, 
                fontWeight: 'bold',
                backgroundColor: 'white',
                p: 1,
                borderRadius: 1,
                border: `2px solid ${type.color}`
              }}>
                {type.name}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                {type.range[0] === type.range[1] 
                  ? `${type.range[0]}°`
                  : `${type.range[0]}°-${type.range[1]}°`
                }
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
          💡 نصيحة: ابدأ من الخط الأفقي وقس في اتجاه عقارب الساعة
        </Typography>
      </Box>
    </Box>
  );
};

export default AngleHunter;
