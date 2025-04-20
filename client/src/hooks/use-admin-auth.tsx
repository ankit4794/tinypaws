import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AdminUser = {
  _id: string;
  email: string;
  fullName?: string;
  role: string;
};

type AdminAuthContextType = {
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
  adminLoginMutation: UseMutationResult<AdminUser, Error, AdminLoginData>;
  adminLogoutMutation: UseMutationResult<void, Error, void>;
};

type AdminLoginData = {
  email: string;
  password: string;
};

const LOCAL_STORAGE_ADMIN_KEY = "tinypaws_admin_user";

// Try to get persisted admin user from localStorage
const getPersistedAdminUser = (): AdminUser | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_ADMIN_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse stored admin user data:", error);
    return null;
  }
};

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  // Use state to keep track of the admin user
  const [adminUserState, setAdminUserState] = useState<AdminUser | null>(getPersistedAdminUser());
  // Use a ref to track if we've already updated localStorage to prevent effect loops
  const hasUpdatedStorage = useRef(false);

  // Initialize the query with data from localStorage if available
  const {
    data: adminUserData,
    error,
    isLoading,
  } = useQuery<AdminUser | null, Error>({
    queryKey: ["/api/admin/user"],
    queryFn: async () => {
      try {
        // Try to get from server first
        const res = await apiRequest("GET", "/api/admin/user");
        if (res.status === 200) {
          const data = await res.json();
          return data;
        } else {
          // If server says no, return null
          return null;
        }
      } catch (error) {
        console.error("Error fetching admin user:", error);
        // On error, use what we have in localStorage
        return getPersistedAdminUser();
      }
    },
    // Use stale time to avoid too frequent refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Use initialData as a fallback
    initialData: getPersistedAdminUser(),
    // Don't refetch on window focus since we manage state ourselves
    refetchOnWindowFocus: false,
  });

  // Update state and localStorage when data from query changes
  useEffect(() => {
    if (adminUserData !== undefined) {
      setAdminUserState(adminUserData);
      // Only update localStorage if we have real data and not already updated
      if (adminUserData && !hasUpdatedStorage.current) {
        localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(adminUserData));
        hasUpdatedStorage.current = true;
      } else if (!adminUserData) {
        localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
        hasUpdatedStorage.current = false;
      }
    }
  }, [adminUserData]);

  const adminLoginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginData) => {
      const res = await apiRequest("POST", "/api/admin/login", credentials);
      if (!res.ok) {
        throw new Error("Invalid email or password");
      }
      return await res.json();
    },
    onSuccess: (user: AdminUser) => {
      queryClient.setQueryData(["/api/admin/user"], user);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(user));
      setAdminUserState(user);
      hasUpdatedStorage.current = true;
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName || user.email}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const adminLogoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/user"], null);
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
      setAdminUserState(null);
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
    <AdminAuthContext.Provider
      value={{
        adminUser: adminUserState,
        isLoading,
        error,
        adminLoginMutation,
        adminLogoutMutation,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}