const { pool } = require('./src/config/database');

async function fixDocumentTypes() {
    try {
        console.log('🔧 Starting document type fix...');
        
        // Get all documents for application 14
        const [documents] = await pool.execute(
            `SELECT * FROM application_documents WHERE application_id = 14 ORDER BY id ASC`
        );
        
        console.log(`📄 Found ${documents.length} documents to fix`);
        
        // Define the correct mapping based on the order they were uploaded
        const fieldMapping = [
            'marksheet_10th',      // id: 20
            'marksheet_12th',      // id: 21  
            'provisional_certificate', // id: 22
            'aadhar_front',        // id: 23
            'aadhar_back',         // id: 24
            'passport_photo',      // id: 25
            'pan_card',           // id: 26
            'voter_id',           // id: 27
            'driving_license',     // id: 28
            'passport',           // id: 29
            'ele',                // id: 30
            'other_document',     // id: 31
            'offer_letter',       // id: 32
            'pay_slip',           // id: 33
            'resignation',        // id: 34
            'experience_letter',  // id: 35
            'bank_statement',     // id: 36
            'employment_check_result', // id: 37
            'employment_certificate'   // id: 38
        ];
        
        // Update each document with the correct field name
        for (let i = 0; i < documents.length; i++) {
            const doc = documents[i];
            const correctFieldName = fieldMapping[i];
            
            if (correctFieldName) {
                await pool.execute(
                    `UPDATE application_documents SET document_type = ? WHERE id = ?`,
                    [correctFieldName, doc.id]
                );
                
                console.log(`✅ Updated document ${doc.id}: ${doc.document_type} → ${correctFieldName}`);
            }
        }
        
        console.log('🎉 Document type fix completed successfully!');
        
        // Verify the changes
        const [updatedDocs] = await pool.execute(
            `SELECT id, document_type, document_name FROM application_documents WHERE application_id = 14 ORDER BY id ASC`
        );
        
        console.log('\n📋 Updated document types:');
        updatedDocs.forEach(doc => {
            console.log(`  ID ${doc.id}: ${doc.document_type} (${doc.document_name})`);
        });
        
    } catch (error) {
        console.error('❌ Error fixing document types:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fixDocumentTypes();
