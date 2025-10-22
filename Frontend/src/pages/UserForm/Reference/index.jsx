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

const Reference = ({ formData, updateFormData }) => {
  return (
    <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
      <CardHeader
        title={
          <Typography variant="h5" sx={{ fontWeight: 500, color: '#4A4458' }}>
            Reference
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <Divider sx={{ mb: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        
        {/* Reference Information - 1 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
            Reference Information - 1
          </Typography>
          <Row className="g-3">
            {/* Row 1: Full Name (50%) + Address (50%) */}
            <Col className="col-12 col-md-6">
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference1_name || ''}
                onChange={(e) => updateFormData({ reference1_name: e.target.value })}
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
                label="Address"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference1_address || ''}
                onChange={(e) => updateFormData({ reference1_address: e.target.value })}
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
            {/* Row 2: Relation (33%) + Contact Number (33%) + Police Station (33%) */}
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Relation"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference1_relation || ''}
                onChange={(e) => updateFormData({ reference1_relation: e.target.value })}
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
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Contact Number"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference1_contact || ''}
                onChange={(e) => updateFormData({ reference1_contact: e.target.value })}
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
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Police Station"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference1_police_station || ''}
                onChange={(e) => updateFormData({ reference1_police_station: e.target.value })}
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

        {/* Reference Information - 2 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
            Reference Information - 2
          </Typography>
          <Row className="g-3">
            {/* Row 1: Full Name (50%) + Address (50%) */}
            <Col className="col-12 col-md-6">
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference2_name || ''}
                onChange={(e) => updateFormData({ reference2_name: e.target.value })}
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
                label="Address"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference2_address || ''}
                onChange={(e) => updateFormData({ reference2_address: e.target.value })}
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
            {/* Row 2: Relation (33%) + Contact Number (33%) + Police Station (33%) */}
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Relation"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference2_relation || ''}
                onChange={(e) => updateFormData({ reference2_relation: e.target.value })}
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
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Contact Number"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference2_contact || ''}
                onChange={(e) => updateFormData({ reference2_contact: e.target.value })}
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
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Police Station"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference2_police_station || ''}
                onChange={(e) => updateFormData({ reference2_police_station: e.target.value })}
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

        {/* Reference Information - 3 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
            Reference Information - 3
          </Typography>
          <Row className="g-3">
            {/* Row 1: Full Name (50%) + Address (50%) */}
            <Col className="col-12 col-md-6">
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference3_name || ''}
                onChange={(e) => updateFormData({ reference3_name: e.target.value })}
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
                label="Address"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference3_address || ''}
                onChange={(e) => updateFormData({ reference3_address: e.target.value })}
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
            {/* Row 2: Relation (33%) + Contact Number (33%) + Police Station (33%) */}
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Relation"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference3_relation || ''}
                onChange={(e) => updateFormData({ reference3_relation: e.target.value })}
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
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Contact Number"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference3_contact || ''}
                onChange={(e) => updateFormData({ reference3_contact: e.target.value })}
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
            <Col className="col-12 col-md-4">
              <TextField
                fullWidth
                label="Police Station"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.reference3_police_station || ''}
                onChange={(e) => updateFormData({ reference3_police_station: e.target.value })}
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

        {/* Current Address Section */}
        <Box sx={{ mb: 4 }}>
          <Row className="g-3">
            <Col className="col-12">
              <TextField
                fullWidth
                label="Current Address"
                placeholder="Enter"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                multiline
                minRows={2}
                value={formData.reference_address || ''}
                onChange={(e) => updateFormData({ reference_address: e.target.value })}
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

      </CardContent>
    </Paper>
  )
}

export default Reference