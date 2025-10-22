import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, People, Apps, ShowChart } from "@mui/icons-material";
import { PersonalInformation } from "@/components/PersonalInformation";
// import '../pages/Dashboard/index.css';
import Datatable from "@/components/Datatable";
import { FaUsers, FaFingerprint, FaHourglassHalf, FaCalendarWeek } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import apiService from '@/services/api';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const Application = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Set the token for API requests
        apiService.setToken(token);
        
        const response = await apiService.getAllApplications();
        
        if (response.success) {
          setApplications(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch applications');
        }
      } catch (err) {
        setError('Failed to fetch applications');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchApplications();
    }
  }, [token]);

  const handleEditClick = (row) => {
    console.log('Edit clicked for row:', row);
    // Add your edit logic here
  };

  const handleDeleteClick = (row) => {
    setApplicationToDelete(row);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!applicationToDelete) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteApplication(applicationToDelete.id);

      if (response.success) {
        // Remove the deleted application from the list
        setApplications(prev => 
          prev.filter(app => app.id !== applicationToDelete.id)
        );
        
        toast.success(`Application for ${applicationToDelete.applicant_first_name} ${applicationToDelete.applicant_last_name} deleted successfully`);
        setDeleteModal(false);
        setApplicationToDelete(null);
      } else {
        toast.error(response.message || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(false);
    setApplicationToDelete(null);
  };

  const cards = [
    { label: 'Clients', value: 28, icon: <FaUsers /> },
    { label: 'Total Verifications', value: 120, icon: <FaFingerprint /> },
    { label: 'Pending', value: 96, icon: <FaHourglassHalf /> },
    { label: 'This week', value: 16, icon: <FaCalendarWeek /> },
  ];

  const handleCopyLink = (id) => {
    setApplications(applications =>
      applications.map(row =>
        row.id === id ? { ...row, linkCopied: true } : row
      )
    );
  };

  const columns = [
    { 
      field: 'applicant_name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 150,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {`${params.row.applicant_first_name} ${params.row.applicant_last_name}`}
        </div>
      ) 
    },
    { 
      field: 'applicant_phone', 
      headerName: 'Contact No.', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.applicant_phone || 'N/A'}
        </div>
      ) 
    },
    { 
      field: 'company_name', 
      headerName: 'Client', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.company_name || 'N/A'}
        </div>
      ) 
    },
    { 
      field: 'id', 
      headerName: 'Online ID', 
      flex: 1, 
      minWidth: 100,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.id}
        </div>
      ) 
    },
    { 
      field: 'created_at', 
      headerName: 'Applied', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {new Date(params.row.created_at).toLocaleDateString()}
        </div>
      ) 
    },
    { 
      field: 'application_status', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 100,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          <span className={`status-badge status-${params.row.application_status}`}>
            {params.row.application_status}
          </span>
        </div>
      ) 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <div className="datatable-cell-content" style={{ justifyContent: 'center', gap: '8px' }}>
          <IconButton
            size="small"
            onClick={() => handleEditClick(params.row)}
            title="Edit Application"
            style={{ color: '#1976d2' }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          {user?.user_type === 'admin' && (
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              title="Delete Application"
              style={{ color: '#d32f2f' }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <style>
        {`
          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
          }
          .status-pending {
            background-color: #fef3c7;
            color: #92400e;
          }
          .status-assigned {
            background-color: #dbeafe;
            color: #1e40af;
          }
          .status-under_review {
            background-color: #fef3c7;
            color: #92400e;
          }
          .status-approved {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-rejected {
            background-color: #fee2e2;
            color: #991b1b;
          }
        `}
      </style>
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="dashboard-title" style={{color:"#4F378B"}}>
          Applications
        </h1>
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading applications...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : (
          <Datatable
            tabledata={applications}
            columns={columns}
            pageSize={8}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={handleDeleteCancel} centered>
        <ModalHeader toggle={handleDeleteCancel}>
          Confirm Delete Application
        </ModalHeader>
        <ModalBody>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', color: '#d32f2f', marginBottom: '16px' }}>
              ⚠️
            </div>
            <h5 style={{ marginBottom: '16px', color: '#333' }}>
              Are you sure you want to delete this application?
            </h5>
            {applicationToDelete && (
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  Applicant: {applicationToDelete.applicant_first_name} {applicationToDelete.applicant_last_name}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Email: {applicationToDelete.applicant_email}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Application ID: {applicationToDelete.id}
                </p>
                <p style={{ margin: '0', color: '#666' }}>
                  Status: {applicationToDelete.application_status}
                </p>
              </div>
            )}
            <p style={{ color: '#666', fontSize: '14px' }}>
              This action cannot be undone. All associated files, reviews, and data will be permanently deleted.
            </p>
          </div>
        </ModalBody>
        <ModalFooter style={{ justifyContent: 'center', gap: '12px' }}>
          <Button 
            color="secondary" 
            onClick={handleDeleteCancel}
            disabled={deleting}
            style={{ minWidth: '100px' }}
          >
            Cancel
          </Button>
          <Button 
            color="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleting}
            style={{ minWidth: '100px' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Application;