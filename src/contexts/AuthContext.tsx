import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, SupabaseUser } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextProps {
  session: Session | null;
  user: SupabaseUser | null;
  signIn: (email: string, password: string) => Promise<{ error: any } | undefined>;
  signOut: () => Promise<void>;
  loading: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check active session and set data
    const getSession = async () => {
      setLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(session);
        
        if (session?.user) {
          const { id, email, user_metadata } = session.user;
          const role = user_metadata?.role || 'admin'; // Default role if none found
          
          setUser({ id, email, role, user_metadata });
          setUserRole(role);
          localStorage.setItem('userRole', role);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        toast({
          title: "Erreur d'authentification",
          description: "Impossible de récupérer votre session",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          const { id, email, user_metadata } = newSession.user;
          const role = user_metadata?.role || 'admin';
          
          setUser({ id, email, role, user_metadata });
          setUserRole(role);
          localStorage.setItem('userRole', role);
        } else {
          setUser(null);
          setUserRole(null);
          localStorage.removeItem('userRole');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return undefined;
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userRole');
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    signIn,
    signOut,
    loading,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 