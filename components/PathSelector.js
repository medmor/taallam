"use client";
import React from 'react';
import { Box, Grid, Card, CardActionArea, CardContent, Typography, Chip } from '@mui/material';
import { School, Calculate, Translate, Science } from '@mui/icons-material';

const PATHS = [
  { id: 'math', title: 'مسار الرياضيات', icon: <Calculate />, color: '#22c55e', description: 'الجمع، الطرح، الضرب، القسمة، الكسور، الأنماط' },
  { id: 'language', title: 'مسار اللغة العربية', icon: <Translate />, color: '#3b82f6', description: 'الحروف، الكلمات، القراءة، المفردات' },
  // Future: add more like science, geography
];

export default function PathSelector({ selected, onSelect }) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        <School sx={{ mr: 1, verticalAlign: 'middle' }} /> اختر مسارك التعليمي
      </Typography>
      <Grid container spacing={3}>
        {PATHS.map((p) => (
          <Grid item xs={12} md={6} key={p.id}>
            <Card elevation={selected === p.id ? 8 : 3} sx={{ borderRadius: 3, border: selected === p.id ? `3px solid ${p.color}` : 'none' }}>
              <CardActionArea onClick={() => onSelect(p.id)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <Chip icon={p.icon} label={p.title} sx={{ bgcolor: p.color, color: 'white', fontWeight: 'bold' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
