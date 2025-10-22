# 🧪 Frontend-Backend Integration Test Guide

## 🎯 **What We've Implemented**

### ✅ **Backend Integration**
- API service layer for all backend communication
- Authentication context for state management
- Real-time user data from backend
- Role-based routing and access control

### ✅ **Frontend Updates**
- Login page with real API calls
- Dynamic UI rendering based on user role
- Protected routes with authentication
- Logout functionality
- User info display in sidebar

## 🚀 **Testing Steps**

### **1. Start Both Servers**

**Backend:**
```bash
cd Backend
npm run dev
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

### **2. Test Login Flow**

#### **Admin Login:**
1. Go to `http://localhost:5173/login`
2. Click "Admin Login" button (fills test credentials)
3. Click "Sign in"
4. Should redirect to `/dashboard` (Admin Dashboard)

#### **Verifier Login:**
1. Go to `http://localhost:5173/login`
2. Click "Verifier Login" button (fills test credentials)
3. Click "Sign in"
4. Should redirect to `/verifier-dashboard` (Verifier Dashboard)

### **3. Verify Role-Based Access**

#### **Admin User:**
- ✅ Can access `/dashboard`
- ✅ Can access `/client`
- ✅ Can access `/employees`
- ✅ Can access `/application`
- ✅ Can access `/help`
- ❌ Cannot access `/verifier-dashboard` (redirects to admin dashboard)

#### **Verifier User:**
- ✅ Can access `/verifier-dashboard`
- ✅ Can access `/verifier-applications`
- ✅ Can access `/pending`
- ✅ Can access `/approved`
- ✅ Can access `/verifier-help`
- ❌ Cannot access `/dashboard` (redirects to verifier dashboard)

### **4. Test Authentication Features**

#### **Token Persistence:**
1. Login successfully
2. Refresh the page
3. Should stay logged in
4. User data should persist

#### **Logout:**
1. Click logout button in sidebar
2. Should redirect to login page
3. Token should be cleared
4. Cannot access protected routes

#### **Invalid Token:**
1. Manually clear localStorage
2. Try to access protected route
3. Should redirect to login

## 🔍 **Expected Behavior**

### **Login Success:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 2,
    "email": "admin@test.com",
    "first_name": "Test",
    "last_name": "Admin",
    "user_type": "admin",
    "full_name": "Test Admin",
    "token": "jwt_token_here"
  }
}
```

### **Dashboard Data:**
- **Admin**: Shows user stats, company stats, application stats
- **Verifier**: Shows assigned companies and application counts

### **Sidebar Display:**
- User avatar and name
- User role (Administrator/Verifier/Company User)
- User email
- Role-specific navigation menu
- Logout button

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. CORS Error:**
```
Access to fetch at 'http://localhost:3000/api/users/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution:** Backend CORS is configured correctly, check if backend is running

#### **2. Network Error:**
```
Failed to fetch
```
**Solution:** Backend server not running or wrong port

#### **3. Authentication Error:**
```
401 Unauthorized
```
**Solution:** Check if JWT token is valid, try logging in again

#### **4. Role Access Error:**
```
403 Forbidden
```
**Solution:** User doesn't have permission for that action

### **Debug Steps:**
1. Check browser console for errors
2. Verify backend server is running
3. Check network tab for API calls
4. Verify localStorage has authToken
5. Check user role in context

## 🎉 **Success Indicators**

### **✅ Integration Working:**
- Login redirects to correct dashboard
- User info displays correctly in sidebar
- Navigation shows role-appropriate menu items
- Logout works and clears session
- Protected routes work correctly
- Role-based access control functions

### **✅ Backend Communication:**
- API calls succeed
- JWT tokens are received and stored
- User data is fetched from backend
- Dashboard data is real-time from database

## 🚀 **Next Steps After Testing**

1. **Test with real users** (create new accounts)
2. **Implement Company Management APIs** (next phase)
3. **Add real-time dashboard updates**
4. **Implement file upload functionality**
5. **Add email notifications**

---

**🎯 Ready to test! Start both servers and try the login flow.**
