# AT Park - Cloudflare R2 Image Upload Worker

This directory contains the Cloudflare Worker for handling image uploads to Cloudflare R2 storage for the AT Park application.

## Overview

The worker provides a secure way to upload images to Cloudflare R2 storage without exposing your R2 credentials in the frontend code. It generates pre-signed URLs for direct uploads to R2 and returns the public URL for the uploaded image.

## Files

- `upload-worker.js`: The Cloudflare Worker code
- `wrangler.toml`: Configuration file for Wrangler (Cloudflare's CLI tool)

## Setup Instructions

### Prerequisites

1. A Cloudflare account
2. Cloudflare R2 storage set up
3. Wrangler CLI installed (`npm install -g wrangler`)

### Steps

1. **Authenticate with Cloudflare**

   ```bash
   wrangler login
   ```

2. **Create an R2 Bucket**

   If you haven't already created an R2 bucket, you can create one using the Cloudflare dashboard or with Wrangler:

   ```bash
   wrangler r2 bucket create atpark-images
   ```

3. **Configure Public Access for the Bucket**

   To make the uploaded images publicly accessible, you need to enable public access for your bucket in the Cloudflare dashboard:

   - Go to R2 in your Cloudflare dashboard
   - Select your bucket
   - Go to "Settings" > "Public Access"
   - Enable public access and note the public URL

4. **Update the wrangler.toml File**

   Edit the `wrangler.toml` file and update the following:

   - Your Cloudflare account ID
   - Your bucket name (if different from `atpark-images`)
   - The public bucket URL

5. **Deploy the Worker**

   ```bash
   cd cloudflare
   wrangler publish
   ```

6. **Update the Frontend Configuration**

   After deploying the worker, update the `UPLOAD_WORKER_URL` in `src/services/imageService.ts` with your worker's URL:

   ```typescript
   const UPLOAD_WORKER_URL = 'https://atpark-upload-worker.<your-worker-subdomain>.workers.dev';
   ```

## CORS Configuration

The worker already includes CORS headers to allow requests from any origin. If you want to restrict this to specific origins, modify the `Access-Control-Allow-Origin` header in the worker code.

## Testing the Worker

You can test the worker using curl:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.jpg","contentType":"image/jpeg"}' \
  https://atpark-upload-worker.<your-worker-subdomain>.workers.dev
```

This should return a JSON response with the upload URL and public URL.

## Troubleshooting

- **Worker Deployment Issues**: Check the Wrangler logs with `wrangler tail`
- **Upload Errors**: Verify that your R2 bucket is properly configured and that public access is enabled
- **CORS Errors**: Ensure that the worker's CORS headers are properly configured for your frontend domain

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
