import { createContext, ReactNode, useContext, useEffect, useState } from "react";
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

  // Initialize the query with data from localStorage if available
  const {
    data: adminUserData,
    error,
    isLoading,
  } = useQuery<AdminUser | null, Error>({
    queryKey: ["/api/admin/user"],
    queryFn: async () => {
      try {
        // First check if we have user in localStorage
        const storedUser = getPersistedAdminUser();
        if (storedUser) {
          // Verify with server if this user is still valid
          const res = await apiRequest("GET", "/api/admin/user");
          if (res.status === 200) {
            const data = await res.json();
            setAdminUserState(data);
            return data;
          } else {
            // If server says no, clear localStorage
            localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
            setAdminUserState(null);
            return null;
          }
        }
        
        // No stored user, try to get from server
        const res = await apiRequest("GET", "/api/admin/user");
        if (res.status === 401 || res.status === 403) {
          setAdminUserState(null);
          return null;
        }
        const data = await res.json();
        setAdminUserState(data);
        return data;
      } catch (error) {
        console.error("Error fetching admin user:", error);
        // On error, use what we have in state
        return adminUserState;
      }
    },
    // Use stale time to avoid too frequent refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Use initialData as a fallback
    initialData: adminUserState,
    // Don't refetch on window focus since we manage state ourselves
    refetchOnWindowFocus: false,
  });

  // Always use adminUserState as the source of truth
  const adminUser = adminUserState;

  // Persist user data to localStorage when it changes
  useEffect(() => {
    if (adminUserData) {
      localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(adminUserData));
      setAdminUserState(adminUserData);
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
        adminUser,
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