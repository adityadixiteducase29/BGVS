# Client API Documentation

This document describes the API endpoints for managing clients and their services in the Background Verification System.

## Base URL
```
http://localhost:3000/api/clients
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Client
**POST** `/api/clients`

Creates a new client with selected services.

**Request Body:**
```json
{
  "client_name": "Acme Corporation",
  "client_email": "hr@acme.com",
  "password": "securepassword123",
  "services": {
    "personal_information": true,
    "education": true,
    "reference": false,
    "documentation": true,
    "employment_information": true,
    "tenancy_information": false,
    "residential": true
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "id": 1,
    "client_name": "Acme Corporation",
    "client_email": "hr@acme.com",
    "is_active": true,
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Required Fields:**
- `client_name`: String (2-255 characters)
- `client_email`: Valid email format, unique
- `password`: String (6-255 characters)
- `services`: Object with at least one service enabled

**Valid Services:**
- `personal_information`
- `education`
- `reference`
- `documentation`
- `employment_information`
- `tenancy_information`
- `residential`

---

### 2. Get All Clients
**GET** `/api/clients`

Retrieves all active clients with their service counts.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_name": "Acme Corporation",
      "client_email": "hr@acme.com",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "enabled_services_count": 5
    }
  ]
}
```

---

### 3. Get Client by ID
**GET** `/api/clients/:id`

Retrieves a specific client with all their services.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "client_name": "Acme Corporation",
    "client_email": "hr@acme.com",
    "is_active": true,
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "services": {
      "personal_information": true,
      "education": true,
      "reference": false,
      "documentation": true,
      "employment_information": true,
      "tenancy_information": false,
      "residential": true
    }
  }
}
```

---

### 4. Update Client
**PUT** `/api/clients/:id`

Updates client information (name, email, active status).

**Request Body:**
```json
{
  "client_name": "Acme Corp Updated",
  "client_email": "hr.updated@acme.com",
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Client updated successfully"
}
```

**Allowed Fields:**
- `client_name`
- `client_email`
- `is_active`

---

### 5. Update Client Services
**PUT** `/api/clients/:id/services`

Updates the services configuration for a client.

**Request Body:**
```json
{
  "services": {
    "personal_information": true,
    "education": true,
    "reference": true,
    "documentation": false,
    "employment_information": true,
    "tenancy_information": true,
    "residential": false
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Client services updated successfully"
}
```

---

### 6. Deactivate Client
**DELETE** `/api/clients/:id`

Deactivates a client (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Client deactivated successfully"
}
```

---

### 7. Get Client Statistics
**GET** `/api/clients/stats/overview`

Retrieves overall client and service statistics.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "clientStats": {
      "total_clients": 25,
      "active_clients": 23
    },
    "serviceStats": [
      {
        "service_name": "personal_information",
        "enabled_count": 23
      },
      {
        "service_name": "education",
        "enabled_count": 20
      }
    ]
  }
}
```

---

## UserForm Visibility Endpoints

These endpoints are used by the frontend to determine which form sections to show/hide based on client services.

### 8. Get Client Services for Visibility
**GET** `/api/clients/:clientId/services/visibility`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "client_id": "1",
    "services": {
      "personal_information": true,
      "education": true,
      "reference": false,
      "documentation": true,
      "employment_information": true,
      "tenancy_information": false,
      "residential": true
    }
  }
}
```

### 9. Check Specific Service Status
**GET** `/api/clients/:clientId/services/:serviceName/status`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "client_id": "1",
    "service_name": "personal_information",
    "is_enabled": true
  }
}
```

---

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Client name must be at least 2 characters long",
    "Invalid email format"
  ]
}
```

### Client Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "Client not found"
}
```

### Duplicate Email (409 Conflict)
```json
{
  "success": false,
  "message": "Client with this email already exists"
}
```

### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

## Frontend Integration

### Using the Client Services Utility

```javascript
import { useClientServices, isFormSectionVisible } from '../utils/clientServices';

// In your UserForm component
const UserForm = ({ clientId }) => {
  const { services, loading, error, isVisible } = useClientServices(clientId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {isVisible('PersonalInfo') && <PersonalInfoSection />}
      {isVisible('Education') && <EducationSection />}
      {isVisible('Reference') && <ReferenceSection />}
      {isVisible('Document') && <DocumentSection />}
      {isVisible('Employment') && <EmploymentSection />}
      {isVisible('Tenancy') && <TenancySection />}
      {isVisible('Residency') && <ResidencySection />}
    </div>
  );
};
```

### Service Names Mapping

| Service Key | Display Name | Description |
|-------------|--------------|-------------|
| `personal_information` | Personal Information | Basic personal details |
| `education` | Education | Educational background |
| `reference` | Reference | Personal references |
| `documentation` | Documentation | Document uploads |
| `employment_information` | Employment Information | Work history |
| `tenancy_information` | Tenancy Information | Rental history |
| `residential` | Residential | Address history |

---

## Database Schema

### Clients Table
```sql
CREATE TABLE clients (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

### Client Services Table
```sql
CREATE TABLE client_services (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    client_id BIGINT UNSIGNED NOT NULL,
    service_name ENUM('personal_information', 'education', 'reference', 'documentation', 'employment_information', 'tenancy_information', 'residential') NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_service (client_id, service_name)
);
```

---

## Security Notes

1. **Authentication Required**: All endpoints require valid JWT tokens
2. **Role-Based Access**: Only admin users can create/update/delete clients
3. **Password Hashing**: Passwords are automatically hashed using bcrypt
4. **Input Validation**: All inputs are validated before processing
5. **SQL Injection Protection**: Uses parameterized queries
6. **CORS**: Configured for frontend domain access

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

---

## Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- cURL
- Thunder Client (VS Code extension)

Example cURL command:
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "client_name": "Test Client",
    "client_email": "test@example.com",
    "password": "password123",
    "services": {
      "personal_information": true,
      "education": true
    }
  }'
```
