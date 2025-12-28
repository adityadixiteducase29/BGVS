import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { TextField, Box, Typography, RadioGroup, FormControlLabel, Radio, Alert } from '@mui/material';
import { toast } from 'react-toastify';

const FinalizeReviewModal = ({ isOpen, toggle, onFinalize, isFinalizing }) => {
  const [decision, setDecision] = useState(''); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleDecisionChange = (event) => {
    setDecision(event.target.value);
    setRejectionReason(''); // Clear rejection reason when changing decision
    setError('');
  };

  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
    setError('');
  };

  const handleSubmit = () => {
    // Validate
    if (!decision) {
      setError('Please select a decision (Approve or Reject)');
      return;
    }

    if (decision === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    // Call the onFinalize callback with the decision and rejection reason
    onFinalize(decision === 'approve' ? 'approved' : 'rejected', rejectionReason.trim());
  };

  const handleClose = () => {
    // Reset state when closing
    setDecision('');
    setRejectionReason('');
    setError('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="md" centered>
      <ModalHeader toggle={handleClose}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#4A4458' }}>
          Finalize Review
        </Typography>
      </ModalHeader>
      <ModalBody>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2, color: '#4A4458' }}>
              How would you like to finalize this review?
            </Typography>
            <RadioGroup
              value={decision}
              onChange={handleDecisionChange}
              sx={{ gap: 1 }}
            >
              <FormControlLabel
                value="approve"
                control={<Radio />}
                label={
                  <Typography variant="body1" sx={{ color: '#4A4458' }}>
                    Approve this application
                  </Typography>
                }
              />
              <FormControlLabel
                value="reject"
                control={<Radio />}
                label={
                  <Typography variant="body1" sx={{ color: '#4A4458' }}>
                    Reject this application
                  </Typography>
                }
              />
            </RadioGroup>
          </Box>

          {decision === 'reject' && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#4A4458' }}>
                Rejection Reason <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Please provide a detailed reason for rejecting this application..."
                value={rejectionReason}
                onChange={handleRejectionReasonChange}
                variant="outlined"
                required
                error={decision === 'reject' && !rejectionReason.trim()}
                helperText={
                  decision === 'reject' && !rejectionReason.trim()
                    ? 'Rejection reason is required'
                    : ''
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'var(--primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)',
                    },
                  },
                }}
              />
            </Box>
          )}

          {decision === 'approve' && (
            <Alert severity="info">
              This application will be marked as approved. Are you sure you want to proceed?
            </Alert>
          )}
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={handleClose}
          disabled={isFinalizing}
          style={{ marginRight: '8px' }}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={isFinalizing || !decision || (decision === 'reject' && !rejectionReason.trim())}
          style={{
            backgroundColor: 'var(--primary)',
            borderColor: 'var(--primary)',
            color: 'white',
          }}
        >
          {isFinalizing ? 'Finalizing...' : 'Finalize Review'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default FinalizeReviewModal;

