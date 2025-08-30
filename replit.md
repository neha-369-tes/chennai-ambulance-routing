# Chennai Emergency Ambulance Routing System

## Overview

This is a production-ready emergency ambulance routing system specifically designed for Chennai, India. The application helps emergency dispatchers find the fastest route to the nearest hospital based on real hospital locations, traffic patterns, and emergency types. It provides real-time ambulance tracking, intelligent routing algorithms, and a responsive dashboard interface for emergency operations.

The system integrates actual Chennai hospital data with traffic-aware routing to optimize emergency response times. It features a modern React frontend with an Express.js backend, utilizing PostgreSQL for data persistence and WebSocket connections for real-time updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens and dark theme
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Maps**: Leaflet.js for interactive map visualization with real-time tracking
- **Real-time**: WebSocket integration for live ambulance location updates

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket for real-time features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: PostgreSQL session store for persistence
- **Development**: Vite for fast development with HMR support

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Data Models**: 
  - Hospitals with geolocation, specialties, and availability status
  - Emergency calls with location, priority, and routing information
  - Ambulances with real-time location tracking
- **File Storage**: JSON data files for Chennai hospital information

### Authentication and Authorization
- Session-based authentication using connect-pg-simple
- PostgreSQL session storage for scalability
- Role-based access control for dispatcher operations

### Routing and Traffic Intelligence
- **Geospatial Calculations**: Haversine formula for distance calculations
- **Traffic Awareness**: Chennai-specific traffic zone definitions with congestion factors
- **Route Optimization**: Multi-factor algorithm considering distance, traffic, hospital capacity, and emergency type
- **Real-time Updates**: Dynamic route recalculation based on traffic conditions

### Real-time Communication
- **WebSocket Server**: Native Node.js WebSocket implementation
- **Message Types**: Ambulance location updates, emergency status changes, system notifications
- **Client Synchronization**: Automatic reconnection and state synchronization

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and query building

### Frontend Libraries
- **Radix UI**: Accessible, unstyled UI component primitives
- **Leaflet**: Open-source mapping library for interactive maps
- **TanStack Query**: Server state management with caching and synchronization
- **Tailwind CSS**: Utility-first CSS framework for styling

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Geolocation Services
- **Browser Geolocation API**: For emergency location detection
- **Chennai Hospital Database**: Curated JSON dataset with real hospital coordinates and capabilities

### Mapping and Routing
- **OpenStreetMap**: Base map tiles for Chennai area visualization
- **Custom Routing Engine**: Traffic-aware pathfinding with Chennai-specific optimizations