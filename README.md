# Sangeet Listener

A modern, full-stack music streaming platform built with the MERN stack (MongoDB, Express, React, Node.js). Sangeet Listener provides a premium continuous audio playback experience, offering both listeners and artists a rich set of features tailored to their needs.

## Features

### For Listeners
- **Immersive Music Player:** Enjoy gapless playback with play, pause, next/previous skip buttons, shuffle, and repeat modes. 
- **Full-Screen Immersive Mode:** View lyrics (if available), dynamic backgrounds based on the album cover, and an expanded player UI.
- **Library Management:** Save playlists and follow your favorite artists.
- **Liked Songs:** Easily keep track of songs you love.
- **Explore & Search:** Discover new music through categories, popular feeds, and a powerful search engine for tracks, artists, and playlists.
- **Responsive Design:** Seamless experience across desktop and mobile devices.

### For Artists
- **Artist Dashboard:** Upload and manage your tracks directly from the platform.
- **Profile Management:** Customize your artist profile with avatars and bios.
- **Public Playlists:** Create and manage playlists specifically to showcase your music to listeners.

## Tech Stack

### Frontend
- **React.js:** Core UI library
- **React Router:** Navigation and routing
- **Tailwind CSS:** Modern, utility-first styling for a rich, beautiful UI
- **Context API:** State management for authentication and audio player state
- **Vite:** Fast, modern build tool

### Backend
- **Node.js & Express:** Robust server and API framework
- **MongoDB:** Flexible NoSQL database with Mongoose ODM
- **JSON Web Tokens (JWT):** Secure user authentication and session management
- **Cloudinary:** Media upload management for audio files and cover art
- **Multer:** Handling multipart/form-data for file uploads

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB Atlas URI
- Cloudinary account credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd SangeetListener
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following keys:
   ```env
   PORT=5000
   MONGODB_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the App:**
   Open your browser and navigate to `http://localhost:5173`.

## Folder Structure

- `frontend/`: Contains the React application, React Contexts, components, and pages.
- `backend/`: Contains the Express server, Mongoose models, controllers, and API routes.

## License
MIT License
