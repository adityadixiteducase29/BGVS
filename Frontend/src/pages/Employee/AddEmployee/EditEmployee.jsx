import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import { TextField, Select, MenuItem, FormControl, InputLabel, Chip, OutlinedInput } from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import apiService from '../../../services/api';
import './AddEmployee.css';
import { toast } from 'react-toastify';

const EditEmployee = ({ modal, toggle, refreshFlag, setRefreshFlag, employeeData }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    password: '',
    assignToCompany: []
  });

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      assignToCompany: typeof value === 'string' ? value.split(',') : value,
    }));
    
    // Close the dropdown after selection
    setDropdownOpen(false);
  };

  const handleRemoveCompany = (companyToRemove) => {
    setFormData(prev => ({
      ...prev,
      assignToCompany: prev.assignToCompany.filter(companyId => companyId !== companyToRemove)
    }));
  };

  // Populate form when employeeData changes
  useEffect(() => {
    if (employeeData && modal) {
      setFormData({
        employeeName: employeeData.name || '',
        employeeEmail: employeeData.email || '',
        password: '', // Don't populate password for security
        assignToCompany: employeeData.assigned_company_ids || []
      });
    }
  }, [employeeData, modal]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        apiService.setToken(token);
        const response = await apiService.getCompaniesDropdown();
        
        if (response.success) {
          setCompanies(response.data);
        } else {
          console.error('Failed to fetch companies:', response.message);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    if (modal) {
      fetchCompanies();
    }
  }, [modal]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const updateData = {
        name: formData.employeeName,
        email: formData.employeeEmail,
        assignToCompany: formData.assignToCompany
      };

      // Only include password if it's been changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      apiService.setToken(token);
      const result = await apiService.updateEmployee(employeeData.id, updateData);

      console.log('Employee updated successfully:', result.data);

      // Reset form
      setFormData({
        employeeName: '',
        employeeEmail: '',
        password: '',
        assignToCompany: []
      });
      toggle();
      toast.success('Employee updated successfully!');
      setRefreshFlag(!refreshFlag);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle} size="lg" className="add-client-modal">
        <ModalHeader toggle={toggle} className="add-client-header">
          <h2 className="modal-title">Edit Employee</h2>
        </ModalHeader>

        <ModalBody className="add-client-body">
          <Row className='mb-3'>
            <Col md={6}>
              <TextField
                fullWidth
                name="employeeEmail"
                value={formData.employeeEmail}
                onChange={handleInputChange}
                label="Employee Email"
                type="email"
                placeholder="Enter employee email"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                className="form-field"
              />
            </Col>
            <Col md={6}>
              <TextField
                fullWidth
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                label="Employee Name"
                type="text"
                placeholder="Enter employee name"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                className="form-field"
              />
            </Col>
          </Row>
          <Row className='mb-3'>
            <Col md={6}>
              <TextField
                fullWidth
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                label="Password (Leave blank to keep current)"
                type="password"
                placeholder="Enter new password"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                className="form-field"
              />
            </Col>
            <Col md={6}>
              <FormControl fullWidth className="form-field company-select-field">
                <InputLabel id="company-select-label">Assign to Company</InputLabel>
                <Select
                  labelId="company-select-label"
                  id="company-select"
                  multiple
                  open={dropdownOpen}
                  onOpen={() => setDropdownOpen(true)}
                  onClose={() => setDropdownOpen(false)}
                  value={formData.assignToCompany}
                  onChange={handleCompanyChange}
                  input={<OutlinedInput label="Assign to Company" />}
                  renderValue={(selected) => {
                    return selected.length > 0 ? `${selected.length} selected` : '';
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        zIndex: 9999
                      }
                    }
                  }}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.value} value={company.value}>
                      {company.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Selected Companies Display */}
            </Col>
          </Row>
          <Row>
          {formData.assignToCompany.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#49454F', 
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    Selected Companies:
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 8,
                    maxHeight: '120px',
                    overflow: 'auto',
                    padding: '8px 0'
                  }}>
                    {formData.assignToCompany.map((value) => {
                      const company = companies.find(c => c.value === value);
                      return (
                        <Chip 
                          key={value} 
                          label={company ? company.label : value} 
                          size="small"
                          style={{ 
                            backgroundColor: '#6750A4', 
                            color: 'white'
                          }}
                          onDelete={() => handleRemoveCompany(value)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
          </Row>
        </ModalBody>

        <ModalFooter className="add-client-footer">
          <Button
            color="link"
            onClick={toggle}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSave}
            className="save-button"
            disabled={!formData.employeeName || !formData.employeeEmail || formData.assignToCompany.length === 0 || loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EditEmployee;