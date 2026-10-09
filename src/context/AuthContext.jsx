import { useState, useEffect } from 'react';
import { AuthContext } from './authContextDef.js';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const DEMO_STORAGE_KEY = 'crevo_demo_auth_session';

function getInitialDemoState() {
  if (typeof window === 'undefined') return { user: null, session: null };
  try {
    const cached = localStorage.getItem(DEMO_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore
  }
  return { user: null, session: null };
}

export function AuthProvider({ children }) {
  const [initial] = useState(getInitialDemoState);
  const [user, setUser] = useState(initial.user);
  const [session, setSession] = useState(initial.session);

  // Initialize Auth state for live Supabase
  useEffect(() => {
    let ignore = false;

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        if (!ignore && initialSession) {
          setSession(initialSession);
          setUser({
            id: initialSession.user.id,
            email: initialSession.user.email,
            role: initialSession.user.user_metadata?.role || 'creator',
            displayName: initialSession.user.user_metadata?.display_name || initialSession.user.email.split('@')[0],
            avatarUrl: initialSession.user.user_metadata?.avatar_url,
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (!ignore) {
          setSession(currentSession);
          if (currentSession) {
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              role: currentSession.user.user_metadata?.role || 'creator',
              displayName: currentSession.user.user_metadata?.display_name || currentSession.user.email.split('@')[0],
              avatarUrl: currentSession.user.user_metadata?.avatar_url,
            });
          } else {
            setUser(null);
          }
        }
      });

      return () => {
        ignore = true;
        subscription.unsubscribe();
      };
    }

    return () => {
      ignore = true;
    };
  }, []);

  const signIn = async ({ email, password }) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }

    // Demo Mode Sign In
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email,
      role: email.includes('brand') ? 'brand' : 'creator',
      displayName: email.split('@')[0],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };
    const mockSession = {
      access_token: 'test-creator-token',
      user: mockUser,
    };
    setUser(mockUser);
    setSession(mockSession);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
    return { user: mockUser, session: mockSession };
  };

  const signUp = async ({ email, password, role = 'creator', displayName }) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            display_name: displayName,
          },
        },
      });
      if (error) throw error;
      return data;
    }

    // Demo Mode Sign Up
    const mockUser = {
      id: `usr-${Date.now()}`,
      email,
      role,
      displayName: displayName || email.split('@')[0],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };
    const mockSession = {
      access_token: role === 'creator' ? 'test-creator-token' : 'test-brand-token',
      user: mockUser,
    };
    setUser(mockUser);
    setSession(mockSession);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
    return { user: mockUser, session: mockSession };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem(DEMO_STORAGE_KEY);
  };

  const token = session?.access_token || (user?.role === 'brand' ? 'test-brand-token' : 'test-creator-token');

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
