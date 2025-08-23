import React from 'react';
import { Card, CardContent, Typography, IconButton, CardMedia, Button, CardActions } from '@mui/material';
import { VolumeUp } from '@mui/icons-material';

const LearningCard = ({ data, type, onCardClick, onSoundClick }) => {
  const isCategory = type === 'category';

  return (
    <Card
      onClick={() => onCardClick(data)}
      sx={{
        maxWidth: 345,
        cursor: isCategory ? 'pointer':'',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="img"
        height="75%"
        image={data.image}
        alt={data.name}
        sx={{ padding: '2%' }}
      />
      <CardContent sx={{ flexGrow: 1, alignItems: 'center', display: "flex", gap:'2px' }}>
        <Button variant="outlined" onClick={(e) => {
          if (!isCategory) {
            e.stopPropagation(); // Prevent card click when clicking on name
            onSoundClick(data.sound);
          }
        }}>
          <Typography >
            {data.name}
          </Typography>
        </Button>
        {!isCategory && (
          <>
            <Button  variant="outlined" onClick={(e) => {
              e.stopPropagation();
              onSoundClick(data.enSound);
            }}>
              <Typography variant="subtitle1">
                {data.enName}
              </Typography>
            </Button>

            <Button  variant="outlined" onClick={(e) => {
              e.stopPropagation();
              onSoundClick(data.frSound);
            }}>
              <Typography variant="subtitle2">
                {data.frName}
              </Typography>
            </Button>
          </>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        {data.itemSound && (
          <IconButton  onClick={(e) => {
            e.stopPropagation();
            onSoundClick(data.itemSound);
          }}>
            <VolumeUp />
          </IconButton>
        )}
      </CardActions>

    </Card>
  );
};

export default LearningCard;