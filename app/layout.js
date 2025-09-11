'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';
import { UserProvider } from '@/contexts/UserContext';

import HeaderWithUser from '@/components/HeaderWithUser';
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="ar"  dir='rtl'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <body>
          <UserProvider>
            <HeaderWithUser />
            <main>{children}</main>
            <Footer />
          </UserProvider>
        </body>
      </ThemeProvider>
    </html>
  );
}
