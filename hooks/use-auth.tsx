import { createContext, ReactNode, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

// Define user type
type User = {
  _id: string;
  email: string;
  fullName?: string;
  mobile?: string;
  role: string;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

// Define login credentials type
type LoginCredentials = {
  email: string;
  password: string;
};

// Define register data type
type RegisterData = {
  email: string;
  password: string;
  fullName?: string;
  mobile?: string;
};

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/user');
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Handle 401 or other errors silently during initial load
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromSession();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      // Redirect to home page after successful login
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }
      
      const registeredUser = await response.json();
      setUser(registeredUser);
      
      // Redirect to home page after successful registration
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to logout');
      }
      
      setUser(null);
      
      // Redirect to home page after successful logout
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}