import React, { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material'
import { ExpandMore, Help, Support, Book, VideoLibrary, Add, Edit, Delete, Settings } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import apiService from '@/services/api'
import { toast } from 'react-toastify'
import './VerifierHelp/index.css'

const VerifierHelp = () => {
  const { user } = useSelector((state) => state.auth)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    form_section: 'reference',
    is_active: true,
    display_order: 0
  })

  const formSections = [
    { value: 'reference', label: 'Reference' },
    { value: 'personal_information', label: 'Personal Information' },
    { value: 'education', label: 'Education' },
    { value: 'employment', label: 'Employment' },
    { value: 'tenancy', label: 'Tenancy' },
    { value: 'residency', label: 'Residency' },
    { value: 'documentation', label: 'Documentation' }
  ]

  useEffect(() => {
    if (user?.user_type === 'admin') {
      fetchQuestions()
    }
  }, [user])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllQuestions(null, false)
      if (response.success) {
        setQuestions(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (question = null) => {
    if (question) {
      setEditingQuestion(question)
      setQuestionForm({
        question_text: question.question_text,
        form_section: question.form_section,
        is_active: question.is_active,
        display_order: question.display_order || 0
      })
    } else {
      setEditingQuestion(null)
      setQuestionForm({
        question_text: '',
        form_section: 'reference',
        is_active: true,
        display_order: 0
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingQuestion(null)
    setQuestionForm({
      question_text: '',
      form_section: 'reference',
      is_active: true,
      display_order: 0
    })
  }

  const handleSaveQuestion = async () => {
    try {
      if (!questionForm.question_text.trim()) {
        toast.error('Question text is required')
        return
      }

      let response
      if (editingQuestion) {
        response = await apiService.updateQuestion(editingQuestion.id, questionForm)
      } else {
        response = await apiService.createQuestion(questionForm)
      }

      if (response.success) {
        toast.success(editingQuestion ? 'Question updated successfully' : 'Question created successfully')
        fetchQuestions()
        handleCloseDialog()
      } else {
        toast.error(response.message || 'Failed to save question')
      }
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('Failed to save question')
    }
  }

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      const response = await apiService.deleteQuestion(id)
      if (response.success) {
        toast.success('Question deleted successfully')
        fetchQuestions()
      } else {
        toast.error(response.message || 'Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }
  const helpSections = [
    {
      title: "Getting Started",
      icon: <Help />,
      content: "Learn the basics of document verification and how to use the verifier dashboard effectively.",
      items: [
        "Understanding the verification process",
        "Navigating the dashboard",
        "Setting up your profile",
        "Understanding priority levels"
      ]
    },
    {
      title: "Verification Guidelines",
      icon: <Book />,
      content: "Comprehensive guidelines for verifying different types of documents and handling edge cases.",
      items: [
        "Aadhar Card verification standards",
        "PAN Card verification process",
        "Passport verification requirements",
        "Common verification errors to avoid"
      ]
    },
    {
      title: "Video Tutorials",
      icon: <VideoLibrary />,
      content: "Step-by-step video guides for various verification processes and dashboard features.",
      items: [
        "Document verification walkthrough",
        "Dashboard navigation tutorial",
        "Priority management guide",
        "Reporting and analytics overview"
      ]
    },
    {
      title: "Support & Contact",
      icon: <Support />,
      content: "Get in touch with our support team for technical issues or verification-related questions.",
      items: [
        "Technical support contact",
        "Verification process questions",
        "Dashboard feature requests",
        "Emergency contact information"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="dashboard-title" style={{color:"#4F378B"}}>
          Help & Support
        </h1>
        <p className="text-gray-600">Find answers to common questions and get support for verification tasks</p>
      </div>
      
      {/* Quick Help Cards */}
      <div className="help-cards-container">
        {helpSections.map((section, index) => (
          <Paper key={index} elevation={1} className="help-card">
            <CardHeader
              avatar={section.icon}
              title={section.title}
              className="help-card-header"
            />
            <CardContent className="help-card-content">
              <Typography variant="body2" color="text.secondary" className="help-card-description">
                {section.content}
              </Typography>
              <ul className="help-card-list">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="help-card-list-item">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Paper>
        ))}
      </div>
      
      {/* FAQ Section */}
      <div className="faq-section">
        <Typography variant="h5" className="faq-title">
          Frequently Asked Questions
        </Typography>
        
        <Accordion className="faq-accordion">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">How do I handle high-priority applications?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              High-priority applications should be reviewed within 2 hours of submission. 
              These are typically marked with red priority indicators and require immediate attention.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion className="faq-accordion">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">What should I do if I encounter a suspicious document?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              If you encounter a suspicious document, mark it as "Rejected" and add detailed notes 
              explaining your concerns. Contact your supervisor immediately for further guidance.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion className="faq-accordion">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">How can I improve my verification speed?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Focus on one application at a time, use keyboard shortcuts, and familiarize yourself 
              with common document patterns. Regular practice and following verification guidelines 
              will naturally improve your speed.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
      
      {/* Question Management Section (Admin Only) */}
      {user?.user_type === 'admin' && (
        <div className="question-management-section" style={{ marginTop: '32px' }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings sx={{ color: '#4F378B' }} />
                <Typography variant="h5" sx={{ fontWeight: 500, color: '#4A4458' }}>
                  Form Questions Management
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  backgroundColor: '#4F378B',
                  '&:hover': { backgroundColor: '#3C2D63' }
                }}
              >
                Add Question
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
              <Typography>Loading questions...</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Form Section</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Display Order</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">No questions found. Add your first question!</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>{question.question_text}</TableCell>
                          <TableCell>
                            {formSections.find(s => s.value === question.form_section)?.label || question.form_section}
                          </TableCell>
                          <TableCell>{question.display_order}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color: question.is_active ? '#4caf50' : '#f44336',
                                fontWeight: 500
                              }}
                            >
                              {question.is_active ? 'Active' : 'Inactive'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(question)}
                              sx={{ color: '#1976d2' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteQuestion(question.id)}
                              sx={{ color: '#d32f2f' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </div>
      )}

      {/* Contact Support */}
      <div className="contact-support-section">
        <Paper elevation={1} className="contact-support-card">
          <CardHeader
            title="Need More Help?"
            subheader="Our support team is available 24/7 to assist you"
            className="contact-support-header"
          />
          <CardContent className="contact-support-content">
            <Typography variant="body1" className="contact-support-text">
              If you couldn't find the answer you're looking for, don't hesitate to contact our support team.
            </Typography>
            <div className="contact-support-buttons">
              <button className="contact-button primary">
                Contact Support
              </button>
              <button className="contact-button secondary">
                Schedule Training
              </button>
            </div>
          </CardContent>
        </Paper>
      </div>

      {/* Question Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Question Text"
              multiline
              rows={3}
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Form Section</InputLabel>
              <Select
                value={questionForm.form_section}
                onChange={(e) => setQuestionForm({ ...questionForm, form_section: e.target.value })}
                label="Form Section"
              >
                {formSections.map((section) => (
                  <MenuItem key={section.value} value={section.value}>
                    {section.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Display Order"
              value={questionForm.display_order}
              onChange={(e) => setQuestionForm({ ...questionForm, display_order: parseInt(e.target.value) || 0 })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={questionForm.is_active}
                  onChange={(e) => setQuestionForm({ ...questionForm, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveQuestion}
            variant="contained"
            sx={{ backgroundColor: '#4F378B', '&:hover': { backgroundColor: '#3C2D63' } }}
          >
            {editingQuestion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VerifierHelp;
