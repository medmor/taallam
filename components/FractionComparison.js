import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip, Zoom, Fade, LinearProgress } from '@mui/material';
import { playSfx } from '@/lib/sfx';
import { GameProgressionManager } from '@/lib/gameEnhancements';
import { gameThemes, enhancedButtonStyles, cardAnimations, createFireworksEffect, enhancedSoundFeedback } from '@/lib/visualEnhancements';

const FractionComparison = () => {
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const [leftFraction, setLeftFraction] = useState({ numerator: 1, denominator: 2 });
  const [rightFraction, setRightFraction] = useState({ numerator: 1, denominator: 4 });
  const [gameMode, setGameMode] = useState('compare'); // 'compare' or 'order'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [fractionList, setFractionList] = useState([]);
  const [orderedAnswers, setOrderedAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [animatingFractions, setAnimatingFractions] = useState(false);
  
  const gameRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const gameManager = useRef(new GameProgressionManager('fractionComparison')).current;
  const theme = gameThemes.fractions;

  const pieColors = {
    filled: '#ff6b35',
    unfilled: '#ffe082',
    border: '#8d6e63',
    background: '#fff8e1'
  };

  const generateNewProblem = () => {
    const modes = ['compare', 'order'];
    const newMode = modes[Math.floor(Math.random() * modes.length)];
    setGameMode(newMode);

    setSelectedAnswer(null);
    setShowResult(false);
    setOrderedAnswers([]);

    if (newMode === 'compare') {
      generateCompareProblem();
    } else {
      generateOrderProblem();
    }
  };

  const generateCompareProblem = () => {
    const currentLevel = gameManager.getCurrentLevel();
    let denominators;
    
    // Enhanced difficulty progression for fractions
    switch (currentLevel) {
      case 'beginner':
        denominators = [2, 3, 4]; // Simple fractions
        break;
      case 'intermediate':
        denominators = [2, 3, 4, 5, 6]; // Add 5ths and 6ths
        break;
      case 'advanced':
        denominators = [2, 3, 4, 5, 6, 8, 10]; // Add 8ths and 10ths
        break;
      case 'expert':
        denominators = [2, 3, 4, 5, 6, 8, 9, 10, 12]; // Complex fractions
        break;
      default:
        denominators = [2, 3, 4];
    }

    let leftNum, leftDen, rightNum, rightDen;

    // Generate two different fractions
    leftDen = denominators[Math.floor(Math.random() * denominators.length)];
    leftNum = Math.floor(Math.random() * leftDen) + 1;
    
    do {
      rightDen = denominators[Math.floor(Math.random() * denominators.length)];
      rightNum = Math.floor(Math.random() * rightDen) + 1;
    } while (leftNum / leftDen === rightNum / rightDen);

    // Ensure fractions are proper
    if (leftNum >= leftDen) leftNum = leftDen - 1;
    if (rightNum >= rightDen) rightNum = rightDen - 1;

    setLeftFraction({ numerator: leftNum, denominator: leftDen });
    setRightFraction({ numerator: rightNum, denominator: rightDen });
  };

  const generateOrderProblem = () => {
    let denominators;
    
    if (level === 1) {
      denominators = [2, 4];
    } else if (level === 2) {
      denominators = [2, 3, 4, 6];
    } else {
      denominators = [2, 3, 4, 5, 6, 8];
    }

    const fractions = [];
    const count = level === 1 ? 3 : (level === 2 ? 4 : 5);

    for (let i = 0; i < count; i++) {
      const den = denominators[Math.floor(Math.random() * denominators.length)];
      const num = Math.floor(Math.random() * den) + 1;
      if (num < den) {
        fractions.push({ numerator: num, denominator: den });
      }
    }

    // Ensure we have unique fractions
    const uniqueFractions = fractions.filter((frac, index, arr) => 
      arr.findIndex(f => f.numerator / f.denominator === frac.numerator / frac.denominator) === index
    );

    if (uniqueFractions.length < count) {
      // Add more fractions if needed
      while (uniqueFractions.length < count) {
        const den = denominators[Math.floor(Math.random() * denominators.length)];
        const num = Math.floor(Math.random() * den) + 1;
        const newFrac = { numerator: num, denominator: den };
        if (num < den && !uniqueFractions.some(f => f.numerator / f.denominator === num / den)) {
          uniqueFractions.push(newFrac);
        }
      }
    }

    setFractionList(uniqueFractions.slice(0, count));
  };

  const drawPieChart = (canvas, fraction, size = 'normal') => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = size === 'small' ? 30 : Math.min(canvas.width, canvas.height) * 0.35;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background circle
    ctx.fillStyle = pieColors.background;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw pie slices
    const anglePerSlice = (2 * Math.PI) / fraction.denominator;
    
    for (let i = 0; i < fraction.denominator; i++) {
      const startAngle = i * anglePerSlice - Math.PI / 2;
      const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
      
      // Fill slice
      ctx.fillStyle = i < fraction.numerator ? pieColors.filled : pieColors.unfilled;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Draw slice border
      ctx.strokeStyle = pieColors.border;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw outer border
    ctx.strokeStyle = pieColors.border;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw slice dividers
    ctx.strokeStyle = pieColors.border;
    ctx.lineWidth = 2;
    for (let i = 0; i < fraction.denominator; i++) {
      const angle = i * anglePerSlice - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
      ctx.stroke();
    }
  };

  const checkCompareAnswer = (answer) => {
    playSfx('click');
    setSelectedAnswer(answer);
    
    const leftValue = leftFraction.numerator / leftFraction.denominator;
    const rightValue = rightFraction.numerator / rightFraction.denominator;
    
    let correctAnswer;
    if (leftValue > rightValue) {
      correctAnswer = 'greater';
    } else if (leftValue < rightValue) {
      correctAnswer = 'less';
    } else {
      correctAnswer = 'equal';
    }
    
    const correct = answer === correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    playSfx(correct ? 'correct' : 'wrong');
    
    if (correct) {
      setScore(prev => prev + level);
      setTimeout(() => {
        if (score > 0 && score % 15 === 14) {
          setLevel(prev => Math.min(prev + 1, 3));
        }
        generateNewProblem();
      }, 2000);
    }
  };

  const handleOrderDrop = (fraction) => {
    if (showResult) return;
    
    playSfx('click');
    
    if (!orderedAnswers.find(f => f.numerator === fraction.numerator && f.denominator === fraction.denominator)) {
      const newOrdered = [...orderedAnswers, fraction];
      setOrderedAnswers(newOrdered);
      
      if (newOrdered.length === fractionList.length) {
        checkOrderAnswer(newOrdered);
      }
    }
  };

  const checkOrderAnswer = (orderedFractions) => {
    const sortedCorrect = [...fractionList].sort((a, b) => 
      (a.numerator / a.denominator) - (b.numerator / b.denominator)
    );
    
    const isCorrectOrder = orderedFractions.every((frac, index) => 
      frac.numerator === sortedCorrect[index].numerator && 
      frac.denominator === sortedCorrect[index].denominator
    );
    
    setIsCorrect(isCorrectOrder);
    setShowResult(true);
    playSfx(isCorrectOrder ? 'correct' : 'wrong');
    
    if (isCorrectOrder) {
      setScore(prev => prev + level * 2);
      setTimeout(() => {
        if (score > 0 && score % 15 === 14) {
          setLevel(prev => Math.min(prev + 1, 3));
        }
        generateNewProblem();
      }, 2000);
    }
  };

  const resetOrderAnswer = () => {
    playSfx('click');
    setOrderedAnswers([]);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    generateNewProblem();
  };

  const simplifyFraction = (num, den) => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(num, den);
    return { numerator: num / divisor, denominator: den / divisor };
  };

  const getFractionText = (fraction, showSimplified = false) => {
    if (showSimplified) {
      const simplified = simplifyFraction(fraction.numerator, fraction.denominator);
      const original = `${fraction.numerator}/${fraction.denominator}`;
      const simplifiedText = `${simplified.numerator}/${simplified.denominator}`;
      
      // Only show simplified version if it's different from original
      if (original !== simplifiedText) {
        return `${original} = ${simplifiedText}`;
      }
    }
    return `${fraction.numerator}/${fraction.denominator}`;
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: 'مبتدئ - كسور بسيطة',
      2: 'متوسط - كسور متنوعة', 
      3: 'متقدم - كسور معقدة'
    };
    return descriptions[level];
  };

  const getQuestionText = () => {
    if (gameMode === 'compare') {
      return 'قارن بين الكسرين التاليين:';
    } else {
      return 'رتب الكسور من الأصغر إلى الأكبر:';
    }
  };

  useEffect(() => {
    generateNewProblem();
  }, []);

  useEffect(() => {
    if (gameMode === 'compare') {
      const leftCanvas = leftCanvasRef.current;
      const rightCanvas = rightCanvasRef.current;
      
      if (leftCanvas) {
        leftCanvas.width = 200;
        leftCanvas.height = 200;
        drawPieChart(leftCanvas, leftFraction);
      }
      
      if (rightCanvas) {
        rightCanvas.width = 200;
        rightCanvas.height = 200;
        drawPieChart(rightCanvas, rightFraction);
      }
    }
  }, [leftFraction, rightFraction, gameMode]);

  const OrderableChart = ({ fraction, index }) => {
    const canvasRef = useRef(null);
    
    useEffect(() => {
      if (canvasRef.current) {
        canvasRef.current.width = 80;
        canvasRef.current.height = 80;
        drawPieChart(canvasRef.current, fraction, 'small');
      }
    }, [fraction]);

    const isUsed = orderedAnswers.find(f => f.numerator === fraction.numerator && f.denominator === fraction.denominator);
    
    return (
      <Paper
        elevation={isUsed ? 1 : 3}
        sx={{
          p: 2,
          textAlign: 'center',
          cursor: isUsed ? 'default' : 'pointer',
          opacity: isUsed ? 0.3 : 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: isUsed ? 'none' : 'scale(1.05)',
            elevation: isUsed ? 1 : 6
          }
        }}
        onClick={() => !isUsed && handleOrderDrop(fraction)}
      >
        <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />
        <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
          {getFractionText(fraction)}
        </Typography>
      </Paper>
    );
  };

  return (
    <Box sx={{ 
      maxWidth: 1000, 
      mx: 'auto', 
      p: 3, 
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: '20px'
    }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ color: '#2196f3', fontWeight: 'bold' }}>
        📊 مقارنة الكسور
      </Typography>
      
      {/* Score and Level */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip 
          label={gameMode === 'compare' ? 'مقارنة' : 'ترتيب'} 
          color="success" 
          size="large" 
        />
      </Box>

      {/* Level Description */}
      <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
        {getLevelDescription()}
      </Typography>

      {/* Question */}
      <Typography variant="h6" sx={{ mb: 3, color: '#333' }}>
        {getQuestionText()}
      </Typography>

      {/* Compare Mode */}
      {gameMode === 'compare' && (
        <>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 4, 
            mb: 3,
            flexWrap: 'wrap'
          }}>
            {/* Left Fraction */}
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <canvas ref={leftCanvasRef} style={{ display: 'block', margin: '0 auto' }} />
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#1976d2' }}>
                {getFractionText(leftFraction, true)}
              </Typography>
            </Paper>

            {/* Comparison Symbol */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h3" sx={{ color: '#666', fontWeight: 'bold' }}>
                ؟
              </Typography>
            </Box>

            {/* Right Fraction */}
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <canvas ref={rightCanvasRef} style={{ display: 'block', margin: '0 auto' }} />
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#1976d2' }}>
                {getFractionText(rightFraction, true)}
              </Typography>
            </Paper>
          </Box>

          {/* Answer Options */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mb: 3,
            flexWrap: 'wrap'
          }}>
            <Button
              variant={selectedAnswer === 'greater' ? "contained" : "outlined"}
              size="large"
              onClick={() => checkCompareAnswer('greater')}
              disabled={showResult}
              sx={{
                minWidth: 120,
                height: 60,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                backgroundColor: showResult && selectedAnswer === 'greater'
                  ? (isCorrect ? '#4caf50' : '#f44336')
                  : undefined,
                color: showResult && selectedAnswer === 'greater' && !isCorrect ? 'white' : undefined
              }}
            >
              &gt; أكبر من
            </Button>
            
            <Button
              variant={selectedAnswer === 'less' ? "contained" : "outlined"}
              size="large"
              onClick={() => checkCompareAnswer('less')}
              disabled={showResult}
              sx={{
                minWidth: 120,
                height: 60,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                backgroundColor: showResult && selectedAnswer === 'less'
                  ? (isCorrect ? '#4caf50' : '#f44336')
                  : undefined,
                color: showResult && selectedAnswer === 'less' && !isCorrect ? 'white' : undefined
              }}
            >
              &lt; أصغر من
            </Button>
            
            <Button
              variant={selectedAnswer === 'equal' ? "contained" : "outlined"}
              size="large"
              onClick={() => checkCompareAnswer('equal')}
              disabled={showResult}
              sx={{
                minWidth: 120,
                height: 60,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                backgroundColor: showResult && selectedAnswer === 'equal'
                  ? (isCorrect ? '#4caf50' : '#f44336')
                  : undefined,
                color: showResult && selectedAnswer === 'equal' && !isCorrect ? 'white' : undefined
              }}
            >
              = يساوي
            </Button>
          </Box>
        </>
      )}

      {/* Order Mode */}
      {gameMode === 'order' && (
        <>
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            انقر على الكسور لترتيبها من الأصغر إلى الأكبر:
          </Typography>

          {/* Available Fractions */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mb: 3,
            flexWrap: 'wrap'
          }}>
            {fractionList.map((fraction, index) => (
              <OrderableChart key={index} fraction={fraction} index={index} />
            ))}
          </Box>

          {/* Ordered Result */}
          {orderedAnswers.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                الترتيب الحالي:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1, 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                {orderedAnswers.map((fraction, index) => (
                  <React.Fragment key={index}>
                    <Chip 
                      label={getFractionText(fraction)} 
                      color="primary" 
                      size="large"
                      sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                    />
                    {index < orderedAnswers.length - 1 && (
                      <Typography variant="h6" sx={{ color: '#666' }}>&lt;</Typography>
                    )}
                  </React.Fragment>
                ))}
              </Box>

              <Button 
                variant="outlined" 
                onClick={resetOrderAnswer}
                sx={{ mt: 2 }}
                disabled={showResult}
              >
                إعادة ترتيب
              </Button>
            </Box>
          )}
        </>
      )}

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
          {!isCorrect && gameMode === 'compare' && (
            <Typography variant="body1" sx={{ mt: 1, color: '#666' }}>
              فكر في حجم القطع المظللة في كل دائرة
            </Typography>
          )}
          {!isCorrect && gameMode === 'order' && (
            <Typography variant="body1" sx={{ mt: 1, color: '#666' }}>
              الترتيب الصحيح: {[...fractionList]
                .sort((a, b) => (a.numerator / a.denominator) - (b.numerator / b.denominator))
                .map(f => getFractionText(f))
                .join(' < ')}
            </Typography>
          )}
        </Paper>
      )}

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          onClick={generateNewProblem}
          size="large"
        >
          مسألة جديدة
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
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff3e0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#f57c00' }}>
          📚 تعلم مقارنة الكسور
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🥧 <strong>الدوائر الدائرية:</strong> تساعدك على رؤية حجم الكسر بصريًا
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📏 <strong>المقارنة:</strong> قارن الأجزاء المظللة لتحديد الكسر الأكبر
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📊 <strong>نفس المقام:</strong> إذا كان المقام متساوي، الكسر ذو البسط الأكبر هو الأكبر
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔄 <strong>الكسور المتكافئة:</strong> كسور مختلفة تمثل نفس القيمة (مثل: 2/6 = 1/3)
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          💡 نصيحة: الكسور الأقرب للواحد الصحيح تكون أكبر!
        </Typography>
      </Box>
    </Box>
  );
};

export default FractionComparison;
