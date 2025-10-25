"use client";
import React from 'react';
import { Box, Grid, Card, CardActionArea, CardContent, Typography, Chip } from '@mui/material';
import { School, Calculate, Translate, Science, Public, Brush, MusicNote, Computer } from '@mui/icons-material';

const PATHS = [
  { id: 'math', title: 'مسار الرياضيات', icon: <Calculate />, color: '#22c55e', description: 'الجمع، الطرح، الضرب، القسمة، الكسور، الأنماط' },
  { id: 'language', title: 'مسار اللغة العربية', icon: <Translate />, color: '#3b82f6', description: 'الحروف، الكلمات، القراءة، المفردات' },
  { id: 'science', title: 'مسار العلوم الطبيعية', icon: <Science />, color: '#f59e0b', description: 'الحيوانات، النباتات، الطقس، الجسم، الحواس، الظواهر' },
  { id: 'geo', title: 'مسار الجغرافيا والتاريخ', icon: <Public />, color: '#10b981', description: 'المنزل والحي، المدن والبلدان، القارات، الأزمنة والحضارات' },
  { id: 'arts', title: 'مسار الفنون والإبداع', icon: <Brush />, color: '#ec4899', description: 'الألوان، الأشكال، الرسم التفاعلي، الموسيقى والإيقاع' },
  { id: 'technology', title: 'مسار التكنولوجيا والبرمجة', icon: <Computer />, color: '#8b5cf6', description: 'أجزاء الحاسوب، الفأرة، التسلسل المنطقي، الحلقات البسيطة' },
];

export default function PathSelector({ selected, onSelect }) {
  return (
    <Box>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          fontWeight: 'bold', 
          color: '#1e293b',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <School sx={{ fontSize: 40 }} /> اختر مسارك التعليمي
      </Typography>
      <Grid container spacing={3} sx={{ maxWidth: 1400, mx: 'auto' }} justifyContent="center">
        {PATHS.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card 
              elevation={selected === p.id ? 12 : 2} 
              sx={{ 
                borderRadius: 4,
                border: selected === p.id ? `4px solid ${p.color}` : '2px solid transparent',
                transition: 'all 0.3s ease',
                height: '100%',
                background: selected === p.id 
                  ? `linear-gradient(135deg, ${p.color}08, ${p.color}18)` 
                  : 'white',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${p.color}40`,
                  border: `2px solid ${p.color}`,
                },
                minWidth: { xs: '90vw', sm: '400px' },
              }}
            >
              <CardActionArea 
                onClick={() => onSelect(p.id)}
                sx={{ height: '100%', p: 1 }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: `${p.color}20`,
                      mb: 2,
                      '& svg': {
                        fontSize: 48,
                        color: p.color
                      }
                    }}
                  >
                    {p.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 'bold',
                      color: p.color,
                      fontSize: '1.25rem'
                    }}
                  >
                    {p.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.8,
                      px: 1,
                      minHeight: 60
                    }}
                  >
                    {p.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
