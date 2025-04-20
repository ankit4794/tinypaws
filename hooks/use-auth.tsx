import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

type User = {
  _id: string;
  email: string;
  fullName?: string;
  mobile?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  fullName?: string;
  mobile?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch the user when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If 401 or other error, user is not authenticated
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch user"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      toast({
        title: "Login successful",
        description: "Welcome back to TinyPaws!",
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err : new Error("Login failed"));
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const newUser = await response.json();
      setUser(newUser);
      toast({
        title: "Registration successful",
        description: "Welcome to TinyPaws!",
      });
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err : new Error("Registration failed"));
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }

      setUser(null);
      // Optional: Redirect to login page
      router.push('/auth');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (err) {
      console.error("Logout error:", err);
      setError(err instanceof Error ? err : new Error("Logout failed"));
      toast({
        title: "Logout failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}