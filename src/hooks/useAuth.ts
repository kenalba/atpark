import { useState, useEffect, useCallback } from 'react';
import atProtoService from '../services/atproto';
import { AuthState } from '../types';

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = atProtoService.isAuthenticated();
        
        if (isAuthenticated) {
          const did = atProtoService.getDid();
          
          if (did) {
            const profileResponse = await atProtoService.getProfile(did);
            
            if (profileResponse.success && profileResponse.data) {
              setAuthState({
                isAuthenticated: true,
                user: profileResponse.data,
                isLoading: false,
                error: null,
              });
              return;
            }
          }
        }
        
        // If we get here, user is not authenticated
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error checking authentication',
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (identifier: string, password: string): Promise<boolean> => {
    console.log('Login attempt with:', { identifier });
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await atProtoService.login(identifier, password);
      console.log('Login response in hook:', response);
      
      if (response.success && response.data) {
        console.log('Login successful, setting auth state');
        
        // Set auth state with basic user info from login
        setAuthState({
          isAuthenticated: true,
          user: response.data,
          isLoading: false,
          error: null,
        });
        
        // Try to fetch profile info in the background, but don't block login success
        try {
          console.log('Fetching profile info for:', response.data.did);
          const profileResponse = await atProtoService.getProfile(response.data.did);
          
          if (profileResponse.success && profileResponse.data) {
            console.log('Profile fetch successful:', profileResponse.data);
            setAuthState(prev => ({
              ...prev,
              user: profileResponse.data || null,
            }));
          } else {
            console.log('Profile fetch failed:', profileResponse.error);
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Don't update auth state on profile fetch error
        }
        
        return true;
      }
      
      // If we get here, login failed
      console.log('Login failed:', response.error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: response.error || 'Login failed',
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error during login',
      });
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await atProtoService.logout();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error during logout',
      }));
    }
  }, []);

  // Update user profile
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!authState.isAuthenticated || !authState.user) {
      return;
    }
    
    try {
      const response = await atProtoService.getProfile(authState.user.did);
      
      if (response.success && response.data) {
        setAuthState(prev => ({
          ...prev,
          user: response.data || null,
        }));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [authState.isAuthenticated, authState.user]);

  return {
    ...authState,
    login,
    logout,
    refreshProfile,
  };
};

export default useAuth;
