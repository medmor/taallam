"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { userManager } from '@/lib/userManager';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserSelector, setShowUserSelector] = useState(false);

  useEffect(() => {
    // Check if there's a current user
    const user = userManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      setShowUserSelector(true);
    }
  }, []);

  const handleUserSelected = (user) => {
    setCurrentUser(user);
    setShowUserSelector(false);
  };

  const handleSwitchUser = () => {
    setShowUserSelector(true);
    setCurrentUser(null);
  };

  const updateCurrentUser = () => {
    const updatedUser = userManager.getCurrentUser();
    setCurrentUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      showUserSelector,
      setShowUserSelector,
      handleUserSelected,
      handleSwitchUser,
      updateCurrentUser
    }}>
      {children}
    </UserContext.Provider>
  );
};