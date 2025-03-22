# Scheduler SaaS API

Backend API for the Scheduler SaaS application, built with NestJS, TypeORM, and PostgreSQL.

## Description

This is a multi-tenant SaaS application that allows organizations to manage their scheduling needs, including:

- User and organization management
- Authentication with JWT
- Role-based access control
- Scheduling management (upcoming)
- Appointment booking (upcoming)
- Notifications (upcoming)

## Technology Stack

- **Backend**: NestJS, TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT, Passport
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for running PostgreSQL)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd scheduler/api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. Start the database (using Docker)
   ```bash
   docker-compose up -d
   ```

5. Run the application
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user and organization
- `POST /api/auth/login` - Login and get access token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens

## Project Structure

```
src/
├── auth/              # Authentication module
├── common/            # Shared code (guards, decorators, etc.)
├── config/            # Application configuration
├── organizations/     # Organizations module
├── users/             # Users module
└── app.module.ts      # Main application module
```

## Future Enhancements

- Calendar management
- Appointment scheduling
- Customer management
- Notification system (email/SMS)
- Payment integrations
- Analytics and reporting

## License

[MIT](LICENSE)
