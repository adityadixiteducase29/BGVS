import React, { useState, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Progress, Alert } from 'reactstrap';
import { Download, Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import apiService from '@/services/api';
import { toast } from 'react-toastify';
import './Import.css';

const Import = ({ modal, toggle, onImportComplete }) => {
  const [step, setStep] = useState(1); // 1: Generate Template, 2: Upload CSV, 3: Processing, 4: Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const fileInputRef = useRef(null);

  const resetModal = () => {
    setStep(1);
    setLoading(false);
    setError('');
    setSelectedFile(null);
    setImportResults(null);
    setProgress(0);
    setSelectedCompanyId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    toggle();
  };

  // Load companies when modal opens
  React.useEffect(() => {
    if (modal) {
      loadCompanies();
    }
  }, [modal]);

  const loadCompanies = async () => {
    try {
      const response = await apiService.request('/companies', { method: 'GET' });
      if (response.success && response.data) {
        setCompanies(response.data);
        if (response.data.length > 0) {
          setSelectedCompanyId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setError('Failed to load companies');
    }
  };

  const handleGenerateTemplate = async () => {
    try {
      setLoading(true);
      setError('');

      if (!selectedCompanyId) {
        throw new Error('Please select a company first.');
      }
      
      // Generate CSV template
      const response = await fetch(`${apiService.baseURL}/applications/companies/${selectedCompanyId}/csv-template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate CSV template');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get the selected company name for the filename
      const selectedCompany = companies.find(c => c.id === parseInt(selectedCompanyId));
      const companyName = selectedCompany ? selectedCompany.name.replace(/\s+/g, '_') : 'default';
      a.download = `application_template_${companyName}.csv`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('CSV template downloaded successfully!');
      setStep(2);

    } catch (error) {
      console.error('Error generating template:', error);
      setError(error.message);
      toast.error('Failed to generate CSV template');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file to import');
      return;
    }

    if (!selectedCompanyId) {
      setError('Please select a company first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStep(3);
      setProgress(0);

      // Create FormData
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Import CSV
      const response = await fetch(`${apiService.baseURL}/applications/companies/${selectedCompanyId}/import-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (result.success) {
        setImportResults(result.data);
        setStep(4);
        
        if (result.data.successful > 0) {
          toast.success(`Successfully imported ${result.data.successful} applications!`);
        }
        if (result.data.failed > 0) {
          toast.warning(`${result.data.failed} applications failed to import. Check details below.`);
        }

        // Refresh applications list
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        throw new Error(result.message || 'Import failed');
      }

    } catch (error) {
      console.error('Error importing CSV:', error);
      setError(error.message);
      toast.error('Failed to import CSV');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="import-step">
      <div className="step-icon">
        <FileText size={48} color="#1976d2" />
      </div>
      <h4>Generate CSV Template</h4>
      <p>Download a CSV template with all the required fields and sample data to help you format your import file correctly.</p>
      
      <div className="company-selection">
        <label htmlFor="company-select">Select Company:</label>
        <select
          id="company-select"
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="form-control"
        >
          <option value="">Choose a company...</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="template-features">
        <div className="feature-item">
          <CheckCircle size={20} color="#4caf50" />
          <span>All application fields included</span>
        </div>
        <div className="feature-item">
          <CheckCircle size={20} color="#4caf50" />
          <span>Sample data for reference</span>
        </div>
        <div className="feature-item">
          <CheckCircle size={20} color="#4caf50" />
          <span>Required fields marked with *</span>
        </div>
      </div>

      <Button 
        color="primary" 
        onClick={handleGenerateTemplate}
        disabled={loading}
        className="generate-btn"
      >
        <Download size={20} />
        {loading ? 'Generating...' : 'Generate CSV Template'}
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="import-step">
      <h4>Upload CSV File</h4>
      <p>Select the CSV file you want to import. Make sure it follows the template format.</p>
      
      <div className="company-selection">
        <label htmlFor="company-select-upload">Select Company:</label>
        <select
          id="company-select-upload"
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="form-control"
        >
          <option value="">Choose a company...</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="file-upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="file-input"
          id="csv-file-input"
        />
        <label htmlFor="csv-file-input" className="file-upload-label">
          <Upload size={24} />
          <span>{selectedFile ? selectedFile.name : 'Choose CSV File'}</span>
        </label>
      </div>

      {selectedFile && (
        <div className="file-info">
          <div className="file-details">
            <span className="file-name">{selectedFile.name}</span>
            <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      )}

      <div className="step-actions">
        <Button 
          color="secondary" 
          onClick={() => setStep(1)}
          disabled={loading}
        >
          Back
        </Button>
        <Button 
          color="primary" 
          className='custom-primary-button'
          onClick={handleImport}
          disabled={!selectedFile || loading}
        >
          <Upload size={20} />
          {loading ? 'Importing...' : 'Import Applications'}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="import-step">
      <div className="step-icon">
        <Upload size={48} color="#1976d2" />
      </div>
      <h4>Processing Import</h4>
      <p>Please wait while we process your CSV file and import the applications...</p>
      
      <div className="progress-container">
        <Progress value={progress} className="import-progress" />
        <span className="progress-text">{progress}% Complete</span>
      </div>

      <div className="processing-info">
        <div className="info-item">
          <AlertCircle size={16} color="#ff9800" />
          <span>Validating data format</span>
        </div>
        <div className="info-item">
          <AlertCircle size={16} color="#ff9800" />
          <span>Checking for duplicates</span>
        </div>
        <div className="info-item">
          <AlertCircle size={16} color="#ff9800" />
          <span>Creating applications</span>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="import-step">
      <div className="step-icon d-flex justify-content-center align-items-center">
        {importResults?.failed === 0 ? (
          <CheckCircle size={48} color="#4caf50" />
        ) : (
          <AlertCircle size={48} color="#ff9800" />
        )}
      </div>
      
      <h4>Import Complete</h4>
      <p>Your CSV import has been processed. Here are the results:</p>

      <div className="import-summary">
        <div className="summary-item success">
          <CheckCircle size={20} color="#4caf50" />
          <span>{importResults?.successful || 0} Successful</span>
        </div>
        <div className="summary-item error">
          <XCircle size={20} color="#f44336" />
          <span>{importResults?.failed || 0} Failed</span>
        </div>
        <div className="summary-item total">
          <FileText size={20} color="#1976d2" />
          <span>{importResults?.total || 0} Total</span>
        </div>
      </div>

      {importResults?.failed > 0 && (
        <div className="failed-applications">
          <h5>Failed Applications:</h5>
          <div className="failed-list">
            {importResults.failedApplications.slice(0, 5).map((app, index) => (
              <div key={index} className="failed-item">
                <span className="failed-name">{app.applicantName}</span>
                <span className="failed-error">{app.error}</span>
              </div>
            ))}
            {importResults.failedApplications.length > 5 && (
              <div className="failed-more">
                ... and {importResults.failedApplications.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className="step-actions">
        <Button 
          color="primary" 
          onClick={handleClose}
          className='custom-primary-button'
        >
          Done
        </Button>
        <Button 
          color="secondary" 
          onClick={() => {
            resetModal();
            setStep(1);
          }}
        >
          Import Another File
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={modal} toggle={handleClose} size="lg" className="import-modal">
      <ModalHeader toggle={handleClose}>
        <div className="modal-title">
          <Upload size={24} />
          <span>Import Applications from CSV</span>
        </div>
      </ModalHeader>
      
      <ModalBody>
        {error && (
          <Alert color="danger" className="import-error">
            <AlertCircle size={16} />
            {error}
          </Alert>
        )}

        <div className="import-steps">
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>4</div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default Import;