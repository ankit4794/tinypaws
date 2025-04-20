import { createContext, ReactNode, useContext } from 'react';
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// User type
export type User = {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  mobile?: string;
  role: string;
  address?: any;
  googleId?: string;
  facebookId?: string;
  createdAt: string;
  updatedAt: string;
};

// Login Data type
type LoginData = {
  email: string;
  password: string;
};

// Register Data type
type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  mobile?: string;
};

// Update User Data type
type UpdateUserData = {
  fullName?: string;
  mobile?: string;
  address?: Record<string, string>;
  currentPassword?: string;
  newPassword?: string;
};

// Auth Context Type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  updateUserMutation: UseMutationResult<User, Error, UpdateUserData>;
};

// Create Auth Context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Query to get current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/auth/user');
        if (res.status === 401) {
          return null;
        }
        return await res.json();
      } catch (error) {
        return null;
      }
    },
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/auth/user'], user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.fullName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/auth/user'], user);
      toast({
        title: 'Registration successful',
        description: `Welcome to TinyPaws, ${user.fullName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      const res = await apiRequest('PUT', '/api/auth/update-user', userData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/auth/user'], user);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateUserMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}