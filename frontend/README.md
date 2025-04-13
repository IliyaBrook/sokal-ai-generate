# Sokal AI Generate - Content Generation Platform

## Architecture Overview

Sokal AI Generate is a full-stack application designed for AI-powered content generation, utilizing a modern microservices architecture within a monorepo structure. The system consists of:

- **Frontend**: Next.js 15.2.4 application with Tailwind CSS for styling, implemented using the App Router pattern
- **Backend**: NestJS application with modular structure and MongoDB database
- **Shared Components**: Shared types and configurations used across services

The architecture follows a clean separation of concerns with distinct modules:

- Authentication and user management
- AI-powered content generation via OpenAI API
- Post storage and management
- Real-time collaborative editing
- Short link generation for content sharing

### System Structure Details

The project utilizes a monorepo architecture managed with Yarn Workspaces, containing four primary modules:

1. **Backend (NestJS)**
   - Modular structure with controllers, services, DTOs and schemas
   - MongoDB integration via Mongoose
   - JWT authentication with access/refresh token mechanism
   - REST API endpoints for user management, content generation and sharing
   - WebSocket implementation for real-time collaboration

2. **Frontend (Next.js)**
   - App Router architecture for improved routing and performance
   - Server and client components separation
   - Tailwind CSS for styling
   - Context providers for state management
   - Custom hooks for authentication and API interaction

3. **Shared Types**
   - Common TypeScript interfaces and types
   - Shared between frontend and backend
   - Ensures type consistency across the application

4. **Configs**
   - Shared configuration for linting, formatting and TypeScript
   - Ensures consistent code quality across all modules

## API Reference

### Authentication

#### Register User

```txt
POST /auth/signup
```

**Request Body:**

```typescript
{
  email: string;      // Valid email address
  password: string;   // Minimum 6 characters
  firstname: string;  // Minimum 1 character
  lastname: string;   // Minimum 1 character
}
```

**Response (200 OK):**

```typescript
{
  user: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  },
  tokens: {
    accessToken: string;
    refreshToken: string;
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid input data or email already exists
- `500 Internal Server Error`: Server error

#### Login User
```
POST /auth/login
```

**Request Body:**
```typescript
{
  email: string;  
  password: string;  // User's password
}
```

**Response (200 OK):**
```typescript
{
  user: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  },
  tokens: {
    accessToken: string;
    refreshToken: string;
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

#### Refresh Token
```
POST /auth/refresh
```

**Request Body:**
```typescript
{
  refreshToken: string;  // Refresh token previously issued
}
```

**Response (200 OK):**
```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token
- `500 Internal Server Error`: Server error

### Content Generation

#### Generate Post
```
POST /generate
```

**Headers:**
- `Authorization: Bearer {accessToken}`

**Request Body:**
```typescript
{
  topic: string;  // The topic for the post
  style: string;  // Style or tone for the post
}
```

**Response (200 OK):**
```typescript
{
  title: string;    // Generated title
  content: string;  // Generated content
  topic: string;    // Original topic
  style: string;    // Original style
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error or API failure

### Posts Management

#### Save Post
```
POST /posts/save
```

**Headers:**
- `Authorization: Bearer {accessToken}`

**Request Body:**
```typescript
{
  title: string;                    // Post title
  content: string;                  // Post content
  topic: string;                    // Post topic
  style: string;                    // Post style
  isPublished?: boolean;            // Publication status (default: false)
  scheduledPublishDate?: string;    // ISO date string for scheduled publication
}
```

**Response (201 Created):**
```typescript
{
  id: string;
  title: string;
  content: string;
  topic: string;
  style: string;
  authorId: string;
  isPublished: boolean;
  scheduledPublishDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

#### Get User Posts
```
GET /posts/user
```

**Headers:**
- `Authorization: Bearer {accessToken}`

**Response (200 OK):**
```typescript
[
  {
    id: string;
    title: string;
    content: string;
    topic: string;
    style: string;
    authorId: string;
    isPublished: boolean;
    scheduledPublishDate?: string;
    createdAt: string;
    updatedAt: string;
  },
  // More posts...
]
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

#### Get Post by ID
```
GET /posts/:id
```

**URL Parameters:**
- `id`: Post ID

**Response (200 OK):**
```typescript
{
  id: string;
  title: string;
  content: string;
  topic: string;
  style: string;
  authorId: string;
  isPublished: boolean;
  scheduledPublishDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**
- `404 Not Found`: Post not found
- `500 Internal Server Error`: Server error

#### Update Post
```
PUT /posts/:id
```

**Headers:**
- `Authorization: Bearer {accessToken}`

**URL Parameters:**
- `id`: Post ID

**Request Body:**
```typescript
{
  title?: string;
  content?: string;
  topic?: string;
  style?: string;
  isPublished?: boolean;
  scheduledPublishDate?: string | null;
}
```

**Response (200 OK):**
```typescript
{
  id: string;
  title: string;
  content: string;
  topic: string;
  style: string;
  authorId: string;
  isPublished: boolean;
  scheduledPublishDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User not authorized to update this post
- `404 Not Found`: Post not found
- `500 Internal Server Error`: Server error

#### Delete Post
```
DELETE /posts/:id
```

**Headers:**
- `Authorization: Bearer {accessToken}`

**URL Parameters:**
- `id`: Post ID

**Response (200 OK):**
```typescript
{
  message: "Post deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User not authorized to delete this post
- `404 Not Found`: Post not found
- `500 Internal Server Error`: Server error

### Sharing

#### Create Short Link
```
POST /short
```

**Headers:**
- `Authorization: Bearer {accessToken}`

**Request Body:**
```typescript
{
  targetType: "post" | "other";  // Type of content being shared
  targetId: string;              // ID of the content (post ID)
}
```

**Response (201 Created):**
```typescript
{
  id: string;
  code: string;      // Short code
  targetType: string;
  targetId: string;
  createdAt: string;
  expiresAt?: string;
  url: string;       // Full URL to access the shared content
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

#### Get Content by Short Code
```
GET /short/:code
```

**URL Parameters:**
- `code`: Short link code

**Response (200 OK):**
```typescript
{
  id: string;
  code: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  expiresAt?: string;
  url: string;
}
```

**Error Responses:**
- `404 Not Found`: Short link not found or expired
- `500 Internal Server Error`: Server error

#### Get Shared Content
```
GET /shared/:code
```

**URL Parameters:**
- `code`: Short link code

**Response (200 OK):**
```typescript
{
  post: {
    id: string;
    title: string;
    content: string;
    topic: string;
    style: string;
    authorId: string;
    isPublished: boolean;
    scheduledPublishDate?: string;
    createdAt: string;
    updatedAt: string;
  },
  creator: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  }
}
```

**Error Responses:**
- `404 Not Found`: Content not found, short link not found or expired
- `500 Internal Server Error`: Server error

### Users

#### Get All Users
```
GET /users
```

**Headers:**
- `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `page`: Page number (optional, default: 1)
- `limit`: Number of results per page (optional, default: 10)

**Response (200 OK):**
```typescript
[
  {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  },
  // More users...
]
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

#### Get User by ID
```
GET /users/:id
```

**Headers:**
- `Authorization: Bearer {accessToken}`

**URL Parameters:**
- `id`: User ID

**Response (200 OK):**
```typescript
{
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

## Tech Stack & Tools

### Backend

- **NestJS Framework**: Chosen for its modular architecture, TypeScript support, and enterprise-ready features
- **MongoDB**: NoSQL database providing flexibility for content storage and high performance
- **JWT Authentication**: Secure authentication with access/refresh token strategy
- **OpenAI Integration**: API interface for AI-powered content generation
- **WebSockets**: Real-time collaborative editing capabilities

### Frontend

- **Next.js 15.2.4**: React framework with server-side rendering and App Router
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **TypeScript**: Static typing for improved code quality and developer experience

### Infrastructure

- **Docker & Docker Compose**: Containerization for consistent development and deployment
- **Yarn Workspaces**: Monorepo management for shared code and dependencies
- **Node.js**: Server runtime (v22+)

## Deployment Strategy

The application is containerized using Docker for consistent deployment across environments:

- **Microservices Architecture**: Each component (frontend, backend, database) runs in its own container
- **Docker Compose**: Orchestrates the multi-container application
- **Environment Configuration**: Environment variables for sensitive configuration
- **Database Persistence**: Volume mapping for MongoDB data persistence
- **Network Isolation**: Custom Docker network for secure service communication

## Features

- **Authentication System**: Secure signup/login with JWT tokens and automatic refresh mechanism
- **AI Content Generation**: Integration with OpenAI API for generating blog posts based on topic and style
- **Content Management**: Save, edit, and publish generated content
- **Collaborative Editing**: Real-time multi-user editing through shared links
- **Public/Private Content**: Control over content visibility and sharing
- **Rich Text Editor**: Support for various formatting options and code syntax highlighting

## Getting Started

### Prerequisites

- Node.js (v22.0.0 or later)
- Docker and Docker Compose
- OpenAI API key

### Environment Setup

1. Create `.env` file in the root directory with:

```txt
SERVER_PORT=4000
MONGO_USERNAME=your_mongo_username
MONGO_PASSWORD=your_mongo_password
JWT_SECRET=your_jwt_secret
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
OPENAI_API_KEY=your_openai_api_key
```

2. For development, create `backend/.env.development` with similar variables.

### Running with Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# The application will be available at:
# - Frontend: http://localhost:80
# - Backend API: http://localhost:4001
```

### Development Mode

```bash
# Install dependencies
yarn install

# Start all services in development mode (frontend, backend, and shared-types watcher)
yarn dev

# Start only backend
yarn dev:server

# Start only frontend
yarn dev:client

# Build for production
yarn build

# Start in production mode
yarn start:production

# Linting and formatting
yarn lint     # Run linting on both server and client
yarn format   # Format code in both server and client
```

## Challenges & Solutions

1. **JWT Authentication Expiry**:
   - Challenge: Managing token expiration and user sessions
   - Solution: Implemented refresh token strategy with 30-day persistence and secure storage

2. **Real-time Collaboration**:
   - Challenge: Enabling multiple users to edit content simultaneously
   - Solution: WebSocket integration for real-time updates and conflict resolution

3. **Content Security**:
   - Challenge: Managing content visibility and access control
   - Solution: Multi-level permission system with public/private content flags

4. **API Rate Limiting**:
   - Challenge: Protecting the OpenAI API from excessive use
   - Solution: Implemented request throttling with NestJS ThrottlerGuard

## Improvements & Next Steps

If I had more time to improve this project, I would implement:

1. **CMS Integration**: Integrate Strapi headless CMS for more robust content management capabilities
2. **Social Authentication**: Add Gmail-based authorization for simplified user onboarding
3. **Enhanced Editing Options**: Expand post editing features with additional formatting options and templates
4. **Multiple AI Models**: Support for various AI models beyond OpenAI, including Gemini, Claude Sonnet, and others
5. **Real-time Collaboration Enhancements**: More sophisticated conflict resolution and presence indicators

## License

MIT