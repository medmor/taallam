"use client";
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Fade } from '@mui/material';
import { School } from '@mui/icons-material';
import PathSelector from '@/components/PathSelector';
import { useSearchParams, useRouter } from 'next/navigation';
import UserSelector from '@/components/UserSelector';
import LearningDashboard from '@/components/LearningDashboard';
import AdditionGame from '@/components/AdditionGame';
import MultiplicationGame from '@/components/MultiplicationGame';
import PizzaFractionsGame from '@/components/PizzaFractionsGame';
import SubtractionGame from '@/components/SubtractionGame';
import DivisionGame from '@/components/DivisionGame';
import FractionsComparison from '@/components/FractionsComparison';
import NumberPatternsGame from '@/components/NumberPatternsGame';
import ArabicLettersGame from '@/components/ArabicLettersGame';
import LetterPictureMatchGame from '@/components/LetterPictureMatchGame';
import LetterWordMatchGame from '@/components/LetterWordMatchGame';
import WordFromPictureGame from '@/components/WordFromPictureGame';
import WordBuilderGame from '@/components/WordBuilderGame';
import SentenceBuilderGame from '@/components/SentenceBuilderGame';
import AnimalsSoundsGame from '@/components/AnimalsSoundsGame';
import PlantsPartsGame from '@/components/PlantsPartsGame';
import WeatherSeasonsGame from '@/components/WeatherSeasonsGame';
import BodyPartsGame from '@/components/BodyPartsGame';
import FiveSensesGame from '@/components/FiveSensesGame';
import MagnetismElectricityGame from '@/components/MagnetismElectricityGame';
import WaterCycleGame from '@/components/WaterCycleGame';
import { useUser } from '@/contexts/UserContext';
import { userManager } from '@/lib/userManager';

export default function Home() {
  const { 
    currentUser, 
    showUserSelector, 
    setShowUserSelector,
    handleUserSelected,
    updateCurrentUser 
  } = useUser();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  // Start with no selected path; user must choose explicitly
  const [selectedPath, setSelectedPath] = useState(searchParams.get('path') || '');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showGame, setShowGame] = useState(false);

  const handleStartLesson = (lesson) => {
    setCurrentLesson(lesson);
    setShowGame(true);
  };

  const handleGameComplete = (score, time) => {
    if (currentLesson && currentUser) {
      // Determine total possible score based on game type
      let totalPossible = 10; // Default for most games
      if (currentLesson.component === 'FractionsComparison') {
        totalPossible = 8; // FractionsComparison has 8 rounds
      } else if (currentLesson.component === 'NumberPatternsGame') {
        // NumberPatternsGame rounds vary by level
        if (currentLesson.level === 'beginner') totalPossible = 8;
        else if (currentLesson.level === 'intermediate') totalPossible = 10;
        else totalPossible = 12; // advanced
      } else if (currentLesson.component === 'ArabicLettersGame') {
        // ArabicLettersGame rounds vary by level
        if (currentLesson.level === 'beginner') totalPossible = 10;
        else if (currentLesson.level === 'intermediate') totalPossible = 15;
        else totalPossible = 20; // advanced
      } else if (currentLesson.component === 'LetterPictureMatchGame') {
        if (currentLesson.level === 'beginner') totalPossible = 10; else if (currentLesson.level === 'intermediate') totalPossible = 15; else totalPossible = 20;
      } else if (currentLesson.component === 'LetterWordMatchGame') {
        if (currentLesson.level === 'beginner') totalPossible = 10; else if (currentLesson.level === 'intermediate') totalPossible = 15; else totalPossible = 20;
      } else if (currentLesson.component === 'WordFromPictureGame') {
        if (currentLesson.level === 'beginner') totalPossible = 10; else if (currentLesson.level === 'intermediate') totalPossible = 15; else totalPossible = 20;
      } else if (currentLesson.component === 'WordBuilderGame') {
        if (currentLesson.level === 'beginner') totalPossible = 8; else if (currentLesson.level === 'intermediate') totalPossible = 10; else totalPossible = 12;
      } else if (currentLesson.component === 'SentenceBuilderGame') {
        if (currentLesson.level === 'beginner') totalPossible = 8; else if (currentLesson.level === 'intermediate') totalPossible = 10; else totalPossible = 12;
      } else if ([
        'AnimalsSoundsGame',
        'PlantsPartsGame',
        'WeatherSeasonsGame',
        'BodyPartsGame',
        'FiveSensesGame',
        'MagnetismElectricityGame',
        'WaterCycleGame'
      ].includes(currentLesson.component)) {
        if (currentLesson.component === 'AnimalsSoundsGame') {
          if (currentLesson.level === 'beginner') totalPossible = 6; else if (currentLesson.level === 'intermediate') totalPossible = 8; else totalPossible = 10;
        } else {
          // Other science placeholders still 6 rounds until implemented
          totalPossible = 6;
        }
      }
      
      // 80% success rate required for completion
      const completed = score >= Math.ceil(totalPossible * 0.8);
      userManager.updateProgress(currentLesson.id, score, time, completed);
      
      // Refresh user data
      updateCurrentUser();
    }
    
    // Return to dashboard
    setShowGame(false);
    setCurrentLesson(null);
  };

  // Keep URL in sync when selectedPath changes
  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (selectedPath) {
      current.set('path', selectedPath);
    } else {
      // If empty, remove any existing param so URL stays clean and no auto-redirect to math
      current.delete('path');
    }
    const query = current.toString();
    router.replace(query ? `/?${query}` : '/');
  }, [selectedPath]);

  if (showGame && currentLesson) {
    const gameComponents = {
      AdditionGame,
      MultiplicationGame,
      PizzaFractionsGame,
      SubtractionGame,
      DivisionGame,
      FractionsComparison,
      NumberPatternsGame,
      ArabicLettersGame,
      LetterPictureMatchGame,
      LetterWordMatchGame,
      WordFromPictureGame,
      WordBuilderGame,
      SentenceBuilderGame,
      AnimalsSoundsGame,
      PlantsPartsGame,
      WeatherSeasonsGame,
      BodyPartsGame,
      FiveSensesGame,
      MagnetismElectricityGame,
      WaterCycleGame,
    };
    const GameComponent = gameComponents[currentLesson.component];

    if (!GameComponent) {
      console.error(`Game component "${currentLesson.component}" not found!`);
      // Optionally, show an error message to the user
      setShowGame(false);
      return null;
    }

    // Show the game component
    return (
      <GameComponent
        level={currentLesson.level}
        onComplete={handleGameComplete}
        onBack={() => setShowGame(false)}
      />
    );
  }

  if (!currentUser) {
    // Show welcome screen while user selector is loading
    return (
      <>
        <Box sx={{ pt: 8, pb: 6, minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Container maxWidth="sm">
            <Fade in timeout={800}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <School sx={{ fontSize: 80, mb: 3 }} />
                <Typography
                  component="h1"
                  variant="h2"
                  align="center"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  مرحباً بكم في تعلّم
                </Typography>
                <Typography variant="h5" align="center" paragraph sx={{ opacity: 0.9 }}>
                  منصة تعليمية تفاعلية لتعلم الرياضيات
                </Typography>
                <Typography variant="body1" align="center" paragraph sx={{ opacity: 0.8, mb: 4 }}>
                  رحلة تعليمية ممتعة ومنظمة لإتقان مهارات الرياضيات خطوة بخطوة
                </Typography>
              </Box>
            </Fade>
          </Container>
        </Box>
        
        <UserSelector
          open={showUserSelector}
          onClose={() => setShowUserSelector(false)}
          onUserSelected={handleUserSelected}
        />
      </>
    );
  }

  // If no path chosen yet, show only path selector (after user creation)
  if (!selectedPath) {
    return (
      <>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', pt: 6 }}>
          <Container maxWidth="md" sx={{ mt: 4 }}>
            <PathSelector selected={selectedPath} onSelect={setSelectedPath} />
          </Container>
        </Box>
        <UserSelector
          open={showUserSelector}
          onClose={() => setShowUserSelector(false)}
          onUserSelected={handleUserSelected}
        />
      </>
    );
  }

  return (
    <>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
          <LearningDashboard 
            currentUser={currentUser}
            onStartLesson={handleStartLesson}
            selectedPath={selectedPath}
          />
          <Container maxWidth="lg" sx={{ mt: 2 }}>
            <PathSelector selected={selectedPath} onSelect={setSelectedPath} />
          </Container>
        </Box>
        <UserSelector
          open={showUserSelector}
          onClose={() => setShowUserSelector(false)}
          onUserSelected={handleUserSelected}
        />
    </>
  );
}