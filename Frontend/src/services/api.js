// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

// API Service Class
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = null; // Will be set from Redux
    }

    // Set authentication token (called from Redux)
    setToken(token) {
        this.token = token;
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
    }

    // Get authentication headers
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : ''
        };
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            
            // Prepare headers
            const headers = this.getAuthHeaders();
            
            // If we have a body and it's FormData, don't set Content-Type
            // If it's not FormData, set Content-Type to application/json
            if (options.body && options.body instanceof FormData) {
                delete headers['Content-Type']; // Let browser set it for FormData
            }
            
            const config = {
                headers,
                ...options
            };

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Create a more detailed error
                const error = new Error(data.message || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            
            // If it's a network error (no response)
            if (!error.status) {
                error.message = 'Network error. Please check your connection.';
                error.status = 0;
            }
            
            throw error;
        }
    }

    // Convert object to FormData (for future file uploads)
    objectToFormData(obj) {
        const formData = new FormData();
        Object.keys(obj).forEach(key => {
            if (obj[key] !== null && obj[key] !== undefined) {
                formData.append(key, obj[key]);
            }
        });
        return formData;
    }

    // Authentication Methods - Using JSON for better compatibility
    async login(email, password) {
        try {
            const response = await this.request('/users/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // Note: Token will be set by Redux, not here
            return response;
        } catch (error) {
            // Return a structured error response
            return {
                success: false,
                message: error.message || 'Login failed',
                error: error
            };
        }
    }

    async register(userData) {
        try {
            const response = await this.request('/users/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            // Note: Token will be set by Redux, not here
            return response;
        } catch (error) {
            // Return a structured error response
            return {
                success: false,
                message: error.message || 'Registration failed',
                error: error
            };
        }
    }

    async logout() {
        this.clearToken();
        return { success: true, message: 'Logged out successfully' };
    }

    // User Profile Methods
    async getProfile() {
        try {
            return await this.request('/users/profile');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch profile',
                error: error
            };
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await this.request('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Profile update failed',
                error: error
            };
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.request('/users/change-password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Password change failed',
                error: error
            };
        }
    }

    // Dashboard Methods
    async getDashboardData() {
        try {
            return await this.request('/users/dashboard');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch dashboard data',
                error: error
            };
        }
    }

    // Admin Methods
    async getAllUsers() {
        try {
            return await this.request('/users/all');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch users',
                error: error
            };
        }
    }

    async getVerifiersWithAssignments() {
        try {
            return await this.request('/users/verifiers-with-assignments');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch verifiers',
                error: error
            };
        }
    }

    async getUserStats() {
        try {
            return await this.request('/users/stats');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch user stats',
                error: error
            };
        }
    }

    // Verifier Methods
    async getVerifierApplications() {
        try {
            return await this.request('/users/verifier/applications');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch verifier applications',
                error: error
            };
        }
    }

    async getVerifierPendingApplications() {
        try {
            return await this.request('/users/verifier/applications/pending');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch pending applications',
                error: error
            };
        }
    }

    async getVerifierApprovedApplications() {
        try {
            return await this.request('/users/verifier/applications/approved');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch approved applications',
                error: error
            };
        }
    }

    async getVerifierStats() {
        try {
            return await this.request('/users/verifier/stats');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch verifier stats',
                error: error
            };
        }
    }

    async getVerifierCompanies() {
        try {
            return await this.request('/users/verifier/companies');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch verifier companies',
                error: error
            };
        }
    }

    // Auto-assign application to current verifier
    async assignApplicationToVerifier(applicationId) {
        try {
            return await this.request(`/applications/${applicationId}/auto-assign`, {
                method: 'POST'
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to assign application to verifier',
                error: error
            };
        }
    }

    // Get application details by ID
    async getApplicationDetails(applicationId) {
        try {
            return await this.request(`/applications/${applicationId}`);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch application details',
                error: error
            };
        }
    }

    // Company Methods (Future)
    async getCompanyApplications() {
        try {
            return await this.request('/users/company/applications');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch company applications',
                error: error
            };
        }
    }

    async getCompanyStats() {
        try {
            return await this.request('/users/company/stats');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch company stats',
                error: error
            };
        }
    }

    // Dashboard Methods
    async getDashboardStats() {
        try {
            return await this.request('/companies/stats/dashboard');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch dashboard stats',
                error: error
            };
        }
    }

    // Company Dropdown Methods
    async getCompaniesDropdown() {
        try {
            return await this.request('/companies/dropdown');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch companies dropdown',
                error: error
            };
        }
    }

    // Company Employee Methods
    async getCompanyEmployees() {
        try {
            return await this.request('/companies/employees');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch company employees',
                error: error
            };
        }
    }

    // Applications Methods
    async exportApplicationsToExcel(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.client_id) queryParams.append('client_id', filters.client_id);
            if (filters.verifier_id) queryParams.append('verifier_id', filters.verifier_id);
            if (filters.search) queryParams.append('search', filters.search);
            
            const url = `${this.baseURL}/applications/export/excel${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': this.token ? `Bearer ${this.token}` : ''
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to export applications');
            }

            // Get the blob from response
            const blob = await response.blob();
            
            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            
            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'applications_export.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            return { success: true, message: 'Applications exported successfully' };
        } catch (error) {
            console.error('Error exporting applications:', error);
            return { success: false, message: error.message || 'Failed to export applications' };
        }
    }

    async getAllApplications(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });
            
            const endpoint = `/applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            return await this.request(endpoint);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch applications',
                error: error
            };
        }
    }

    async getApplicationById(id) {
        try {
            return await this.request(`/applications/${id}`);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch application',
                error: error
            };
        }
    }
    async getApplicationBasicDetails(id) {
        try {
            return await this.request(`/applications/${id}/basic-details`);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch application basic details',
                error: error
            };
        }
    }
    async deleteApplication(id) {
        try {
            return await this.request(`/applications/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete application',
                error: error
            };
        }
    }

    async updateApplication(id, applicationData) {
        try {
            // Create FormData for file uploads
            const formData = new FormData();
            
            // Add all form fields to FormData
            Object.keys(applicationData).forEach(key => {
                if (applicationData[key] !== null && applicationData[key] !== undefined && applicationData[key] !== '') {
                    if (applicationData[key] instanceof File) {
                        formData.append(key, applicationData[key]);
                    } else {
                        formData.append(key, applicationData[key]);
                    }
                }
            });

            const url = `${this.baseURL}/applications/${id}`;
            const headers = {
                'Authorization': this.token ? `Bearer ${this.token}` : ''
                // Don't set Content-Type, let browser set it for FormData
            };

            const response = await fetch(url, {
                method: 'PUT',
                headers: headers,
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            return {
                success: false,
                message: error.message || 'Failed to update application',
                error: error
            };
        }
    }

    async deleteDocument(documentId) {
        try {
            return await this.request(`/applications/documents/${documentId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete document',
                error: error
            };
        }
    }

    // Employee/Verifier Methods
    async getAllEmployees() {
        try {
            return await this.request('/employees');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch employees',
                error: error
            };
        }
    }

    async createEmployee(employeeData) {
        try {
            return await this.request('/employees', {
                method: 'POST',
                body: JSON.stringify(employeeData)
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to create employee',
                error: error
            };
        }
    }

    async getEmployeeById(id) {
        try {
            return await this.request(`/employees/${id}`);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch employee',
                error: error
            };
        }
    }

    async updateEmployee(id, employeeData) {
        try {
            return await this.request(`/employees/${id}`, {
                method: 'PUT',
                body: JSON.stringify(employeeData)
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to update employee',
                error: error
            };
        }
    }

    async deleteEmployee(id) {
        try {
            return await this.request(`/employees/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete employee',
                error: error
            };
        }
    }

    async deleteClient(id) {
        try {
            return await this.request(`/companies/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete client',
                error: error
            };
        }
    }

    async getEmployeeStats() {
        try {
            return await this.request('/employees/stats/dashboard');
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch employee stats',
                error: error
            };
        }
    }

    // Review API Methods
    async submitReview(applicationId, reviewData) {
        try {
            return await this.request(`/reviews/${applicationId}/review`, {
                method: 'POST',
                body: JSON.stringify(reviewData)
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to submit review',
                error: error
            };
        }
    }

    async getReview(applicationId) {
        try {
            return await this.request(`/reviews/${applicationId}/review`);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch review',
                error: error
            };
        }
    }

    async finalizeReview(applicationId, finalData) {
        try {
            return await this.request(`/reviews/${applicationId}/finalize-review`, {
                method: 'POST',
                body: JSON.stringify(finalData)
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to finalize review',
                error: error
            };
        }
    }

    // Health Check
    async healthCheck() {
        try {
            const response = await fetch('https://bgvs-backend.vercel.app/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Question Management Methods
    // Public method to get active questions (no authentication required - for UserForm)
    async getPublicQuestions(formSection) {
        try {
            const url = `${this.baseURL}/questions/public?form_section=${formSection}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch questions',
                error: error
            };
        }
    }

    async getAllQuestions(formSection = null, activeOnly = true) {
        try {
            const queryParams = new URLSearchParams();
            if (formSection) queryParams.append('form_section', formSection);
            if (activeOnly) queryParams.append('active_only', 'true');
            
            const endpoint = `/questions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            return await this.request(endpoint);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch questions',
                error: error
            };
        }
    }

    async getQuestionById(id) {
        try {
            return await this.request(`/questions/${id}`);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch question',
                error: error
            };
        }
    }

    async createQuestion(questionData) {
        try {
            return await this.request('/questions', {
                method: 'POST',
                body: JSON.stringify(questionData)
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to create question',
                error: error
            };
        }
    }

    async updateQuestion(id, questionData) {
        try {
            return await this.request(`/questions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(questionData)
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to update question',
                error: error
            };
        }
    }

    async deleteQuestion(id) {
        try {
            return await this.request(`/questions/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete question',
                error: error
            };
        }
    }

    async saveQuestionAnswer(applicationId, questionId, answerText) {
        try {
            return await this.request(`/questions/applications/${applicationId}/answers`, {
                method: 'POST',
                body: JSON.stringify({
                    question_id: questionId,
                    answer_text: answerText
                })
            });
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to save answer',
                error: error
            };
        }
    }

    async getQuestionAnswers(applicationId, formSection = null) {
        try {
            const queryParams = new URLSearchParams();
            if (formSection) queryParams.append('form_section', formSection);
            
            const endpoint = `/questions/applications/${applicationId}/answers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            return await this.request(endpoint);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch answers',
                error: error
            };
        }
    }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
