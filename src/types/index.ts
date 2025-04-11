// Photo types
export interface Photo {
  uri: string;
  image: string;
  thumbnail?: string;
  tags?: string[];
  location?: string;
  visibility: 'public' | 'private' | 'shared';
  description?: string;
  createdAt: string;
  authorDid: string;
}

// Share types
export interface Share {
  uri: string;
  photoUri: string;
  sharedWith: string[];
  expiresAt?: string;
  createdAt: string;
}

// User types
export interface User {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
