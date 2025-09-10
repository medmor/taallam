// Enhanced Game Features Summary
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip, 
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom
} from '@mui/material';
import { 
  TrendingUp, 
  Psychology, 
  VolumeUp, 
  Palette,
  EmojiEvents,
  School,
  Speed,
  Star
} from '@mui/icons-material';
import { gameThemes } from '@/lib/visualEnhancements';

const GameEnhancementsSummary = () => {
  const [visible, setVisible] = useState(false);
  const theme = gameThemes.math;

  useEffect(() => {
    setVisible(true);
  }, []);

  const enhancements = [
    {
      icon: <TrendingUp />,
      title: 'التقدم التدريجي في الصعوبة',
      description: 'نظام ذكي للصعوبة يتكيف مع مستوى اللاعب',
      features: [
        'أربعة مستويات: مبتدئ، متوسط، متقدم، خبير',
        'تقدم تلقائي بناءً على الأداء',
        'عمليات رياضية متنوعة حسب المستوى',
        'تخزين التقدم في المتصفح'
      ],
      color: theme.primary
    },
    {
      icon: <Palette />,
      title: 'التحسينات البصرية',
      description: 'تصميم عصري مع رسوم متحركة جذابة',
      features: [
        'تدرجات لونية جميلة',
        'رسوم متحركة سلسة',
        'تأثيرات الجسيمات والألعاب النارية',
        'تصميم متجاوب على جميع الأجهزة'
      ],
      color: theme.secondary
    },
    {
      icon: <VolumeUp />,
      title: 'تحسين المؤثرات الصوتية',
      description: 'ردود فعل صوتية تفاعلية ومحفزة',
      features: [
        'أصوات متنوعة للإجابات الصحيحة والخاطئة',
        'أصوات خاصة للإنجازات والتسلسلات',
        'تأثيرات صوتية للانتقال بين المستويات',
        'تحكم في مستوى الصوت'
      ],
      color: theme.accent
    },
    {
      icon: <Psychology />,
      title: 'نظام الإنجازات والتحفيز',
      description: 'نظام شامل لتتبع التقدم والتحفيز',
      features: [
        'تتبع التسلسل في الإجابات الصحيحة',
        'إنجازات خاصة للأداء المتميز',
        'نظام النقاط والمكافآت',
        'شارات التقدير للمهارات المختلفة'
      ],
      color: '#9c27b0'
    }
  ];

  const enhancedGames = [
    { name: 'لعبة الجمع', status: 'مكتملة', features: ['صعوبة تدريجية', 'تأثيرات بصرية', 'نظام التسلسل'] },
    { name: 'لعبة الضرب', status: 'مكتملة', features: ['مستويات متقدمة', 'رسوم متحركة', 'أصوات محفزة'] },
    { name: 'بينغو الرياضيات', status: 'مكتملة', features: ['واجهة محسنة', 'ألعاب نارية', 'تقدم المستوى'] },
    { name: 'خط الأرقام', status: 'مكتملة', features: ['صعوبة متكيفة', 'حركات سلسة', 'تأثيرات جسيمية'] },
    { name: 'موازنة المعادلات', status: 'محسنة', features: ['معادلات معقدة', 'تصميم جديد', 'نظام النقاط'] },
    { name: 'الرقم المفقود', status: 'محسنة', features: ['أنماط معقدة', 'تحديات متنوعة', 'تقييم ذكي'] },
    { name: 'مقارنة الكسور', status: 'محسنة', features: ['كسور متقدمة', 'رسوم توضيحية', 'تدريب تدريجي'] }
  ];

  return (
    <Box 
      sx={{ 
        p: 4, 
        background: `linear-gradient(135deg, ${theme.background})`,
        minHeight: '100vh'
      }}
    >
      <Fade in={visible} timeout={800}>
        <Paper 
          elevation={8}
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              mb: 3,
              background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            🎮 تحسينات الألعاب التعليمية
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ mb: 4, color: 'text.secondary' }}
          >
            تطوير شامل لتحسين تجربة التعلم والتفاعل
          </Typography>

          <Grid container spacing={3}>
            {enhancements.map((enhancement, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Zoom in={visible} timeout={600} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Card 
                    elevation={6}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      border: `2px solid ${enhancement.color}20`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${enhancement.color}30`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          sx={{ 
                            p: 1.5, 
                            borderRadius: '50%', 
                            background: `${enhancement.color}20`,
                            color: enhancement.color,
                            mr: 2
                          }}
                        >
                          {enhancement.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: enhancement.color }}>
                          {enhancement.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                        {enhancement.description}
                      </Typography>
                      
                      <List dense>
                        {enhancement.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Star sx={{ color: enhancement.color, fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Fade>

      <Fade in={visible} timeout={800} style={{ transitionDelay: '800ms' }}>
        <Paper 
          elevation={8}
          sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              mb: 3,
              color: theme.primary,
              fontWeight: 'bold'
            }}
          >
            🎯 الألعاب المحسنة
          </Typography>

          <Grid container spacing={2}>
            {enhancedGames.map((game, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Zoom in={visible} timeout={400} style={{ transitionDelay: `${1000 + index * 100}ms` }}>
                  <Card 
                    elevation={4}
                    sx={{ 
                      borderRadius: 3,
                      border: '1px solid rgba(33, 150, 243, 0.2)',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {game.name}
                        </Typography>
                        <Chip 
                          label={game.status}
                          color={game.status === 'مكتملة' ? 'success' : 'primary'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {game.features.map((feature, featureIndex) => (
                          <Chip 
                            key={featureIndex}
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: '0.75rem',
                              borderColor: theme.primary,
                              color: theme.primary
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.primary }}>
              📊 إحصائيات التطوير
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                    7
                  </Typography>
                  <Typography variant="body2">ألعاب محسنة</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: theme.secondary, fontWeight: 'bold' }}>
                    4
                  </Typography>
                  <Typography variant="body2">مستويات صعوبة</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: theme.accent, fontWeight: 'bold' }}>
                    15+
                  </Typography>
                  <Typography variant="body2">تحسين جديد</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                    100%
                  </Typography>
                  <Typography variant="body2">تجربة محسنة</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default GameEnhancementsSummary;
