
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { User } from "@/types/user";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { allUsers } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        // Get session from Supabase
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // For now, let's use mock data for all users
          // This helps us avoid the infinite recursion issue with Supabase RLS
          setUser(null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check session on load
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // For now, use mock data for all users
          setUser(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, allow login with the demo accounts from mockData
      const mockUser = allUsers.find(u => u.email === email);
      
      if (mockUser) {
        setUser(mockUser);
        
        toast({
          title: "Logged in successfully",
          description: `Welcome, ${mockUser.firstName}!`,
        });
        
        setIsLoading(false);
        return true;
      }
      
      // If not a demo account, show error
      toast({
        title: "Login failed",
        description: "Please use one of the demo accounts listed on the login page.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Just set user to null for both mock and real users
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while trying to log out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
