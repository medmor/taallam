"use client";
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Fade } from '@mui/material';
import { School } from '@mui/icons-material';
import UserSelector from '@/components/UserSelector';
import LearningDashboard from '@/components/LearningDashboard';
import AdditionGame from '@/components/AdditionGame';
import MultiplicationGame from '@/components/MultiplicationGame';
import PizzaFractionsGame from '@/components/PizzaFractionsGame';
import SubtractionGame from '@/components/SubtractionGame';
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
  
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showGame, setShowGame] = useState(false);

  const handleStartLesson = (lesson) => {
    setCurrentLesson(lesson);
    setShowGame(true);
  };

  const handleGameComplete = (score, time) => {
    if (currentLesson && currentUser) {
      // Update user progress
      const completed = score >= 8; // 80% success rate
      userManager.updateProgress(currentLesson.id, score, time, completed);
      
      // Refresh user data
      updateCurrentUser();
    }
    
    // Return to dashboard
    setShowGame(false);
    setCurrentLesson(null);
  };

  if (showGame && currentLesson) {
    const gameComponents = {
      AdditionGame,
      MultiplicationGame,
      PizzaFractionsGame,
      SubtractionGame,
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

  return (
    <>
      {/* Main Dashboard */}
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Learning Dashboard */}
        <LearningDashboard 
          currentUser={currentUser}
          onStartLesson={handleStartLesson}
        />
      </Box>

      {/* User Selector Dialog */}
      <UserSelector
        open={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onUserSelected={handleUserSelected}
      />
    </>
  );
}