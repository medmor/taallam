import Link from 'next/link'
import { Box, Button, Card, CardContent, CardMedia, Container, Grid, Typography } from '@mui/material'
import AdditionGame from '@/components/AdditionGame'

export default function Home() {
  return (
    <div>
      <main>
        <Box sx={{ pt: 8, pb: 6 }}>
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              مرحباً بكم في تعلم
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              المكان الأفضل لتعليم الأطفال اللغة العربية
            </Typography>
            <AdditionGame />
          </Container>
        </Box>
      </main>
    </div>
  )
}