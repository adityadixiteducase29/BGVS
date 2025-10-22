import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button } from '@mui/material';
import { Close, Download, Visibility } from '@mui/icons-material';
import './index.css';

const DocumentPreview = ({ isOpen, toggle, documentUrl, documentName, documentType }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = () => {
    if (documentUrl) {
      // Get auth token for authenticated download
      const token = localStorage.getItem('auth_token');
      
      // Create a download link with the token
      const link = document.createElement('a');
      link.href = documentUrl; // URL already includes token
      link.download = documentName || 'document';
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileType = (url, documentName) => {
    if (!url) return 'unknown';
    
    // Try to get extension from document name first
    if (documentName) {
      const extension = documentName.split('.').pop().toLowerCase();
      if (['pdf'].includes(extension)) return 'pdf';
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
      if (['doc', 'docx'].includes(extension)) return 'word';
      if (['xls', 'xlsx'].includes(extension)) return 'excel';
    }
    
    // Fallback: try to get from URL (though it might not have extension)
    const urlExtension = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(urlExtension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(urlExtension)) return 'image';
    if (['doc', 'docx'].includes(urlExtension)) return 'word';
    if (['xls', 'xlsx'].includes(urlExtension)) return 'excel';
    
    // Default to PDF for API endpoints (since we know these are PDFs from the logs)
    return 'pdf';
  };

  const renderDocumentPreview = () => {
    const fileType = getFileType(documentUrl, documentName);
    
    if (!documentUrl) {
      return (
        <div className="document-preview-error">
          <Visibility sx={{ fontSize: 48, color: '#ccc' }} />
          <p>No document available</p>
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <div style={{ width: '100%', height: '500px', position: 'relative' }}>
            <iframe
              src={documentUrl}
              width="100%"
              height="100%"
              style={{ border: 'none', borderRadius: '8px' }}
              title={documentName}
              onLoad={() => {
                console.log('PDF loaded successfully');
                setLoading(false);
              }}
              onError={() => {
                console.error('Failed to load PDF');
                setLoading(false);
                setError('Failed to load document');
              }}
            />
            {loading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div className="loading-spinner"></div>
                <p>Loading document...</p>
              </div>
            )}
          </div>
        );
      
      case 'image':
        return (
          <img
            src={documentUrl}
            alt={documentName}
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
            onLoad={() => {
              console.log('Image loaded successfully');
              setLoading(false);
            }}
            onError={() => {
              console.error('Failed to load image');
              setLoading(false);
              setError('Failed to load image');
            }}
          />
        );
      
      case 'word':
      case 'excel':
      default:
        return (
          <div className="document-preview-unsupported">
            <Visibility sx={{ fontSize: 48, color: '#ccc' }} />
            <p>Preview not available for this file type</p>
            <p className="file-info">File: {documentName}</p>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{ mt: 2 }}
            >
              Download to View
            </Button>
          </div>
        );
    }
  };

  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen && documentUrl) {
      console.log('Opening document preview:', documentUrl);
      setLoading(true);
      setError('');
      
      // Set a timeout to stop loading after 10 seconds
      const timeout = setTimeout(() => {
        console.log('Timeout reached, stopping loading state');
        setLoading(false);
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [isOpen, documentUrl]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="document-preview-modal">
      <ModalHeader toggle={toggle} className="document-preview-header">
        <div className="header-content">
          <Visibility sx={{ mr: 1 }} />
          <span>Document Preview</span>
        </div>
      </ModalHeader>
      
      <ModalBody className="document-preview-body">
        {loading && !documentUrl ? (
          <div className="document-preview-loading">
            <div className="loading-spinner"></div>
            <p>Loading document...</p>
          </div>
        ) : error ? (
          <div className="document-preview-error">
            <Visibility sx={{ fontSize: 48, color: '#f44336' }} />
            <p>Error loading document: {error}</p>
          </div>
        ) : (
          renderDocumentPreview()
        )}
      </ModalBody>
      
      <ModalFooter className="document-preview-footer">
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={!documentUrl}
        >
          Download
        </Button>
        <Button
          variant="contained"
          onClick={toggle}
          startIcon={<Close />}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DocumentPreview;
