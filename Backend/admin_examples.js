// ========================================
// EXAMPLE: Creating Different Admin Users
// ========================================

// Example 1: Create a Super Admin
const SUPER_ADMIN_CONFIG = {
    email: 'superadmin@company.com',
    password: 'SuperAdmin@2024',
    firstName: 'Super',
    lastName: 'Admin',
    userType: 'admin'
};

// Example 2: Create a Company Manager
const MANAGER_CONFIG = {
    email: 'manager@company.com',
    password: 'Manager@123',
    firstName: 'John',
    lastName: 'Manager',
    userType: 'admin'
};

// Example 3: Create a System Administrator
const SYS_ADMIN_CONFIG = {
    email: 'sysadmin@company.com',
    password: 'SysAdmin@456',
    firstName: 'System',
    lastName: 'Administrator',
    userType: 'admin'
};

// ========================================
// HOW TO USE:
// ========================================
// 1. Copy one of the configs above
// 2. Replace the ADMIN_CONFIG in create_admin.js
// 3. Run: node create_admin.js
// 4. Login with the new credentials

console.log('📋 Example Admin Configurations:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Super Admin:', SUPER_ADMIN_CONFIG.email);
console.log('2. Manager:', MANAGER_CONFIG.email);
console.log('3. System Admin:', SYS_ADMIN_CONFIG.email);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 Copy any config to create_admin.js and run it!');
