import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: 'primary.main', p: 6, mt: 8 }} component="footer">
      <Typography variant="body2" color="text.secondary" align="center">
        {'© '}
        {new Date().getFullYear()}{' '}
  تعلم. جميع الحقوق محفوظة.
      </Typography>
    </Box>
  );
}
