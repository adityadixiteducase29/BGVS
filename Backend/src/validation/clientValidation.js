// Client data validation functions

const validateClientData = (data) => {
    const errors = [];

    // Validate client_name
    if (!data.client_name || typeof data.client_name !== 'string') {
        errors.push('Client name is required and must be a string');
    } else if (data.client_name.trim().length < 2) {
        errors.push('Client name must be at least 2 characters long');
    } else if (data.client_name.trim().length > 255) {
        errors.push('Client name must be less than 255 characters');
    }

    // Validate client_email
    if (!data.client_email || typeof data.client_email !== 'string') {
        errors.push('Client email is required and must be a string');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.client_email)) {
            errors.push('Invalid email format');
        }
        if (data.client_email.length > 255) {
            errors.push('Email must be less than 255 characters');
        }
    }

    // Validate password
    if (!data.password || typeof data.password !== 'string') {
        errors.push('Password is required and must be a string');
    } else if (data.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    } else if (data.password.length > 255) {
        errors.push('Password must be less than 255 characters');
    }

    // Validate services
    if (!data.services || typeof data.services !== 'object') {
        errors.push('Services configuration is required');
    } else {
        const validServices = [
            'personal_information',
            'education',
            'reference',
            'documentation',
            'employment_information',
            'tenancy_information',
            'residential'
        ];

        const providedServices = Object.keys(data.services);
        
        // Check if all provided services are valid
        for (const service of providedServices) {
            if (!validServices.includes(service)) {
                errors.push(`Invalid service: ${service}`);
            }
            
            if (typeof data.services[service] !== 'boolean') {
                errors.push(`Service ${service} must be a boolean value`);
            }
        }

        // Check if at least one service is enabled
        const enabledServices = Object.values(data.services).filter(Boolean);
        if (enabledServices.length === 0) {
            errors.push('At least one service must be enabled');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateClientUpdate = (data) => {
    const errors = [];
    const allowedFields = ['client_name', 'client_email', 'is_active'];

    // Check if any invalid fields are provided
    const providedFields = Object.keys(data);
    for (const field of providedFields) {
        if (!allowedFields.includes(field)) {
            errors.push(`Field '${field}' is not allowed for update`);
        }
    }

    // Validate client_name if provided
    if (data.client_name !== undefined) {
        if (typeof data.client_name !== 'string') {
            errors.push('Client name must be a string');
        } else if (data.client_name.trim().length < 2) {
            errors.push('Client name must be at least 2 characters long');
        } else if (data.client_name.trim().length > 255) {
            errors.push('Client name must be less than 255 characters');
        }
    }

    // Validate client_email if provided
    if (data.client_email !== undefined) {
        if (typeof data.client_email !== 'string') {
            errors.push('Client email must be a string');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.client_email)) {
                errors.push('Invalid email format');
            }
            if (data.client_email.length > 255) {
                errors.push('Email must be less than 255 characters');
            }
        }
    }

    // Validate is_active if provided
    if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
        errors.push('is_active must be a boolean value');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateServicesUpdate = (data) => {
    const errors = [];

    if (!data.services || typeof data.services !== 'object') {
        errors.push('Services configuration is required');
    } else {
        const validServices = [
            'personal_information',
            'education',
            'reference',
            'documentation',
            'employment_information',
            'tenancy_information',
            'residential'
        ];

        const providedServices = Object.keys(data.services);
        
        // Check if all provided services are valid
        for (const service of providedServices) {
            if (!validServices.includes(service)) {
                errors.push(`Invalid service: ${service}`);
            }
            
            if (typeof data.services[service] !== 'boolean') {
                errors.push(`Service ${service} must be a boolean value`);
            }
        }

        // Check if at least one service is enabled
        const enabledServices = Object.values(data.services).filter(Boolean);
        if (enabledServices.length === 0) {
            errors.push('At least one service must be enabled');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateClientData,
    validateClientUpdate,
    validateServicesUpdate
};
