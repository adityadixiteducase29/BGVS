const { pool } = require('../config/database');

class Question {
    constructor(questionData) {
        this.question_text = questionData.question_text;
        this.form_section = questionData.form_section;
        this.is_active = questionData.is_active !== undefined ? questionData.is_active : true;
        this.display_order = questionData.display_order || 0;
        this.created_by = questionData.created_by;
    }

    // Save question to database
    async save() {
        try {
            const [result] = await pool.execute(
                `INSERT INTO form_questions 
                (question_text, form_section, is_active, display_order, created_by) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    this.question_text,
                    this.form_section,
                    this.is_active,
                    this.display_order,
                    this.created_by
                ]
            );
            
            this.id = result.insertId;
            return this;
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to create question');
        }
    }

    // Find question by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT q.*, u.first_name, u.last_name 
                FROM form_questions q
                LEFT JOIN users u ON q.created_by = u.id
                WHERE q.id = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Failed to find question');
        }
    }

    // Get all questions for a form section
    static async findBySection(formSection, activeOnly = true) {
        try {
            let query = `
                SELECT q.*, u.first_name, u.last_name 
                FROM form_questions q
                LEFT JOIN users u ON q.created_by = u.id
                WHERE q.form_section = ?
            `;
            const params = [formSection];

            if (activeOnly) {
                query += ' AND q.is_active = TRUE';
            }

            query += ' ORDER BY q.display_order ASC, q.created_at ASC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch questions');
        }
    }

    // Get all questions
    static async findAll(activeOnly = false) {
        try {
            let query = `
                SELECT q.*, u.first_name, u.last_name 
                FROM form_questions q
                LEFT JOIN users u ON q.created_by = u.id
                WHERE 1=1
            `;
            const params = [];

            if (activeOnly) {
                query += ' AND q.is_active = TRUE';
            }

            query += ' ORDER BY q.form_section ASC, q.display_order ASC, q.created_at ASC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch questions');
        }
    }

    // Update question
    async update(updateData) {
        try {
            const updateFields = [];
            const updateValues = [];

            const allowedFields = ['question_text', 'form_section', 'is_active', 'display_order'];

            allowedFields.forEach(field => {
                if (updateData.hasOwnProperty(field)) {
                    updateFields.push(`${field} = ?`);
                    updateValues.push(updateData[field]);
                }
            });

            if (updateFields.length === 0) {
                return false;
            }

            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateValues.push(this.id);

            const query = `UPDATE form_questions SET ${updateFields.join(', ')} WHERE id = ?`;
            const [result] = await pool.execute(query, updateValues);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating question:', error);
            throw new Error('Failed to update question');
        }
    }

    // Delete question
    async delete() {
        try {
            const [result] = await pool.execute(
                'DELETE FROM form_questions WHERE id = ?',
                [this.id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to delete question');
        }
    }

    // Save answer for an application
    static async saveAnswer(applicationId, questionId, answerText) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO application_question_answers 
                (application_id, question_id, answer_text) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                answer_text = VALUES(answer_text),
                updated_at = CURRENT_TIMESTAMP`,
                [applicationId, questionId, answerText]
            );
            return result.insertId || true;
        } catch (error) {
            console.error('Error saving answer:', error);
            throw new Error('Failed to save answer');
        }
    }

    // Get answers for an application
    static async getAnswersByApplication(applicationId) {
        try {
            const [rows] = await pool.execute(
                `SELECT aqa.*, q.question_text, q.form_section
                FROM application_question_answers aqa
                JOIN form_questions q ON aqa.question_id = q.id
                WHERE aqa.application_id = ?`,
                [applicationId]
            );
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch answers');
        }
    }

    // Get answers for an application by section
    static async getAnswersByApplicationAndSection(applicationId, formSection) {
        try {
            const [rows] = await pool.execute(
                `SELECT aqa.*, q.question_text, q.form_section
                FROM application_question_answers aqa
                JOIN form_questions q ON aqa.question_id = q.id
                WHERE aqa.application_id = ? AND q.form_section = ?`,
                [applicationId, formSection]
            );
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch answers');
        }
    }
}

module.exports = Question;

