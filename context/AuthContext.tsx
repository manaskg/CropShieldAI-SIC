import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AnalysisHistoryItem } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'joinedDate' | 'history'>) => Promise<void>;
  logout: () => void;
  updateProfileImage: (base64Image: string) => void;
  addToHistory: (item: Omit<AnalysisHistoryItem, 'id' | 'date'>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from session storage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('cropShield_currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load user from storage", e);
    }
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          const usersStr = localStorage.getItem('cropShield_users');
          const users: User[] = usersStr ? JSON.parse(usersStr) : [];
          
          const foundUser = users.find(u => u.email === email && u.password === password);
          
          if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('cropShield_currentUser', JSON.stringify(foundUser));
            resolve();
          } else {
            reject(new Error('Invalid email or password'));
          }
        } catch (e) {
          reject(new Error('Login failed due to storage error'));
        }
      }, 800); // Simulate network delay
    });
  };

  const signup = async (userData: Omit<User, 'id' | 'joinedDate' | 'history'>) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          const usersStr = localStorage.getItem('cropShield_users');
          const users: User[] = usersStr ? JSON.parse(usersStr) : [];

          if (users.some(u => u.email === userData.email)) {
            reject(new Error('User with this email already exists'));
            return;
          }

          const newUser: User = {
            ...userData,
            id: crypto.randomUUID(),
            joinedDate: new Date().toISOString(),
            history: []
          };

          users.push(newUser);
          try {
             localStorage.setItem('cropShield_users', JSON.stringify(users));
          } catch (e) {
             // If global list fails, we might still proceed with local session, but it's risky.
             // For now, reject.
             reject(new Error('Storage full. Cannot register new user.'));
             return;
          }
          
          // Auto login after signup
          setUser(newUser);
          localStorage.setItem('cropShield_currentUser', JSON.stringify(newUser));
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cropShield_currentUser');
  };

  // Helper to safely update storage
  const safeUpdateUserStorage = (updatedUser: User): boolean => {
    try {
      localStorage.setItem('cropShield_currentUser', JSON.stringify(updatedUser));
      
      const usersStr = localStorage.getItem('cropShield_users');
      if (usersStr) {
        const users: User[] = JSON.parse(usersStr);
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          users[index] = updatedUser;
          localStorage.setItem('cropShield_users', JSON.stringify(users));
        }
      }
      return true;
    } catch (error) {
      console.error("Storage quota exceeded:", error);
      return false;
    }
  };

  const updateProfileImage = (base64Image: string) => {
    if (!user) return;
    
    const updatedUser = { ...user, avatar: base64Image };
    
    // Optimistically update state
    setUser(updatedUser);
    
    if (!safeUpdateUserStorage(updatedUser)) {
        // Revert if failed (optional, but good UX)
        alert("Storage full. Could not save profile image.");
        setUser(user); 
    }
  };

  const addToHistory = (itemData: Omit<AnalysisHistoryItem, 'id' | 'date'>) => {
    if (!user) return;

    const newItem: AnalysisHistoryItem = {
      ...itemData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };

    const updatedUser = {
      ...user,
      history: [newItem, ...user.history]
    };

    // Optimistically update
    setUser(updatedUser);

    if (!safeUpdateUserStorage(updatedUser)) {
        // Fallback: If storage is full, try saving without the image preview
        // This often happens because base64 images are large.
        console.warn("Storage full, attempting to save history without image.");
        
        // We also strip fullAnalysis to save space if needed, but priority is removing the image
        const itemNoImage = { ...newItem, imagePreview: '' };
        const userNoImage = { ...user, history: [itemNoImage, ...user.history] };
        
        setUser(userNoImage);
        if (!safeUpdateUserStorage(userNoImage)) {
            // Extreme fallback: strip full analysis too if still failing
            const itemMinimal = { ...itemNoImage, fullAnalysis: undefined };
            const userMinimal = { ...user, history: [itemMinimal, ...user.history] };
            
            setUser(userMinimal);
            
            if (!safeUpdateUserStorage(userMinimal)) {
                 alert("Storage Limit Reached: Could not save analysis history. Please clear browser data.");
                 setUser(user); // Revert
            }
        }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      updateProfileImage,
      addToHistory,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};