const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authenticate');
const { requireVerifier } = require('../middleware/roleAuth');

// All review routes require authentication and verifier role
router.use(authenticate);
router.use(requireVerifier);

/**
 * @route POST /api/applications/:id/review
 * @desc Submit field and file reviews for an application
 * @access Verifier only
 * @body {
 *   fieldReviews: [
 *     { fieldName: "applicant_first_name", fieldValue: "John", status: "approved", notes: "Verified" },
 *     { fieldName: "applicant_email", fieldValue: "john@example.com", status: "rejected", notes: "Invalid email" }
 *   ],
 *   fileReviews: [
 *     { fileId: 1, status: "approved", notes: "Document verified" },
 *     { fileId: 2, status: "rejected", notes: "Document unclear" }
 *   ],
 *   overallNotes: "Overall review notes"
 * }
 */
router.post('/:id/review', ReviewController.submitReview);

/**
 * @route GET /api/applications/:id/review
 * @desc Get review details for an application
 * @access Verifier only
 */
router.get('/:id/review', ReviewController.getReview);

/**
 * @route POST /api/applications/:id/finalize-review
 * @desc Finalize application review (approve/reject overall)
 * @access Verifier only
 * @body {
 *   overallStatus: "approved" | "rejected",
 *   finalNotes: "Final review notes"
 * }
 */
router.post('/:id/finalize-review', ReviewController.finalizeReview);

module.exports = router;
