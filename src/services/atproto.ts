import { BskyAgent } from '@atproto/api';
import { User, Photo, Share, ApiResponse } from '../types';

// Default ATPROTO service URL
const DEFAULT_SERVICE = 'https://bsky.social';

class AtProtoService {
  private agent: BskyAgent;
  private serviceUrl: string;

  constructor(serviceUrl: string = DEFAULT_SERVICE) {
    this.serviceUrl = serviceUrl;
    this.agent = new BskyAgent({ service: this.serviceUrl });
  }

  // Authentication methods
  async login(identifier: string, password: string): Promise<ApiResponse<User>> {
    try {
      console.log('Attempting login with:', { identifier });
      
      const response = await this.agent.login({ identifier, password });
      console.log('Login response:', response);
      
      // For debugging
      if (this.agent.session) {
        console.log('Session established:', {
          did: this.agent.session.did,
          handle: this.agent.session.handle
        });
      } else {
        console.log('No session established after login');
      }
      
      // Create user object from session data
      const user: User = {
        did: this.agent.session?.did || '',
        handle: this.agent.session?.handle || '',
        displayName: undefined,
        avatar: undefined,
      };
      
      // Return success if we have a session and DID
      if (this.agent.session && this.agent.session.did) {
        return { success: true, data: user };
      } else {
        return { success: false, error: 'Failed to establish session' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during login' 
      };
    }
  }

  async logout(): Promise<void> {
    await this.agent.logout();
  }

  isAuthenticated(): boolean {
    return !!this.agent.session;
  }

  // Profile methods
  async getProfile(did: string): Promise<ApiResponse<User>> {
    try {
      console.log('Getting profile for DID:', did);
      
      if (!this.isAuthenticated()) {
        console.log('Not authenticated when trying to get profile');
        return { success: false, error: 'Not authenticated' };
      }

      console.log('Fetching profile with agent...');
      const response = await this.agent.getProfile({ actor: did });
      console.log('Profile response:', response);
      
      if (!response.success) {
        console.log('Profile fetch unsuccessful');
        return { success: false, error: 'Failed to fetch profile' };
      }
      
      // Create user object from profile data
      const user: User = {
        did: response.data.did,
        handle: response.data.handle,
        displayName: response.data.displayName,
        avatar: response.data.avatar,
      };
      
      console.log('Profile fetch successful, user:', user);
      return { success: true, data: user };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error getting profile' 
      };
    }
  }

  // Photo methods
  async createPhoto(photoData: Omit<Photo, 'uri' | 'authorDid'>): Promise<ApiResponse<Photo>> {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      const did = this.getDid();
      if (!did) {
        return { success: false, error: 'User DID not available' };
      }

      console.log('Creating photo with data:', photoData);
      
      // IMPORTANT: In a real implementation, we would first upload the image to a separate
      // image hosting service (like AWS S3, Cloudinary, etc.) and then store only the URL
      // in the ATPROTO record. ATPROTO is not designed to store large binary data directly.
      //
      // For example:
      // 1. Upload image to S3/Cloudinary and get back a URL
      // 2. Store that URL in the ATPROTO record
      //
      // For now, we'll simulate this by assuming photoData.image is already a URL
      // to an externally hosted image, not a data URL or binary data.
      
      // Validate the image URL
      if (!photoData.image) {
        return { 
          success: false, 
          error: 'Image URL is required' 
        };
      }
      
      // Check if the image is a data URL (starts with "data:")
      if (photoData.image.startsWith('data:')) {
        return { 
          success: false, 
          error: 'Cannot store data URLs directly in ATPROTO records. Please upload the image to an external service first.' 
        };
      }
      
      // Verify that the image URL is from our Cloudflare R2 storage or a valid external URL
      // This is a simple check, in a real app you might want to validate more thoroughly
      const isValidImageUrl = photoData.image.includes('picsum.photos') || // For development
                             photoData.image.includes('r2.cloudflarestorage.com') || // For production
                             photoData.image.startsWith('https://'); // Any HTTPS URL
      
      if (!isValidImageUrl) {
        return {
          success: false,
          error: 'Invalid image URL. Images must be hosted on a secure server.'
        };
      }
      
      // Create a record in the user's repository using the app.dogpark.photo lexicon
      // Using a generic record object that matches what BskyAgent expects
      const record: Record<string, unknown> = {
        // Store only the URL to the image, not the image data itself
        image: photoData.image,
        thumbnail: photoData.thumbnail,
        tags: photoData.tags || [],
        location: photoData.location,
        visibility: photoData.visibility || 'public',
        description: photoData.description,
        createdAt: photoData.createdAt || new Date().toISOString()
      };
      
      // Create the record in the user's repository
      const response = await this.agent.com.atproto.repo.createRecord({
        repo: did,
        collection: 'app.dogpark.photo',
        record
      });
      
      // Extract the URI from the response
      const responseObj = response as unknown as { uri: string };
      const uri = responseObj.uri;
      
      // Create a Photo object with the response data
      const photo: Photo = {
        uri,
        authorDid: did,
        ...photoData
      };
      
      console.log('Photo created successfully:', photo);
      
      return { 
        success: true, 
        data: photo
      };
    } catch (error) {
      console.error('Error creating photo:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error creating photo' 
      };
    }
  }

  async getPhotos(limit: number = 50, cursor?: string): Promise<ApiResponse<Photo[]>> {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      const did = this.getDid();
      if (!did) {
        return { success: false, error: 'User DID not available' };
      }

      console.log('Fetching photos with limit:', limit, 'cursor:', cursor);
      
      // Query the network for photos using the app.dogpark.photo lexicon
      const params: {
        repo: string;
        collection: string;
        limit: number;
        cursor?: string;
      } = {
        repo: did,
        collection: 'app.dogpark.photo',
        limit
      };
      
      // Only add cursor if it's defined
      if (cursor) {
        params.cursor = cursor;
      }
      
      console.log('Querying with params:', params);
      const response = await this.agent.com.atproto.repo.listRecords(params);
      
      // The response contains records, but TypeScript doesn't know the exact shape
      // First convert to unknown, then to the expected type to avoid TypeScript errors
      const responseObj = response as unknown as { records: Array<{ uri: string; value: Record<string, unknown> }> };
      const records = responseObj.records || [];
      
      if (records.length === 0) {
        console.log('No photos found');
        return { success: true, data: [] };
      }
      
      // Map the records to Photo objects
      const photos: Photo[] = records.map(record => {
        const value = record.value;
        return {
          uri: record.uri,
          authorDid: record.uri.split('/')[0],
          image: value.image as string,
          thumbnail: value.thumbnail as string | undefined,
          tags: (value.tags as string[]) || [],
          location: value.location as string | undefined,
          visibility: (value.visibility as 'public' | 'private' | 'shared') || 'public',
          description: value.description as string | undefined,
          createdAt: value.createdAt as string
        };
      });
      
      console.log('Photos fetched successfully:', photos.length);
      
      return { 
        success: true, 
        data: photos
      };
    } catch (error) {
      console.error('Error getting photos:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error getting photos' 
      };
    }
  }

  // Share methods - these will be implemented as we develop the app
  async createShare(shareData: Omit<Share, 'uri'>): Promise<ApiResponse<Share>> {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      // This is a placeholder for the actual implementation
      // We'll need to create a record in the user's repository
      // using the app.dogpark.share lexicon
      console.log('Creating share with data:', shareData);
      
      return { 
        success: false, 
        error: 'Method not implemented yet' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error creating share' 
      };
    }
  }

  // Helper methods
  getDid(): string | undefined {
    return this.agent.session?.did;
  }
}

// Create a singleton instance
const atProtoService = new AtProtoService();

export default atProtoService;
