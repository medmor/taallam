import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip, LinearProgress } from '@mui/material';
import { playSfx } from '@/lib/sfx';

const DecimalRace = () => {
  const canvasRef = useRef(null);
  const [question, setQuestion] = useState(null);
  const [gameMode, setGameMode] = useState('identify'); // 'identify', 'compare', 'place'
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [raceProgress, setRaceProgress] = useState(0);
  const [aiProgress1, setAiProgress1] = useState(0);
  const [aiProgress2, setAiProgress2] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [isRacing, setIsRacing] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [aiSpeeds, setAiSpeeds] = useState({ ai1: 0, ai2: 0 });
  const [raceResult, setRaceResult] = useState(null);

  const raceColors = {
    track: '#2E5BBA', // Blue road color like city roads
    car: '#ff6b35',
    finish: '#4caf50',
    background: '#f0f8ff', // Light blue-ish background
    progress: '#2196f3'
  };

  const generateQuestion = () => {
    const modes = ['identify', 'compare', 'place'];
    const newMode = modes[Math.floor(Math.random() * modes.length)];
    setGameMode(newMode);
    setSelectedAnswer(null);
    setShowResult(false);

    if (newMode === 'identify') {
      generateIdentifyQuestion();
    } else if (newMode === 'compare') {
      generateCompareQuestion();
    } else {
      generatePlaceValueQuestion();
    }
  };

  const generateIdentifyQuestion = () => {
    let decimal;
    
    if (level === 1) {
      // Simple decimals with tenths
      decimal = (Math.random() * 9 + 1).toFixed(1);
    } else if (level === 2) {
      // Decimals with hundredths
      decimal = (Math.random() * 9 + 1).toFixed(2);
    } else {
      // Decimals with thousandths
      decimal = (Math.random() * 9 + 1).toFixed(3);
    }

    const parts = decimal.split('.');
    const wholePart = parts[0];
    const decimalPart = parts[1];
    
    // Generate question about place value
    const questionTypes = [
      'digit-value',
      'place-name',
      'digit-position'
    ];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const digitIndex = Math.floor(Math.random() * decimalPart.length);
    const targetDigit = decimalPart[digitIndex];
    
    let questionText, correctAnswer;
    
    if (questionType === 'digit-value') {
      const placeNames = ['العُشر', 'المئة', 'الألف'];
      const placeValues = [0.1, 0.01, 0.001];
      const digitValue = targetDigit * placeValues[digitIndex];
      
      questionText = `في العدد ${decimal}، ما قيمة الرقم ${targetDigit}؟`;
      correctAnswer = digitValue.toString();
      
      const wrongOptions = new Set();
      wrongOptions.add((targetDigit * placeValues[(digitIndex + 1) % placeValues.length]).toFixed(3));
      wrongOptions.add((targetDigit * placeValues[(digitIndex + 2) % placeValues.length]).toFixed(3));
      wrongOptions.add(targetDigit.toString());
      
      setOptions([correctAnswer, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5));
      
    } else if (questionType === 'place-name') {
      const placeNames = ['العُشر', 'المئة', 'الألف'];
      
      questionText = `في العدد ${decimal}، الرقم ${targetDigit} في خانة:`;
      correctAnswer = placeNames[digitIndex];
      
      const wrongOptions = placeNames.filter((_, i) => i !== digitIndex);
      wrongOptions.push('الآحاد');
      
      setOptions([correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5));
      
    } else {
      questionText = `في العدد ${decimal}، أي رقم في خانة ${['العُشر', 'المئة', 'الألف'][digitIndex]}؟`;
      correctAnswer = targetDigit;
      
      const wrongOptions = new Set();
      while (wrongOptions.size < 3) {
        const wrongDigit = Math.floor(Math.random() * 10).toString();
        if (wrongDigit !== correctAnswer) {
          wrongOptions.add(wrongDigit);
        }
      }
      
      const allOptions = [correctAnswer, ...Array.from(wrongOptions)]
        .sort(() => Math.random() - 0.5);
      
      setOptions(allOptions);
    }

    setQuestion({
      text: questionText,
      decimal: decimal,
      correctAnswer: correctAnswer,
      type: questionType
    });
  };

  const generateCompareQuestion = () => {
    let decimal1, decimal2;
    
    if (level === 1) {
      decimal1 = (Math.random() * 9 + 1).toFixed(1);
      decimal2 = (Math.random() * 9 + 1).toFixed(1);
    } else if (level === 2) {
      decimal1 = (Math.random() * 9 + 1).toFixed(2);
      decimal2 = (Math.random() * 9 + 1).toFixed(2);
    } else {
      decimal1 = (Math.random() * 9 + 1).toFixed(3);
      decimal2 = (Math.random() * 9 + 1).toFixed(3);
    }

    // Ensure they're different
    while (parseFloat(decimal1) === parseFloat(decimal2)) {
      decimal2 = (Math.random() * 9 + 1).toFixed(level);
    }

    const questionText = `قارن بين ${decimal1} و ${decimal2}`;
    
    let correctAnswer;
    if (parseFloat(decimal1) > parseFloat(decimal2)) {
      correctAnswer = `${decimal1} > ${decimal2}`;
    } else {
      correctAnswer = `${decimal1} < ${decimal2}`;
    }

    const wrongAnswer = parseFloat(decimal1) > parseFloat(decimal2) 
      ? `${decimal1} < ${decimal2}` 
      : `${decimal1} > ${decimal2}`;
    
    const equalAnswer = `${decimal1} = ${decimal2}`;

    setOptions([correctAnswer, wrongAnswer, equalAnswer].sort(() => Math.random() - 0.5));
    
    setQuestion({
      text: questionText,
      decimal1: decimal1,
      decimal2: decimal2,
      correctAnswer: correctAnswer,
      type: 'compare'
    });
  };

  const generatePlaceValueQuestion = () => {
    const placeValues = level === 1 
      ? [0.1, 0.01] 
      : level === 2 
        ? [0.1, 0.01, 0.001] 
        : [0.1, 0.01, 0.001, 0.0001];
    
    const targetValue = placeValues[Math.floor(Math.random() * placeValues.length)];
    const digit = Math.floor(Math.random() * 9) + 1;
    const result = (digit * targetValue).toFixed(4);
    
    const placeNames = {
      0.1: 'العُشر',
      0.01: 'المئة', 
      0.001: 'الألف',
      0.0001: 'عُشر الألف'
    };

    const questionText = `إذا كان الرقم ${digit} في خانة ${placeNames[targetValue]}، فما قيمته؟`;
    const correctAnswer = parseFloat(result).toString();
    
    const wrongOptions = new Set();
    wrongOptions.add((digit * 0.1).toFixed(1));
    wrongOptions.add((digit * 0.01).toFixed(2));
    wrongOptions.add(digit.toString());
    
    // Remove correct answer from wrong options if it exists
    wrongOptions.delete(correctAnswer);
    
    const allOptions = [correctAnswer, ...Array.from(wrongOptions)]
      .slice(0, 4) // Take correct answer plus 3 wrong options
      .sort(() => Math.random() - 0.5);
    
    setOptions(allOptions);

    setQuestion({
      text: questionText,
      correctAnswer: correctAnswer,
      type: 'place-value'
    });
  };

  const drawRaceTrack = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw track background
    ctx.fillStyle = raceColors.background;
    ctx.fillRect(0, 0, width, height);

    // Draw wider track with 3 lanes (from 25% to 75% of height)
    ctx.fillStyle = raceColors.track;
    ctx.fillRect(0, height * 0.25, width, height * 0.5);

    // Draw track border lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    
    // Top border
    ctx.beginPath();
    ctx.moveTo(0, height * 0.25);
    ctx.lineTo(width, height * 0.25);
    ctx.stroke();
    
    // Bottom border
    ctx.beginPath();
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width, height * 0.75);
    ctx.stroke();

    // Draw lane dividers (dashed lines)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    
    // Lane divider 1 (between lane 1 and 2)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.42);
    ctx.lineTo(width, height * 0.42);
    ctx.stroke();
    
    // Lane divider 2 (between lane 2 and 3)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.58);
    ctx.lineTo(width, height * 0.58);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw finish line
    const finishX = width * 0.9;
    ctx.strokeStyle = raceColors.finish;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(finishX, height * 0.25);
    ctx.lineTo(finishX, height * 0.75);
    ctx.stroke();

    // Draw vehicles
    const drawVehicle = (progress, laneY, color, label, isPlayer = false) => {
      const vehicleX = (progress / 100) * (finishX - 30) + 20;
      
      // Vehicle body (slightly larger)
      ctx.fillStyle = color;
      ctx.fillRect(vehicleX - 18, laneY - 10, 36, 20);
      
      // Vehicle wheels
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(vehicleX - 10, laneY + 12, 5, 0, 2 * Math.PI);
      ctx.arc(vehicleX + 10, laneY + 12, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Speed lines if moving
      if (progress > 0) {
        ctx.strokeStyle = isPlayer ? '#ffeb3b' : '#fff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(vehicleX - 25 - i * 6, laneY - 4 + i * 4);
          ctx.lineTo(vehicleX - 30 - i * 6, laneY - 4 + i * 4);
          ctx.stroke();
        }
      }

      // Player label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label, vehicleX, laneY - 25);
    };

    // Draw vehicles in separate lanes
    // AI vehicle 1 (top lane)
    drawVehicle(aiProgress1, height * 0.33, '#4caf50', 'الخصم 1');
    
    // Player vehicle (middle lane)
    drawVehicle(raceProgress, height * 0.5, raceColors.car, 'أنت', true);
    
    // AI vehicle 2 (bottom lane)
    drawVehicle(aiProgress2, height * 0.67, '#9c27b0', 'الخصم 2');

    // Draw flags at finish line
    ctx.fillStyle = '#000';
    for (let i = 0; i < 5; i++) {
      const flagY = height * 0.2 + i * 12;
      ctx.fillRect(finishX + 5, flagY, 12, 10);
      ctx.fillStyle = i % 2 === 0 ? '#000' : '#fff';
      ctx.fillRect(finishX + 5, flagY, 6, 5);
      ctx.fillRect(finishX + 11, flagY + 5, 6, 5);
      ctx.fillStyle = '#000';
    }
  };

  const handleAnswer = (answer) => {
    if (showResult) return;
    
    playSfx('click');
    setSelectedAnswer(answer);
    
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playSfx('correct');
      const points = level + (streak >= 3 ? 2 : 1);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setRaceProgress(prev => {
        const newProgress = Math.min(prev + (10 + streak * 2), 100);
        
        // Check if player wins
        if (newProgress >= 100 && !raceResult) {
          setIsRacing(false);
          setRaceResult({ winner: 'أنت', playerPosition: 1 });
        }
        
        return newProgress;
      });
    } else {
      playSfx('wrong');
      setStreak(0);
      setRaceProgress(prev => Math.max(prev - 5, 0));
    }

    setQuestionsAnswered(prev => prev + 1);
    
    setTimeout(() => {
      if (timeLeft > 0 && raceProgress < 100 && !raceResult) {
        generateQuestion();
      }
    }, 1500);
  };

  const startRace = () => {
    setIsRacing(true);
    setTimeLeft(180); // 3 minutes
    setRaceProgress(0);
    setAiProgress1(0);
    setAiProgress2(0);
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setRaceResult(null);
    
    // Set AI speeds - AI1 finishes in 0.5-0.9 min, AI2 finishes in 1.5-2 min
    const ai1FinishTime = 30 + Math.random() * 24; // 30-54 seconds (0.5-0.9 min)
    const ai2FinishTime = 90 + Math.random() * 30; // 90-120 seconds (1.5-2 min)
    
    setAiSpeeds({
      ai1: 100 / ai1FinishTime, // progress per second
      ai2: 100 / ai2FinishTime  // progress per second
    });
    
    generateQuestion();
  };

  const resetRace = () => {
    setIsRacing(false);
    setTimeLeft(180); // 3 minutes
    setRaceProgress(0);
    setAiProgress1(0);
    setAiProgress2(0);
    setScore(0);
    setLevel(1);
    setQuestionsAnswered(0);
    setStreak(0);
    setShowResult(false);
    setQuestion(null);
    setRaceResult(null);
    setAiSpeeds({ ai1: 0, ai2: 0 });
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: 'مبتدئ - أعشار ومئات',
      2: 'متوسط - أعشار ومئات وآلاف',
      3: 'متقدم - كسور عشرية معقدة'
    };
    return descriptions[level];
  };

  // Timer effect with AI movement
  useEffect(() => {
    let timer;
    if (isRacing && timeLeft > 0 && !raceResult) {
      timer = setInterval(() => {
        // Move AI vehicles
        setAiProgress1(prev => {
          const newProgress = prev + aiSpeeds.ai1;
          if (newProgress >= 100 && !raceResult) {
            setRaceResult({ winner: 'الخصم 1', position: 1 });
            setIsRacing(false);
          }
          return Math.min(newProgress, 100);
        });
        
        setAiProgress2(prev => {
          const newProgress = prev + aiSpeeds.ai2;
          if (newProgress >= 100 && !raceResult && aiProgress1 < 100) {
            setRaceResult({ winner: 'الخصم 2', position: aiProgress1 >= 100 ? 3 : 2 });
            setIsRacing(false);
          }
          return Math.min(newProgress, 100);
        });
        
        // Update timer
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (!raceResult) {
              // Determine final positions
              const scores = [
                { name: 'أنت', progress: raceProgress },
                { name: 'الخصم 1', progress: aiProgress1 },
                { name: 'الخصم 2', progress: aiProgress2 }
              ].sort((a, b) => b.progress - a.progress);
              
              const playerPosition = scores.findIndex(s => s.name === 'أنت') + 1;
              setRaceResult({ winner: scores[0].name, playerPosition });
            }
            setIsRacing(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRacing, timeLeft, aiSpeeds, raceResult, raceProgress, aiProgress1, aiProgress2]);

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 20 === 0 && level < 3) {
      setLevel(prev => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 400;
      canvas.height = 150;
      drawRaceTrack();
    }
  }, [raceProgress, aiProgress1, aiProgress2]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ 
      maxWidth: 900, 
      mx: 'auto', 
      p: 3, 
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: '20px'
    }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ color: '#2196f3', fontWeight: 'bold' }}>
        🏎️ سباق الكسور العشرية
      </Typography>

      {/* Game Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip label={`الوقت: ${formatTime(timeLeft)}`} color="info" size="large" />
        <Chip label={`المتتالية: ${streak}🔥`} color="success" size="large" />
      </Box>

      {/* Level Description */}
      <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
        {getLevelDescription()}
      </Typography>

      {/* Race Track */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            maxWidth: '400px',
            height: 'auto',
            border: '2px solid #ddd',
            borderRadius: '10px'
          }} 
        />
        
        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            تقدم السباق: {raceProgress.toFixed(0)}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={raceProgress} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: raceColors.progress
              }
            }} 
          />
        </Box>
      </Paper>

      {!isRacing && !question && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            أجب على أسئلة الكسور العشرية للفوز في السباق!
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={startRace}
            sx={{ fontSize: '1.2rem', py: 1.5, px: 4 }}
          >
            🏁 ابدأ السباق
          </Button>
        </Box>
      )}

      {(timeLeft === 0 || raceResult) && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: raceResult?.winner === 'أنت' ? '#e8f5e8' : '#fff3e0' }}>
          <Typography variant="h5" sx={{ 
            color: raceResult?.winner === 'أنت' ? '#2e7d32' : '#f57c00',
            mb: 2,
            fontWeight: 'bold'
          }}>
            {raceResult?.winner === 'أنت' ? '🏆 تهانينا! لقد فزت في السباق!' : 
             raceResult ? `🏁 انتهى السباق - الفائز: ${raceResult.winner}` : 
             '⏰ انتهى الوقت!'}
          </Typography>
          
          {raceResult && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>نتائج السباق:</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`أنت: ${raceProgress.toFixed(0)}%`} 
                  color={raceResult.winner === 'أنت' ? 'success' : 'default'}
                  size="large"
                  sx={{ fontSize: '1rem' }}
                />
                <Chip 
                  label={`الخصم 1: ${aiProgress1.toFixed(0)}%`} 
                  color={raceResult.winner === 'الخصم 1' ? 'success' : 'default'}
                  size="large"
                  sx={{ fontSize: '1rem' }}
                />
                <Chip 
                  label={`الخصم 2: ${aiProgress2.toFixed(0)}%`} 
                  color={raceResult.winner === 'الخصم 2' ? 'success' : 'default'}
                  size="large"
                  sx={{ fontSize: '1rem' }}
                />
              </Box>
              {raceResult.playerPosition && (
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                  ترتيبك: المركز {raceResult.playerPosition}
                </Typography>
              )}
            </Box>
          )}
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            النقاط النهائية: {score} | الأسئلة المجابة: {questionsAnswered}
            {streak > 0 && ` | أفضل متتالية: ${streak}`}
          </Typography>
          
          <Button variant="contained" onClick={resetRace} sx={{ mt: 1 }}>
            سباق جديد
          </Button>
        </Paper>
      )}

      {/* Question Section */}
      {question && isRacing && timeLeft > 0 && !raceResult && (
        <>
          <Typography variant="h6" sx={{ mb: 3, color: '#333' }}>
            {question.text}
          </Typography>

          {/* Answer Options */}
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
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                sx={{
                  minWidth: 120,
                  height: 60,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  backgroundColor: showResult 
                    ? (option === question.correctAnswer
                        ? '#4caf50' 
                        : (selectedAnswer === option ? '#f44336' : undefined))
                    : undefined,
                  color: showResult && option === question.correctAnswer ? 'white' : undefined,
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
                {isCorrect ? '🎉 ممتاز! السيارة تتقدم!' : '❌ حاول مرة أخرى في السؤال التالي'}
              </Typography>
              {isCorrect && streak >= 3 && (
                <Typography variant="body1" sx={{ mt: 1, color: '#ff6b35', fontWeight: 'bold' }}>
                  🔥 متتالية رائعة! نقاط إضافية!
                </Typography>
              )}
            </Paper>
          )}
        </>
      )}

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        {isRacing && (
          <Button 
            variant="outlined" 
            onClick={() => setIsRacing(false)}
            size="large"
          >
            إيقاف السباق
          </Button>
        )}
        
        <Button 
          variant="contained" 
          onClick={resetRace}
          size="large"
          color="secondary"
        >
          إعادة تشغيل
        </Button>
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          📚 تعلم الكسور العشرية
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔢 <strong>خانة العُشر:</strong> الرقم الأول بعد الفاصلة العشرية (0.1)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔢 <strong>خانة المئة:</strong> الرقم الثاني بعد الفاصلة العشرية (0.01)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔢 <strong>خانة الألف:</strong> الرقم الثالث بعد الفاصلة العشرية (0.001)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📊 <strong>المقارنة:</strong> قارن الأرقام من اليسار إلى اليمين
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          💡 نصيحة: في السباق، الإجابات الصحيحة المتتالية تعطي نقاط إضافية!
        </Typography>
      </Box>
    </Box>
  );
};

export default DecimalRace;
