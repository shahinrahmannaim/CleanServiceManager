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
- **✅ Hero section styling**: Applied tomato to navy blue gradient background to top contact bar (red-500 to blue-900)
- **✅ Full category linking**: All category badges now properly link to filtered services pages with working category filtering
- **✅ Complete admin panel CRUD**: Categories and Services management with full create, read, update, delete functionality
- **✅ Services page hero background**: Added professional gradient background with "Cleaning Services in Qatar" text
- **✅ Category selection in service creation**: Admin can now select categories when creating services
- **✅ Logo integration confirmed**: Brand logo already properly integrated on login and register pages
- **✅ AuthModal logo integration**: Added Panaroma logo to top of authentication modal with professional styling
- **✅ Enhanced authentication flow**: Fixed booking system to show login modal instead of errors for unauthenticated users
- **✅ Complete authentication forms**: Added Remember Me checkbox and Google/Facebook social login options to both login and register forms
- **✅ Enhanced logo visibility**: Increased logo size from 14x14 to 20x20 pixels and improved category navigation icons for better brand recognition
- **✅ Comprehensive input validation**: Implemented regex validation for email and password fields with security measures against SQL injection and script injection
- **✅ Fixed category filtering functionality**: Resolved URL parameter parsing issue that prevented category filtering from working when clicking navbar categories
- **✅ Fully dynamic category management system**: Confirmed zero hardcoded categories - all data comes from admin panel with complete CRUD operations
- **✅ SEO-friendly category URLs**: Implemented `/services/house-cleaning` format instead of query parameters with active category highlighting
- **✅ Logo and navbar optimization**: Enhanced SVG logo with cleaning brush design, gradient colors, and shadow effects; updated navbar background to blue gradient matching logo theme
- **✅ Consistent branding**: Unified color scheme throughout navigation with white text on blue background, improved hover states and transitions
- **✅ Professional brand logo integration**: Replaced custom SVG with official Panaroma logo featuring blue building design and red company name
- **✅ Facilities management rebrand**: Updated all text from "cleaning services" to "facilities management" throughout navbar, footer, hero, and authentication modal
- **✅ Enhanced brand consistency**: Applied professional logo across navbar, authentication modal, and footer with proper sizing and positioning

### July 14, 2025
- **✅ Restructured registration flow**: Simplified registration process by removing provider option from main registration form
- **✅ Implemented "Become a Seller" feature**: Added seller upgrade option in user profile with complete application form
- **✅ Enhanced mobile responsiveness**: Fixed authentication modal scrolling and sizing issues on mobile devices
- **✅ Added seller application backend**: Created `/api/auth/become-seller` endpoint for user role upgrades
- **✅ Improved user experience**: Clean separation between customer registration and seller application processes
- **✅ Updated role system**: Changed from provider to seller role (superadmin, admin, seller, user) throughout database and codebase
- **✅ Database schema updates**: Renamed provider_id to seller_id, is_verified_provider to is_verified_seller, updated role enum
- **✅ Removed account type selection**: Eliminated account type input field from registration forms - all users register as "user" by default
- **✅ Simplified registration process**: Users can only register as regular users, role changes handled by admins through user management

### July 19, 2025
- **✅ Enhanced booking management system**: Built comprehensive booking schedule dashboard with smart auto-assignment algorithm that balances employee workloads
- **✅ Advanced booking features**: Added PDF export for scheduling reports, detailed booking statistics, and real-time status updates
- **✅ Smart employee assignment**: Implemented algorithm that analyzes current workloads and distributes bookings evenly among available employees
- **✅ Comprehensive seller management**: Built seller administration dashboard with approval workflow, statistics, and filtering capabilities
- **✅ Logo and navbar optimization**: Enhanced SVG logo with professional cleaning brush design and unified blue gradient theme throughout navigation
- **✅ Improved visual consistency**: Matched navbar background colors to logo theme, enhanced mobile menu styling, and improved branding consistency

### Current Status
- **Core Platform**: Fully functional with JWT authentication, role-based access, and database-driven content
- **Booking System**: Complete booking flow with automatic employee assignment via WebSocket chatbot
- **API Coverage**: All CRUD operations implemented and tested for services, categories, bookings, favorites, cart, addresses
- **Frontend**: Dynamic data loading from APIs, no hardcoded content, responsive design with professional navbar
- **User Management**: Complete profile system with address management, secure validation, and professional UI
- **Admin Panel**: Complete CRUD operations for categories and services with professional UI, validation, and error handling - fully dynamic with zero hardcoded data
- **Category System**: Complete category navigation with dummy data for all service types, proper filtering and linking
- **UI/UX**: Professional navy blue and tomato red color scheme applied consistently throughout the platform
- **Service Management**: Full service creation with category selection, category-based filtering, and comprehensive admin interface
- **Remaining**: Email service needs SMTP configuration, time logs/invoices schema fixes, ElasticSearch implementation
- **Achievement**: Zero hardcoded data - all categories, services, and content are database-driven through admin panel management

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