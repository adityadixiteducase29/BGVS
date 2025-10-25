import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import { TextField, Checkbox, FormControlLabel } from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import apiService from '../../../services/api';
import './EditClient.css';

const EditClient = ({ modal, toggle, clientId, onClientUpdated }) => {
  const { user } = useAppSelector(state => state.auth);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    password: ''
  });

  const [selectedServices, setSelectedServices] = useState({
    personal_information: false,
    education: false,
    reference: false,
    documentation: false,
    employment_information: false,
    tenancy_information: false,
    residential: false
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Fetch client data when modal opens
  useEffect(() => {
    if (modal && clientId) {
      fetchClientData();
    }
  }, [modal, clientId]);

  const fetchClientData = async () => {
    try {
      setFetching(true);
      setError('');

      // Get auth token from Redux store
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Set token in API service
      apiService.setToken(token);

      // Fetch client data
      const result = await apiService.request(`/companies/${clientId}`, {
        method: 'GET'
      });

      if (result.success && result.data) {
        const client = result.data;
        
        
        // Populate form data
        setFormData({
          clientName: client.name || '',
          clientEmail: client.email || '',
          password: '' // Don't populate password for security
        });

        // Populate services
        if (client.services && typeof client.services === 'object') {
          const servicesState = {
            personal_information: false,
            education: false,
            reference: false,
            documentation: false,
            employment_information: false,
            tenancy_information: false,
            residential: false
          };

          // client.services is an object like { personal_information: true, education: false, ... }
          Object.keys(servicesState).forEach(serviceName => {
            if (client.services.hasOwnProperty(serviceName)) {
              servicesState[serviceName] = Boolean(client.services[serviceName]);
            }
          });

          setSelectedServices(servicesState);
        } else {
          // If no services found, reset to default state
          setSelectedServices({
            personal_information: false,
            education: false,
            reference: false,
            documentation: false,
            employment_information: false,
            tenancy_information: false,
            residential: false
          });
        }
      }

    } catch (error) {
      console.error('Error fetching client data:', error);
      setError('Failed to load client data: ' + error.message);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      // Prepare data for API - only include password if it's provided
      const clientData = {
        name: formData.clientName,
        email: formData.clientEmail
      };

      // Only include password if user provided a new one
      if (formData.password && formData.password.trim() !== '') {
        clientData.password = formData.password;
      }

      // Get auth token from Redux store
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Set token in API service
      apiService.setToken(token);

      // Update company basic info
      const updateResult = await apiService.request(`/companies/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(clientData)
      });

      if (!updateResult.success) {
        throw new Error(updateResult.message || 'Failed to update client');
      }

      // Update company services
      const servicesResult = await apiService.request(`/companies/${clientId}/services`, {
        method: 'PUT',
        body: JSON.stringify({ services: selectedServices })
      });

      if (!servicesResult.success) {
        throw new Error(servicesResult.message || 'Failed to update client services');
      }

      // Success - close modal and reset form
      console.log('Client updated successfully:', updateResult.data);

      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        password: ''
      });
      setSelectedServices({
        personal_information: false,
        education: false,
        reference: false,
        documentation: false,
        employment_information: false,
        tenancy_information: false,
        residential: false
      });

      // Call the callback to refresh the client list
      if (onClientUpdated) {
        onClientUpdated();
      }

      // Close the modal
      toggle();

      // You can add a success notification here
      alert('Client updated successfully!');

    } catch (error) {
      console.error('Error updating client:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle} size="lg" className="add-client-modal">
        <ModalHeader toggle={toggle} className="add-client-header">
          <h2 className="modal-title">Edit Client</h2>
        </ModalHeader>

        <ModalBody className="add-client-body">
          {/* Loading State */}
          {fetching && (
            <div className="loading-message" style={{ color: '#1976d2', marginBottom: '16px', padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
              Loading client data...
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '16px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          <Row className='mb-4'>
            <Row className='mb-3'>
              <Col md={6}>
              <TextField
                  fullWidth
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  label="Client Name"
                  type="text"
                  placeholder="Enter client name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                />
              </Col>
              <Col md={6}>
              <TextField
                  fullWidth
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  label="Client Email"
                  type="email"
                  placeholder="Enter client email"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
              <TextField
                  fullWidth
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  label="New Password (Optional)"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                />
              </Col>
            </Row>
          </Row>
          {/* Divider */}
          <div className="divider"></div>

          {/* Services Section */}
          <div className="services-section">
            <h3 className="services-title">Services ({selectedCount}/7)</h3>
            <div className="services-grid">
              <div className="service-item">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedServices.personal_information}
                      onChange={() => handleServiceToggle('personal_information')}
                      className="mui-checkbox"
                      size="small"
                    />
                  }
                  label="Personal Information"
                  className="service-label-container"
                />
              </div>

              <div className="service-item">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedServices.education}
                      onChange={() => handleServiceToggle('education')}
                      className="mui-checkbox"
                      size="small"
                    />
                  }
                  label="Education"
                  className="service-label-container"
                />
              </div>

              <div className="service-item">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedServices.reference}
                      onChange={() => handleServiceToggle('reference')}
                      className="mui-checkbox"
                      size="small"
                    />
                  }
                  label="Reference"
                  className="service-label-container"
                />
              </div>

              <div className="service-item">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedServices.documentation}
                      onChange={() => handleServiceToggle('documentation')}
                      className="mui-checkbox"
                      size="small"
                    />
                  }
                  label="Documentation"
                  className="service-label-container"
                />
              </div>

              <div className="service-item">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedServices.employment_information}
                      onChange={() => handleServiceToggle('employment_information')}
                      className="mui-checkbox"
                      size="small"
                    />
                  }
                  label="Employment Information"
                  className="service-label-container"
                />
              </div>

              <div className="service-item">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedServices.tenancy_information}
                      onChange={() => handleServiceToggle('tenancy_information')}
                      className="mui-checkbox"
                      size="small"
                    />
                  }
                  label="Tenancy Information"
                  className="service-label-container"
                />
              </div>

              <div className="service-item">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedServices.residential}
                      onChange={() => handleServiceToggle('residential')}
                      className="mui-checkbox"
                      size="small"
                    />
                  }
                  label="Residential"
                  className="service-label-container"
                />
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="add-client-footer">
          <Button
            color="link"
            onClick={toggle}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSave}
            className="save-button"
            disabled={!formData.clientName || !formData.clientEmail || selectedCount === 0 || loading || fetching}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EditClient;