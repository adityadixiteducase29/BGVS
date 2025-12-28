import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label, Alert } from 'reactstrap';
import { Upload, X } from 'lucide-react';
import apiService from '@/services/api';
import { toast } from 'react-toastify';

const ReportUploadModal = ({ isOpen, toggle, applicationId, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setError('Only PDF and Word documents are allowed');
        setSelectedFile(null);
        return;
      }

      // Validate file size (20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('File size must be less than 20MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const token = localStorage.getItem('auth_token');
      apiService.setToken(token);
      
      const response = await apiService.uploadReport(applicationId, selectedFile);

      if (response.success) {
        toast.success('Report uploaded successfully');
        setSelectedFile(null);
        toggle();
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        setError(response.message || 'Failed to upload report');
      }
    } catch (err) {
      console.error('Error uploading report:', err);
      setError('Failed to upload report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>
        Upload Report
      </ModalHeader>
      <ModalBody>
        {error && (
          <Alert color="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        <div className="mb-3">
          <Label for="reportFile">Select Report File</Label>
          <Input
            type="file"
            id="reportFile"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <small className="text-muted d-block mt-2">
            Supported formats: PDF, DOC, DOCX (Max size: 20MB)
          </small>
        </div>

        {selectedFile && (
          <div className="mt-3 p-3 border rounded">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Upload size={20} />
                <div>
                  <strong>{selectedFile.name}</strong>
                  <div className="text-muted small">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button
                color="link"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  document.getElementById('reportFile').value = '';
                }}
                disabled={uploading}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={handleClose}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Report'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReportUploadModal;

