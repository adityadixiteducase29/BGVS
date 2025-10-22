# 🚀 Background Verification System - API Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Role-Based Access Control](#role-based-access-control)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Development Setup](#development-setup)
8. [Testing Guide](#testing-guide)

---

## 🎯 System Overview

### **What This System Does**
The Background Verification System is a full-stack application that allows:
- **Admins** to manage companies and verifiers
- **Verifiers** to review background verification applications
- **Companies** to submit verification requests
- **Public users** to fill verification forms

### **System Architecture**
```
Frontend (React) ↔ Backend (Node.js + Express) ↔ Database (MySQL)
```

### **User Roles & Permissions**
| Role | Can Do | Cannot Do |
|------|---------|-----------|
| **Admin** | Everything | Nothing |
| **Verifier** | Review assigned applications, View assigned companies | Create companies, Manage other users |
| **Company** | View own applications, View statistics | Review applications, Manage users |

---

## 🔐 Authentication

### **JWT Token Structure**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "user_type": "admin|verifier|company",
  "full_name": "User Full Name",
  "iat": "issued_at_timestamp",
  "exp": "expiration_timestamp"
}
```

### **Token Usage**
```bash
# Include in Authorization header
Authorization: Bearer <your-jwt-token>
```

### **Token Expiration**
- **Default**: 24 hours
- **Configurable**: Via `JWT_EXPIRES_IN` environment variable

---

## 👥 User Management

### **User Types**
1. **Admin** (`user_type: "admin"`)
   - System administrators
   - Full access to all features
   - Can manage companies and verifiers

2. **Verifier** (`user_type: "verifier"`)
   - Background verification specialists
   - Assigned to specific companies
   - Can review and approve/reject applications

3. **Company** (`user_type: "company"`)
   - Companies requiring verification services
   - Can view their application status
   - Future feature

### **User Fields**
```json
{
  "id": "auto_generated",
  "email": "user@example.com",
  "password": "hashed_password",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "admin|verifier|company",
  "is_active": true,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## 🛡️ Role-Based Access Control

### **Permission System**
The system uses a **permission-based access control** system:

```javascript
// Check if user can perform specific action
user.canPerformAction('create_company')     // Returns true/false
user.canPerformAction('review_applications') // Returns true/false
```

### **Available Permissions**
| Permission | Admin | Verifier | Company |
|------------|-------|----------|---------|
| `create_company` | ✅ | ❌ | ❌ |
| `manage_verifiers` | ✅ | ❌ | ❌ |
| `view_all_applications` | ✅ | ❌ | ❌ |
| `assign_applications` | ✅ | ❌ | ❌ |
| `view_assigned_applications` | ❌ | ✅ | ❌ |
| `review_applications` | ❌ | ✅ | ❌ |
| `view_company_applications` | ❌ | ❌ | ✅ |
| `view_company_stats` | ❌ | ❌ | ✅ |

---

## 🌐 API Endpoints

### **Base URL**
```
http://localhost:3000/api
```

### **1. Authentication Endpoints**

#### **Create Admin User (Developer Only)**
```http
POST /api/users/create-admin
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Admin"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "id": 1,
    "email": "admin@company.com",
    "first_name": "John",
    "last_name": "Admin",
    "user_type": "admin",
    "full_name": "John Admin",
    "token": "jwt_token_here"
  }
}
```

#### **User Registration**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "verifier@company.com",
  "password": "SecurePass123",
  "first_name": "Jane",
  "last_name": "Verifier",
  "user_type": "verifier"
}
```

#### **User Login**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "SecurePass123"
}
```

### **2. User Profile Endpoints**

#### **Get User Profile**
```http
GET /api/users/profile
Authorization: Bearer <jwt-token>
```

#### **Update User Profile**
```http
PUT /api/users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "first_name": "Updated Name",
  "email": "newemail@company.com"
}
```

#### **Change Password**
```http
PUT /api/users/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### **3. Dashboard Endpoints**

#### **Get Role-Based Dashboard**
```http
GET /api/users/dashboard
Authorization: Bearer <jwt-token>
```

**Admin Dashboard Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "user_type": "admin", ... },
    "dashboard": {
      "userStats": [
        { "user_type": "admin", "count": 2, "active_count": "2" },
        { "user_type": "verifier", "count": 5, "active_count": "5" }
      ],
      "companyStats": { "total_companies": 10, "active_companies": 10 },
      "applicationStats": [
        { "application_status": "pending", "count": 25 },
        { "application_status": "approved", "count": 150 }
      ]
    }
  }
}
```

**Verifier Dashboard Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 3, "user_type": "verifier", ... },
    "dashboard": {
      "assignedCompanies": [
        {
          "id": 1,
          "name": "Tech Corp",
          "industry": "Technology",
          "total_applications": 15,
          "pending_applications": 5
        }
      ],
      "myApplications": {
        "total_assigned": 15,
        "pending": 5,
        "assigned": 3,
        "under_review": 2,
        "approved": 3,
        "rejected": 2
      }
    }
  }
}
```

### **4. Admin-Only Endpoints**

#### **Get All Verifiers**
```http
GET /api/users/all
Authorization: Bearer <admin-jwt-token>
```

#### **Get Verifiers with Company Assignments**
```http
GET /api/users/verifiers-with-assignments
Authorization: Bearer <admin-jwt-token>
```

#### **Get System Statistics**
```http
GET /api/users/stats
Authorization: Bearer <admin-jwt-token>
```

### **5. Verifier-Only Endpoints**

#### **Get Assigned Applications**
```http
GET /api/users/verifier/applications
Authorization: Bearer <verifier-jwt-token>
```

#### **Get Assigned Companies**
```http
GET /api/users/verifier/companies
Authorization: Bearer <verifier-jwt-token>
```

---

## 🗄️ Database Schema

### **Core Tables**

#### **1. Users Table**
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('admin', 'verifier', 'company') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

#### **2. Companies Table**
```sql
CREATE TABLE companies (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    verification_form_link VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### **3. Verifier Assignments Table**
```sql
CREATE TABLE verifier_assignments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    verifier_id BIGINT UNSIGNED NOT NULL,
    company_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id),
    FOREIGN KEY (verifier_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);
```

#### **4. Applications Table**
```sql
CREATE TABLE applications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    applicant_first_name VARCHAR(100) NOT NULL,
    applicant_last_name VARCHAR(100) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    application_status ENUM('pending', 'assigned', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
    assigned_verifier_id BIGINT UNSIGNED NULL,
    assigned_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (assigned_verifier_id) REFERENCES users(id)
);
```

---

## 🛠️ Development Setup

### **Prerequisites**
- Node.js (v16+)
- MySQL (v8.0+)
- MySQL Workbench (optional but recommended)

### **1. Clone and Install**
```bash
cd Backend
npm install
```

### **2. Database Setup**
```bash
# Open MySQL Workbench and run:
# database_create.sql
```

### **3. Environment Configuration**
Create `.env` file:
```env
NODE_ENV=development
PORT=3000
DB_HOST=127.0.0.1
DB_USER=verification_user
DB_PASSWORD=Verification@123
DB_NAME=background_verification_system
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173
```

### **4. Start Server**
```bash
npm run dev
```

---

## 🧪 Testing Guide

### **1. Test Server Health**
```bash
curl http://localhost:3000/health
```

### **2. Create Admin User**
```bash
curl -X POST http://localhost:3000/api/users/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123",
    "first_name": "Test",
    "last_name": "Admin"
  }'
```

### **3. Login as Admin**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123"
  }'
```

### **4. Test Admin Dashboard**
```bash
# Use token from login response
curl -X GET http://localhost:3000/api/users/dashboard \
  -H "Authorization: Bearer <your-jwt-token>"
```

### **5. Test Role-Based Access**
```bash
# Try to access admin endpoint with verifier token (should fail)
curl -X GET http://localhost:3000/api/users/stats \
  -H "Authorization: Bearer <verifier-jwt-token>"
```

---

## 🔄 Complete System Flow

### **1. Initial Setup**
```
Developer → Creates Admin User → System Ready
```

### **2. Company Management (Next Phase)**
```
Admin → Creates Company → Unique Form Link Generated → Company Active
```

### **3. Verifier Management (Next Phase)**
```
Admin → Creates Verifier → Assigns to Company → Verifier Can Review Applications
```

### **4. Application Processing (Future Phase)**
```
Public User → Fills Form → Application Stored → Auto-Assigned to Verifier → Review → Approval/Rejection
```

---

## 🚨 Important Notes

### **Security Features**
- ✅ **Password Hashing**: Bcrypt with 12 rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Role-Based Access**: Granular permission control
- ✅ **Input Validation**: Comprehensive request validation
- ✅ **SQL Injection Protection**: Parameterized queries

### **Development Guidelines**
- 🔒 **Never commit** `.env` files
- 🔒 **Use strong passwords** in production
- 🔒 **Rotate JWT secrets** regularly
- 🔒 **Implement rate limiting** in production
- 🔒 **Add logging** for production monitoring

---

## 📞 Support

For development questions or issues:
1. Check the error logs in the console
2. Verify database connection
3. Check JWT token expiration
4. Ensure proper role permissions

---

**🎯 Next Phase: Company Management APIs**
The foundation is ready! Next we'll implement company creation, verifier assignment, and unique form link generation.
