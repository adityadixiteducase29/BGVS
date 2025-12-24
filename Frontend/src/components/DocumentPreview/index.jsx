import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button } from '@mui/material';
import { Close, Download, Visibility } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './index.css';

// Configure PDF.js worker for Vite
// Using local worker file from public folder (most reliable)
if (typeof window !== 'undefined') {
  // Use local worker file from public folder (ES module version)
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const DocumentPreview = ({ isOpen, toggle, documentUrl, documentName, documentType }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actualUrl, setActualUrl] = useState(null);
  const [pdfFile, setPdfFile] = useState(null); // Store blob/File object for react-pdf
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownload = async () => {
    const urlToUse = actualUrl || documentUrl;
    if (!urlToUse) return;

    try {
      // For Cloudinary URLs or direct URLs, fetch and download as blob
      if (urlToUse.includes('cloudinary.com') || (!urlToUse.includes('/api/files/'))) {
        const response = await fetch(urlToUse);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = documentName || 'document';
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        // For API endpoints, add token and download
        const token = localStorage.getItem('auth_token');
        const downloadUrl = `${urlToUse}${urlToUse.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = documentName || 'document';
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(urlToUse, '_blank');
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

  // Memoize PDF.js options to avoid unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    httpHeaders: {},
    withCredentials: false,
  }), []);

  const renderDocumentPreview = () => {
    const urlToUse = actualUrl || documentUrl;
    const fileType = getFileType(urlToUse, documentName);
    
    if (!urlToUse) {
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
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {pdfLoading && (
              <div style={{
                padding: '20px',
                textAlign: 'center'
              }}>
                <div className="loading-spinner"></div>
                <p>Loading PDF...</p>
              </div>
            )}
            
            {error && !pdfLoading && (
              <div style={{
                padding: '20px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#f44336', marginBottom: '10px' }}>{error}</p>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownload}
                >
                  Download PDF
                </Button>
              </div>
            )}
            
            {(urlToUse || pdfFile) && !error && (
              <div style={{ width: '100%', overflow: 'auto', maxHeight: '600px' }}>
                <Document
                  file={pdfFile || urlToUse}
                  onLoadSuccess={({ numPages }) => {
                    console.log('✅ PDF loaded successfully, pages:', numPages);
                    setNumPages(numPages);
                    setPdfLoading(false);
                    setLoading(false);
                  }}
                  onLoadError={(error) => {
                    console.error('❌ Failed to load PDF:', error);
                    console.error('Error details:', {
                      message: error.message,
                      name: error.name,
                      stack: error.stack,
                      fileSource: pdfFile ? 'File object' : (urlToUse?.startsWith('blob:') ? 'Blob URL' : urlToUse?.includes('/proxy') ? 'Proxy URL' : 'Direct URL'),
                      fileUrl: urlToUse
                    });
                    
                    // If proxy failed, try direct Cloudinary URL as fallback
                    if (urlToUse?.includes('/proxy') && !urlToUse.includes('cloudinary.com')) {
                      console.log('⚠️ Proxy failed, trying to get direct Cloudinary URL...');
                      // Extract fileId from proxy URL
                      const fileIdMatch = urlToUse.match(/\/api\/files\/(\d+)\/proxy/);
                      if (fileIdMatch && fileIdMatch[1]) {
                        const fileId = fileIdMatch[1];
                        const token = localStorage.getItem('auth_token');
                        // Try to get the direct URL from the main endpoint
                        fetch(`/api/files/${fileId}?token=${encodeURIComponent(token)}`, {
                          method: 'GET',
                          credentials: 'include'
                        })
                        .then(response => response.json())
                        .then(data => {
                          if (data.success && data.url && data.url.includes('cloudinary.com')) {
                            console.log('✅ Got direct Cloudinary URL, retrying...');
                            setActualUrl(data.url);
                            setError('');
                            setPdfLoading(true);
                          } else {
                            throw new Error('Could not get direct URL');
                          }
                        })
                        .catch(fallbackError => {
                          console.error('❌ Fallback also failed:', fallbackError);
                          setError('Failed to load PDF. The file may not be available. Please try downloading instead.');
                          setPdfLoading(false);
                          setLoading(false);
                        });
                        return; // Don't set error yet, wait for fallback
                      }
                    }
                    
                    // Provide more helpful error messages
                    let errorMessage = 'Failed to load PDF';
                    if (error.message?.includes('Invalid PDF')) {
                      errorMessage = 'Invalid PDF file. The file may be corrupted or not a valid PDF.';
                    } else if (error.message?.includes('CORS')) {
                      errorMessage = 'CORS error. Please try downloading the file instead.';
                    } else if (error.message?.includes('not available') || error.message?.includes('not found')) {
                      errorMessage = 'File not available. It may have been deleted or moved.';
                    } else if (error.message) {
                      errorMessage = `Failed to load PDF: ${error.message}`;
                    }
                    
                    setError(errorMessage);
                    setPdfLoading(false);
                    setLoading(false);
                  }}
                  loading={
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div className="loading-spinner"></div>
                      <p>Loading PDF...</p>
                    </div>
                  }
                  options={pdfOptions}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    {numPages > 1 && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                          disabled={pageNumber <= 1}
                        >
                          Previous
                        </Button>
                        <span style={{ minWidth: '100px', textAlign: 'center' }}>
                          Page {pageNumber} of {numPages}
                        </span>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                          disabled={pageNumber >= numPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      width={Math.min(800, window.innerWidth - 100)}
                    />
                  </div>
                </Document>
              </div>
            )}
          </div>
        );
      
      case 'image':
        return (
          <img
            src={urlToUse}
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

  // Fetch the actual file URL if it's an API endpoint
  useEffect(() => {
    let timeoutId;
    let blobUrlToCleanup = null;
    
    if (isOpen && documentUrl) {
      console.log('📄 Opening document preview:', documentUrl);
      setLoading(true);
      setError('');
      setActualUrl(null);
      
      // Check if it's an API endpoint (not a direct URL)
      if (documentUrl.startsWith('/api/files/') || documentUrl.includes('/api/files/')) {
        // Fetch the file URL from backend
        fetch(documentUrl, {
          method: 'GET',
          credentials: 'include'
        })
        .then(response => {
          console.log('📥 Response received:', response.status, response.headers.get('content-type'));
          
          // Check if response is JSON (Cloudinary URL) or a redirect
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            // Backend returned JSON with URL
            return response.json().then(data => {
              console.log('📋 JSON response:', data);
              if (data.success && data.url) {
                const cloudinaryUrl = data.url;
                console.log('☁️ Cloudinary URL received:', cloudinaryUrl);
                
                // For PDFs from Cloudinary, fetch as blob to ensure proper iframe embedding
                const isPDF = data.mimeType === 'application/pdf' || 
                            documentName?.toLowerCase().endsWith('.pdf') ||
                            cloudinaryUrl.includes('/raw/upload/');
                
                if (isPDF && cloudinaryUrl.includes('cloudinary.com')) {
                  console.log('📄 PDF detected from Cloudinary');
                  setPdfLoading(true);
                  
                  // Use proxy URL to avoid CORS and ensure valid PDF structure
                  // Extract fileId from documentUrl
                  const fileIdMatch = documentUrl.match(/\/api\/files\/(\d+)/);
                  if (fileIdMatch && fileIdMatch[1]) {
                    const fileId = fileIdMatch[1];
                    const token = localStorage.getItem('auth_token');
                    const proxyUrl = `${window.location.origin}/api/files/${fileId}/proxy?token=${encodeURIComponent(token)}`;
                    console.log('📄 Using proxy URL for PDF (avoids CORS issues):', proxyUrl);
                    setActualUrl(proxyUrl);
                  } else {
                    // Fallback to direct URL if we can't get fileId
                    console.log('📄 Using Cloudinary URL directly:', cloudinaryUrl);
                    setActualUrl(cloudinaryUrl);
                  }
                  setPdfFile(null);
                  setLoading(false);
                  setPdfLoading(false); // Let react-pdf handle the loading
                  if (timeoutId) clearTimeout(timeoutId);
                } else {
                  // For images, use direct URL
                  setActualUrl(cloudinaryUrl);
                  setPdfFile(null);
                  setLoading(false);
                  if (timeoutId) clearTimeout(timeoutId);
                }
              } else {
                throw new Error(data.message || 'Failed to get file URL');
              }
            });
          } else {
            // It's a redirect or direct file - use the final URL
            if (response.redirected) {
              console.log('🔄 Redirected to:', response.url);
              setActualUrl(response.url);
              setLoading(false);
              if (timeoutId) clearTimeout(timeoutId);
            } else {
              // It's a direct file stream - use blob URL
              return response.blob().then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                blobUrlToCleanup = blobUrl;
                setActualUrl(blobUrl);
                setLoading(false);
                if (timeoutId) clearTimeout(timeoutId);
              });
            }
          }
        })
        .catch(err => {
          console.error('❌ Error fetching file:', err);
          setError('Failed to load document. Please try again.');
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
        });
      } else {
        // It's already a direct URL (Cloudinary or other)
        console.log('🌐 Using direct URL:', documentUrl);
        setActualUrl(documentUrl);
        setLoading(false);
      }
      
      // Set a timeout to stop loading after 15 seconds (increased for PDF blob fetching)
      timeoutId = setTimeout(() => {
        console.log('⏱️ Timeout reached, stopping loading state');
        setLoading(false);
      }, 15000);
    } else if (!isOpen) {
      // Reset state when modal closes
      setActualUrl(null);
      setPdfFile(null);
      setLoading(false);
      setError('');
      setNumPages(null);
      setPageNumber(1);
      setPdfLoading(false);
    }
    
    // Cleanup function - runs on unmount or when dependencies change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Clean up blob URL if created
      if (blobUrlToCleanup && blobUrlToCleanup.startsWith('blob:')) {
        console.log('🧹 Cleaning up blob URL');
        URL.revokeObjectURL(blobUrlToCleanup);
      }
    };
  }, [isOpen, documentUrl, documentName]);

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
