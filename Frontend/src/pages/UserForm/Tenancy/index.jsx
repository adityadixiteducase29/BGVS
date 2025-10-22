import React from 'react'
import {
  Typography,
  TextField,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material'
import { Row, Col } from 'reactstrap'

const Tenancy = ({ formData, updateFormData }) => {
  return (
    <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
      <CardHeader
        title={
          <Typography variant="h5" sx={{ fontWeight: 500, color: '#4A4458' }}>
            Tenancy Information
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <Divider sx={{ mb: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        
        {/* House Owner Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
            House Owner details
          </Typography>
          <Row className="g-3">
            {/* Row 1: House Owner Name (50%) + Contact Number (50%) */}
            <Col className="col-12 col-md-6">
              <TextField
                fullWidth
                label="House Owner Name"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.house_owner_name || ''}
                onChange={(e) => updateFormData({ house_owner_name: e.target.value })}
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
                label="Contact Number"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.house_owner_contact || ''}
                onChange={(e) => updateFormData({ house_owner_contact: e.target.value })}
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
            {/* Row 2: Address (100%) */}
            <Col className="col-12">
              <TextField
                fullWidth
                label="Address"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.house_owner_address || ''}
                onChange={(e) => updateFormData({ house_owner_address: e.target.value })}
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
            {/* Row 3: Residing (50%) */}
            <Col className="col-12 col-md-6">
              <TextField
                fullWidth
                label="Residing"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.residing || ''}
                onChange={(e) => updateFormData({ residing: e.target.value })}
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

      </CardContent>
    </Paper>
  )
}

export default Tenancy