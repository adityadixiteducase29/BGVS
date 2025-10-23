const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const { testConnection } = require('./src/config/database');

// ========================================
// ADMIN USER CONFIGURATION
// ========================================
// Change these values to create different admin users
const ADMIN_CONFIG = {
    email: 'admin@test.com',
    password: 'Admin@123',
    firstName: 'Company',
    lastName: 'Admin',
    userType: 'admin'
};

// ========================================
// SCRIPT EXECUTION
// ========================================

async function createAdminUser() {
    try {
        console.log('🚀 Starting admin user creation...');
        console.log('📧 Email:', ADMIN_CONFIG.email);
        console.log('👤 Name:', `${ADMIN_CONFIG.firstName} ${ADMIN_CONFIG.lastName}`);
        console.log('🔑 User Type:', ADMIN_CONFIG.userType);
        
        // Test database connection
        console.log('\n🔍 Testing database connection...');
        await testConnection();
        console.log('✅ Database connected successfully!');
        
        // Check if user already exists
        console.log('\n🔍 Checking if user already exists...');
        const existingUser = await User.findByEmail(ADMIN_CONFIG.email);
        
        if (existingUser) {
            console.log('⚠️  User already exists with email:', ADMIN_CONFIG.email);
            console.log('📊 Existing user details:');
            console.log('   - ID:', existingUser.id);
            console.log('   - Name:', `${existingUser.first_name} ${existingUser.last_name}`);
            console.log('   - Type:', existingUser.user_type);
            console.log('   - Active:', existingUser.is_active ? 'Yes' : 'No');
            
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            const answer = await new Promise((resolve) => {
                rl.question('\n❓ Do you want to update the existing user? (y/N): ', resolve);
            });
            
            rl.close();
            
            if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                console.log('❌ Operation cancelled.');
                process.exit(0);
            }
            
            // Update existing user
            console.log('\n🔄 Updating existing user...');
            const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 12);
            
            const updateQuery = `
                UPDATE users 
                SET password = ?, 
                    first_name = ?, 
                    last_name = ?, 
                    user_type = ?, 
                    is_active = TRUE,
                    updated_at = NOW()
                WHERE email = ?
            `;
            
            const { pool } = require('./src/config/database');
            await pool.execute(updateQuery, [
                hashedPassword,
                ADMIN_CONFIG.firstName,
                ADMIN_CONFIG.lastName,
                ADMIN_CONFIG.userType,
                ADMIN_CONFIG.email
            ]);
            
            console.log('✅ User updated successfully!');
            console.log('🔑 New password has been set.');
            
        } else {
            // Create new user
            console.log('\n🆕 Creating new admin user...');
            
            const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 12);
            
            const insertQuery = `
                INSERT INTO users (
                    email, 
                    password, 
                    first_name, 
                    last_name, 
                    user_type, 
                    is_active, 
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())
            `;
            
            const { pool } = require('./src/config/database');
            const [result] = await pool.execute(insertQuery, [
                ADMIN_CONFIG.email,
                hashedPassword,
                ADMIN_CONFIG.firstName,
                ADMIN_CONFIG.lastName,
                ADMIN_CONFIG.userType
            ]);
            
            console.log('✅ Admin user created successfully!');
            console.log('🆔 User ID:', result.insertId);
        }
        
        // Display final user details
        console.log('\n📋 Final User Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', ADMIN_CONFIG.email);
        console.log('🔑 Password:', ADMIN_CONFIG.password);
        console.log('👤 Full Name:', `${ADMIN_CONFIG.firstName} ${ADMIN_CONFIG.lastName}`);
        console.log('🏷️  User Type:', ADMIN_CONFIG.userType);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        console.log('\n🎉 Admin user setup complete!');
        console.log('💡 You can now login with these credentials.');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.error('🔍 Stack trace:', error.stack);
        process.exit(1);
    } finally {
        // Close database connection
        process.exit(0);
    }
}

// ========================================
// USAGE INSTRUCTIONS
// ========================================

console.log('🔧 Admin User Creation Script');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 To create a different admin user:');
console.log('   1. Edit the ADMIN_CONFIG object in this file');
console.log('   2. Change email, password, firstName, lastName');
console.log('   3. Run: node create_admin.js');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Run the script
createAdminUser();
