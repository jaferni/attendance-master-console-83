
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { User } from "@/types/user";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { allUsers } from "@/data";
import { Session } from "@supabase/supabase-js";

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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          // Check if this is a superadmin (check in the database or use role from session)
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          
          if (profileData && profileData.role === 'superadmin') {
            setUser({
              id: newSession.user.id,
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: newSession.user.email || '',
              role: 'superadmin',
              avatar: profileData.avatar,
            });
          } else {
            // Check if it's a teacher
            const { data: teacherData } = await supabase
              .from('teachers')
              .select('*')
              .eq('email', newSession.user.email)
              .single();
              
            if (teacherData) {
              setUser({
                id: teacherData.id,
                firstName: teacherData.first_name,
                lastName: teacherData.last_name,
                email: teacherData.email || '',
                role: 'teacher',
              });
            } else {
              // If not a teacher or superadmin, check mock users
              const mockUser = allUsers.find(u => u.email === newSession.user.email);
              if (mockUser) {
                setUser(mockUser);
              } else {
                // No valid user found - sign out
                await supabase.auth.signOut();
                setUser(null);
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Then check for existing session
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Check if this is a superadmin
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          
          if (profileData && profileData.role === 'superadmin') {
            setUser({
              id: data.session.user.id,
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: data.session.user.email || '',
              role: 'superadmin',
              avatar: profileData.avatar,
            });
          } else {
            // Check if it's a teacher
            const { data: teacherData } = await supabase
              .from('teachers')
              .select('*')
              .eq('email', data.session.user.email)
              .single();
              
            if (teacherData) {
              setUser({
                id: teacherData.id,
                firstName: teacherData.first_name,
                lastName: teacherData.last_name,
                email: teacherData.email || '',
                role: 'teacher',
              });
            } else {
              // If not a teacher or superadmin, check mock users
              const mockUser = allUsers.find(u => u.email === data.session.user.email);
              if (mockUser) {
                setUser(mockUser);
              } else {
                // No valid user found
                setUser(null);
              }
            }
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
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // First try to log in with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!authError && authData.session) {
        // Authentication successful
        setSession(authData.session);
        // User will be set by the auth state change listener
        setIsLoading(false);
        return true;
      }
      
      // If Supabase auth fails, try the mock users for demo purposes
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
      
      // If not a mock user, check if it's a teacher
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
      
      if (teacherError) {
        // No teacher found with this email/password
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      if (teacherData) {
        // Teacher login successful
        const teacherUser: User = {
          id: teacherData.id,
          firstName: teacherData.first_name,
          lastName: teacherData.last_name,
          email: teacherData.email || '',
          role: 'teacher',
        };
        
        setUser(teacherUser);
        
        toast({
          title: "Logged in successfully",
          description: `Welcome, ${teacherUser.firstName}!`,
        });
        
        setIsLoading(false);
        return true;
      }
      
      // If we get here, no valid user was found
      toast({
        title: "Login failed",
        description: "Please use one of the demo accounts listed on the login page, a valid teacher account, or a valid superadmin account.",
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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
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
