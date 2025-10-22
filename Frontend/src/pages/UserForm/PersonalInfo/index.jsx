import React, { useState } from 'react'
import './index.css'
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Box,
  Divider,
  Paper,
  CardContent,
  CardHeader,
  Button,
  Alert,
  Snackbar
} from '@mui/material'
import { Row, Col } from "reactstrap"
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Search as SearchIcon } from '@mui/icons-material'

const PersonalInformation = ({ companyId, formData, updateFormData }) => {
  const [date, setDate] = useState(null)
  const [useCurrentAddress, setUseCurrentAddress] = useState(false)
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const genderDropdown = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
        <CardHeader
          title={<Typography variant="h5" className="main-title">Personal Information</Typography>}
          sx={{ pb: 1 }}
        />
        <Divider sx={{ mb: 2 }} />
        <CardContent sx={{ pt: 0 }}>
          {/* Basic Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" className="section-header">Basic Details</Typography>
            {/* Row 1: First Name (50%) + Last Name (50%) */}
            <Row className="g-3">
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  placeholder="Enter your first name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.applicant_first_name}
                  onChange={(e) => handleInputChange('applicant_first_name', e.target.value)}
                  required
                />
              </Col>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  placeholder="Enter your last name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.applicant_last_name}
                  onChange={(e) => handleInputChange('applicant_last_name', e.target.value)}
                  required
                />
              </Col>
            </Row>
            {/* Row 2: Email ID (50%) + Contact Number (50%) */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email ID"
                  type="email"
                  placeholder="Enter your email address"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.applicant_email}
                  onChange={(e) => handleInputChange('applicant_email', e.target.value)}
                  required
                />
              </Col>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  placeholder="Enter your phone number"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.applicant_phone}
                  onChange={(e) => handleInputChange('applicant_phone', e.target.value)}
                />
              </Col>
            </Row>
            {/* Row 2: Gender (33%) + Contact Number (33%) + Languages (33%) */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel className='gender-label' shrink>Gender</InputLabel>
                  <Select
                    value={formData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    displayEmpty
                    renderValue={(value) => {
                      if (value === '') {
                        return <span style={{ color: '#999' }}>Select Gender</span>;
                      }
                      return genderDropdown.find(option => option.id === value)?.label;
                    }}
                  >
                    {genderDropdown.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Languages"
                  placeholder="Enter languages you know"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.languages || ''}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  // InputProps={{
                  //   startAdornment: <SearchIcon className="search-icon" />
                  // }}
                />
              </Col>
            </Row>
            {/* Row 3: Date of Birth (50%) centered */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={6}>
                <DatePicker
                  label="Date of Birth"
                  value={date}
                  onChange={(newDate) => {
                    setDate(newDate);
                    handleInputChange('applicant_dob', newDate ? newDate.toISOString().split('T')[0] : '');
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: "Enter Date of Birth",
                      variant: "outlined",
                      InputLabelProps: { shrink: true },
                      className: "form-field"
                    }
                  }}
                  format="dd/MM/yyyy"
                />
              </Col>
            </Row>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Family & Emergency Contacts Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" className="section-header">
              Family & Emergency Contacts
            </Typography>
            {/* Row: Father Name (33%) + Mother Name (33%) + Emergency Contact (33%) */}
            <Row className="g-3">
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Father Name"
                  placeholder="Enter your father's name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.father_name || ''}
                  onChange={(e) => handleInputChange('father_name', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mother Name"
                  placeholder="Enter your mother's name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.mother_name || ''}
                  onChange={(e) => handleInputChange('mother_name', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  placeholder="Enter emergency contact"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.emergency_contact_number || ''}
                  onChange={(e) => handleInputChange('emergency_contact_number', e.target.value)}
                />
              </Col>
            </Row>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Current Address Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" className="section-header">
              Current Address
            </Typography>
            {/* Row 1: House No. (50%) + Area/Locality (50%) */}
            <Row className="g-3">
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="House No."
                  placeholder="Enter house number"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_house_no || ''}
                  onChange={(e) => handleInputChange('current_house_no', e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Area/Locality"
                  placeholder="Enter area or locality"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_area_locality || ''}
                  onChange={(e) => handleInputChange('current_area_locality', e.target.value)}
                />
              </Col>
            </Row>
            {/* Row 2: Area/Locality 2 (50%) + District (50%) */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Area/Locality 2"
                  placeholder="Enter additional area details"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_area_locality_2 || ''}
                  onChange={(e) => handleInputChange('current_area_locality_2', e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="District"
                  placeholder="Enter district name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_district || ''}
                  onChange={(e) => handleInputChange('current_district', e.target.value)}
                />
              </Col>
            </Row>
            {/* Row 3: Police Station (33%) + Pincode (33%) + Tehsil (33%) */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Police Station"
                  placeholder="Enter police station name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_police_station || ''}
                  onChange={(e) => handleInputChange('current_police_station', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pincode"
                  placeholder="Enter 6-digit pincode"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_pincode || ''}
                  onChange={(e) => handleInputChange('current_pincode', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tehsil"
                  placeholder="Enter tehsil name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_tehsil || ''}
                  onChange={(e) => handleInputChange('current_tehsil', e.target.value)}
                />
              </Col>
            </Row>
            {/* Row 4: Post Office (33%) + Landmark (33%) */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Post Office"
                  placeholder="Enter post office name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_post_office || ''}
                  onChange={(e) => handleInputChange('current_post_office', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Landmark"
                  placeholder="Enter nearby landmark"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.current_landmark || ''}
                  onChange={(e) => handleInputChange('current_landmark', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}></Col> {/* empty to complete row structure */}
            </Row>
            {/* Row 5: Current Address (100%) */}
            <Row className="g-3 mt-1">
              <Col xs={12}>
                <TextField
                  fullWidth
                  label="Current Address"
                  placeholder="Enter your complete current address"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  multiline
                  minRows={2}
                  value={formData.current_address || ''}
                  onChange={(e) => handleInputChange('current_address', e.target.value)}
                />
              </Col>
            </Row>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Permanent Address Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" className="section-header">
              Permanent Address
            </Typography>
            
            {/* Checkbox for using current address as permanent */}
            <Row className="g-3 mb-3">
              <Col xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.use_current_as_permanent || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        handleInputChange('use_current_as_permanent', isChecked);
                        
                        // If checked, copy current address to permanent address
                        if (isChecked) {
                          const addressFields = {
                            permanent_house_no: formData.current_house_no || '',
                            permanent_area_locality: formData.current_area_locality || '',
                            permanent_area_locality_2: formData.current_area_locality_2 || '',
                            permanent_district: formData.current_district || '',
                            permanent_police_station: formData.current_police_station || '',
                            permanent_pincode: formData.current_pincode || '',
                            permanent_tehsil: formData.current_tehsil || '',
                            permanent_post_office: formData.current_post_office || '',
                            permanent_landmark: formData.current_landmark || '',
                            permanent_address: formData.current_address || ''
                          };
                          
                          // Update all permanent address fields at once
                          updateFormData(addressFields);
                        }
                      }}
                    />
                  }
                  label="Use Current Address as Permanent Address"
                />
              </Col>
            </Row>

            {/* Row 1: House No. (50%) + Area/Locality (50%) */}
            <Row className="g-3">
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="House No."
                  placeholder="Enter house number"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_house_no || ''}
                  onChange={(e) => handleInputChange('permanent_house_no', e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Area/Locality"
                  placeholder="Enter area or locality"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_area_locality || ''}
                  onChange={(e) => handleInputChange('permanent_area_locality', e.target.value)}
                />
              </Col>
            </Row>
            {/* Row 2: Area/Locality 2 (50%) + District (50%) */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Area/Locality 2"
                  placeholder="Enter additional area details"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_area_locality_2 || ''}
                  onChange={(e) => handleInputChange('permanent_area_locality_2', e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <TextField
                  fullWidth
                  label="District"
                  placeholder="Enter district name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_district || ''}
                  onChange={(e) => handleInputChange('permanent_district', e.target.value)}
                />
              </Col>
            </Row>
            {/* Row 3: Police Station (33%) + Pincode (33%) + Tehsil (33%) */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Police Station"
                  placeholder="Enter police station name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_police_station || ''}
                  onChange={(e) => handleInputChange('permanent_police_station', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pincode"
                  placeholder="Enter 6-digit pincode"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_pincode || ''}
                  onChange={(e) => handleInputChange('permanent_pincode', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tehsil"
                  placeholder="Enter tehsil name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_tehsil || ''}
                  onChange={(e) => handleInputChange('permanent_tehsil', e.target.value)}
                />
              </Col>
            </Row>
            {/* Row 4: Post Office (33%) + Landmark (33%) */}
            <Row className="g-3 mt-1">
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Post Office"
                  placeholder="Enter post office name"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_post_office || ''}
                  onChange={(e) => handleInputChange('permanent_post_office', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Landmark"
                  placeholder="Enter nearby landmark"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  value={formData.permanent_landmark || ''}
                  onChange={(e) => handleInputChange('permanent_landmark', e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}></Col> {/* empty to complete row structure */}
            </Row>
            {/* Row 5: Permanent Address (100%) */}
            <Row className="g-3 mt-1">
              <Col xs={12}>
                <TextField
                  fullWidth
                  label="Permanent Address"
                  placeholder="Enter your complete permanent address"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                  multiline
                  minRows={2}
                  value={formData.permanent_address || ''}
                  onChange={(e) => handleInputChange('permanent_address', e.target.value)}
                />
              </Col>
            </Row>
          </Box>

          {/* Submit Button */}

          {/* Success Message */}
          {/* <Snackbar
            open={submitted}
            autoHideDuration={6000}
            onClose={() => setSubmitted(false)}
          >
            <Alert onClose={() => setSubmitted(false)} severity="success">
              Application submitted successfully!
            </Alert>
          </Snackbar> */}
        </CardContent>
      </Paper>
    </LocalizationProvider>
  )
}

export default PersonalInformation
