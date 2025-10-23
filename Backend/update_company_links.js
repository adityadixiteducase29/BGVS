const { pool } = require('./src/config/database');
const config = require('./src/config/environment');
require('dotenv').config();

async function updateCompanyLinks() {
    console.log('🔧 Company Link Update Script');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 This script will update all company verification form links');
    console.log('🌐 Frontend URL:', config.frontendUrl);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        console.log('🔍 Fetching all companies...');
        
        // Get all companies
        const [companies] = await pool.execute(`
            SELECT id, name, verification_form_link 
            FROM companies 
            WHERE is_active = TRUE
        `);

        if (companies.length === 0) {
            console.log('ℹ️  No active companies found.');
            return;
        }

        console.log(`📊 Found ${companies.length} active companies:`);
        companies.forEach(company => {
            console.log(`   - ${company.name} (ID: ${company.id})`);
            console.log(`     Current link: ${company.verification_form_link || 'Not set'}`);
        });

        console.log('\n🔄 Updating company links...');
        
        let updatedCount = 0;
        for (const company of companies) {
            const newLink = `${config.frontendUrl}/user-form/${company.id}`;
            
            // Only update if the link is different
            if (company.verification_form_link !== newLink) {
                await pool.execute(`
                    UPDATE companies 
                    SET verification_form_link = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [newLink, company.id]);
                
                console.log(`✅ Updated ${company.name}: ${newLink}`);
                updatedCount++;
            } else {
                console.log(`⏭️  Skipped ${company.name} (already correct)`);
            }
        }

        console.log('\n🎉 Update complete!');
        console.log(`📈 Updated ${updatedCount} companies`);
        console.log(`⏭️  Skipped ${companies.length - updatedCount} companies (already correct)`);
        
        console.log('\n📋 Final Links:');
        const [updatedCompanies] = await pool.execute(`
            SELECT id, name, verification_form_link 
            FROM companies 
            WHERE is_active = TRUE
            ORDER BY id
        `);
        
        updatedCompanies.forEach(company => {
            console.log(`   ${company.name}: ${company.verification_form_link}`);
        });

    } catch (error) {
        console.error('❌ Error updating company links:', error.message);
        process.exit(1);
    } finally {
        // Close the pool if needed
        await pool.end();
    }
}

// Run the script
updateCompanyLinks();
