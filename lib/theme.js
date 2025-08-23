'use client';
import { createTheme } from '@mui/material/styles';
import { Fuzzy_Bubbles } from 'next/font/google';

const fuzzyBubbles = Fuzzy_Bubbles({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#fb923c',
    },
    secondary: {
      main: '#f97316',
    },
    background: {
      default: '#e6f2e6'
    },
  },
  typography: {
    fontFamily: fuzzyBubbles.style.fontFamily,
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 700,
      },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
