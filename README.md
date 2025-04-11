# AT Park - Dog Park Photo Sharing App

AT Park is a web application for sharing dog photos from dog parks. It allows users to upload photos, tag them, and share them with others. The app is built using React, TypeScript, and the AT Protocol (ATPROTO) for decentralized data storage.

## Features

- **Authentication**: Sign in with your ATPROTO account
- **Photo Upload**: Upload photos of dogs from the dog park
- **Tagging**: Tag photos with dog names or other information
- **Photo Gallery**: View photos in a gallery format
- **Photo Details**: View detailed information about photos
- **Sharing**: Share photos with others

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: AT Protocol (ATPROTO)
- **State Management**: React Hooks
- **Routing**: React Router
- **Styling**: Material-UI, CSS
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An ATPROTO account (you can create one at [Bluesky](https://bsky.app/signup))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/atpark.git
   cd atpark
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

### Docker

You can also run the app using Docker:

1. Development:
   ```bash
   docker-compose up
   ```

2. Production:
   ```bash
   docker build -t atpark .
   docker run -p 80:80 atpark
   ```

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

## ATPROTO Integration

This app uses the AT Protocol (ATPROTO) for decentralized data storage. It defines custom lexicons for storing photo data and sharing information. The app interacts with the ATPROTO network through the `@atproto/api` library.

### Image Hosting with Cloudflare R2

The app uses Cloudflare R2 for image hosting since ATPROTO is not designed to store large binary data directly. Images are uploaded to Cloudflare R2 before creating ATPROTO records, and only the image URLs are stored in the ATPROTO records.

A Cloudflare Worker handles the image uploads to R2, providing a secure way to upload images without exposing R2 credentials in the frontend code.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [AT Protocol](https://atproto.com/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
