# User Service Backend

A Node.js Express service for user management, authentication, and profile handling with PostgreSQL database via Prisma ORM.

## Prerequisites

- Node.js (v22.13.1 or higher)
- PostgreSQL (running locally or in Docker)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Environment Setup

Ensure `.env` file is configured with:
```
PORT=3001
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/user_service_db"
JWT_SECRET=your_super_secret_keys
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Sync database schema
npx prisma db push

# (Optional) View database with Prisma
npx prisma studio --url "postgresql://postgres:postgres123@localhost:5432/user_service_db"
```

## Running the Backend

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Test Script
```bash
node src/test.js
```

The service will be available at `http://localhost:3002`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user //done
- `POST /api/auth/login` - User login //done
- `POST /api/auth/logout` - User logout //done
- `POST /api/auth/refresh-token` - Refresh access token //done

### User Management
- `GET /api/users/me` - Get current user profile //done
- `PUT /api/users/me` - Update user info //done  t9dry tbdli ghur first w last name
- `DELETE /api/users/me` - Deactivate account // done

### Role & Permission Management
- `GET /api/roles` - Get all available roles //done
- `GET /api/roles/me` - Get current user's  role //done
- `GET /api/roles/user/:userId` - Get specific user's roles (admin only)//dooooen


### Profile Management
- `GET /api/profile` - Get user profile // deffrent binha w bin get user howa role ctt // donnnnne
- `PUT /api/profile` - Update user profile t9dry tbdly ga3 hdo ['age', 'gender', 'dateOfBirth', 'education', 'profession', 'country', 'city', 'deviceType', 'bio'] //done
- `GET /api/profile/interests` - Get user interests //done
- `POST /api/profile/interests` - Add user interest  //donne

### Notification Management
- `POST /api/notifications` - Create notification (admin/system only)//done
- `GET /api/notifications` - Get current user's notifications//done
- `PUT /api/notifications/:id` - Mark notification as read//done

### Health Check
- `GET /health` - Service health status

## Role-Based Access Control (RBAC)

The system implements multi-role support with the following roles:

- **ADMIN**: Full system access, can manage users and roles
- **CREATOR**: Can create and manage content
- **PARTICIPANT**: Basic user access for participation

### Permission Examples

```javascript
// Require admin role
const { requireAdmin } = require('./middleware/rbac.middleware');
router.post('/admin-only', auth, requireAdmin, handler);

// Require specific role
const { requireRole } = require('./middleware/rbac.middleware');
router.get('/creator-content', auth, requireRole('CREATOR'), handler);

// Require any of multiple roles
router.get('/mixed-access', auth, requireRole(['CREATOR', 'ADMIN']), handler);
```

## Testing

### Create Test Users
```bash
# Create test users with roles
node src/test-roles.js
```

### Test Authentication
```bash
# Create test user for login
node src/test.js
```

## Project Structure

```
src/
├── app.js              # Express app setup
├── config/
│   ├── db.js          # Database configuration
│   └── prisma.js      # Prisma client instance
├── controllers/       # Business logic handlers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── role.controller.js    # NEW: Role management
│   └── ...
├── middleware/        # Express middleware
│   ├── auth.middleware.js    # JWT authentication
│   ├── rbac.middleware.js    # NEW: Role-based access control
│   └── validate.middleware.js
├── routes/           # API route definitions
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── role.routes.js        # NEW: Role management routes
│   └── ...
└── test.js           # Test scripts
```

## Docker

To run with Docker Compose:
```bash
docker-compose up
```
