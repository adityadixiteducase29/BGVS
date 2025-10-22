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
  Chip
} from '@mui/material'
import { Row, Col, Input, Label } from 'reactstrap'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Close } from '@mui/icons-material'
import Upload from '../Svg/Upload.svg'
import './index.css'

const EmploymentDetails = ({ formData, updateFormData }) => {
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)

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
              Employment Information
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <Divider sx={{ mb: 2 }} />
        <CardContent sx={{ pt: 0 }}>
          
          {/* Company Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
              Company details
            </Typography>
            <Row className="g-3">
              {/* Row 1: Company Name (50%) + Designation (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Company Name"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.company_name || ''}
                  onChange={(e) => updateFormData({ company_name: e.target.value })}
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
                  label="Designation"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.designation || ''}
                  onChange={(e) => updateFormData({ designation: e.target.value })}
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
              {/* Row 2: Employee ID (50%) + Location (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Employee ID"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.employee_id || ''}
                  onChange={(e) => updateFormData({ employee_id: e.target.value })}
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
                  label="Location"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.employment_location || ''}
                  onChange={(e) => updateFormData({ employment_location: e.target.value })}
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
              {/* Row 3: HR Number (50%) + HR Email (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="HR Number"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.hr_number || ''}
                  onChange={(e) => updateFormData({ hr_number: e.target.value })}
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
                  label="HR Email"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.hr_email || ''}
                  onChange={(e) => updateFormData({ hr_email: e.target.value })}
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
              {/* Row 4: Work Responsibility (50%) + Salary (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Work Responsibility"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.work_responsibility || ''}
                  onChange={(e) => updateFormData({ work_responsibility: e.target.value })}
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
                  label="Salary"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.salary || ''}
                  onChange={(e) => updateFormData({ salary: e.target.value })}
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
              {/* Row 5: Date Range */}
              <Col className="col-12 col-md-6">
                <DatePicker
                  label="From"
                  value={fromDate}
                  onChange={(newDate) => {
                    setFromDate(newDate);
                    updateFormData({ employment_from_date: newDate ? newDate.toISOString().split('T')[0] : '' });
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
                    updateFormData({ employment_to_date: newDate ? newDate.toISOString().split('T')[0] : '' });
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
              {/* Row 6: Reason of leaving (100%) */}
              <Col className="col-12">
                <TextField
                  fullWidth
                  label="Reason of leaving"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.reason_of_leaving || ''}
                  onChange={(e) => updateFormData({ reason_of_leaving: e.target.value })}
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
              {/* Row 7: Previous Manager (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Previous Manager"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.previous_manager || ''}
                  onChange={(e) => updateFormData({ previous_manager: e.target.value })}
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
            </Row>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Documents Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
              Documents
            </Typography>
            
            {/* Offer Letter Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Offer Letter
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="offer_letter"
                accept=".jpg,.jpeg,.png,.pdf"
                id="offerLetterUpload"
              />
            </div>

            {/* Pay Slip Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Pay Slip
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="pay_slip"
                accept=".jpg,.jpeg,.png,.pdf"
                id="paySlipUpload"
              />
            </div>

            {/* Resignation Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Resignation
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="resignation"
                accept=".jpg,.jpeg,.png,.pdf"
                id="resignationUpload"
              />
            </div>

            {/* Experience Letter Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Experience Letter
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="experience_letter"
                accept=".jpg,.jpeg,.png,.pdf"
                id="experienceLetterUpload"
              />
            </div>

            {/* Bank Statement Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Bank Statement
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="bank_statement"
                accept=".jpg,.jpeg,.png,.pdf"
                id="bankStatementUpload"
              />
            </div>

            {/* Employment Check Result Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Employment Check Result
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="employment_check_result"
                accept=".jpg,.jpeg,.png,.pdf"
                id="employmentCheckResultUpload"
              />
            </div>

            {/* Employment Certificate Add Upload */}
            <div className="upload-box">
              <div className="upload-content">
                <img src={Upload} alt="Upload" className="upload-icon" />
                <div>
                  <Typography variant="h6" className="upload-title">
                    Employment Certificate Add
                  </Typography>
                  <Typography variant="body2" className="upload-description">
                    Files Supported: JPEG, PDF and PNG (max size 2mb)
                  </Typography>
                </div>
              </div>
              <CustomFileUpload 
                field="employment_certificate"
                accept=".jpg,.jpeg,.png,.pdf"
                id="employmentCertificateUpload"
              />
            </div>
          </Box>

        </CardContent>
      </Paper>
    </LocalizationProvider>
  )
}

export default EmploymentDetails