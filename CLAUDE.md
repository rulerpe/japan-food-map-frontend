# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japan Food Map application built with Next.js 14 that displays restaurants on an interactive Mapbox map. Users can click on restaurant markers to view associated YouTube videos about the restaurants. The application integrates with Supabase for restaurant data and supports custom location markers.

## Development Commands

- **Development server**: `npm run dev` (runs with Turbo for faster builds)
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Lint**: `npm run lint` (ESLint with auto-fix enabled)

## Architecture & Key Technologies

### Frontend Stack
- **Next.js 14** with App Router (`app/` directory structure)
- **NextUI v2** for UI components (modals, buttons, inputs, etc.)
- **Tailwind CSS** for styling with Tailwind Variants
- **TypeScript** with strict mode enabled
- **Framer Motion** for animations
- **Mapbox GL JS** for interactive maps

### Backend Integration
- **Supabase** for restaurant data storage with PostgreSQL database
- **YouTube embedded videos** for restaurant content

### Project Structure
```
app/
├── layout.tsx          # Root layout with providers and theming
├── page.tsx            # Main map component with Supabase integration
├── providers.tsx       # Theme and UI providers
└── error.tsx           # Error boundary

components/
├── video-panel.tsx     # Modal component for YouTube videos
├── navbar.tsx          # Navigation component
├── theme-switch.tsx    # Dark/light theme toggle
└── primitives.ts       # Shared UI primitives

config/
├── site.ts             # Site configuration and navigation
├── fonts.ts            # Font configuration
└── mocks.ts            # Mock data for custom locations
```

## Key Data Models

### Restaurant Interface (Supabase Schema)
```typescript
interface Restaurant {
  id: number;
  created_at: string;
  business_name?: string;
  channel_id?: string;
  description?: string;
  duration?: string;
  food_type?: string;
  formatted_address?: string;
  latitude: number;
  like_count?: number;
  longitude: number;
  num_reviews?: number;
  place_id?: string;
  published_date?: string;
  rating?: number;
  restaurant_name?: string;
  title?: string;
  video_id?: string;
  view_count?: number;
}
```

### CustomLocation Interface
```typescript
interface CustomLocation {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  name?: string;
}
```

## Environment Configuration

Required environment variables:
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox API token
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous API key

## Supabase Integration

- **Database**: PostgreSQL with geographic queries using latitude/longitude bounds
- **Queries**: Optimized for geographic bounds with rating-based ordering and 30-record limit
- **Client**: Uses Supabase JavaScript client for real-time data access

## Map Features

- **Restaurant markers**: Red markers from Supabase data
- **Custom location markers**: Blue markers from mock data
- **Dynamic loading**: Markers update based on map viewport
- **Click interactions**: Opens video panel modal on marker click

## Styling Patterns

- Uses NextUI's built-in theming system
- Dark mode support via `next-themes`
- Responsive design with Tailwind CSS
- Component-level styling with `tailwind-variants`

## Code Quality & Linting

ESLint configuration enforces:
- React best practices and hooks rules
- Import ordering and unused import removal
- TypeScript unused variable warnings
- JSX accessibility (a11y) guidelines
- Prettier code formatting
- Consistent padding between statements