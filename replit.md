# 교육과정 빈칸 인출 (Curriculum Blank Extraction)

## Overview

This is a full-stack web application designed to help students practice with Korean educational curriculum content through interactive fill-in-the-blank exercises. The application automatically analyzes Korean educational text and creates blanks based on morphological patterns and difficulty levels, providing instant feedback and detailed scoring to enhance the learning experience with curriculum-based content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern component-based UI with type safety
- **Vite**: Fast development server and build tool optimized for modern web development
- **TailwindCSS + shadcn/ui**: Utility-first styling with pre-built accessible components
- **TanStack Query**: Server state management for API calls and caching
- **Wouter**: Lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Express.js**: RESTful API server with middleware for logging and error handling
- **TypeScript**: Full type safety across the entire backend
- **In-Memory Storage**: Simple storage implementation using Maps for development (production-ready for database migration)
- **Korean Text Analysis**: Custom morphological analyzer that identifies particles, functional words, and content words
- **Difficulty-based Blank Generation**: Algorithm that creates blanks based on beginner (20%), intermediate (50%), and advanced (95%) difficulty levels

### Data Storage Solutions
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database for production
- **Schema Design**: Exercises table with JSON fields for blanks, answers, and results to handle complex nested data
- **Migration Support**: Drizzle Kit for database schema management and migrations

### Authentication and Authorization
- **Session-based**: Express sessions with PostgreSQL store using connect-pg-simple
- **No current auth implementation**: Ready for authentication system integration

### Korean Language Processing
- **Morphological Analysis**: Custom analyzer that identifies Korean particles (조사) and functional words
- **Smart Blank Creation**: Avoids creating blanks for grammatical particles while targeting content words
- **Difficulty Scaling**: Three-tier difficulty system (초급 20%, 중급 50%, 고급 95%) for adaptive blank generation
- **User-selectable Difficulty**: Frontend interface allows users to choose difficulty level before exercise creation
- **Real-time Feedback**: Instant grading with detailed feedback for incorrect answers

### External Dependencies
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide Icons**: Consistent icon system throughout the application
- **Date-fns**: Date manipulation and formatting utilities
- **Nanoid**: Unique ID generation for client-side operations
- **Embla Carousel**: Touch-friendly carousel components
- **Replit Integration**: Development environment optimization with cartographer and runtime error overlay