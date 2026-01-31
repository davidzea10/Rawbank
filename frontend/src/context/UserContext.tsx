import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserType = 'particulier' | 'entrepreneur' | null;

export interface User {
  id: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  type: UserType;
  score?: number;
  creditLimit?: number;
  profileCompleted: boolean;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rawfinance_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('rawfinance_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rawfinance_user');
    }
  }, [user]);

  const login = (phone: string) => {
    setUser({
      id: '',
      phone,
      email: '',
      firstName: '',
      lastName: '',
      type: null,
      profileCompleted: false,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
