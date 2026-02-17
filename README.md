# INCURSION

A hyper-realistic cinematic web-based game experience built with React + Vite (frontend) and MERN stack (backend).

## 🌌 Project Overview

INCURSION is a sci-fi thriller game that opens with a cinematic sequence featuring:
- Hyper-realistic Earth rendering with WebGL (Three.js)
- 3D brushed steel typography with dynamic effects
- Atmospheric audio design with spatial sound
- Full MERN authentication and progression tracking
- Cinematic transitions and interactive sequences

## 🚀 Tech Stack

### Frontend
- **React** + **Vite** - Fast development and optimized builds
- **Three.js** + **React Three Fiber** - 3D rendering engine
- **@react-three/drei** - Helper components for R3F
- **@react-three/postprocessing** - Visual effects (bloom, DOF)
- **GSAP** - Advanced animation library
- **Tone.js** - Audio synthesis and playback
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors

### Backend
- **Express.js** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
/incursion
├── /client (Frontend - React + Vite)
│   ├── /public
│   │   ├── /textures      # Earth maps, normal maps, cloud layers
│   │   ├── /models        # 3D models (GLTF/GLB)
│   │   ├── /audio         # Atmospheric sounds, music
│   │   └── /fonts         # Typography assets
│   ├── /src
│   │   ├── /components
│   │   │   ├── /ui        # 2D UI overlays
│   │   │   ├── /3d        # 3D scene components
│   │   │   └── /common    # Shared components
│   │   ├── /scenes        # Main scene containers
│   │   ├── /hooks         # Custom React hooks
│   │   ├── /utils         # Helper functions
│   │   ├── /shaders       # GLSL shaders
│   │   ├── /services      # API client
│   │   ├── /store         # Zustand state management
│   │   └── /styles        # CSS modules
│   └── package.json
│
├── /server (Backend - Express + MongoDB)
│   ├── /config            # DB connection
│   ├── /models            # Mongoose schemas
│   ├── /routes            # API routes
│   ├── /middleware        # Auth middleware
│   ├── /controllers       # Route handlers
│   └── server.js
│
├── ASSETS_README.md       # Asset sourcing guide
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/incursion
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_key_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Configure environment variables in `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Client will run on `http://localhost:5173`

## 🎨 Asset Requirements

See [ASSETS_README.md](./ASSETS_README.md) for detailed instructions on sourcing high-quality textures, fonts, and audio files.

**Note**: The app will work with procedural fallbacks if assets are not yet loaded, but for the full cinematic experience, high-quality NASA Earth textures are recommended.

## 🎮 Features

### ✅ Implemented
- [x] React + Vite project structure
- [x] Express backend with MongoDB
- [x] JWT authentication system
- [x] User registration and login
- [x] Game progression tracking
- [x] Deep space 3D scene with Earth
- [x] Atmospheric shaders and glow effects
- [x] Mouse parallax camera movement
- [x] Floating space particles
- [x] 3D title typography with pulsing glow
- [x] Transmission message UI overlay
- [x] Glitch and scanline effects
- [x] Global state management

### 🚧 In Progress
- [ ] Cinematic transition sequences
- [ ] Atmospheric dive with re-entry effects
- [ ] SERN laboratory 3D environment
- [ ] Login terminal interface
- [ ] Post-login cutscene
- [ ] Audio system integration

### 📋 Planned
- [ ] Full gameplay integration
- [ ] Save/load game state
- [ ] Achievement system
- [ ] Multi-level progression
- [ ] Advanced visual effects
- [ ] Mobile responsiveness
- [ ] Performance optimizations

## 🎯 Development Workflow

1. **Planning** - Architecture and technical design
2. **Execution** - Feature implementation
3. **Verification** - Testing and validation

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Game Progress (Protected)
- `GET /api/progress` - Get user's game progress
- `POST /api/progress` - Save/update game progress

## 📝 License

MIT License - See LICENSE file for details

## 👨‍💻 Developer Notes

- Uses `--legacy-peer-deps` for React 19 compatibility with Three.js ecosystem
- WebGL rendering optimized for modern GPUs
- State management uses Zustand for minimal boilerplate
- Authentication uses JWT with refresh token rotation

---

**Status**: Active Development | **Version**: 0.1.0 - Alpha
