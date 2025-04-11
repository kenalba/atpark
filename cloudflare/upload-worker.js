/**
 * AT Park - Cloudflare Worker for R2 Image Uploads
 * 
 * This worker handles direct uploads to Cloudflare R2 storage.
 * It generates pre-signed URLs for uploading images and returns
 * the public URL for the uploaded image.
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests with more comprehensive headers
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400", // 24 hours
        },
      });
    }

    // Only allow POST requests for creating upload URLs
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      // Parse the request to get file information
      const { filename, contentType } = await request.json();
      
      if (!filename || !contentType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing filename or contentType" 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
          } 
        }
      );
      }

      // Generate a unique key for the file
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const key = `${timestamp}-${randomString}-${filename}`;
      
      // Create a presigned URL for uploading
      const uploadUrl = await env.BUCKET.createUploadUrl({
        key,
        expiresIn: 60 * 60, // URL expires in 1 hour
        metadata: {
          contentType,
        },
      });

      // Generate the public URL for the file
      const publicUrl = `${env.PUBLIC_BUCKET_URL}/${key}`;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            uploadUrl,
            publicUrl,
            key,
          },
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
          },
        }
      );
    } catch (error) {
      console.error("Error generating upload URL:", error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Internal server error" 
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
          },
        }
      );
    }
  },
};
