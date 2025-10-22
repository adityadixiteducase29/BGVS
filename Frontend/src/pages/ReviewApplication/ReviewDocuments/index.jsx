import React, { useState } from 'react'
// import './index.css'
import {
    Typography, Select,
    MenuItem,
    FormControl, Divider,
    Paper,
    CardContent,
    CardHeader, Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material'
import { KeyboardArrowDown, Visibility } from '@mui/icons-material'
import DocumentPreview from '../../../components/DocumentPreview'
const ReviewDocuments = ({ 
    applicationData, 
    fieldReviews, 
    fileReviews,
    onFieldReviewChange, 
    onFileReviewChange 
}) => {
    // Document preview modal state
    const [previewModal, setPreviewModal] = useState({
        isOpen: false,
        documentUrl: '',
        documentName: '',
        documentType: ''
    })

    const handleReviewStatusChange = (fieldName, status) => {
        // Notify parent component about the change
        if (onFieldReviewChange) {
            onFieldReviewChange(fieldName, status);
        }
    };

    // Function to handle document preview
    const handleDocumentPreview = (fieldName) => {
        // Find the file in applicationData.files array
        const file = applicationData?.files?.find(f => f.document_type === fieldName);
        
        if (file) {
            // Get auth token for file access
            const token = localStorage.getItem('auth_token');
            // Create a proper file URL with authentication token
            const documentUrl = `/api/files/${file.id}?token=${encodeURIComponent(token)}`;
            const documentName = file.document_name || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            setPreviewModal({
                isOpen: true,
                documentUrl,
                documentName,
                documentType: fieldName
            });
        } else {
            // Show error or handle missing file
            console.warn(`No file found for field: ${fieldName}`);
            setPreviewModal({
                isOpen: true,
                documentUrl: '',
                documentName: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                documentType: fieldName
            });
        }
    };

    const togglePreviewModal = () => {
        setPreviewModal(prev => ({
            ...prev,
            isOpen: !prev.isOpen
        }));
    };

    // Table data structures
    const detailsData = [
        {
            field: 'Aadhar Card Number',
            value: applicationData?.aadhar_number || '',
            fieldName: 'aadhar_number'
        },
        {
            field: 'PAN Card Number',
            value: applicationData?.pan_number || '',
            fieldName: 'pan_number'
        }
    ];

    const documentsData = [
        {
            field: 'Aadhar Card Front Side',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'aadhar_front',
            hasDocument: true
        },
        {
            field: 'Aadhar Card Back Side',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'aadhar_back',
            hasDocument: true
        },
        {
            field: 'Passport Size Photo',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'passport_photo',
            hasDocument: true
        },
        {
            field: 'PAN Card',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'pan_card',
            hasDocument: true
        },
        {
            field: 'Voter ID',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'voter_id',
            hasDocument: true
        },
        {
            field: 'Driving License',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'driving_license',
            hasDocument: true
        },
        {
            field: 'Passport',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'passport',
            hasDocument: true
        },
        {
            field: 'Ele',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'ele',
            hasDocument: true
        },
        {
            field: 'Other Document',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'other_document',
            hasDocument: true
        }
    ];

  return (
    <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
      <CardHeader
        title={<Typography variant="h5" className="main-title">Documents</Typography>}
        sx={{ pb: 1 }}
      />
      <Divider sx={{ mb: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        {/* Details Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#534D59' }}>
          Details
        </Typography>
        
        <TableContainer sx={{ borderRadius: '12px', border: '1px solid #E4E4E4', overflow: 'hidden', mb: 3 }}>
          <Table sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid #E4E4E4' } }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#FAFAFA', 
                    borderRight: '1px solid #DDE2E5',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#534D59',
                    padding: '12px 16px',
                    height: '48px'
                  }}
                >
                  Fields
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#FAFAFA', 
                    borderRight: '1px solid #DDE2E5',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#534D59',
                    padding: '12px 16px',
                    height: '48px'
                  }}
                >
                  Inputs
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#FAFAFA',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#534D59',
                    padding: '12px 16px',
                    height: '48px'
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailsData.map((row, index) => (
                <TableRow key={index} sx={{ height: '48px' }}>
                  <TableCell 
                    sx={{ 
                      borderRight: '1px solid #CFD3D4',
                      fontSize: '14px',
                      color: '#1B2128',
                      padding: '12px 16px',
                      height: '48px'
                    }}
                  >
                    {row.field}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      borderRight: '1px solid #DDE2E5',
                      fontSize: '14px',
                      color: '#1B2128',
                      padding: '12px 16px',
                      height: '48px'
                    }}
                  >
                    {row.value || '-'}
                  </TableCell>
                  <TableCell sx={{ padding: '8px 16px', height: '48px' }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={fieldReviews[row.fieldName]?.review_status || 'pending'}
                        onChange={(e) => handleReviewStatusChange(row.fieldName, e.target.value)}
                        IconComponent={KeyboardArrowDown}
                        sx={{
                          fontSize: '14px',
                          color: '#1B2128',
                          height: '32px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                          },
                          '& .MuiSelect-select': {
                            padding: '6px 8px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Section Divider */}
        <Divider sx={{ my: 3 }} />

        {/* Documents Uploads Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#534D59' }}>
          Documents Uploads
        </Typography>
        
        {/* Documents Uploads Table */}
        <TableContainer sx={{ borderRadius: '12px', border: '1px solid #E4E4E4', overflow: 'hidden' }}>
          <Table sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid #E4E4E4' } }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#FAFAFA', 
                    borderRight: '1px solid #DDE2E5',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#534D59',
                    padding: '12px 16px',
                    height: '48px'
                  }}
                >
                  Fields
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#FAFAFA', 
                    borderRight: '1px solid #DDE2E5',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#534D59',
                    padding: '12px 16px',
                    height: '48px'
                  }}
                >
                  Inputs
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#FAFAFA',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#534D59',
                    padding: '12px 16px',
                    height: '48px'
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentsData.map((row, index) => (
                <TableRow key={index} sx={{ height: '48px' }}>
                  <TableCell 
                    sx={{ 
                      borderRight: '1px solid #CFD3D4',
                      fontSize: '14px',
                      color: '#1B2128',
                      padding: '12px 16px',
                      height: '48px'
                    }}
                  >
                    {row.field}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      borderRight: '1px solid #DDE2E5',
                      fontSize: '14px',
                      color: '#1B2128',
                      padding: '12px 16px',
                      height: '48px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{row.value || '-'}</span>
                      {row.hasDocument && (
                        <IconButton
                          size="small"
                          onClick={() => handleDocumentPreview(row.fieldName)}
                          className="document-view-button"
                          title="View Document"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  </TableCell>
                  <TableCell sx={{ padding: '8px 16px', height: '48px' }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={fieldReviews[row.fieldName]?.review_status || 'pending'}
                        onChange={(e) => handleReviewStatusChange(row.fieldName, e.target.value)}
                        IconComponent={KeyboardArrowDown}
                        sx={{
                          fontSize: '14px',
                          color: '#1B2128',
                          height: '32px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                          },
                          '& .MuiSelect-select': {
                            padding: '6px 8px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </CardContent>
      
      {/* Document Preview Modal */}
      <DocumentPreview
        isOpen={previewModal.isOpen}
        toggle={togglePreviewModal}
        documentUrl={previewModal.documentUrl}
        documentName={previewModal.documentName}
        documentType={previewModal.documentType}
      />
    </Paper>
  )
}

export default ReviewDocuments