"use client";
import React from "react";
import Header from "./Header";
import { useUser } from "@/contexts/UserContext";

export default function HeaderWithUser() {
  const { currentUser, handleSwitchUser } = useUser();

  return (
    <Header 
      currentUser={currentUser} 
      onSwitchUser={handleSwitchUser}
    />
  );
}