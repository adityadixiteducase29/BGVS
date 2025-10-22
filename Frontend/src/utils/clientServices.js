import { useState, useEffect, useCallback } from 'react';

// Utility functions for checking client services and controlling UserForm visibility

/**
 * Check if a specific service is enabled for a company
 * @param {string} companyId - The company ID
 * @param {string} serviceName - The service name to check
 * @returns {Promise<boolean>} - Whether the service is enabled
 */
export const isServiceEnabled = async (companyId, serviceName) => {
  try {
    const response = await fetch(`/api/companies/${companyId}/services/${serviceName}/status`);
    if (!response.ok) {
      throw new Error('Failed to check service status');
    }
    
    const result = await response.json();
    return result.data.is_enabled;
  } catch (error) {
    console.error('Error checking service status:', error);
    return false; // Default to false if there's an error
  }
};

/**
 * Get all services for a company
 * @param {string} companyId - The company ID
 * @returns {Promise<Object>} - Object containing all services and their status
 */
export const getCompanyServices = async (companyId) => {
  try {
    console.log('Fetching company services for companyId:', companyId);
    const response = await fetch(`/api/companies/${companyId}/services/visibility?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch company services');
    }
    
    const result = await response.json();
    console.log('API Response:', result);
    console.log('Services data:', result.data.services);
    return result.data.services;
  } catch (error) {
    console.error('Error fetching company services:', error);
    return {}; // Return empty object if there's an error
  }
};

/**
 * Check if multiple services are enabled for a company
 * @param {string} companyId - The company ID
 * @param {Array<string>} serviceNames - Array of service names to check
 * @returns {Promise<Object>} - Object with service names as keys and boolean values
 */
export const checkMultipleServices = async (companyId, serviceNames) => {
  try {
    const services = await getCompanyServices(companyId);
    const result = {};
    
    serviceNames.forEach(serviceName => {
      result[serviceName] = services[serviceName] || false;
    });
    
    return result;
  } catch (error) {
    console.error('Error checking multiple services:', error);
    // Return all services as false if there's an error
    const result = {};
    serviceNames.forEach(serviceName => {
      result[serviceName] = false;
    });
    return result;
  }
};

/**
 * Get service display names mapping
 * @returns {Object} - Mapping of service keys to display names
 */
export const getServiceDisplayNames = () => {
  return {
    personal_information: 'Personal Information',
    education: 'Education',
    reference: 'Reference',
    documentation: 'Documentation',
    employment_information: 'Employment Information',
    tenancy_information: 'Tenancy Information',
    residential: 'Residential'
  };
};

/**
 * Get service descriptions for tooltips or help text
 * @returns {Object} - Mapping of service keys to descriptions
 */
export const getServiceDescriptions = () => {
  return {
    personal_information: 'Basic personal details like name, contact info, and identification',
    education: 'Educational background and qualifications',
    reference: 'Personal and professional references',
    documentation: 'Document uploads and verification',
    employment_information: 'Work history and employment details',
    tenancy_information: 'Rental and tenancy history',
    residential: 'Residential address history and verification'
  };
};

/**
 * Check if UserForm section should be visible based on company services
 * @param {Object} companyServices - Object containing service status
 * @param {string} sectionName - The section name to check
 * @returns {boolean} - Whether the section should be visible
 */
export const isFormSectionVisible = (companyServices, sectionName) => {
  if (!companyServices || typeof companyServices !== 'object') {
    return false;
  }
  
  // Map section names to service keys
  const sectionToServiceMap = {
    'PersonalInfo': 'personal_information',
    'Education': 'education',
    'Reference': 'reference',
    'Document': 'documentation',
    'Employment': 'employment_information',
    'Tenancy': 'tenancy_information',
    'Residency': 'residential'
  };
  
  const serviceKey = sectionToServiceMap[sectionName];
  if (!serviceKey) {
    console.warn(`Unknown section name: ${sectionName}`);
    return false;
  }
  
  return companyServices[serviceKey] === true;
};

/**
 * Get all visible form sections for a company
 * @param {Object} companyServices - Object containing service status
 * @returns {Array<string>} - Array of visible section names
 */
export const getVisibleFormSections = (companyServices) => {
  if (!companyServices || typeof companyServices !== 'object') {
    return [];
  }
  
  const sectionToServiceMap = {
    'PersonalInfo': 'personal_information',
    'Education': 'education',
    'Reference': 'reference',
    'Document': 'documentation',
    'Employment': 'employment_information',
    'Tenancy': 'tenancy_information',
    'Residency': 'residential'
  };
  
  const visibleSections = [];
  
  Object.entries(sectionToServiceMap).forEach(([sectionName, serviceKey]) => {
    if (companyServices[serviceKey] === true) {
      visibleSections.push(sectionName);
    }
  });
  
  return visibleSections;
};

/**
 * Create a hook for managing company services in React components
 * @param {string} companyId - The company ID
 * @returns {Object} - Object containing services state and utility functions
 */
export const useCompanyServices = (companyId) => {
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setServices({});
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Starting to fetch services for companyId:', companyId);
        const companyServices = await getCompanyServices(companyId);
        console.log('useCompanyServices Debug:', {
          companyId,
          companyServices,
          type: typeof companyServices,
          isObject: typeof companyServices === 'object',
          keys: companyServices ? Object.keys(companyServices) : 'no keys'
        });
        setServices(companyServices || {});
      } catch (err) {
        console.error('useCompanyServices Error:', err);
        setError(err.message);
        setServices({});
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [companyId]);

  const isVisible = useCallback((sectionName) => {
    return isFormSectionVisible(services, sectionName);
  }, [services]);

  const getVisibleSections = useCallback(() => {
    return getVisibleFormSections(services);
  }, [services]);

  return {
    services,
    loading,
    error,
    isVisible,
    getVisibleSections,
    refresh: () => {
      if (companyId) {
        getCompanyServices(companyId).then(setServices);
      }
    }
  };
};
