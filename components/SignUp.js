'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for the confirmation link!')
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card sx={{ minWidth: 275, maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h5" component="div" sx={{ mb: 2, textAlign: 'center' }}>
            إنشاء حساب
          </Typography>
          <form onSubmit={handleSignUp}>
            <TextField
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth>
              إنشاء حساب
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
