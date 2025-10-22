const FormData = require('form-data');
const fs = require('fs');

// Test data - comprehensive form submission
const testData = {
    applicant_first_name: 'John',
    applicant_last_name: 'Doe',
    applicant_email: 'john.doe.test@example.com',
    applicant_phone: '1234567890',
    applicant_dob: '1990-01-01',
    gender: 'male',
    languages: 'English, Hindi',
    father_name: 'Robert Doe',
    mother_name: 'Jane Doe',
    emergency_contact_number: '9876543210',
    current_house_no: '123',
    current_area_locality: 'Test Area',
    current_district: 'Test District',
    current_police_station: 'Test Police Station',
    current_pincode: '123456',
    highest_education: 'Bachelor of Engineering',
    institute_name: 'Test University',
    education_city: 'Test City',
    grades: 'A+',
    education_from_date: '2010-01-01',
    education_to_date: '2014-01-01',
    reference1_name: 'Reference 1',
    reference1_address: 'Reference 1 Address',
    reference1_relation: 'Friend',
    reference1_contact: '1111111111',
    aadhar_number: '123456789012',
    pan_number: 'ABCDE1234F',
    company_name: 'Test Company',
    designation: 'Software Engineer',
    employee_id: 'EMP001',
    employment_location: 'Test Location',
    employment_from_date: '2020-01-01',
    employment_to_date: '2023-01-01',
    hr_number: '4444444444',
    hr_email: 'hr@testcompany.com',
    work_responsibility: 'Software Development',
    salary: '50000',
    neighbour1_name: 'Neighbor 1',
    neighbour1_mobile: '5555555555',
    bike_quantity: '1',
    car_quantity: '1',
    ac_quantity: '2',
    current_address: 'Test Current Address',
    permanent_address: 'Test Permanent Address',
    company_id: '8'
};

async function testApplicationSubmission() {
    try {
        const form = new FormData();
        
        // Add all form fields
        Object.keys(testData).forEach(key => {
            form.append(key, testData[key]);
        });
        
        // Create a dummy PDF file for testing
        const dummyPdfContent = Buffer.from('%PDF-1.3\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF');
        
        // Add a few dummy files for testing
        const fileFields = ['marksheet_10th', 'aadhar_front', 'pan_card'];
        
        fileFields.forEach(fieldName => {
            form.append(fieldName, dummyPdfContent, {
                filename: `${fieldName}.pdf`,
                contentType: 'application/pdf'
            });
        });
        
        console.log('Testing application submission with comprehensive data...');
        console.log('Form fields:', Object.keys(testData).length);
        console.log('File fields:', fileFields.length);
        
        const response = await fetch('http://localhost:3000/api/applications/companies/8/applications', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        
        const result = await response.json();
        
        console.log('Response Status:', response.status);
        console.log('Response:', JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('✅ Application submitted successfully!');
            console.log(`Application ID: ${result.data.id}`);
            console.log(`Files processed: ${result.data.filesProcessed}`);
        } else {
            console.log('❌ Application submission failed:', result.message);
        }
        
    } catch (error) {
        console.error('Error testing application submission:', error);
    }
}

// Run the test
testApplicationSubmission();
