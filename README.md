# Rinoimob App

Vue 3 + Vite + TypeScript frontend application for the Rinoimob property management platform.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure variables
4. Start development server: `npm run dev`

## Available Scripts

- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

See `.env.example` for available configuration:
- `VITE_API_URL`: Backend API URL (default: http://localhost:8080/api)

## Project Structure

```
src/
├── components/     # Reusable Vue components
├── stores/        # Pinia state management
├── views/         # Page components
├── router/        # Vue Router configuration
├── types/         # TypeScript type definitions
├── App.vue        # Root component
├── main.ts        # Application entry point
└── index.css      # Global styles with Tailwind
```

## Technologies

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
 (Portal Interno)

Vue 3 + Vite - Internal admin dashboard for property and lead management.

## Tech Stack
- Vue 3
- TypeScript
- Vite
- TailwindCSS
- Pinia (State Management)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure
- `src/components/` - Vue components
- `src/pages/` - Page components
- `src/stores/` - Pinia stores
- `src/api/` - API client

## Features
- Property Management
- Lead Pipeline
- Admin Dashboard
- User Management

## Documentation
See [../rinoimob-docs](../rinoimob-docs) for architecture and API details.

## Issues
All development tasks are tracked in [.projects](https://github.com/revenlab/.projects/issues?q=label%3Aapp).
