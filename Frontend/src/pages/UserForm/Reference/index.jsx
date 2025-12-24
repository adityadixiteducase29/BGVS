import React, { useState, useEffect } from 'react'
import {
  Typography,
  TextField,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from '@mui/material'
import { Row, Col } from 'reactstrap'
import { Delete } from '@mui/icons-material'
import { Button } from '@mui/material'
import apiService from '@/services/api'

const Reference = ({ formData, updateFormData, companyId }) => {
  const [questions, setQuestions] = useState([])
  const [questionAnswers, setQuestionAnswers] = useState([])

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await apiService.getPublicQuestions('reference')
      if (response.success) {
        setQuestions(response.data || [])
        // Initialize with 5 empty question answer boxes by default
        const initialAnswers = Array.from({ length: 5 }, () => ({
          question_id: '',
          question_text: '',
          answer_text: ''
        }))
        setQuestionAnswers(initialAnswers)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleQuestionSelect = (index, questionId) => {
    const selectedQuestion = questions.find(q => q.id === questionId)
    const updatedAnswers = [...questionAnswers]
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      question_id: questionId,
      question_text: selectedQuestion?.question_text || ''
    }
    setQuestionAnswers(updatedAnswers)
    updateFormData({ question_answers: updatedAnswers })
  }

  const handleAnswerChange = (index, answerText) => {
    const updatedAnswers = [...questionAnswers]
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      answer_text: answerText
    }
    setQuestionAnswers(updatedAnswers)
    updateFormData({ question_answers: updatedAnswers })
  }

  const handleRemoveQuestion = (index) => {
    // Reset the question at this index instead of removing it
    const updatedAnswers = [...questionAnswers]
    updatedAnswers[index] = {
      question_id: '',
      question_text: '',
      answer_text: ''
    }
    setQuestionAnswers(updatedAnswers)
    updateFormData({ question_answers: updatedAnswers })
  }

  // Get available questions (not already selected)
  const getAvailableQuestions = (currentIndex) => {
    const selectedIds = questionAnswers
      .map((qa, idx) => idx !== currentIndex ? qa.question_id : null)
      .filter(id => id)
    return questions.filter(q => !selectedIds.includes(q.id))
  }
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
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'var(--primary)', mb: 3 }}>
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'var(--primary)', mb: 3 }}>
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'var(--primary)', mb: 3 }}>
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
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
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)'
                    }
                  }
                }}
              />
            </Col>
          </Row>
        </Box>

        {/* Dynamic Questions Section */}
        {questions.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: 'var(--primary)', mb: 3 }}>
                Additional Questions (Select 5 questions to answer)
              </Typography>

              {questionAnswers.map((qa, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #E5E7EA', borderRadius: 2 }}>
                  <Row className="g-3">
                    <Col className="col-12 col-md-5">
                      <FormControl fullWidth>
                        <InputLabel>Select Question {index + 1}</InputLabel>
                        <Select
                          value={qa.question_id || ''}
                          onChange={(e) => handleQuestionSelect(index, e.target.value)}
                          label={`Select Question ${index + 1}`}
                          sx={{
                            height: 56,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#79747E'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'var(--primary)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'var(--primary)'
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {getAvailableQuestions(index).map((question) => (
                            <MenuItem key={question.id} value={question.id}>
                              {question.question_text}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Col>
                    <Col className="col-12 col-md-6">
                      <TextField
                        fullWidth
                        label="Answer"
                        placeholder="Enter your answer"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={qa.answer_text || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        disabled={!qa.question_id}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: 56,
                            '& fieldset': {
                              borderColor: '#79747E'
                            },
                            '&:hover fieldset': {
                              borderColor: 'var(--primary)'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'var(--primary)'
                            }
                          }
                        }}
                      />
                    </Col>
                    {/* <Col className="col-12 col-md-1">
                      <IconButton
                        onClick={() => handleRemoveQuestion(index)}
                        disabled={questionAnswers.length <= 1}
                        sx={{ color: '#d32f2f', mt: 1 }}
                        title={questionAnswers.length <= 1 ? 'At least one question is required' : 'Remove question'}
                      >
                        <Delete />
                      </IconButton>
                    </Col> */}
                  </Row>
                </Box>
              ))}
            </Box>
          </>
        )}

      </CardContent>
    </Paper>
  )
}

export default Reference