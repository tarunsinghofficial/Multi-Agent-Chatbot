# Chatbot Platform - Frontend

React + Vite + Tailwind CSS frontend for the Chatbot Platform.

## Features

- Modern React with Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management
- Axios for API calls
- Responsive design
- Authentication flow

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp env.example .env
```

3. Configure your `.env` file with the backend API URL

### Running the Application

Development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

The application will run on `http://localhost:5173` by default.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout component
│   └── ProtectedRoute.jsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Dashboard.jsx   # Dashboard page
│   └── Projects.jsx    # Projects page
├── services/           # API services
│   └── api.js          # API client configuration
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.jsx             # Main app component
└── main.jsx            # App entry point
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

## Features

### Authentication

- User registration and login
- JWT token management
- Protected routes
- Automatic token refresh

### Project Management

- Create, read, update, delete projects
- Project listing and details
- Model selection

### UI Components

- Responsive design
- Modern Tailwind CSS styling
- Loading states
- Error handling
- Form validation

## Development

The application uses:

- **React 18** with hooks and context
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for HTTP requests
- **Heroicons** for icons

## Building for Production

1. Update environment variables for production
2. Run `npm run build`
3. Deploy the `dist` folder to your hosting service

## Deployment

The frontend can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

Make sure to set the correct `VITE_API_URL` environment variable for your production backend.
