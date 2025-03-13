
import React, { createContext, useState, useContext, ReactNode } from "react";

type ProfileContextType = {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  refreshAvatar: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshAvatar = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <ProfileContext.Provider value={{ avatarUrl, setAvatarUrl, refreshAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
