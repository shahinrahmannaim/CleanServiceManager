# Panaroma Cleaning Services Platform

## Overview
Panaroma is a full-stack cleaning services platform connecting customers with professional cleaning providers across Qatar. Its core purpose is to streamline booking, management, and delivery of cleaning services, featuring dynamic content, real-time communication, and comprehensive administrative tools. The platform aims to be the leading solution for facilities management in the region.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: JWT tokens stored in HTTP-only cookies

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with bcrypt for password hashing
- **Real-time Communication**: WebSocket support for chatbot and notifications
- **Session Management**: Cookie-based authentication

### UI/UX Decisions
- **Design System**: shadcn/ui components built on Radix UI primitives, New York style.
- **Theme**: Consistent professional navy blue and tomato red color scheme.
- **Branding**: Official Panaroma logo (blue building design with red company name) integrated across all touchpoints.
- **Responsiveness**: Mobile-first approach with Tailwind CSS for optimized viewing across devices.
- **User Experience**: Simplified registration flow, clear separation of customer and seller functionalities, dynamic content loading, and professional landing page design.
- **Visuals**: Gradient backgrounds, clear imagery, and consistent typography.

### Key Features and Specifications
- **Authentication System**: Modal-based registration/login, OTP verification, JWT, and role-based access (User, Seller, Admin, Superadmin).
- **Service Management**: Categorized service catalog, dynamic pricing, advanced search with filters, and a comprehensive booking system with real-time updates and smart employee assignment.
- **User Management**: Profile management, address management, booking history, and admin panel for user role assignments.
- **Real-time Features**: WebSocket-based chatbot, real-time booking updates and notifications.
- **Admin Panel**: Full CRUD operations for categories, services, promotions, and seller management with an approval workflow, all database-driven with zero hardcoded data.
- **Promotions System**: Full CRUD functionality for promotional offers, automatic application of best promotions to bookings, and scheduled cleanup of expired promotions.
- **Data Flow**: REST API for CRUD, WebSocket for real-time, Drizzle ORM for PostgreSQL schema (Users, Categories, Services, Bookings, Payments, Cart/Favorites, OTP Codes).

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **UI Components**: Radix UI primitives (with shadcn/ui)
- **Date Handling**: date-fns
- **HTTP Client**: Fetch API (with custom wrapper)

### Authentication Services
- **JWT**: JSON Web Token
- **bcrypt**: Password hashing
- **Cookie Parser**: HTTP-only cookie management
- **OTP Service**: For email and SMS verification

### Development Tools
- **TypeScript**: For full type safety
- **ESLint/Prettier**: For code quality
- **Vite**: For fast development and builds
- **PostCSS**: For CSS processing (with Tailwind CSS)

### Deployment Infrastructure
- **DigitalOcean**: Primary cloud hosting platform
- **Docker**: Containerization for consistent deployments
- **App Platform**: Managed hosting with auto-scaling
- **Managed PostgreSQL**: Production database solution