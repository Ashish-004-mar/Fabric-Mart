import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => Promise<AuthResponse>;
  register: (name: string, email: string, role: UserRole, companyName?: string) => Promise<AuthResponse>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Try to load saved user session
    const saved = localStorage.getItem('fabricai_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('fabricai_user');
      }
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    let targetUser: User;
    if (user && !user.id.startsWith('user-buyer-2') && !user.id.startsWith('user-supplier-4')) {
      targetUser = {
        ...user,
        role: newRole,
        companyName: user.companyName || (newRole === 'SUPPLIER' ? `${user.name} Textiles` : `${user.name} Brand`),
      };
    } else {
      targetUser = INITIAL_USERS.find((u) => u.role === newRole) || {
        id: `user-${newRole.toLowerCase()}-default`,
        name: newRole === 'SUPPLIER' ? 'Sofia Rodriguez' : 'Emily Davis',
        email: newRole === 'SUPPLIER' ? 'sofia@weaverecords.com' : 'emily@luxedesign.com',
        role: newRole,
        companyName: newRole === 'SUPPLIER' ? 'Weave Records Mills' : 'Luxe Design Studio',
      };
    }
    setUser(targetUser);
    localStorage.setItem('fabricai_user', JSON.stringify(targetUser));
  };

  const login = async (email: string, role?: UserRole): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        return { success: false, error: data.error || 'Account not found. Please register / sign up first.' };
      }
      setUser(data.user);
      localStorage.setItem('fabricai_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, role: UserRole, companyName?: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, companyName }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        return { success: false, error: data.error || 'Registration failed.' };
      }
      setUser(data.user);
      localStorage.setItem('fabricai_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error during registration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('fabricai_user', JSON.stringify(updated));

    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error('Failed to sync profile update to server database:', e);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete user account on server database:', e);
    }
    logout();
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fabricai_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'BUYER',
        switchRole,
        login,
        register,
        updateUser,
        deleteAccount,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
