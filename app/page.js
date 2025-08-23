import Link from 'next/link'
import { Box, Button, Card, CardContent, CardMedia, Container, Grid, Typography } from '@mui/material'

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
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} margin={'auto'}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: '400px' }}
              >
                  <CardMedia
                    component="img"
                    height="180"
                    image="/images/learn-names/farm-animals/category.jpeg"
                    alt="تعلم الأسماء"
                    sx={{ padding: '2%' }}
                  />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    تعلم الأسماء
                  </Typography>
                  <Typography>
                    استكشفوا عالم الأسماء العربية بطريقة ممتعة وتفاعلية.
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button component={Link} href="/learn-names" variant="contained" fullWidth>
                    ابدأ الآن
                  </Button>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} margin={'auto'}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                  <CardMedia
                    component="img"
                    height="180"
                    image="/images/games/matching-cards.png"
                    alt="العاب تعليمية"
                    sx={{ padding: '2%' }}
                  />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    العاب
                  </Typography>
                  <Typography>
                    مجموعة من الألعاب التعليمية لتعزيز مهارات اللغة العربية.
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button component={Link} href="/games" variant="contained" fullWidth>
                    العب الآن
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  )
}