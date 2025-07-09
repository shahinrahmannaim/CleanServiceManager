# Panaroma Cleaning Services Platform

## Overview

Panaroma is a full-stack cleaning services platform that connects customers with professional cleaning providers across Qatar. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data storage and real-time communication through WebSockets.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 9, 2025
- **✅ Eliminated all static/dummy frontend data**: All categories, services, cities, testimonials, and stats now come from database APIs
- **✅ Fixed booking creation system**: Auto-calculates total amount from service price, handles database constraints correctly
- **✅ Implemented search functionality**: Database-based service search with category and location filters
- **✅ Added new API endpoints**: `/api/cities`, `/api/testimonials`, `/api/stats` for dynamic data
- **✅ WebSocket chatbot assignment**: Bookings automatically assigned to employees with real-time status updates
- **✅ Comprehensive testing completed**: All authentication, CRUD operations, booking flow, and role-based access verified working
- **✅ Database fully populated**: Users with different roles, services, categories, and test bookings in place
- **✅ Complete address management system**: Full CRUD operations for user addresses with secure validation
- **✅ Professional navbar redesign**: Top contact bar with Qatar phone/email, social media icons, enhanced navigation
- **✅ Logo integration**: Custom logo properly integrated in navbar with professional branding
- **✅ Enhanced user management system**: Fixed admin panel with proper validation, error handling, and professional UI
- **✅ Comprehensive dummy data**: Added complete service data for all categories (Car Cleaning, Carpet Cleaning, Laundry, Window Cleaning, etc.)
- **✅ Category navigation improvements**: Enhanced with larger icons, better alignment, professional styling, and improved spacing
- **✅ Hero section styling**: Applied professional gradient background to top contact bar matching hero section (blue-900 to blue-700)
- **✅ Full category linking**: All category badges now properly link to filtered services pages with working category filtering
- **✅ Complete admin panel CRUD**: Categories and Services management with full create, read, update, delete functionality
- **✅ Services page hero background**: Added professional gradient background with "Cleaning Services in Qatar" text
- **✅ Category selection in service creation**: Admin can now select categories when creating services
- **✅ Logo integration confirmed**: Brand logo already properly integrated on login and register pages

### Current Status
- **Core Platform**: Fully functional with JWT authentication, role-based access, and database-driven content
- **Booking System**: Complete booking flow with automatic employee assignment via WebSocket chatbot
- **API Coverage**: All CRUD operations implemented and tested for services, categories, bookings, favorites, cart, addresses
- **Frontend**: Dynamic data loading from APIs, no hardcoded content, responsive design with professional navbar
- **User Management**: Complete profile system with address management, secure validation, and professional UI
- **Admin Panel**: Complete CRUD operations for categories and services with professional UI, validation, and error handling
- **Category System**: Complete category navigation with dummy data for all service types, proper filtering and linking
- **UI/UX**: Professional navy blue and tomato red color scheme applied consistently throughout the platform
- **Service Management**: Full service creation with category selection, category-based filtering, and comprehensive admin interface
- **Remaining**: Email service needs SMTP configuration, time logs/invoices schema fixes, ElasticSearch implementation

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

### UI Component System
- **Design System**: shadcn/ui components built on Radix UI primitives
- **Theme**: New York style with neutral base colors
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Icons**: Lucide React icons throughout the application

## Key Components

### Authentication System
- **Registration/Login**: Modal-based authentication with email/mobile options
- **OTP Verification**: Email and SMS OTP support for account verification
- **Role-based Access**: User, Employee, Admin, and Superadmin roles
- **Protected Routes**: Component-based route protection with role validation

### Service Management
- **Service Catalog**: Categorized cleaning services with pricing
- **Booking System**: Date/time scheduling with address collection
- **Favorites & Cart**: User can save services and manage cart items
- **Search & Filter**: Location and category-based service discovery

### User Management
- **Profile Management**: User account settings and preferences
- **Booking History**: Track past and current service bookings
- **Role Management**: Admin panel for user role assignments

### Real-time Features
- **ChatBot**: WebSocket-based customer support chat
- **Notifications**: Real-time booking updates and status changes
- **Employee Assignment**: Automatic booking assignment to available employees

## Data Flow

### Database Schema
The application uses PostgreSQL with Drizzle ORM, featuring:
- **Users**: Authentication and profile information with role-based access
- **Categories**: Service categorization system
- **Services**: Detailed service listings with pricing and descriptions
- **Bookings**: Customer service requests with scheduling
- **Payments**: Transaction tracking and payment methods
- **Cart/Favorites**: User preference management
- **OTP Codes**: Verification system for email/mobile

### API Structure
- **REST API**: Express routes for CRUD operations
- **WebSocket**: Real-time communication for chat and notifications
- **File Upload**: Support for service images and user avatars
- **Error Handling**: Centralized error management with proper HTTP status codes

### State Management
- **Server State**: TanStack Query for API data caching and synchronization
- **Client State**: React hooks for local component state
- **Form State**: React Hook Form for form management and validation
- **Auth State**: Context-based authentication state management

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type checking and validation
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Date Handling**: date-fns for date manipulation
- **HTTP Client**: Fetch API with custom wrapper for API requests

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESLint/Prettier**: Code formatting and linting
- **Vite**: Fast development server and build tool
- **PostCSS**: CSS processing with Tailwind CSS

### Authentication Services
- **JWT**: JSON Web Token for stateless authentication
- **bcrypt**: Password hashing and verification
- **Cookie Parser**: HTTP-only cookie management
- **OTP Service**: Email and SMS verification system

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL, JWT_SECRET, SMTP configuration

### Production Build
- **Frontend**: Vite build output to dist/public
- **Backend**: esbuild compilation to dist/index.js
- **Static Assets**: Served through Express static middleware
- **Database Migrations**: Drizzle migrations in /migrations directory

### Configuration
- **Build Scripts**: Separate dev, build, and start commands
- **Type Checking**: TypeScript compilation verification
- **Database Schema**: Push schema changes with drizzle-kit

The application is designed for scalability with a clear separation of concerns, type safety throughout, and modern development practices. The modular architecture allows for easy feature additions and maintenance.