# AT Park Developer Guide

## Project Overview

AT Park is a web application for sharing dog photos from dog parks. It allows users to upload photos, tag them, and share them with others. The app is built using React, TypeScript, and the AT Protocol (ATPROTO) for decentralized data storage.

The application follows a modern React architecture with hooks for state management, TypeScript for type safety, and Material-UI for the UI components. It uses the ATPROTO SDK for authentication and data storage.

## Key Features

- **Authentication**: Sign in with ATPROTO accounts
- **Photo Gallery**: View photos in a responsive grid layout
- **Photo Details**: View detailed information about photos with tagging capabilities
- **Photo Upload**: Upload photos with metadata (tags, location, description)
- **Tagging**: Tag photos with dog names or other information
- **Sharing**: Share photos with others (planned)

## Project Structure

```
atpark/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/      # React components
│   │   ├── Auth/        # Authentication components
│   │   ├── Layout/      # Layout components
│   │   ├── Navigation/  # Navigation components
│   │   └── Photos/      # Photo-related components
│   ├── hooks/           # Custom React hooks
│   ├── lexicons/        # ATPROTO lexicon definitions
│   ├── services/        # API services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Entry point
│   └── theme.ts         # Material-UI theme
├── Dockerfile           # Production Docker configuration
├── Dockerfile.dev       # Development Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── ...                  # Other configuration files
```

## Key Files for Developers

### Core Application Files

- **`src/App.tsx`**: Main application component with routing setup
- **`src/theme.ts`**: Material-UI theme configuration
- **`src/types/index.ts`**: TypeScript type definitions for the application

### Authentication

- **`src/services/atproto.ts`**: Service for interacting with the ATPROTO API
- **`src/hooks/useAuth.ts`**: Hook for authentication state management
- **`src/components/Auth/Login.tsx`**: Login form component
- **`src/components/Auth/ProtectedRoute.tsx`**: Route protection component

### Photo Management

- **`src/hooks/usePhotos.ts`**: Hook for photo state management
- **`src/components/Photos/PhotoGallery.tsx`**: Photo gallery component
- **`src/components/Photos/PhotoDetail.tsx`**: Photo detail view component
- **`src/components/Photos/PhotoUpload.tsx`**: Photo upload component

### ATPROTO Integration

- **`src/lexicons/app.dogpark.photo.json`**: ATPROTO lexicon for photo data
- **`src/lexicons/app.dogpark.share.json`**: ATPROTO lexicon for sharing data

## Development Workflow

1. **Setup**: Clone the repository and install dependencies with `npm install`
2. **Development**: Run the development server with `npm run dev`
3. **Building**: Build the production version with `npm run build`
4. **Docker**: Use Docker for development with `docker-compose up` or build for production with `docker build -t atpark .`

## ATPROTO Integration

The application uses the AT Protocol (ATPROTO) for decentralized data storage. It defines custom lexicons for storing photo data and sharing information. The app interacts with the ATPROTO network through the `@atproto/api` library.

The ATPROTO integration has been implemented for the core photo functionality:

- **Authentication**: Users can sign in with their ATPROTO accounts
- **Photo Creation**: The `createPhoto` method in `atproto.ts` creates records in the user's repository using the app.dogpark.photo lexicon
- **Photo Retrieval**: The `getPhotos` method fetches photos from the network with pagination support
- **Tagging**: Users can add and save tags to photos, which are stored in the ATPROTO repository
- **Image Hosting**: Images are uploaded to Cloudflare R2 storage before creating ATPROTO records

### Image Hosting with Cloudflare R2

The app uses Cloudflare R2 for image hosting since ATPROTO is not designed to store large binary data directly. This approach solves the "413 Payload Too Large" error that occurs when trying to store large images directly in ATPROTO records.

The image upload flow works as follows:

1. User selects an image in the PhotoUpload component
2. The image is uploaded to Cloudflare R2 using the imageService
3. The R2 storage returns a public URL for the image
4. The URL is stored in the ATPROTO record, not the image data itself

#### Cloudflare Worker for Secure Uploads

A Cloudflare Worker handles the image uploads to R2, providing a secure way to upload images without exposing R2 credentials in the frontend code:

- The worker generates pre-signed URLs for direct uploads to R2
- It handles CORS and security concerns
- It returns the public URL for the uploaded image

The worker code and configuration are located in the `cloudflare/` directory.

#### Environment Configuration

The app uses environment variables for configuration, which are stored in the `.env` file:

- `VITE_CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `VITE_R2_BUCKET_NAME`: The name of your R2 bucket
- `VITE_R2_PUBLIC_URL`: The public URL for your R2 bucket
- `VITE_UPLOAD_WORKER_URL`: The URL of your Cloudflare Worker

The app still maintains fallback to mock data when the ATPROTO network is unavailable or when there are no photos yet, ensuring a smooth development experience.

## Next Steps

### Short-term Tasks

1. **Fix Authentication Persistence**:

   - **Priority**: High - Users are logged out on page refresh
   - **Current Status**: Authentication state is not persisted between sessions
   - **Potential Solutions**:
     - Implement token storage in localStorage or sessionStorage
     - Add refresh token functionality to the authentication flow
     - Update the useAuth hook to check for stored tokens on initialization
     - Consider using a more robust state management solution for auth state

2. **Fix Cloudflare Worker SSL Issues**:

   - **Priority**: High - This is blocking the image upload functionality
   - **Current Status**: The Cloudflare Worker is experiencing SSL issues (`ERR_SSL_VERSION_OR_CIPHER_MISMATCH`)
   - **Potential Solutions**:
     - Set up a custom domain for the Cloudflare Worker
     - Enable Total TLS in Cloudflare to cover all subdomains
     - Check if the worker domain is properly proxied through Cloudflare
     - Deploy the worker to a different platform (e.g., Vercel, Netlify Functions)
     - Create a local development proxy server for testing

3. **Enhance ATPROTO Integration**:

   - Add support for fetching photos by tags
   - Implement the `createShare` method to enable sharing functionality
   - Add support for comments and reactions using custom lexicons

4. **Enhance User Experience**:

   - Add image optimization for faster loading
   - Implement better error recovery mechanisms
   - Add offline support for viewing previously loaded photos

5. **Improve Photo Management**:
   - Add photo editing capabilities
   - Implement photo deletion
   - Add support for multiple photos in a single post

### Medium-term Tasks

1. **Social Features**:

   - Implement comments on photos
   - Add likes/reactions to photos
   - Create user profiles with their photo collections

2. **Sharing Capabilities**:

   - Implement the sharing functionality using the `app.dogpark.share` lexicon
   - Add support for private and shared visibility modes
   - Create shareable links for photos

3. **Search and Discovery**:
   - Implement search by tags, location, or description
   - Create an explore page with trending or featured photos
   - Add location-based discovery

### Long-term Tasks

1. **Advanced Features**:

   - Add support for photo albums
   - Implement AI-powered automatic tagging
   - Add support for video uploads

2. **Performance Optimizations**:

   - Implement caching for faster loading
   - Add offline support with service workers
   - Optimize bundle size for faster initial load

3. **Cross-platform Support**:
   - Create a mobile app using React Native
   - Add PWA support for installation on mobile devices
   - Implement desktop app using Electron

## Troubleshooting

### Common Issues

1. **Authentication Issues**:

   - Check the console for detailed error messages
   - Ensure you're using a valid ATPROTO account
   - Check if the ATPROTO service is available

   **Authentication Persistence Issue**:

   - **Current Status**: Users are logged out on page refresh
   - **Root Cause**: Authentication state is not persisted between sessions
   - **Impact**: Users need to log in again after every page refresh
   - **Potential Solutions**:
     - Implement token storage in localStorage or sessionStorage
     - Add refresh token functionality to the authentication flow
     - Update the useAuth hook to check for stored tokens on initialization

2. **Photo Upload Issues**:

   - Check file size and format restrictions
   - Ensure you're authenticated before uploading
   - Check console for detailed error messages

3. **Cloudflare Worker SSL Issues**:

   - **Current Status**: There's an ongoing SSL issue with the Cloudflare Worker that causes `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` errors when trying to upload photos
   - This error prevents successful image uploads to R2 storage
   - We've attempted several fixes including using XMLHttpRequest instead of fetch and adding CORS headers to the worker
   - The issue appears to be related to SSL certificate configuration on the Cloudflare side

   **Potential Solutions to Explore**:

   - Set up a custom domain for the Cloudflare Worker instead of using the workers.dev domain
   - Enable Total TLS in Cloudflare to cover all subdomains
   - Check if the worker domain is properly proxied through Cloudflare
   - Deploy the worker to a different platform (e.g., Vercel, Netlify Functions)
   - Create a local development proxy server that forwards requests to the Cloudflare Worker

4. **Development Environment Issues**:
   - Clear browser cache and local storage
   - Restart the development server
   - Check for dependency conflicts with `npm ls`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request

## Resources

- [AT Protocol Documentation](https://atproto.com/docs)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/material-ui/getting-started/overview/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
