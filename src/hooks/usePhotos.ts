import { useState, useCallback, useEffect } from 'react';
import atProtoService from '../services/atproto';
import { Photo, ApiResponse } from '../types';

interface UsePhotosOptions {
  autoFetch?: boolean;
  limit?: number;
}

// Mock data generator for fallback when needed
const generateMockPhotos = (count: number = 10): Photo[] => {
  const mockPhotos: Photo[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `photo-${i + 1}`;
    mockPhotos.push({
      uri: `at://mock/${id}`,
      authorDid: 'did:plc:mock',
      image: `https://picsum.photos/seed/${id}/800/600`,
      description: `This is a mock photo #${i + 1}`,
      tags: ['dog', 'park', `tag${i + 1}`],
      location: 'Central Park',
      visibility: 'public',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Each photo 1 day apart
    });
  }
  
  return mockPhotos;
};

const usePhotos = (options: UsePhotosOptions = {}) => {
  const { autoFetch = true, limit = 50 } = options;
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [useMockData, setUseMockData] = useState<boolean>(false);

  // Fetch photos with optional pagination
  const fetchPhotos = useCallback(async (reset: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    // If reset is true, clear the current photos and cursor
    if (reset) {
      setPhotos([]);
      setCursor(undefined);
      setHasMore(true);
      setUseMockData(false);
    }
    
    // If we're using mock data, continue with that
    if (useMockData) {
      const mockPhotos = generateMockPhotos(12);
      setPhotos(prev => reset ? mockPhotos : [...prev, ...mockPhotos]);
      setIsLoading(false);
      return true;
    }
    
    try {
      // Try to fetch real photos from the API
      const currentCursor = reset ? undefined : cursor;
      const response = await atProtoService.getPhotos(limit, currentCursor);
      
      if (response.success && response.data) {
        const newPhotos = response.data;
        
        // Update the photos state
        setPhotos(prev => reset ? newPhotos : [...prev, ...newPhotos]);
        
        // Check if we have more photos to load
        if (newPhotos.length < limit) {
          setHasMore(false);
        }
        
        // Update the cursor for the next page if we have photos
        if (newPhotos.length > 0) {
          // Use the last photo's URI as the cursor for pagination
          const lastPhoto = newPhotos[newPhotos.length - 1];
          // Extract the record ID from the URI for use as cursor
          // URI format is typically: at://did:plc:abc123/app.dogpark.photo/record123
          const uriParts = lastPhoto.uri.split('/');
          const recordId = uriParts[uriParts.length - 1];
          setCursor(recordId);
          console.log('Setting cursor to:', recordId);
        } else {
          setHasMore(false);
        }
        
        setIsLoading(false);
        return true;
      } else {
        console.log('Using mock photos since API call failed:', response.error);
        // Use mock data for development/testing
        setUseMockData(true);
        const mockPhotos = generateMockPhotos(12);
        setPhotos(prev => reset ? mockPhotos : [...prev, ...mockPhotos]);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      // Use mock data on error
      setUseMockData(true);
      const mockPhotos = generateMockPhotos(12);
      setPhotos(prev => reset ? mockPhotos : [...prev, ...mockPhotos]);
      setIsLoading(false);
      return true;
    }
  }, [cursor, limit, useMockData]);

  // Load more photos (for pagination)
  const loadMorePhotos = useCallback(async (): Promise<boolean> => {
    if (!isLoading && hasMore) {
      return fetchPhotos(false);
    }
    return false;
  }, [fetchPhotos, hasMore, isLoading]);

  // Refresh photos (clear and fetch from beginning)
  const refreshPhotos = useCallback(async (): Promise<boolean> => {
    return fetchPhotos(true);
  }, [fetchPhotos]);

  // Create a new photo
  const createPhoto = useCallback(async (photoData: Omit<Photo, 'uri' | 'authorDid'>): Promise<ApiResponse<Photo>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await atProtoService.createPhoto(photoData);
      
      if (response.success && response.data) {
        // Add the new photo to the list
        setPhotos(prev => [response.data!, ...prev]);
        // If we were using mock data, switch to real data
        setUseMockData(false);
      } else {
        setError(response.error || 'Failed to create photo');
      }
      
      setIsLoading(false);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error creating photo';
      setError(errorMessage);
      setIsLoading(false);
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  // Auto-fetch photos on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchPhotos(true);
    }
  }, [autoFetch, fetchPhotos]);

  return {
    photos,
    isLoading,
    error,
    hasMore,
    fetchPhotos: refreshPhotos,
    loadMorePhotos,
    createPhoto
  };
};

export default usePhotos;
