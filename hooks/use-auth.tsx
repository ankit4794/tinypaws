import { createContext, ReactNode, useContext, useEffect, useState, useRef } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  email?: string;
  mobile?: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  mobile?: string;
};

const LOCAL_STORAGE_AUTH_KEY = "tinypaws-auth";

const getPersistedUser = (): User | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse stored user data:", error);
    return null;
  }
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [userState, setUserState] = useState<User | null>(getPersistedUser());
  // Use a ref to track if we've already updated localStorage to prevent effect loops
  const hasUpdatedStorage = useRef(false);
  
  // Initialize the query with data from localStorage if available
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        // Try to get from server
        const res = await fetch("/api/user");
        if (res.status === 200) {
          const data = await res.json();
          return data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching user:", error);
        // On error, return what we have in localStorage
        return getPersistedUser();
      }
    },
    // Use stale time to avoid too frequent refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Initialize with localStorage data
    initialData: getPersistedUser(),
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
  });

  // Update state and localStorage when data from query changes
  useEffect(() => {
    if (userData !== undefined) {
      setUserState(userData);
      // Only update localStorage if we have real data and not already updated
      if (userData && !hasUpdatedStorage.current) {
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(userData));
        hasUpdatedStorage.current = true;
      } else if (!userData) {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        hasUpdatedStorage.current = false;
      }
    }
  }, [userData]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(user));
      setUserState(user);
      hasUpdatedStorage.current = true;
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(user));
      setUserState(user);
      hasUpdatedStorage.current = true;
      toast({
        title: "Account created",
        description: "Your account has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      setUserState(null);
      hasUpdatedStorage.current = false;
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: userState,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
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