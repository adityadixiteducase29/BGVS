const Question = require('../models/Question');

class QuestionController {
    // Create a new question
    static async createQuestion(req, res) {
        try {
            const { question_text, form_section, is_active, display_order } = req.body;
            const created_by = req.user.id;

            if (!question_text || !form_section) {
                return res.status(400).json({
                    success: false,
                    message: 'Question text and form section are required'
                });
            }

            const question = new Question({
                question_text,
                form_section,
                is_active: is_active !== undefined ? is_active : true,
                display_order: display_order || 0,
                created_by
            });

            const savedQuestion = await question.save();

            res.status(201).json({
                success: true,
                message: 'Question created successfully',
                data: savedQuestion
            });
        } catch (error) {
            console.error('Error creating question:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get public questions (active only, for UserForm - no authentication required)
    static async getPublicQuestions(req, res) {
        try {
            const { form_section } = req.query;

            if (!form_section) {
                return res.status(400).json({
                    success: false,
                    message: 'Form section is required'
                });
            }

            // Only return active questions for public access
            const questions = await Question.findBySection(form_section, true);

            res.status(200).json({
                success: true,
                data: questions
            });
        } catch (error) {
            console.error('Error fetching public questions:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all questions
    static async getAllQuestions(req, res) {
        try {
            const { form_section, active_only } = req.query;
            const activeOnly = active_only === 'true';

            let questions;
            if (form_section) {
                questions = await Question.findBySection(form_section, activeOnly);
            } else {
                questions = await Question.findAll(activeOnly);
            }

            res.status(200).json({
                success: true,
                data: questions
            });
        } catch (error) {
            console.error('Error fetching questions:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get question by ID
    static async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            const question = await Question.findById(id);

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            res.status(200).json({
                success: true,
                data: question
            });
        } catch (error) {
            console.error('Error fetching question:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update question
    static async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const question = await Question.findById(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            const questionInstance = new Question(question);
            questionInstance.id = question.id;

            const updated = await questionInstance.update(updateData);

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update question'
                });
            }

            const updatedQuestion = await Question.findById(id);

            res.status(200).json({
                success: true,
                message: 'Question updated successfully',
                data: updatedQuestion
            });
        } catch (error) {
            console.error('Error updating question:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete question
    static async deleteQuestion(req, res) {
        try {
            const { id } = req.params;

            const question = await Question.findById(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            const questionInstance = new Question(question);
            questionInstance.id = question.id;

            const deleted = await questionInstance.delete();

            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to delete question'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Question deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting question:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Save answer for an application
    static async saveAnswer(req, res) {
        try {
            const { applicationId } = req.params;
            const { question_id, answer_text } = req.body;

            if (!question_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Question ID is required'
                });
            }

            await Question.saveAnswer(applicationId, question_id, answer_text || '');

            res.status(200).json({
                success: true,
                message: 'Answer saved successfully'
            });
        } catch (error) {
            console.error('Error saving answer:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get answers for an application
    static async getAnswers(req, res) {
        try {
            const { applicationId } = req.params;
            const { form_section } = req.query;

            let answers;
            if (form_section) {
                answers = await Question.getAnswersByApplicationAndSection(applicationId, form_section);
            } else {
                answers = await Question.getAnswersByApplication(applicationId);
            }

            res.status(200).json({
                success: true,
                data: answers
            });
        } catch (error) {
            console.error('Error fetching answers:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = QuestionController;

