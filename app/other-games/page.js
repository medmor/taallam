'use client'


import React, { useState } from "react";
import { otherGames } from "../../lib/data";
import GameFrame from "../../components/GameFrame";
import LearningCard from "../../components/LearningCard";
import { Grid, Box, Typography, Button, Container } from "@mui/material";


export default function OtherGamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" mb={4} align="center">
        العاب اخرى
      </Typography>
      {!selectedGame ? (
        <Grid container spacing={4} justifyContent="center">
          {otherGames && otherGames.length > 0 ? (
            otherGames.map((game) => (
              <Grid item xs={12} sm={6} md={4} key={game.id} display="flex" justifyContent="center">
                <LearningCard
                  data={game}
                  type="game"
                  onCardClick={() => setSelectedGame(game)}
                  onSoundClick={() => {}}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center">لا توجد العاب اخرى حاليا</Typography>
            </Grid>
          )}
        </Grid>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh" width="100%">
          <Button
            variant="contained"
            color="primary"
            sx={{ mb: 3, px: 6, py: 1.5, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: 2, boxShadow: 2 }}
            onClick={() => setSelectedGame(null)}
          >
            رجوع
          </Button>
          <Box width="100%" display="flex" justifyContent="center">
            <GameFrame embedId={selectedGame.itchEmbedId} itchGameId={selectedGame.itchGameId} />
          </Box>
        </Box>
      )}
    </Container>
  );
}
