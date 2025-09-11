"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import {
  Person,
  Add,
  Delete,
  School,
  Star,
  AccessTime,
  EmojiEvents
} from '@mui/icons-material';
import { userManager } from '@/lib/userManager';

const UserSelector = ({ open, onClose, onUserSelected }) => {
  const [users, setUsers] = useState({});
  const [newUserName, setNewUserName] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = () => {
    const allUsers = userManager.getAllUsers();
    setUsers(allUsers);
  };

  const handleCreateUser = () => {
    try {
      setError('');
      if (!newUserName.trim()) {
        setError('يرجى إدخال اسم المستخدم');
        return;
      }

      const newUser = userManager.createUser(newUserName);
      setNewUserName('');
      setShowNewUserForm(false);
      onUserSelected(newUser);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectUser = (userId) => {
    try {
      const user = userManager.switchUser(userId);
      onUserSelected(user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = (userId, event) => {
    event.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      userManager.deleteUser(userId);
      loadUsers();
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 دقيقة';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes % 60} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  const getProgressColor = (rate) => {
    if (rate >= 80) return '#4caf50';
    if (rate >= 50) return '#ff9800';
    return '#f44336';
  };

  const userList = Object.values(users);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 1,
        background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
        color: 'white',
        borderRadius: '12px 12px 0 0'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <School />
          اختر المتعلم
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        {userList.length === 0 ? (
          <Fade in timeout={600}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <School sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                لا يوجد متعلمون بعد
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ابدأ رحلة التعلم بإنشاء حساب جديد
              </Typography>
            </Box>
          </Fade>
        ) : (
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {userList.map((user, index) => {
              const completionRate = user.completedLessons.length > 0 
                ? Math.round((user.completedLessons.length / 10) * 100) 
                : 0;
              
              return (
                <Zoom in timeout={300} style={{ transitionDelay: `${index * 100}ms` }} key={user.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        '& .user-actions': {
                          opacity: 1
                        }
                      }
                    }}
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <ListItem sx={{ p: 3 }}>
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          width: 56, 
                          height: 56,
                          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Chip
                                icon={<School />}
                                label={`${user.completedLessons.length} درس مكتمل`}
                                size="small"
                                sx={{ 
                                  backgroundColor: getProgressColor(completionRate),
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                              
                              {user.achievements.length > 0 && (
                                <Chip
                                  icon={<EmojiEvents />}
                                  label={`${user.achievements.length} إنجاز`}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: '#ffd700',
                                    color: '#333',
                                    fontWeight: 'bold'
                                  }}
                                />
                              )}
                              
                              <Chip
                                icon={<AccessTime />}
                                label={formatTime(user.totalTime)}
                                size="small"
                                variant="outlined"
                              />
                              
                              {user.maxStreak > 0 && (
                                <Chip
                                  icon={<Star />}
                                  label={`أفضل سلسلة: ${user.maxStreak}`}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: '#ff4081',
                                    color: 'white'
                                  }}
                                />
                              )}
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              آخر دخول: {new Date(user.lastLoginAt).toLocaleDateString('ar')}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction 
                        className="user-actions"
                        sx={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                      >
                        <IconButton
                          edge="end"
                          onClick={(e) => handleDeleteUser(user.id, e)}
                          sx={{ 
                            color: '#f44336',
                            '&:hover': {
                              backgroundColor: '#f4433620'
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Paper>
                </Zoom>
              );
            })}
          </List>
        )}

        {showNewUserForm ? (
          <Fade in timeout={300}>
            <Paper elevation={3} sx={{ p: 3, mt: 2, borderRadius: 3, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#2196f3', fontWeight: 'bold' }}>
                إنشاء متعلم جديد
              </Typography>
              <TextField
                fullWidth
                label="اسم المتعلم"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateUser()}
                sx={{ mb: 2 }}
                autoFocus
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => {
                    setShowNewUserForm(false);
                    setNewUserName('');
                    setError('');
                  }}
                  variant="outlined"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #388e3c, #4caf50)'
                    }
                  }}
                >
                  إنشاء
                </Button>
              </Box>
            </Paper>
          </Fade>
        ) : (
          <Zoom in timeout={400}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Add />}
              onClick={() => setShowNewUserForm(true)}
              sx={{
                mt: 2,
                py: 2,
                borderRadius: 3,
                border: '2px dashed #2196f3',
                color: '#2196f3',
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#2196f320',
                  border: '2px dashed #1976d2'
                }
              }}
            >
              إضافة متعلم جديد
            </Button>
          </Zoom>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserSelector;