import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { User } from "@/types/user";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
          // Fetch user profile from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            setUser(null);
          } else if (profileData) {
            // Map Supabase user to our User type
            const userProfile: User = {
              id: profileData.id,
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: data.session.user.email || '',
              role: profileData.role as any || 'student',
              avatar: profileData.avatar || '',
            };
            setUser(userProfile);
          }
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
          // Fetch user profile when signed in
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!profileError && profileData) {
            const userProfile: User = {
              id: profileData.id,
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: session.user.email || '',
              role: profileData.role as any || 'student',
              avatar: profileData.avatar || '',
            };
            setUser(userProfile);
          }
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
      // For demo purposes, allow login with the demo accounts
      if (email === "david.anderson@school.edu" || 
          email === "emma.thompson@school.edu" || 
          email === "alex.johnson@school.edu") {
        
        // Create a mock user based on the email
        let role: 'superadmin' | 'teacher' | 'student' = 'student';
        let firstName = '';
        let lastName = '';
        
        if (email === "david.anderson@school.edu") {
          role = 'superadmin';
          firstName = 'David';
          lastName = 'Anderson';
        } else if (email === "emma.thompson@school.edu") {
          role = 'teacher';
          firstName = 'Emma';
          lastName = 'Thompson';
        } else if (email === "alex.johnson@school.edu") {
          role = 'student';
          firstName = 'Alex';
          lastName = 'Johnson';
        }
        
        // Set mock user
        const mockUser: User = {
          id: `mock-${email}`,
          firstName,
          lastName,
          email,
          role,
          avatar: '',
        };
        
        setUser(mockUser);
        
        toast({
          title: "Logged in successfully",
          description: `Welcome, ${firstName}!`,
        });
        
        setIsLoading(false);
        return true;
      }
      
      // If not a demo account, try to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      if (data.user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          toast({
            title: "Login failed",
            description: "Could not fetch user profile. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
        
        // Map Supabase user to our User type
        const userProfile: User = {
          id: profileData.id,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: data.user.email || '',
          role: profileData.role as any || 'student',
          avatar: profileData.avatar || '',
        };
        
        setUser(userProfile);
        
        toast({
          title: "Logged in successfully",
          description: `Welcome, ${userProfile.firstName}!`,
        });
        
        setIsLoading(false);
        return true;
      }
      
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
      // If it's a mock user, just set user to null
      if (user && user.id.startsWith('mock-')) {
        setUser(null);
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        return;
      }
      
      // Otherwise sign out from Supabase
      await supabase.auth.signOut();
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
