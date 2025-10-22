import React, { useState } from 'react'
import {
  Typography,
  TextField,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Row, Col } from 'reactstrap'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ArrowDropDown } from '@mui/icons-material'

const Residency = ({ formData, updateFormData }) => {
  const [residingDate, setResidingDate] = useState(null)

  // Static quantity options
  const quantityOptions = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10+'
  ]

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
        <CardHeader
          title={
            <Typography variant="h5" sx={{ fontWeight: 500, color: '#4A4458' }}>
              Residential
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <Divider sx={{ mb: 2 }} />
        <CardContent sx={{ pt: 0 }}>
          
          {/* Neighbour - 1 Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
              Neighbour - 1
            </Typography>
            <Row className="g-3">
              {/* Row 1: Neighbour 1 Name (50%) + Neighbour 1 Mobile Number (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Neighbour 1 Name"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour1_name || ''}
                  onChange={(e) => updateFormData({ neighbour1_name: e.target.value })}
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
                  label="Neighbour 1 Mobile Number"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour1_mobile || ''}
                  onChange={(e) => updateFormData({ neighbour1_mobile: e.target.value })}
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
              {/* Row 2: Neighbour 1 Since (50%) + Neighbour 1 Remark (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Neighbour 1 Since"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour1_since || ''}
                  onChange={(e) => updateFormData({ neighbour1_since: e.target.value })}
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
                  label="Neighbour 1 Remark"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour1_remark || ''}
                  onChange={(e) => updateFormData({ neighbour1_remark: e.target.value })}
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

          {/* Neighbour - 2 Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
              Neighbour - 2
            </Typography>
            <Row className="g-3">
              {/* Row 1: Neighbour 2 Name (50%) + Neighbour 2 Mobile Number (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Neighbour 2 Name"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour2_name || ''}
                  onChange={(e) => updateFormData({ neighbour2_name: e.target.value })}
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
                  label="Neighbour 2 Mobile Number"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour2_mobile || ''}
                  onChange={(e) => updateFormData({ neighbour2_mobile: e.target.value })}
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
              {/* Row 2: Neighbour 2 Since (50%) + Neighbour 2 Remark (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="Neighbour 2 Since"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour2_since || ''}
                  onChange={(e) => updateFormData({ neighbour2_since: e.target.value })}
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
                  label="Neighbour 2 Remark"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour2_remark || ''}
                  onChange={(e) => updateFormData({ neighbour2_remark: e.target.value })}
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

          {/* Family and Residing Information */}
          <Box sx={{ mb: 4 }}>
            <Row className="g-3">
              {/* Row 1: How Many Family Members (50%) + Residing Date (50%) */}
              <Col className="col-12 col-md-6">
                <TextField
                  fullWidth
                  label="How Many Family Members"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.neighbour1_family_members || ''}
                  onChange={(e) => updateFormData({ neighbour1_family_members: e.target.value })}
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
                <DatePicker
                  label="Residing Date"
                  value={residingDate}
                  onChange={(newDate) => {
                    setResidingDate(newDate);
                    updateFormData({ residing_date: newDate ? newDate.toISOString().split('T')[0] : '' });
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
              {/* Row 2: Residing Remark (100%) */}
              <Col className="col-12">
                <TextField
                  fullWidth
                  label="Residing Remark"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.residing_remark || ''}
                  onChange={(e) => updateFormData({ residing_remark: e.target.value })}
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
              {/* Row 3: Place (100%) */}
              <Col className="col-12">
                <TextField
                  fullWidth
                  label="Place"
                  placeholder="Enter"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.place || ''}
                  onChange={(e) => updateFormData({ place: e.target.value })}
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

          {/* Appliance and Vehicle Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3C2D63', mb: 3 }}>
              Appliance and Vehicle Information
            </Typography>
            <Row className="g-3">
              {/* Row 1: Bike Quantity (33%) + Car Quantity (33%) + AC Quantity (33%) */}
              <Col className="col-12 col-md-4">
                <FormControl fullWidth>
                  <InputLabel id="bike-quantity-label" sx={{ color: '#79747E' }}>
                    Bike Quantity
                  </InputLabel>
                  <Select
                    labelId="bike-quantity-label"
                    value={formData.bike_quantity || ''}
                    label="Bike Quantity"
                    onChange={(e) => updateFormData({ bike_quantity: e.target.value })}
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
                      <em>Select Quantity</em>
                    </MenuItem>
                    {quantityOptions.map((quantity) => (
                      <MenuItem key={quantity} value={quantity}>
                        {quantity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Col>
              <Col className="col-12 col-md-4">
                <FormControl fullWidth>
                  <InputLabel id="car-quantity-label" sx={{ color: '#79747E' }}>
                    Car Quantity
                  </InputLabel>
                  <Select
                    labelId="car-quantity-label"
                    value={formData.car_quantity || ''}
                    label="Car Quantity"
                    onChange={(e) => updateFormData({ car_quantity: e.target.value })}
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
                      <em>Select Quantity</em>
                    </MenuItem>
                    {quantityOptions.map((quantity) => (
                      <MenuItem key={quantity} value={quantity}>
                        {quantity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Col>
              <Col className="col-12 col-md-4">
                <FormControl fullWidth>
                  <InputLabel id="ac-quantity-label" sx={{ color: '#79747E' }}>
                    AC Quantity
                  </InputLabel>
                  <Select
                    labelId="ac-quantity-label"
                    value={formData.ac_quantity || ''}
                    label="AC Quantity"
                    onChange={(e) => updateFormData({ ac_quantity: e.target.value })}
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
                      <em>Select Quantity</em>
                    </MenuItem>
                    {quantityOptions.map((quantity) => (
                      <MenuItem key={quantity} value={quantity}>
                        {quantity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Col>
            </Row>
          </Box>

        </CardContent>
      </Paper>
    </LocalizationProvider>
  )
}

export default Residency