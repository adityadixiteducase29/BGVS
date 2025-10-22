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
    TableRow
} from '@mui/material'
import { KeyboardArrowDown } from '@mui/icons-material'
const ReviewReference = ({ applicationData, onFieldReviewChange }) => {
    // Review status for each field
    const [fieldReviews, setFieldReviews] = useState({
        reference1_name: 'pending',
        reference1_address: 'pending',
        reference1_relation: 'pending',
        reference1_contact: 'pending',
        reference1_police_station: 'pending',
        reference2_name: 'pending',
        reference2_address: 'pending',
        reference2_relation: 'pending',
        reference2_contact: 'pending',
        reference2_police_station: 'pending',
        reference3_name: 'pending',
        reference3_address: 'pending',
        reference3_relation: 'pending',
        reference3_contact: 'pending',
        reference3_police_station: 'pending'
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

    // Table data structures
    const reference1Data = [
        {
            field: 'Full Name',
            value: applicationData?.reference1_name || '',
            fieldName: 'reference1_name'
        },
        {
            field: 'Address',
            value: applicationData?.reference1_address || '',
            fieldName: 'reference1_address'
        },
        {
            field: 'Relation',
            value: applicationData?.reference1_relation || '',
            fieldName: 'reference1_relation'
        },
        {
            field: 'Contact Number',
            value: applicationData?.reference1_contact || '',
            fieldName: 'reference1_contact'
        },
        {
            field: 'Police Station',
            value: applicationData?.reference1_police_station || '',
            fieldName: 'reference1_police_station'
        }
    ];

    const reference2Data = [
        {
            field: 'Full Name',
            value: applicationData?.reference2_name || '',
            fieldName: 'reference2_name'
        },
        {
            field: 'Address',
            value: applicationData?.reference2_address || '',
            fieldName: 'reference2_address'
        },
        {
            field: 'Relation',
            value: applicationData?.reference2_relation || '',
            fieldName: 'reference2_relation'
        },
        {
            field: 'Contact Number',
            value: applicationData?.reference2_contact || '',
            fieldName: 'reference2_contact'
        },
        {
            field: 'Police Station',
            value: applicationData?.reference2_police_station || '',
            fieldName: 'reference2_police_station'
        }
    ];

    const reference3Data = [
        {
            field: 'Full Name',
            value: applicationData?.reference3_name || '',
            fieldName: 'reference3_name'
        },
        {
            field: 'Address',
            value: applicationData?.reference3_address || '',
            fieldName: 'reference3_address'
        },
        {
            field: 'Relation',
            value: applicationData?.reference3_relation || '',
            fieldName: 'reference3_relation'
        },
        {
            field: 'Contact Number',
            value: applicationData?.reference3_contact || '',
            fieldName: 'reference3_contact'
        },
        {
            field: 'Police Station',
            value: applicationData?.reference3_police_station || '',
            fieldName: 'reference3_police_station'
        }
    ];

  return (
    <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
      <CardHeader
        title={<Typography variant="h5" className="main-title">Reference Details</Typography>}
        sx={{ pb: 1 }}
      />
      <Divider sx={{ mb: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        {/* Reference Information - 1 */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#534D59' }}>
          Reference Information – 1
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
              {reference1Data.map((row, index) => (
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

        {/* Reference Information - 2 */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#534D59' }}>
          Reference Information – 2
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
              {reference2Data.map((row, index) => (
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

        {/* Reference Information - 3 */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#534D59' }}>
          Reference Information – 3
        </Typography>
        
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
              {reference3Data.map((row, index) => (
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

      </CardContent>
    </Paper>
  )
}

export default ReviewReference