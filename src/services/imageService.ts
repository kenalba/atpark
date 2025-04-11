import { ApiResponse } from '../types';

interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

interface UploadResponse {
  url: string;
  key: string;
}

// The URL of your Cloudflare Worker
// Use environment variables if available, otherwise fallback to development values
const UPLOAD_WORKER_URL = import.meta.env.VITE_UPLOAD_WORKER_URL || 'https://atpark-upload-worker.aerozep.workers.dev';

// Connect to the Cloudflare Worker for image uploads

class ImageService {
  /**
   * Get a pre-signed URL for uploading an image to R2
   * @param filename The name of the file
   * @param contentType The MIME type of the file
   * @returns ApiResponse with upload URL and public URL
   */
  async getUploadUrl(filename: string, contentType: string): Promise<ApiResponse<UploadUrlResponse>> {
    try {
      console.log('Requesting upload URL from worker:', UPLOAD_WORKER_URL);
      console.log('Request payload:', { filename, contentType });
      
      // Try using XMLHttpRequest instead of fetch to bypass SSL issues
      return new Promise<ApiResponse<UploadUrlResponse>>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UPLOAD_WORKER_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        // Set timeout
        xhr.timeout = 15000;
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log('Worker response data:', result);
              resolve(result);
            } catch (error) {
              console.error('Error parsing response:', error);
              resolve({
                success: false,
                error: 'Failed to parse response from worker'
              });
            }
          } else {
            console.error('Error from worker:', xhr.statusText);
            resolve({
              success: false,
              error: `Server error: ${xhr.status} ${xhr.statusText}`
            });
          }
        };
        
        xhr.onerror = function() {
          console.error('Network error with worker');
          resolve({
            success: false,
            error: 'Network error: Failed to connect to the worker. Check if the worker URL is correct and accessible.'
          });
        };
        
        xhr.ontimeout = function() {
          console.error('Request timed out');
          resolve({
            success: false,
            error: 'Request timed out. The worker may be unavailable.'
          });
        };
        
        xhr.send(JSON.stringify({
          filename,
          contentType,
        }));
      });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      
      // Provide more specific error messages for common network issues
      let errorMessage = 'Unknown error getting upload URL';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. The worker may be unavailable.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Failed to connect to the worker. Check if the worker URL is correct and accessible.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Upload an image to Cloudflare R2 using a pre-signed URL
   * @param file The file to upload
   * @returns ApiResponse with the public URL of the uploaded image
   */
  async uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
    try {
      // Get a pre-signed URL for uploading
      const urlResponse = await this.getUploadUrl(file.name, file.type);

      if (!urlResponse.success || !urlResponse.data) {
        return {
          success: false,
          error: urlResponse.error || 'Failed to get upload URL',
        };
      }

      // Always attempt to upload the file to R2, regardless of environment
      // We've already checked that urlResponse.data exists above
      const { uploadUrl } = urlResponse.data;
      
      console.log('Got pre-signed URL:', uploadUrl);
      console.log('Uploading file to R2...');
      
      // Try using XMLHttpRequest for the R2 upload as well
      try {
        const uploadResult = await new Promise<boolean>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl, true);
          xhr.setRequestHeader('Content-Type', file.type);
          
          // Set timeout
          xhr.timeout = 30000; // 30 second timeout for larger files
          
          // Track upload progress
          xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              console.log(`Upload progress: ${percentComplete}%`);
            }
          };
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log('R2 upload response status:', xhr.status);
              resolve(true);
            } else {
              console.error('Error uploading to R2:', xhr.statusText);
              resolve(false);
            }
          };
          
          xhr.onerror = function() {
            console.error('Network error during R2 upload');
            resolve(false);
          };
          
          xhr.ontimeout = function() {
            console.error('R2 upload timed out');
            resolve(false);
          };
          
          xhr.send(file);
        });
        
        if (!uploadResult) {
          return {
            success: false,
            error: 'Failed to upload image to R2 storage',
          };
        }
      } catch (uploadError) {
        console.error('Error during R2 upload:', uploadError);
        return {
          success: false,
          error: uploadError instanceof Error ? uploadError.message : 'Unknown error uploading to R2',
        };
      }
      
      console.log('File uploaded successfully to R2');

      // Return the public URL
      return {
        success: true,
        data: {
          url: urlResponse.data.publicUrl,
          key: urlResponse.data.key,
        },
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error uploading image',
      };
    }
  }

  /**
   * Generate a thumbnail from an image
   * @param file The original image file
   * @returns ApiResponse with the URL of the thumbnail
   */
  async generateThumbnail(file: File): Promise<ApiResponse<UploadResponse>> {
    // In a real implementation, you would resize the image here
    // For now, we'll just use the original image as the thumbnail
    return this.uploadImage(file);
  }
}

const imageService = new ImageService();
export default imageService;
