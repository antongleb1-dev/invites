import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  idToken: string | null;
}

/**
 * Hook to manage Firebase authentication state
 * Automatically listens to auth state changes and provides current user info
 */
export function useFirebaseAuth(): AuthState & { logout: () => Promise<void> } {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get ID token for API calls
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
        } catch (error) {
          console.error('Failed to get ID token:', error);
          setIdToken(null);
        }
      } else {
        setIdToken(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIdToken(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    idToken,
    logout,
  };
}

