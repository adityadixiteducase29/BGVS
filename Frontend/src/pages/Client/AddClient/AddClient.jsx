import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import { TextField, Checkbox, FormControlLabel } from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import apiService from '../../../services/api';
import './AddClient.css';

const AddClient = ({ modal, toggle, onClientAdded }) => {
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
  const [error, setError] = useState('');

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

      // Prepare data for API
      const clientData = {
        name: formData.clientName,
        email: formData.clientEmail,
        password: formData.password,
        services: selectedServices
      };

      // Get auth token from Redux store
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Set token in API service
      apiService.setToken(token);

      // Make API call using the API service
      const result = await apiService.request('/companies', {
        method: 'POST',
        body: JSON.stringify(clientData)
      });

      // Success - close modal and reset form
      console.log('Client created successfully:', result.data);

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
      if (onClientAdded) {
        onClientAdded();
      }

      // You can add a success notification here
      alert('Client created successfully!');

    } catch (error) {
      console.error('Error creating client:', error);
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
          <h2 className="modal-title">Add Client</h2>
        </ModalHeader>

        <ModalBody className="add-client-body">
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
                  label="Password"
                  type="password"
                  placeholder="Enter password"
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
            disabled={!formData.clientName || !formData.clientEmail || !formData.password || selectedCount === 0 || loading}
          >
            {loading ? 'Creating...' : 'Save'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AddClient;