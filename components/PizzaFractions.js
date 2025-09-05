import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import { playSfx } from '@/lib/sfx';

const PizzaFractions = () => {
  const canvasRef = useRef(null);
  const [targetFraction, setTargetFraction] = useState({ numerator: 1, denominator: 2 });
  const [pizzaSlices, setPizzaSlices] = useState(8);
  const [selectedSlices, setSelectedSlices] = useState(new Set());
  const [gameMode, setGameMode] = useState('select'); // 'select' or 'identify'
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const pizzaColors = {
    base: '#ffd54f',
    crust: '#8d6e63',
    selected: '#ff6b35',
    unselected: '#ffe082',
    toppings: ['#d32f2f', '#388e3c', '#f57c00']
  };

  const generateNewProblem = () => {
    const modes = ['select', 'identify'];
    const newMode = modes[Math.floor(Math.random() * modes.length)];
    setGameMode(newMode);

    // Generate fractions based on level
    let denominators, numerator, denominator;
    
    if (level === 1) {
      denominators = [2, 4];
    } else if (level === 2) {
      denominators = [2, 3, 4, 6];
    } else {
      denominators = [2, 3, 4, 5, 6, 8];
    }

    denominator = denominators[Math.floor(Math.random() * denominators.length)];
    numerator = Math.floor(Math.random() * denominator) + 1;

    // Ensure fraction is not improper
    if (numerator >= denominator) {
      numerator = denominator - 1;
    }

    setTargetFraction({ numerator, denominator });
    setPizzaSlices(denominator);
    setSelectedSlices(new Set());
    setSelectedAnswer(null);
    setShowResult(false);

    if (newMode === 'identify') {
      // Pre-select slices and ask for fraction
      const targetSlices = Math.floor((numerator / denominator) * denominator);
      const preSelected = new Set();
      for (let i = 0; i < targetSlices; i++) {
        preSelected.add(i);
      }
      setSelectedSlices(preSelected);
      generateFractionOptions(numerator, denominator);
    } else {
      generateInstructions();
    }
  };

  const generateFractionOptions = (correctNum, correctDen) => {
    const correctFraction = `${correctNum}/${correctDen}`;
    const wrongOptions = new Set();

    // Generate similar fractions
    while (wrongOptions.size < 3) {
      let wrongNum, wrongDen;
      
      if (Math.random() > 0.5) {
        // Same denominator, different numerator
        wrongDen = correctDen;
        wrongNum = Math.floor(Math.random() * correctDen) + 1;
        if (wrongNum !== correctNum) {
          wrongOptions.add(`${wrongNum}/${wrongDen}`);
        }
      } else {
        // Different denominator
        const otherDenominators = [2, 3, 4, 5, 6, 8].filter(d => d !== correctDen);
        wrongDen = otherDenominators[Math.floor(Math.random() * otherDenominators.length)];
        wrongNum = Math.floor(Math.random() * wrongDen) + 1;
        wrongOptions.add(`${wrongNum}/${wrongDen}`);
      }
    }

    const allOptions = [correctFraction, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const generateInstructions = () => {
    setOptions([]);
  };

  const drawPizza = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pizza base
    ctx.fillStyle = pizzaColors.base;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw pizza slices
    const anglePerSlice = (2 * Math.PI) / pizzaSlices;
    
    for (let i = 0; i < pizzaSlices; i++) {
      const startAngle = i * anglePerSlice - Math.PI / 2;
      const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
      
      // Fill slice
      ctx.fillStyle = selectedSlices.has(i) ? pizzaColors.selected : pizzaColors.unselected;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Draw slice border
      ctx.strokeStyle = pizzaColors.crust;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add toppings to selected slices
      if (selectedSlices.has(i)) {
        const midAngle = (startAngle + endAngle) / 2;
        const toppingRadius = radius * 0.6;
        
        // Draw pepperoni or other toppings
        for (let j = 0; j < 2; j++) {
          const toppingX = centerX + (toppingRadius * (0.4 + j * 0.3)) * Math.cos(midAngle);
          const toppingY = centerY + (toppingRadius * (0.4 + j * 0.3)) * Math.sin(midAngle);
          
          ctx.fillStyle = pizzaColors.toppings[j % pizzaColors.toppings.length];
          ctx.beginPath();
          ctx.arc(toppingX, toppingY, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Draw crust
    ctx.strokeStyle = pizzaColors.crust;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw slice dividers
    ctx.strokeStyle = pizzaColors.crust;
    ctx.lineWidth = 3;
    for (let i = 0; i < pizzaSlices; i++) {
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

  const handlePizzaClick = (event) => {
    if (gameMode === 'identify' || showResult) return;
    
    playSfx('click');
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    // Check if click is within pizza
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (distance > radius) return;

    // Determine which slice was clicked
    const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
    const sliceIndex = Math.floor(normalizedAngle / ((2 * Math.PI) / pizzaSlices));

    const newSelectedSlices = new Set(selectedSlices);
    if (newSelectedSlices.has(sliceIndex)) {
      newSelectedSlices.delete(sliceIndex);
    } else {
      newSelectedSlices.add(sliceIndex);
    }
    
    setSelectedSlices(newSelectedSlices);
  };

  const checkAnswer = () => {
    if (gameMode === 'select') {
      const expectedSlices = Math.round((targetFraction.numerator / targetFraction.denominator) * pizzaSlices);
      const correct = selectedSlices.size === expectedSlices;
      
      setIsCorrect(correct);
      setShowResult(true);
      playSfx(correct ? 'correct' : 'wrong');
      
      if (correct) {
        setScore(prev => prev + level);
        setTimeout(() => {
          if (score > 0 && score % 10 === 9) {
            setLevel(prev => Math.min(prev + 1, 3));
          }
          generateNewProblem();
        }, 2000);
      }
    }
  };

  const handleAnswerSelect = (answer) => {
    if (showResult || gameMode === 'select') return;
    
    playSfx('click');
    setSelectedAnswer(answer);
    
    const correctAnswer = `${targetFraction.numerator}/${targetFraction.denominator}`;
    const correct = answer === correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);
    playSfx(correct ? 'correct' : 'wrong');
    
    if (correct) {
      setScore(prev => prev + level);
      setTimeout(() => {
        if (score > 0 && score % 10 === 9) {
          setLevel(prev => Math.min(prev + 1, 3));
        }
        generateNewProblem();
      }, 2000);
    }
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

  const getCurrentFraction = () => {
    if (selectedSlices.size === 0) return { numerator: 0, denominator: pizzaSlices };
    return simplifyFraction(selectedSlices.size, pizzaSlices);
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
    if (gameMode === 'select') {
      return `انقر على شرائح البيتزا لتمثيل الكسر: ${targetFraction.numerator}/${targetFraction.denominator}`;
    } else {
      return 'ما هو الكسر الذي تمثله الشرائح المحددة؟';
    }
  };

  useEffect(() => {
    generateNewProblem();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 400;
      canvas.height = 400;
      drawPizza();
    }
  }, [pizzaSlices, selectedSlices]);

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
        🍕 كسور البيتزا
      </Typography>
      
      {/* Score and Level */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip 
          label={gameMode === 'select' ? 'اختر الشرائح' : 'حدد الكسر'} 
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

      {/* Current Selection Display */}
      {gameMode === 'select' && showResult && (
        <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
          الكسر الحالي: {getCurrentFraction().numerator}/{getCurrentFraction().denominator}
          {selectedSlices.size > 0 && (
            <span style={{ marginLeft: 8, color: '#1976d2' }}>
              ({selectedSlices.size} من {pizzaSlices} شريحة)
            </span>
          )}
        </Typography>
      )}

      {/* Pizza Canvas */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          onClick={handlePizzaClick}
          style={{ 
            border: '2px solid #ddd', 
            borderRadius: '15px',
            cursor: gameMode === 'select' && !showResult ? 'pointer' : 'default',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </Paper>

      {/* Instructions */}
      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        {gameMode === 'select' 
          ? 'انقر على شرائح البيتزا لتحديدها أو إلغاء تحديدها'
          : 'الشرائح البرتقالية محددة، اختر الكسر الصحيح'
        }
      </Typography>

      {/* Submit Button for Select Mode */}
      {gameMode === 'select' && !showResult && (
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={checkAnswer}
            size="large"
            disabled={selectedSlices.size === 0}
          >
            تحقق من الإجابة
          </Button>
        </Box>
      )}

      {/* Answer Options for Identify Mode */}
      {gameMode === 'identify' && options.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            اختر الكسر الصحيح:
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
                  minWidth: 80,
                  height: 60,
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  backgroundColor: showResult 
                    ? (option === `${targetFraction.numerator}/${targetFraction.denominator}`
                        ? '#4caf50' 
                        : (selectedAnswer === option ? '#f44336' : undefined))
                    : undefined,
                  color: showResult && option === `${targetFraction.numerator}/${targetFraction.denominator}` ? 'white' : undefined,
                  '&:hover': {
                    transform: showResult ? 'none' : 'scale(1.05)',
                  }
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </Box>
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
          {!isCorrect && gameMode === 'select' && (
            <Typography variant="body1" sx={{ mt: 1, color: '#666' }}>
              يجب اختيار {Math.round((targetFraction.numerator / targetFraction.denominator) * pizzaSlices)} شريحة من {pizzaSlices}
            </Typography>
          )}
          {!isCorrect && gameMode === 'identify' && (
            <Typography variant="body1" sx={{ mt: 1, color: '#666' }}>
              الإجابة الصحيحة: {targetFraction.numerator}/{targetFraction.denominator}
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
          بيتزا جديدة
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
          📚 تعلم الكسور
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔢 <strong>البسط:</strong> العدد العلوي - يخبرنا كم جزء لدينا
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔢 <strong>المقام:</strong> العدد السفلي - يخبرنا إجمالي عدد الأجزاء
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🍕 <strong>مثال:</strong> ٣/٨ يعني ٣ شرائح من أصل ٨ شرائح
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          💡 نصيحة: كلما زاد المقام، كانت الشرائح أصغر!
        </Typography>
      </Box>
    </Box>
  );
};

export default PizzaFractions;
