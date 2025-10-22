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
import { Close } from '@mui/icons-material'
import './index.css'
import Upload from '../Svg/Upload.svg'

const Document = ({ formData, updateFormData }) => {

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
    <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
      <CardHeader
        title={
          <Typography variant="h5" sx={{ fontWeight: 500, color: '#4A4458' }}>
            Documents
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <Divider sx={{ mb: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        
        {/* Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
            Details
          </Typography>
          <Row className="g-3">
            {/* Row 1: Aadhar Card Number (50%) + PAN Card Number (50%) */}
            <Col className="col-12 col-md-6">
              <TextField
                fullWidth
                label="Aadhar Card Number"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.aadhar_number || ''}
                onChange={(e) => updateFormData({ aadhar_number: e.target.value })}
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
                label="PAN Card Number"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.pan_number || ''}
                onChange={(e) => updateFormData({ pan_number: e.target.value })}
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
          
          {/* Aadhar Card Front Side Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Upload Aadhar Card Front Side
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
                          <CustomFileUpload 
                field="aadhar_front"
                accept=".jpg,.jpeg,.png,.pdf"
                id="aadharFrontUpload"
              />
          </div>

          {/* Aadhar Card Back Side Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Upload Aadhar Card Back Side
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
                          <CustomFileUpload 
                field="aadhar_back"
                accept=".jpg,.jpeg,.png,.pdf"
                id="aadharBackUpload"
              />
          </div>

          {/* Passport Size Photo Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Passport Size Photo
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
                          <CustomFileUpload 
                field="passport_photo"
                accept=".jpg,.jpeg,.png,.pdf"
                id="passportPhotoUpload"
              />
          </div>

          {/* PAN Card Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Pan Card
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
                          <CustomFileUpload 
                field="pan_card"
                accept=".jpg,.jpeg,.png,.pdf"
                id="panCardUpload"
              />
          </div>

          {/* Voter ID Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Voter ID
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
                          <CustomFileUpload 
                field="voter_id"
                accept=".jpg,.jpeg,.png,.pdf"
                id="voterIdUpload"
              />
          </div>

          {/* Driving License Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Driving License
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
                          <CustomFileUpload 
                field="driving_license"
                accept=".jpg,.jpeg,.png,.pdf"
                id="drivingLicenseUpload"
              />
          </div>

          {/* Passport Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Passport
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
            <CustomFileUpload 
              field="passport"
              accept=".jpg,.jpeg,.png,.pdf"
              id="passportUpload"
            />
          </div>

          {/* Electricity Bill Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Electricity Bill
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
                          <CustomFileUpload 
                field="ele"
                accept=".jpg,.jpeg,.png,.pdf"
                id="electricityBillUpload"
              />
          </div>

          {/* Other Document Upload */}
          <div className="upload-box">
            <div className="upload-content">
              <img src={Upload} alt="Upload" className="upload-icon" />
              <div>
                <Typography variant="h6" className="upload-title">
                  Other document
                </Typography>
                <Typography variant="body2" className="upload-description">
                  Files Supported: JPEG, PDF and PNG (max size 2mb)
                </Typography>
              </div>
            </div>
                          <CustomFileUpload 
                field="other_document"
                accept=".jpg,.jpeg,.png,.pdf"
                id="otherDocumentUpload"
              />
          </div>
        </Box>

      </CardContent>
    </Paper>
  )
}

export default Document