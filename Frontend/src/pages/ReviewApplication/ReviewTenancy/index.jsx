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
const ReviewTenancy = ({ applicationData, onFieldReviewChange }) => {
    // Review status for each field
    const [fieldReviews, setFieldReviews] = useState({
        house_owner_name: 'pending',
        house_owner_contact: 'pending',
        house_owner_address: 'pending',
        residing: 'pending'
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
    const houseOwnerDetailsData = [
        {
            field: 'House Owner Name',
            value: applicationData?.house_owner_name || '',
            fieldName: 'house_owner_name'
        },
        {
            field: 'Contact Number',
            value: applicationData?.house_owner_contact || '',
            fieldName: 'house_owner_contact'
        },
        {
            field: 'Address',
            value: applicationData?.house_owner_address || '',
            fieldName: 'house_owner_address'
        },
        {
            field: 'Residing',
            value: applicationData?.residing || '',
            fieldName: 'residing'
        }
    ];

  return (
    <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
      <CardHeader
        title={<Typography variant="h5" className="main-title">Tenancy Details</Typography>}
        sx={{ pb: 1 }}
      />
      <Divider sx={{ mb: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        {/* House Owner Details Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#534D59' }}>
          House Owner Details
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
              {houseOwnerDetailsData.map((row, index) => (
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

export default ReviewTenancy