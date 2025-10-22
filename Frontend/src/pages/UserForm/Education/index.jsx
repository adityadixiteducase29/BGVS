import React, { useState } from 'react'
import {
  Typography,
  TextField,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { Row, Col, Input, Label } from 'reactstrap'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ArrowDropDown, Close } from '@mui/icons-material'
import Upload from '../Svg/Upload.svg'
import './index.css'

const Education = ({ formData, updateFormData }) => {
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)

  // Static list of Indian cities
  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Surat',
    'Lucknow',
    'Kanpur',
    'Nagpur',
    'Indore',
    'Thane',
    'Bhopal',
    'Visakhapatnam',
    'Pimpri-Chinchwad',
    'Patna',
    'Vadodara',
    'Ghaziabad',
    'Ludhiana',
    'Agra',
    'Nashik',
    'Faridabad',
    'Meerut',
    'Rajkot',
    'Kalyan-Dombivali',
    'Vasai-Virar',
    'Varanasi',
    'Srinagar',
    'Aurangabad',
    'Dhanbad',
    'Amritsar',
    'Allahabad',
    'Ranchi',
    'Howrah',
    'Coimbatore',
    'Jabalpur',
    'Gwalior',
    'Vijayawada',
    'Jodhpur',
    'Madurai',
    'Raipur',
    'Kota',
    'Guwahati',
    'Chandigarh',
    'Solapur',
    'Hubli-Dharwad',
    'Bareilly',
    'Moradabad',
    'Mysore',
    'Gurgaon',
    'Aligarh',
    'Jalandhar',
    'Tiruchirappalli',
    'Bhubaneswar',
    'Salem',
    'Warangal',
    'Mira-Bhayandar',
    'Thiruvananthapuram',
    'Bhiwandi',
    'Saharanpur',
    'Guntur',
    'Amravati',
    'Bikaner',
    'Noida',
    'Jamshedpur',
    'Bhilai',
    'Cuttack',
    'Firozabad',
    'Kochi',
    'Nellore',
    'Bhavnagar',
    'Dehradun',
    'Durgapur',
    'Asansol',
    'Rourkela',
    'Nanded',
    'Kolhapur',
    'Ajmer',
    'Akola',
    'Gulbarga',
    'Jamnagar',
    'Ujjain',
    'Loni',
    'Siliguri',
    'Jhansi',
    'Ulhasnagar',
    'Nellore',
    'Jammu',
    'Sangli-Miraj',
    'Belgaum',
    'Mangalore',
    'Ambattur',
    'Tirunelveli',
    'Malegaon',
    'Gaya',
    'Jalgaon',
    'Udaipur',
    'Maheshtala',
    'Tirupur',
    'Davanagere',
    'Kozhikode',
    'Akola',
    'Kurnool',
    'Rajpur Sonarpur',
    'Bokaro',
    'South Dumdum',
    'Bellary',
    'Patiala',
    'Gopalpur',
    'Agartala',
    'Bhagalpur',
    'Muzaffarnagar',
    'Bhatpara',
    'Panihati',
    'Latur',
    'Dhule',
    'Rohtak',
    'Korba',
    'Bhilwara',
    'Berhampur',
    'Muzaffarpur',
    'Ahmednagar',
    'Mathura',
    'Kollam',
    'Avadi',
    'Kadapa',
    'Kamarhati',
    'Bilaspur',
    'Shahjahanpur',
    'Satara',
    'Bijapur',
    'Rampur',
    'Shivamogga',
    'Chandrapur',
    'Junagadh',
    'Thrissur',
    'Alwar',
    'Bardhaman',
    'Kulti',
    'Kakinada',
    'Nizamabad',
    'Parbhani',
    'Tumkur',
    'Hisar',
    'Ozhukarai',
    'Bihar Sharif',
    'Panipat',
    'Darbhanga',
    'Bally',
    'Aizawl',
    'Dewas',
    'Ichalkaranji',
    'Tirupati',
    'Karnal',
    'Bathinda',
    'Raurkela',
    'Panchkula',
    'Rohtak',
    'Other'
  ]

  const handleFileChange = (field, file) => {
    updateFormData({ [field]: file })
  }

  const CustomFileUpload = ({ field, accept, id }) => {
    const uploadedFile = formData[field];
    
    const handleClearFile = () => {
      updateFormData({ [field]: null });
      // Clear the input value
      const fileInput = document.getElementById(id);
      if (fileInput) {
        fileInput.value = '';
      }
    };

    return (
      <div className="file-upload-container">
        <Input
          id={id}
          type="file"
          onChange={(e) => handleFileChange(field, e.target.files[0])}
          accept={accept}
          className="file-upload-input"
        />
        
        {uploadedFile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              label={uploadedFile.name.length > 25 ? uploadedFile.name.substring(0, 25) + '...' : uploadedFile.name}
              variant="outlined"
              color="primary"
              sx={{ 
                maxWidth: 200,
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }}
            />
            <IconButton
              size="small"
              onClick={handleClearFile}
              sx={{ 
                color: '#d32f2f',
                '&:hover': { 
                  backgroundColor: '#ffebee',
                  color: '#c62828'
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Label 
            for={id} 
            className="btn btn-outline-secondary mb-0 file-upload-button file-upload-label"
          >
            Choose file
          </Label>
        )}
      </div>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
        <CardHeader
          title={
            <Typography variant="h5" sx={{ fontWeight: 500, color: '#4A4458' }}>
              Education
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <Divider sx={{ mb: 2 }} />
        <CardContent sx={{ pt: 0 }}>
          {/* Educational Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
              Educational Details
            </Typography>
            <Row className="g-3">
              {/* Row 1 */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Highest Education Qualifications"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.highest_education || ''}
                  onChange={(e) => updateFormData({ highest_education: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      '& fieldset': {
                        borderColor: '#79747E'
                      },
                      '&:hover fieldset': {
                        borderColor: '#6750A4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6750A4'
                      }
                    }
                  }}
                />
              </Col>
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Institute Name"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.institute_name || ''}
                  onChange={(e) => updateFormData({ institute_name: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      '& fieldset': {
                        borderColor: '#79747E'
                      },
                      '&:hover fieldset': {
                        borderColor: '#6750A4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6750A4'
                      }
                    }
                  }}
                />
              </Col>
              {/* Row 2 */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Grades"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.grades || ''}
                  onChange={(e) => updateFormData({ grades: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      '& fieldset': {
                        borderColor: '#79747E'
                      },
                      '&:hover fieldset': {
                        borderColor: '#6750A4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6750A4'
                      }
                    }
                  }}
                />
              </Col>
              <Col className="col-12 col-md-6">
                <FormControl fullWidth>
                  <InputLabel id="city-select-label" sx={{ color: '#79747E' }}>
                    City
                  </InputLabel>
                  <Select
                    labelId="city-select-label"
                    value={formData.education_city || ''}
                    label="City"
                    onChange={(e) => updateFormData({ education_city: e.target.value })}
                    sx={{
                      height: 56,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#79747E'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6750A4'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6750A4'
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Select City</em>
                    </MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Col>
              {/* Row 3 - Date Range */}
              <Col className="col-12 col-md-6">
                <DatePicker
                  label="From"
                  value={fromDate}
                  onChange={(newDate) => {
                    setFromDate(newDate);
                    updateFormData({ education_from_date: newDate ? newDate.toISOString().split('T')[0] : '' });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: "Select Date",
                      variant: "outlined",
                      InputLabelProps: { shrink: true },
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          height: 56,
                          '& fieldset': {
                            borderColor: '#79747E'
                          },
                          '&:hover fieldset': {
                            borderColor: '#6750A4'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6750A4'
                          }
                        }
                      }
                    }
                  }}
                  format="MM/dd/yyyy"
                />
                <Typography variant="caption" sx={{ color: '#49454F', mt: 0.5, display: 'block' }}>
                  MM/DD/YYYY
                </Typography>
              </Col>
              <Col className="col-12 col-md-6">
                <DatePicker
                  label="To"
                  value={toDate}
                  onChange={(newDate) => {
                    setToDate(newDate);
                    updateFormData({ education_to_date: newDate ? newDate.toISOString().split('T')[0] : '' });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: "Select Date",
                      variant: "outlined",
                      InputLabelProps: { shrink: true },
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          height: 56,
                          '& fieldset': {
                            borderColor: '#79747E'
                          },
                          '&:hover fieldset': {
                            borderColor: '#6750A4'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6750A4'
                          }
                        }
                      }
                    }
                  }}
                  format="MM/dd/yyyy"
                />
                <Typography variant="caption" sx={{ color: '#49454F', mt: 0.5, display: 'block' }}>
                  MM/DD/YYYY
                </Typography>
              </Col>
              {/* Row 4 - Current Address */}
              <Col className="col-12">
                <TextField
                  fullWidth
                  label="Current Address"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  multiline
                  minRows={2}
                  value={formData.education_address || ''}
                  onChange={(e) => updateFormData({ education_address: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#79747E'
                      },
                      '&:hover fieldset': {
                        borderColor: '#6750A4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6750A4'
                      }
                    }
                  }}
                />
              </Col>
            </Row>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Marksheets/Certificates Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
              Marksheets/Certificates
            </Typography>

            {/* 10th Marksheet Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Upload 10th Marksheet
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="marksheet_10th"
                accept=".jpg,.jpeg,.png,.pdf"
                id="tenthMarksheetUpload"
              />
            </div>

            {/* 12th Marksheet Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Upload 12th Marksheet
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="marksheet_12th"
                accept=".jpg,.jpeg,.png,.pdf"
                id="twelfthMarksheetUpload"
              />
            </div>

            {/* Provisional Certificate/Degree Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Provisional Certificate/Degree
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="provisional_certificate"
                accept=".jpg,.jpeg,.png,.pdf"
                id="provisionalCertificateUpload"
              />
            </div>
          </Box>
        </CardContent>
      </Paper>
    </LocalizationProvider>
  )
}

export default Education