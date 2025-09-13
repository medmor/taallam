"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  Container,
  Fade,
  Zoom,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PlayArrow,
  Lock,
  CheckCircle,
  Star,
  AccessTime,
  School,
  EmojiEvents,
  TrendingUp,
  Assignment
} from '@mui/icons-material';
import { userManager, LEARNING_PATH } from '@/lib/userManager';

const LearningDashboard = ({ currentUser, onStartLesson }) => {
  const [learningPath, setLearningPath] = useState([]);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const pathWithProgress = userManager.getLearningPathWithProgress();
      setLearningPath(pathWithProgress);
      setUserStats(userManager.getUserStats());
    }
  }, [currentUser]);

  const getLessonStatus = (lesson) => {
    if (lesson.progress.completed) return 'completed';
    if (lesson.progress.unlocked) return 'available';
    return 'locked';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'available': return '#2196f3';
      case 'locked': return '#bdbdbd';
      default: return '#bdbdbd';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'available': return <PlayArrow />;
      case 'locked': return <Lock />;
      default: return <Lock />;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 دقيقة';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}س ${minutes % 60}د`;
    }
    return `${minutes}د`;
  };

  if (!currentUser || !userStats) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* User Stats Header */}
      <Fade in timeout={600}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64,
                      background: 'rgba(255,255,255,0.2)',
                      fontSize: '1.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {userStats.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      مرحباً {userStats.name}! 👋
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      استمر في رحلة التعلم المذهلة
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {userStats.completedLessons}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        دروس مكتملة
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {userStats.completionRate}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        نسبة الإكمال
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {userStats.totalScore}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        النقاط الكلية
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {formatTime(userStats.totalTime)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        وقت التعلم
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Progress Bar */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                التقدم الكلي: {userStats.completedLessons} من {userStats.totalLessons} دروس
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={userStats.completionRate}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50',
                    borderRadius: 6
                  }
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Fade>

      <Grid container spacing={4}>
        {/* Learning Path */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
            <School sx={{ mr: 1, verticalAlign: 'middle' }} />
            المسار التعليمي
          </Typography>

          <Grid container spacing={3} >
            {learningPath.map((lesson, index) => {
              const status = getLessonStatus(lesson);
              const isNext = lesson.id === userStats.currentLesson;
              
              return (
                <Grid item xs={12} sm={6} key={lesson.id} sx={{marginX: 'auto'}}>
                  <Zoom in timeout={400} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Card
                      elevation={isNext ? 8 : 4}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        border: isNext ? '3px solid #fb923c' : 'none',
                        cursor: status === 'available' ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': status === 'available' ? {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                        } : {},
                        background: status === 'completed' 
                          ? 'linear-gradient(145deg, #e8f5e8, #c8e6c9)'
                          : status === 'available'
                          ? 'linear-gradient(145deg, #ffffff, #f8f9fa)'
                          : 'linear-gradient(145deg, #f5f5f5, #eeeeee)'
                      }}
                      onClick={() => status === 'available' && onStartLesson(lesson)}
                    >
                      {isNext && (
                        <Chip
                          label="الدرس الحالي"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: '50%',
                            transform: 'translateX(50%)',
                            background: 'linear-gradient(45deg, #fb923c, #f97316)',
                            color: 'white',
                            fontWeight: 'bold',
                            zIndex: 1,
                    
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ p: 3, pt: isNext ? 5 : 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              mr: 2,
                              backgroundColor: getStatusColor(status),
                              width: 48,
                              height: 48
                            }}
                          >
                            {getStatusIcon(status)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: status === 'locked' ? '#bdbdbd' : '#333'
                              }}
                            >
                              {lesson.icon} {lesson.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: status === 'locked' ? '#bdbdbd' : '#666'
                              }}
                            >
                              {lesson.description}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Lesson Stats */}
                        {lesson.progress.attempts > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Divider sx={{ mb: 1 }} />
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  أفضل نتيجة: {lesson.progress.bestScore}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  المحاولات: {lesson.progress.attempts}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        )}

                        {/* Skills */}
                        <Box sx={{ mb: 2 }}>
                          {lesson.skills.slice(0, 2).map((skill, idx) => (
                            <Chip
                              key={idx}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                mr: 0.5, 
                                mb: 0.5,
                                opacity: status === 'locked' ? 0.5 : 1
                              }}
                            />
                          ))}
                        </Box>

                        {/* Action Button */}
                        <Button
                          fullWidth
                          variant={status === 'available' ? 'contained' : status === 'completed' ? 'contained' : 'outlined'}
                          disabled={status === 'locked'}
                          startIcon={getStatusIcon(status)}
                          onClick={() => (status === 'available' || status === 'completed') && onStartLesson(lesson)}
                          sx={{
                            borderRadius: 2,
                            py: 1.5,
                            ...(status === 'available' && {
                              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #1976d2, #0288d1)'
                              }
                            }),
                            ...(status === 'completed' && {
                              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #388e3c, #4caf50)'
                              }
                            })
                          }}
                        >
                          {status === 'completed' ? 'إعادة اللعب' : 
                           status === 'available' ? 'ابدأ الدرس' : 'مقفل'}
                        </Button>

                        {/* Time Estimate */}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mt: 1,
                            color: 'text.secondary'
                          }}
                        >
                          <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                          {lesson.estimatedTime}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Achievements & Stats Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Achievements */}
          <Fade in timeout={800}>
            <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                الإنجازات ({userStats.achievements.length})
              </Typography>
              
              {userStats.achievements.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  ابدأ رحلة التعلم لتحصل على إنجازات!
                </Typography>
              ) : (
                <List dense>
                  {userStats.achievements.map((achievement, index) => (
                    <Zoom in timeout={300} style={{ transitionDelay: `${index * 100}ms` }} key={achievement.id}>
                      <ListItem
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          background: 'linear-gradient(45deg, #ffd700, #ffeb3b)',
                          color: '#333'
                        }}
                      >
                        <ListItemIcon>
                          <Typography variant="h6">{achievement.icon}</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={achievement.name}
                          secondary={achievement.description}
                        />
                      </ListItem>
                    </Zoom>
                  ))}
                </List>
              )}
            </Paper>
          </Fade>

          {/* Quick Stats */}
          <Fade in timeout={1000}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                إحصائيات سريعة
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon><Star color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="أطول سلسلة"
                    secondary={`${userStats.maxStreak} إجابة صحيحة متتالية`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon><Assignment color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="الدروس المفتوحة"
                    secondary={`${userStats.unlockedLessons} من ${userStats.totalLessons} دروس`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon><AccessTime color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="متوسط الوقت لكل درس"
                    secondary={userStats.completedLessons > 0 
                      ? formatTime(Math.round(userStats.totalTime / userStats.completedLessons))
                      : 'لا توجد بيانات'
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LearningDashboard;