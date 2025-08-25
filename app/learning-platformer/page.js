"use client"
import React, { useState } from 'react'
import { Box, Grid, Card, CardActionArea, CardContent, Typography } from '@mui/material'
import PlatformerPixi from '@/components/PlatformerPixi'
import PlatformerPhaser from '@/components/PlatformerPhaser'

export default function Page() {
  const [mode, setMode] = useState('phaser');
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Card>
            <CardActionArea onClick={() => setMode('pixi')}>
              <CardContent>
                <Typography variant="h6">Pixi + Matter</Typography>
                <Typography variant="body2">Current rendering: PixiJS with Matter.js physics.</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardActionArea onClick={() => setMode('phaser')}>
              <CardContent>
                <Typography variant="h6">Phaser (Arcade)</Typography>
                <Typography variant="body2">Compare gameplay using Phaser's Arcade physics.</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
      <Box>
        {mode === 'pixi' ? <PlatformerPixi /> : <PlatformerPhaser />}
      </Box>
    </Box>
  )
}
