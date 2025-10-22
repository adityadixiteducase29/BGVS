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
const ReviewEmployment = ({ applicationData, onFieldReviewChange }) => {
    // Review status for each field
    const [fieldReviews, setFieldReviews] = useState({
        company_name: 'pending',
        designation: 'pending',
        employee_id: 'pending',
        employment_location: 'pending',
        employment_from_date: 'pending',
        employment_to_date: 'pending',
        hr_number: 'pending',
        hr_email: 'pending',
        work_responsibility: 'pending',
        salary: 'pending',
        reason_of_leaving: 'pending',
        previous_manager: 'pending',
        offer_letter: 'pending',
        pay_slip: 'pending',
        resignation: 'pending',
        experience_letter: 'pending',
        bank_statement: 'pending',
        employment_check_result: 'pending',
        employment_certificate: 'pending'
    })

    // Document preview modal state
    const [previewModal, setPreviewModal] = useState({
        isOpen: false,
        documentUrl: '',
        documentName: '',
        documentType: ''
    })

    const handleReviewStatusChange = (fieldName, status) => {
        setFieldReviews(prev => ({
            ...prev,
            [fieldName]: status
        }));
        
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
    const companyDetailsData = [
        {
            field: 'Company Name',
            value: applicationData?.company_name || '',
            fieldName: 'company_name'
        },
        {
            field: 'Designation',
            value: applicationData?.designation || '',
            fieldName: 'designation'
        },
        {
            field: 'Employee ID',
            value: applicationData?.employee_id || '',
            fieldName: 'employee_id'
        },
        {
            field: 'Location',
            value: applicationData?.employment_location || '',
            fieldName: 'employment_location'
        },
        {
            field: 'From (Start Date)',
            value: applicationData?.employment_from_date ? new Date(applicationData.employment_from_date).toLocaleDateString() : '',
            fieldName: 'employment_from_date'
        },
        {
            field: 'To (End Date)',
            value: applicationData?.employment_to_date ? new Date(applicationData.employment_to_date).toLocaleDateString() : '',
            fieldName: 'employment_to_date'
        },
        {
            field: 'HR Number',
            value: applicationData?.hr_number || '',
            fieldName: 'hr_number'
        },
        {
            field: 'HR Email',
            value: applicationData?.hr_email || '',
            fieldName: 'hr_email'
        },
        {
            field: 'Work Responsibility',
            value: applicationData?.work_responsibility || '',
            fieldName: 'work_responsibility'
        },
        {
            field: 'Salary',
            value: applicationData?.salary || '',
            fieldName: 'salary'
        },
        {
            field: 'Reason of Leaving',
            value: applicationData?.reason_of_leaving || '',
            fieldName: 'reason_of_leaving'
        },
        {
            field: 'Previous Manager',
            value: applicationData?.previous_manager || '',
            fieldName: 'previous_manager'
        }
    ];

    const employmentDocumentsData = [
        {
            field: 'Offer Letter',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'offer_letter',
            hasDocument: true
        },
        {
            field: 'Pay Slip',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'pay_slip',
            hasDocument: true
        },
        {
            field: 'Resignation',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'resignation',
            hasDocument: true
        },
        {
            field: 'Experience Letter',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'experience_letter',
            hasDocument: true
        },
        {
            field: 'Bank Statement',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'bank_statement',
            hasDocument: true
        },
        {
            field: 'Employment Check Result',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'employment_check_result',
            hasDocument: true
        },
        {
            field: 'Employment Certificate',
            value: 'Uploaded', // This would typically check if file exists
            fieldName: 'employment_certificate',
            hasDocument: true
        }
    ];

  return (
    <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
      <CardHeader
        title={<Typography variant="h5" className="main-title">Employment Details</Typography>}
        sx={{ pb: 1 }}
      />
      <Divider sx={{ mb: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        {/* Company Details Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#534D59' }}>
          Company Details
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
              {companyDetailsData.map((row, index) => (
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
                        value={fieldReviews[row.fieldName] || 'pending'}
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

        {/* Employment Documents Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#534D59' }}>
          Employment Documents
        </Typography>
        
        {/* Employment Documents Table */}
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
              {employmentDocumentsData.map((row, index) => (
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
                        value={fieldReviews[row.fieldName] || 'pending'}
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

export default ReviewEmployment