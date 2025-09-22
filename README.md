# Chatbot Platform

A minimal Chatbot Platform built with React, Node.js, and Supabase for SDE internship assignment.

## Features

- ✅ User authentication (JWT)
- ✅ Project/Agent creation and management
- ✅ Prompt storage and management
- ✅ AI chat interface using OpenRouter API
- 🔄 File upload support (optional)
- 🔄 Analytics and integrations (extensible design)

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **AI Integration**: OpenRouter API
- **Styling**: Tailwind CSS
- **Icons**: Heroicons

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenRouter API key

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `server/database-schema.sql`
3. Note down your Supabase URL and service role key

### 2. Backend Setup

```bash
cd server
npm install
cp env.example .env
```

Update `server/.env` with your credentials:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
cp env.example .env
```

Update `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects

- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Prompts

- `GET /api/prompts/project/:projectId` - Get project prompts
- `POST /api/prompts` - Create new prompt
- `GET /api/prompts/:id` - Get specific prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt

### Chat

- `POST /api/chat` - Send message to AI
- `GET /api/chat/conversation/:conversationId` - Get conversation
- `GET /api/chat/project/:projectId` - Get project conversations

## Getting OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Go to API Keys section
4. Create a new API key
5. Add it to your backend `.env` file

## Features Overview

### Authentication

- Secure JWT-based authentication
- User registration and login
- Protected routes
- Automatic token management

### Project Management

- Create and manage chatbot projects
- Set custom AI models
- Project descriptions and metadata

### Prompt Management

- Store system prompts for projects
- Organize prompts by type
- Edit and delete prompts

### Chat Interface

- Real-time chat with AI
- Conversation history
- Context-aware responses
- Multiple model support

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Row Level Security (RLS) in Supabase
- CORS configuration
- Input validation and sanitization
- Protected API endpoints

## Deployment

### Frontend (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL`

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all environment variables from `.env`

### Database

- Supabase provides hosted PostgreSQL
- No additional setup required

## Development

### Running in Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Testing

- Backend: `npm test` (when tests are added)
- Frontend: `npm run test` (when tests are added)

## Architecture

The application follows a clean architecture pattern:

- **Frontend**: React SPA with context-based state management
- **Backend**: RESTful API with Express.js
- **Database**: PostgreSQL with Supabase
- **Authentication**: JWT tokens
- **AI Integration**: OpenRouter API for multiple LLM providers

## Extensibility

The design allows for easy addition of:

- Analytics dashboard
- File upload functionality
- Multiple AI providers
- Team collaboration features
- API rate limiting
- Webhook integrations

## License

MIT
