import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Divider,
  Container,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material'
import Document from './Document'
import EmploymentDetails from './Employment'
import Residency from './Residency'
import Tenancy from './Tenancy'
import Education from './Education'
import PersonalInformation from './PersonalInfo'
import Reference from './Reference'
import { useCompanyServices } from '../../utils/companyServices'
import { Button } from 'reactstrap'
import Logo from "./Svg/Logo.svg"
const UserForm = () => {
  const { companyId } = useParams()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clientData, setClientData] = useState(null)

  // Comprehensive form state for all sections
  const [formData, setFormData] = useState({
    // Personal Information
    applicant_first_name: '',
    applicant_last_name: '',
    applicant_email: '',
    applicant_phone: '',
    applicant_dob: '',
    gender: '',
    languages: '',

    // Family & Emergency Contacts
    father_name: '',
    mother_name: '',
    emergency_contact_number: '',

    // Current Address
    current_house_no: '',
    current_area_locality: '',
    current_area_locality_2: '',
    current_district: '',
    current_police_station: '',
    current_pincode: '',
    current_tehsil: '',
    current_post_office: '',
    current_landmark: '',

    // Permanent Address
    use_current_as_permanent: false,
    permanent_house_no: '',
    permanent_area_locality: '',
    permanent_area_locality_2: '',
    permanent_district: '',
    permanent_police_station: '',
    permanent_pincode: '',
    permanent_tehsil: '',
    permanent_post_office: '',
    permanent_landmark: '',

    // Education
    highest_education: '',
    institute_name: '',
    education_city: '',
    grades: '',
    education_from_date: '',
    education_to_date: '',
    education_address: '',
    marksheet_10th: null,
    marksheet_12th: null,
    provisional_certificate: null,

    // Reference Information
    reference1_name: '',
    reference1_address: '',
    reference1_relation: '',
    reference1_contact: '',
    reference1_police_station: '',

    reference2_name: '',
    reference2_address: '',
    reference2_relation: '',
    reference2_contact: '',
    reference2_police_station: '',

    reference3_name: '',
    reference3_address: '',
    reference3_relation: '',
    reference3_contact: '',
    reference3_police_station: '',
    reference_address: '',

    // Documents
    aadhar_number: '',
    pan_number: '',
    aadhar_front: null,
    aadhar_back: null,
    passport_photo: null,
    pan_card: null,
    voter_id: null,
    driving_license: null,
    passport: null,
    ele: null,
    other_document: null,

    // Employment Information
    company_name: '',
    designation: '',
    employee_id: '',
    employment_location: '',
    employment_from_date: '',
    employment_to_date: '',
    hr_number: '',
    hr_email: '',
    work_responsibility: '',
    salary: '',
    reason_of_leaving: '',
    previous_manager: '',
    offer_letter: null,
    pay_slip: null,
    resignation: null,
    experience_letter: null,
    bank_statement: null,
    employment_check_result: null,
    employment_certificate: null,

    // Residential
    neighbour1_family_members: '',
    neighbour1_name: '',
    neighbour1_mobile: '',
    neighbour1_since: '',
    neighbour1_remark: '',

    neighbour2_family_members: '',
    neighbour2_name: '',
    neighbour2_mobile: '',
    neighbour2_since: '',
    neighbour2_remark: '',

    residing_date: '',
    residing_remark: '',
    bike_quantity: '',
    car_quantity: '',
    ac_quantity: '',
    place: '',

    // Tenancy Information
    house_owner_name: '',
    house_owner_contact: '',
    house_owner_address: '',
    residing: ''
  })
  console.log(formData, "formData")
  // Use the company services hook to get enabled services
  const { companyServices, loading: servicesLoading, error: servicesError } = useCompanyServices(companyId)

  // Debug logging
  console.log('UserForm Debug:', {
    companyId,
    companyServices,
    servicesLoading,
    servicesError
  });

  // All possible steps
  const allSteps = [
    { id: 1, title: 'Personal Information', component: PersonalInformation, serviceKey: 'personal_information' },
    { id: 2, title: 'Education', component: Education, serviceKey: 'education' },
    { id: 3, title: 'Reference', component: Reference, serviceKey: 'reference' },
    { id: 4, title: 'Document', component: Document, serviceKey: 'documentation' },
    { id: 5, title: 'Employment', component: EmploymentDetails, serviceKey: 'employment_information' },
    { id: 6, title: 'Tenancy', component: Tenancy, serviceKey: 'tenancy_information' },
    { id: 7, title: 'Residency', component: Residency, serviceKey: 'residential' },
  ]

  // Filter steps based on enabled services
  // If companyServices is undefined, show all steps temporarily for debugging
  const steps = companyServices ? allSteps.filter(step => {
    const isEnabled = companyServices[step.serviceKey] === true;
    console.log(`Step ${step.title} (${step.serviceKey}):`, isEnabled);
    return isEnabled;
  }) : allSteps; // Show all steps if services are not loaded yet

  console.log('Filtered steps:', steps);

  useEffect(() => {
    if (!servicesLoading && !servicesError) {
      setLoading(false)
      // Set active step to first available step
      if (steps.length > 0) {
        setActiveStep(0)
      }
    }
  }, [servicesLoading, servicesError, steps.length])

  const handleStepClick = (stepIndex) => {
    setActiveStep(stepIndex)
  }

  // Function to update form data from child components
  const updateFormData = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      ...newData
    }))
  }

  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Create FormData object for file uploads
      const submitData = new FormData()

      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (formData[key] instanceof File) {
            submitData.append(key, formData[key])
          } else {
            submitData.append(key, formData[key])
          }
        }
      })

      // Add company ID
      submitData.append('company_id', companyId)

      const response = await fetch(`/api/applications/companies/${companyId}/applications`, {
        method: 'POST',
        body: submitData
      })

      const result = await response.json()

      if (result.success) {
        alert('Application submitted successfully!')
        // Optionally reset form or redirect
      } else {
        alert('Error submitting application: ' + result.message)
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ActiveComponent = steps[activeStep]?.component || PersonalInformation

  // Handle loading state
  if (servicesLoading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#FAFAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: '#4A4458' }}>
            Loading verification form...
          </Typography>
        </Box>
      </Box>
    )
  }

  // Handle error state
  if (servicesError) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#FAFAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6">Error Loading Form</Typography>
          <Typography>{servicesError}</Typography>
        </Alert>
      </Box>
    )
  }

  // Show no services enabled state
  if (steps.length === 0) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#FAFAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          <Typography variant="h6">No Services Available</Typography>
          <Typography>
            This verification form has no active services. Please contact your administrator.
          </Typography>
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA', p: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4 }}>
          <div className='d-flex align-items-center gap-2'>
            <img src={Logo} alt="logo" />
            <Typography variant="h3" sx={{ fontWeight: 400, color: '#4A4458' }}>
              Background Verification Details
            </Typography>
          </div>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              style={{
                backgroundColor: '#4F378B',
                color: 'white'
              }}
              sx={{
                '&:hover': {
                  backgroundColor: '#3C2D63'
                },
                px: 4,
                py: 1.5
              }}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Sidebar - Steps */}
          <Box sx={{ width: 384 }}>
            <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EA' }}>
              <CardHeader
                title={
                  <Typography variant="h5" sx={{ fontWeight: 500, color: '#4A4458' }}>
                    Steps ({steps.length})
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <Divider sx={{ mb: 2 }} />
              <CardContent sx={{ pt: 0 }}>
                <Stepper orientation="vertical" activeStep={activeStep}>
                  {steps.map((step, index) => (
                    <Step key={step.id} completed={index < activeStep}>
                      <StepLabel
                        onClick={() => handleStepClick(index)}
                        sx={{
                          cursor: 'pointer',
                          '& .MuiStepLabel-iconContainer': {
                            '& .MuiStepIcon-root': {
                              color: index === activeStep ? '#4F378B' : index < activeStep ? '#4F378B' : '#CED2D6',
                              '& .MuiStepIcon-text': {
                                fill: index === activeStep || index < activeStep ? 'white' : '#9EA5AD',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }
                            }
                          },
                          '& .MuiStepLabel-label': {
                            color: index === activeStep ? '#3C2D63' : index < activeStep ? '#3C2D63' : '#9EA5AD',
                            fontWeight: 500,
                            fontSize: '1rem',
                            '&:hover': {
                              color: '#4F378B'
                            }
                          }
                        }}
                      >
                        {step.title}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Paper>
          </Box>

          {/* Right Content - Active Component */}
          <Box sx={{ flex: 1 }}>
            <ActiveComponent
              companyId={companyId}
              formData={formData}
              updateFormData={updateFormData}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default UserForm