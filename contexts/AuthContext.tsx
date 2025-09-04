import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Profile, AppUser } from '../types';
import Spinner from '../components/Spinner';

interface AuthContextType {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (user: User | null): Promise<AppUser | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // The .single() method returns an error if no record is found.
      // We can check for this specific error code ('PGRST116') and treat it
      // as a valid case (profile not yet created) rather than a fatal error to log.
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return { ...user, profile: null };
      }
      
      return { ...user, profile: data as Profile };

    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return { ...user, profile: null };
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        const appUser = await fetchUserProfile(session?.user ?? null);
        setUser(appUser);
        setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const appUser = await fetchUserProfile(session?.user ?? null);
        setUser(appUser);
        if (_event !== 'INITIAL_SESSION') {
             setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    session,
    user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div className="h-screen w-full flex items-center justify-center"><Spinner /></div> : children}
    </AuthContext.Provider>
  );
};
