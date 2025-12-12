import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import { TextField, Box, Typography, Divider, Paper, CardContent, CardHeader, IconButton, Chip, Alert } from '@mui/material';
import { Row, Col, Input, Label } from 'reactstrap';
import { Close, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiService from '@/services/api';
import { toast } from 'react-toastify';
import './EditApplication.css';
import '../UserForm/Document/index.css';

const EditApplication = ({ isOpen, toggle, applicationId, onUpdateComplete }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [formData, setFormData] = useState({
    applicant_first_name: '',
    applicant_last_name: '',
    applicant_email: '',
    applicant_phone: '',
    applicant_dob: '',
    gender: '',
    languages: '',
    father_name: '',
    mother_name: '',
    emergency_contact_number: '',
    current_house_no: '',
    current_area_locality: '',
    current_area_locality_2: '',
    current_district: '',
    current_police_station: '',
    current_pincode: '',
    current_tehsil: '',
    current_post_office: '',
    current_landmark: '',
    use_current_as_permanent: false,
    permanent_house_no: '',
    permanent_area_locality: '',
    permanent_area_locality_2: '',
    permanent_district: '',
    permanent_police_station: '',
    permanent_pincode: '',
    permanent_tehsil: '',
    permanent_post_office: '',
    permanent_landmark: '',
    highest_education: '',
    institute_name: '',
    education_city: '',
    grades: '',
    education_from_date: '',
    education_to_date: '',
    education_address: '',
    reference1_name: '',
    reference1_address: '',
    reference1_relation: '',
    reference1_contact: '',
    reference1_police_station: '',
    reference2_name: '',
    reference2_address: '',
    reference2_relation: '',
    reference2_contact: '',
    reference2_police_station: '',
    reference3_name: '',
    reference3_address: '',
    reference3_relation: '',
    reference3_contact: '',
    reference3_police_station: '',
    aadhar_number: '',
    pan_number: '',
    company_name: '',
    designation: '',
    employee_id: '',
    employment_location: '',
    employment_from_date: '',
    employment_to_date: '',
    hr_number: '',
    hr_email: '',
    work_responsibility: '',
    salary: '',
    reason_of_leaving: '',
    previous_manager: '',
    neighbour1_family_members: '',
    neighbour1_name: '',
    neighbour1_mobile: '',
    neighbour1_since: '',
    neighbour1_remark: '',
    neighbour2_name: '',
    neighbour2_mobile: '',
    neighbour2_since: '',
    neighbour2_remark: '',
    residing_date: '',
    residing_remark: '',
    bike_quantity: '',
    car_quantity: '',
    ac_quantity: '',
    place: '',
    house_owner_name: '',
    house_owner_contact: '',
    house_owner_address: '',
    residing: '',
    // File fields - these will be File objects or null
    aadhar_front: null,
    aadhar_back: null,
    passport_photo: null,
    pan_card: null,
    voter_id: null,
    driving_license: null,
    passport: null,
    ele: null,
    other_document: null,
    marksheet_10th: null,
    marksheet_12th: null,
    provisional_certificate: null,
    offer_letter: null,
    pay_slip: null,
    resignation: null,
    experience_letter: null,
    bank_statement: null,
    employment_certificate: null,
  });

  // Fetch application data when modal opens
  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicationData();
    }
  }, [isOpen, applicationId]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getApplicationDetails(applicationId);
      
      if (response.success) {
        setApplicationData(response.data);
        
        // Map application data to form data
        const mappedData = { ...response.data };
        
        // Initialize file fields as null (they'll be handled separately)
        const fileFields = [
          'aadhar_front', 'aadhar_back', 'passport_photo', 'pan_card', 'voter_id',
          'driving_license', 'passport', 'ele', 'other_document',
          'marksheet_10th', 'marksheet_12th', 'provisional_certificate',
          'offer_letter', 'pay_slip', 'resignation', 'experience_letter',
          'bank_statement', 'employment_certificate'
        ];
        fileFields.forEach(field => {
          mappedData[field] = null;
        });
        
        setFormData(mappedData);
        
        // Set existing files
        if (response.data.files) {
          setExistingFiles(response.data.files);
        }
      } else {
        toast.error(response.message || 'Failed to fetch application data');
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
      toast.error('Failed to fetch application data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleDeleteFile = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await apiService.deleteDocument(documentId);
      if (response.success) {
        toast.success('Document deleted successfully');
        setExistingFiles(prev => prev.filter(file => file.id !== documentId));
      } else {
        toast.error(response.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleClearNewFile = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
    const fileInput = document.getElementById(field);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await apiService.updateApplication(applicationId, formData);
      
      if (response.success) {
        toast.success('Application updated successfully');
        if (onUpdateComplete) {
          onUpdateComplete();
        }
        toggle();
      } else {
        toast.error(response.message || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  const CustomFileUpload = ({ field, accept, label, description }) => {
    const uploadedFile = formData[field];
    // Match by document_type (which stores the field name) or fieldName
    const existingFile = existingFiles.find(f => 
      f.document_type === field || 
      f.fieldName === field ||
      (f.document_name && f.document_name.toLowerCase().includes(field.replace(/_/g, ' ')))
    );
    
    return (
      <div className="upload-box">
        <div className="upload-content">
          <div>
            <Typography variant="h6" className="upload-title">
              {label}
            </Typography>
            <Typography variant="body2" className="upload-description">
              {description}
            </Typography>
          </div>
        </div>
        
        {/* Show existing file if any */}
        {existingFile && !uploadedFile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
            <Chip
              label={existingFile.document_name || existingFile.originalName || 'Existing file'}
              variant="outlined"
              color="primary"
            />
            <IconButton
              size="small"
              onClick={() => handleDeleteFile(existingFile.id)}
              sx={{ color: '#d32f2f' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        
        <Input
          id={field}
          type="file"
          onChange={(e) => handleFileChange(field, e.target.files[0] || null)}
          accept={accept}
          className="file-upload-input"
        />
        
        {uploadedFile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              label={uploadedFile.name.length > 25 ? uploadedFile.name.substring(0, 25) + '...' : uploadedFile.name}
              variant="outlined"
              color="primary"
            />
            <IconButton
              size="small"
              onClick={() => handleClearNewFile(field)}
              sx={{ color: '#d32f2f' }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Label 
            htmlFor={field} 
            className="btn btn-outline-secondary mb-0 file-upload-button file-upload-label"
          >
            {existingFile ? 'Replace file' : 'Choose file'}
          </Label>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
        <ModalHeader toggle={toggle}>Edit Application</ModalHeader>
        <ModalBody>
          <div className="text-center p-4">
            <div>Loading application data...</div>
          </div>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Modal isOpen={isOpen} toggle={toggle} size="xl" centered className="edit-application-modal">
        <ModalHeader toggle={toggle}>
          <Typography variant="h5" sx={{ fontWeight: 500, color: '#4A4458' }}>
            Edit Application - {formData.applicant_first_name} {formData.applicant_last_name}
          </Typography>
        </ModalHeader>
        <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === '1' ? 'active' : ''}
                onClick={() => setActiveTab('1')}
                style={{ cursor: 'pointer' }}
              >
                Personal Info
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '2' ? 'active' : ''}
                onClick={() => setActiveTab('2')}
                style={{ cursor: 'pointer' }}
              >
                Education
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '3' ? 'active' : ''}
                onClick={() => setActiveTab('3')}
                style={{ cursor: 'pointer' }}
              >
                Reference
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '4' ? 'active' : ''}
                onClick={() => setActiveTab('4')}
                style={{ cursor: 'pointer' }}
              >
                Documents
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '5' ? 'active' : ''}
                onClick={() => setActiveTab('5')}
                style={{ cursor: 'pointer' }}
              >
                Employment
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '6' ? 'active' : ''}
                onClick={() => setActiveTab('6')}
                style={{ cursor: 'pointer' }}
              >
                Tenancy
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '7' ? 'active' : ''}
                onClick={() => setActiveTab('7')}
                style={{ cursor: 'pointer' }}
              >
                Residency
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab}>
            {/* Personal Information Tab */}
            <TabPane tabId="1">
              <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA', mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Personal Information
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.applicant_first_name || ''}
                      onChange={(e) => handleInputChange('applicant_first_name', e.target.value)}
                      required
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.applicant_last_name || ''}
                      onChange={(e) => handleInputChange('applicant_last_name', e.target.value)}
                      required
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.applicant_email || ''}
                      onChange={(e) => handleInputChange('applicant_email', e.target.value)}
                      required
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.applicant_phone || ''}
                      onChange={(e) => handleInputChange('applicant_phone', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.applicant_dob ? new Date(formData.applicant_dob) : null}
                      onChange={(date) => handleInputChange('applicant_dob', date ? date.toISOString().split('T')[0] : '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputLabelProps: { shrink: true }
                        }
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Gender"
                      value={formData.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Languages"
                      value={formData.languages || ''}
                      onChange={(e) => handleInputChange('languages', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Father's Name"
                      value={formData.father_name || ''}
                      onChange={(e) => handleInputChange('father_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mother's Name"
                      value={formData.mother_name || ''}
                      onChange={(e) => handleInputChange('mother_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Emergency Contact"
                      value={formData.emergency_contact_number || ''}
                      onChange={(e) => handleInputChange('emergency_contact_number', e.target.value)}
                    />
                  </Col>
                </Row>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Current Address
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="House No"
                      value={formData.current_house_no || ''}
                      onChange={(e) => handleInputChange('current_house_no', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Area/Locality"
                      value={formData.current_area_locality || ''}
                      onChange={(e) => handleInputChange('current_area_locality', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="District"
                      value={formData.current_district || ''}
                      onChange={(e) => handleInputChange('current_district', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      value={formData.current_pincode || ''}
                      onChange={(e) => handleInputChange('current_pincode', e.target.value)}
                    />
                  </Col>
                </Row>
              </Paper>
            </TabPane>

            {/* Education Tab */}
            <TabPane tabId="2">
              <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA', mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Education Information
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Highest Education"
                      value={formData.highest_education || ''}
                      onChange={(e) => handleInputChange('highest_education', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Institute Name"
                      value={formData.institute_name || ''}
                      onChange={(e) => handleInputChange('institute_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.education_city || ''}
                      onChange={(e) => handleInputChange('education_city', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Grades"
                      value={formData.grades || ''}
                      onChange={(e) => handleInputChange('grades', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <DatePicker
                      label="From Date"
                      value={formData.education_from_date ? new Date(formData.education_from_date) : null}
                      onChange={(date) => handleInputChange('education_from_date', date ? date.toISOString().split('T')[0] : '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputLabelProps: { shrink: true }
                        }
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <DatePicker
                      label="To Date"
                      value={formData.education_to_date ? new Date(formData.education_to_date) : null}
                      onChange={(date) => handleInputChange('education_to_date', date ? date.toISOString().split('T')[0] : '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputLabelProps: { shrink: true }
                        }
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Col>
                  <Col xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={3}
                      value={formData.education_address || ''}
                      onChange={(e) => handleInputChange('education_address', e.target.value)}
                    />
                  </Col>
                </Row>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Education Documents
                </Typography>
                <CustomFileUpload
                  field="marksheet_10th"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="10th Marksheet"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="marksheet_12th"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="12th Marksheet"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="provisional_certificate"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Provisional Certificate"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
              </Paper>
            </TabPane>

            {/* Reference Tab */}
            <TabPane tabId="3">
              <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA', mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Reference 1
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={formData.reference1_name || ''}
                      onChange={(e) => handleInputChange('reference1_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact"
                      value={formData.reference1_contact || ''}
                      onChange={(e) => handleInputChange('reference1_contact', e.target.value)}
                    />
                  </Col>
                  <Col xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={2}
                      value={formData.reference1_address || ''}
                      onChange={(e) => handleInputChange('reference1_address', e.target.value)}
                    />
                  </Col>
                </Row>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Reference 2
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={formData.reference2_name || ''}
                      onChange={(e) => handleInputChange('reference2_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact"
                      value={formData.reference2_contact || ''}
                      onChange={(e) => handleInputChange('reference2_contact', e.target.value)}
                    />
                  </Col>
                </Row>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Reference 3
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={formData.reference3_name || ''}
                      onChange={(e) => handleInputChange('reference3_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact"
                      value={formData.reference3_contact || ''}
                      onChange={(e) => handleInputChange('reference3_contact', e.target.value)}
                    />
                  </Col>
                </Row>
              </Paper>
            </TabPane>

            {/* Documents Tab */}
            <TabPane tabId="4">
              <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA', mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Identity Documents
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Aadhar Number"
                      value={formData.aadhar_number || ''}
                      onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="PAN Number"
                      value={formData.pan_number || ''}
                      onChange={(e) => handleInputChange('pan_number', e.target.value)}
                    />
                  </Col>
                </Row>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Document Uploads
                </Typography>
                <CustomFileUpload
                  field="aadhar_front"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Aadhar Card Front"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="aadhar_back"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Aadhar Card Back"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="passport_photo"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Passport Photo"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="pan_card"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="PAN Card"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="voter_id"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Voter ID"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="driving_license"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Driving License"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="passport"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Passport"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="ele"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Electricity Bill"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="other_document"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Other Document"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
              </Paper>
            </TabPane>

            {/* Employment Tab */}
            <TabPane tabId="5">
              <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA', mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Employment Information
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={formData.company_name || ''}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      value={formData.designation || ''}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      value={formData.employee_id || ''}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.employment_location || ''}
                      onChange={(e) => handleInputChange('employment_location', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <DatePicker
                      label="From Date"
                      value={formData.employment_from_date ? new Date(formData.employment_from_date) : null}
                      onChange={(date) => handleInputChange('employment_from_date', date ? date.toISOString().split('T')[0] : '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputLabelProps: { shrink: true }
                        }
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <DatePicker
                      label="To Date"
                      value={formData.employment_to_date ? new Date(formData.employment_to_date) : null}
                      onChange={(date) => handleInputChange('employment_to_date', date ? date.toISOString().split('T')[0] : '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputLabelProps: { shrink: true }
                        }
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="HR Number"
                      value={formData.hr_number || ''}
                      onChange={(e) => handleInputChange('hr_number', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="HR Email"
                      value={formData.hr_email || ''}
                      onChange={(e) => handleInputChange('hr_email', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Salary"
                      value={formData.salary || ''}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                    />
                  </Col>
                </Row>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Employment Documents
                </Typography>
                <CustomFileUpload
                  field="offer_letter"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Offer Letter"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="pay_slip"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Pay Slip"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
                <CustomFileUpload
                  field="experience_letter"
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Experience Letter"
                  description="Files Supported: JPEG, PDF and PNG (max size 10mb)"
                />
              </Paper>
            </TabPane>

            {/* Tenancy Tab */}
            <TabPane tabId="6">
              <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA', mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Tenancy Information
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="House Owner Name"
                      value={formData.house_owner_name || ''}
                      onChange={(e) => handleInputChange('house_owner_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="House Owner Contact"
                      value={formData.house_owner_contact || ''}
                      onChange={(e) => handleInputChange('house_owner_contact', e.target.value)}
                    />
                  </Col>
                  <Col xs={12}>
                    <TextField
                      fullWidth
                      label="House Owner Address"
                      multiline
                      rows={3}
                      value={formData.house_owner_address || ''}
                      onChange={(e) => handleInputChange('house_owner_address', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Residing"
                      value={formData.residing || ''}
                      onChange={(e) => handleInputChange('residing', e.target.value)}
                    />
                  </Col>
                </Row>
              </Paper>
            </TabPane>

            {/* Residency Tab */}
            <TabPane tabId="7">
              <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA', mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
                  Residency Information
                </Typography>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Neighbor 1 Name"
                      value={formData.neighbour1_name || ''}
                      onChange={(e) => handleInputChange('neighbour1_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Neighbor 1 Mobile"
                      value={formData.neighbour1_mobile || ''}
                      onChange={(e) => handleInputChange('neighbour1_mobile', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Neighbor 2 Name"
                      value={formData.neighbour2_name || ''}
                      onChange={(e) => handleInputChange('neighbour2_name', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Neighbor 2 Mobile"
                      value={formData.neighbour2_mobile || ''}
                      onChange={(e) => handleInputChange('neighbour2_mobile', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Bike Quantity"
                      value={formData.bike_quantity || ''}
                      onChange={(e) => handleInputChange('bike_quantity', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Car Quantity"
                      value={formData.car_quantity || ''}
                      onChange={(e) => handleInputChange('car_quantity', e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="AC Quantity"
                      value={formData.ac_quantity || ''}
                      onChange={(e) => handleInputChange('ac_quantity', e.target.value)}
                    />
                  </Col>
                </Row>
              </Paper>
            </TabPane>
          </TabContent>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={saving}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: '#4F378B', color: 'white' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </LocalizationProvider>
  );
};

export default EditApplication;

