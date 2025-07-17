# SafeSwap Authentication API Test

## Endpoints Available:

### 1. Health Check
GET http://localhost:3000/health

### 2. API Info
GET http://localhost:3000/api/info

### 3. Register User
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@safeswap.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "walletAddress": "0x123456789abcdef"
}

### 4. Login User
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@safeswap.com",
  "password": "password123"
}

### 5. Get Profile (Protected)
GET http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN

### 6. Update Profile (Protected)
PUT http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "walletAddress": "0x987654321fedcba"
}

### 7. Change Password (Protected)
PUT http://localhost:3000/api/auth/change-password
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}

### 8. List All Users
GET http://localhost:3000/api/users

### 9. Database Test
GET http://localhost:3000/api/database/test

## Testing with cURL:

### Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@safeswap.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@safeswap.com",
    "password": "password123"
  }'
```

### Get Profile (replace TOKEN with actual JWT):
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### List Users:
```bash
curl http://localhost:3000/api/users
```

## PowerShell Testing:

### Register:
```powershell
$body = @{
    email = "test@safeswap.com"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login:
```powershell
$loginBody = @{
    email = "test@safeswap.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```
