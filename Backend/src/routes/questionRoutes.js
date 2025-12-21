const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/questionController');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin, requireAdminOrVerifier } = require('../middleware/roleAuth');

// Public route - Get active questions for a form section (used by UserForm)
// This allows public access to questions without authentication
router.get('/public', QuestionController.getPublicQuestions);

// All other routes require authentication
router.use(authenticate);

// Get all questions (Admin and Verifier can view)
router.get('/', QuestionController.getAllQuestions);

// Get question by ID
router.get('/:id', QuestionController.getQuestionById);

// Routes accessible by both Admin and Verifier
// Get answers for an application (Verifiers need this to review applications)
router.get('/applications/:applicationId/answers', requireAdminOrVerifier, QuestionController.getAnswers);

// Save answer for an application (Verifiers might need this when editing reviews)
router.post('/applications/:applicationId/answers', requireAdminOrVerifier, QuestionController.saveAnswer);

// Admin only routes
router.use(requireAdmin);

// Create question
router.post('/', QuestionController.createQuestion);

// Update question
router.put('/:id', QuestionController.updateQuestion);

// Delete question
router.delete('/:id', QuestionController.deleteQuestion);

module.exports = router;

