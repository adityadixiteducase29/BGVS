# Node.js + MySQL + Express Backend Template

A production-ready, scalable backend template built with Node.js, Express, and MySQL.

## 🚀 Features

- **Modern Architecture**: Clean, scalable folder structure
- **Security**: JWT authentication, password hashing, input validation
- **Database**: MySQL with connection pooling and proper error handling
- **Validation**: Request validation using express-validator
- **Error Handling**: Global error handling and logging
- **Environment Configuration**: Flexible configuration management
- **Multi-Cloud Storage**: Switch between AWS S3 and DigitalOcean Spaces with a single environment variable
- **API Documentation**: Well-structured REST API endpoints
- **Production Ready**: Security headers, CORS, graceful shutdown

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # Database configuration
│   └── environment.js # Environment variables
├── controllers/      # Business logic controllers
│   └── userController.js
├── middleware/       # Custom middleware
│   └── authenticate.js
├── models/          # Data models
│   └── User.js
├── routes/          # API route definitions
│   └── userRoutes.js
├── validation/      # Input validation schemas
│   └── userValidation.js
├── app.js          # Main application setup
└── server.js       # Server entry point
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd node-mysql-express-template-v1-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp src/config/env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MySQL database**
   ```bash
   mysql -u root -p < database_create.sql
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=demo
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Security Configuration
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=*

# Storage Configuration (AWS S3 or DigitalOcean Spaces)
# Set STORAGE_PROVIDER to 'aws' or 'digitalocean'
STORAGE_PROVIDER=aws

# AWS S3 Configuration (when STORAGE_PROVIDER=aws)
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# DigitalOcean Spaces Configuration (when STORAGE_PROVIDER=digitalocean)
# DO_SPACES_BUCKET_NAME=your-spaces-bucket-name
# DO_SPACES_REGION=nyc3
# DO_SPACES_ACCESS_KEY=your-spaces-access-key
# DO_SPACES_SECRET_KEY=your-spaces-secret-key
```

**Note:** For detailed storage configuration, see [STORAGE_CONFIGURATION.md](./STORAGE_CONFIGURATION.md)

## 🗄️ Database Schema

The application expects a `user` table with the following structure:

```sql
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register new user | No |
| POST | `/api/users/login` | User login | No |
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |
| GET | `/api/users/all` | Get all users | Yes |

### Request Examples

#### Register User
```bash
POST /api/users/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
}
```

#### Login User
```bash
POST /api/users/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "SecurePass123"
}
```

#### Get Profile (Authenticated)
```bash
GET /api/users/profile
Authorization: Bearer <your-jwt-token>
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with configurable rounds
- **Input Validation**: Request validation using express-validator
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable CORS settings
- **SQL Injection Protection**: Parameterized queries with mysql2

## 🚀 Production Deployment

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   ```

2. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "backend"
   ```

3. **Set up reverse proxy (Nginx)**
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Development

```bash
# Development mode with auto-reload
npm run dev

# Check for linting errors
npm run lint

# Format code
npm run format
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔄 Changelog

### v2.0.0
- Complete restructure with modern architecture
- Added input validation
- Improved error handling
- Enhanced security features
- Better database connection management

### v1.0.0
- Initial release with basic functionality
