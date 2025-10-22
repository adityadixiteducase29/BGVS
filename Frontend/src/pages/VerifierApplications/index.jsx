import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  TextField,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider,
  Button
} from '@mui/material'
import { Button as ButtonStrap, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Row, Col } from 'reactstrap'
import { Search, FilterList } from '@mui/icons-material'
import './index.css'
import Datatable from "@/components/Datatable"
import apiService from "../../services/api"
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const VerifierApplications = () => {
  // Sample data for verifier applications
  const [tabledata, setTabledata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const navigate = useNavigate();

  const toggle = () => setModal(!modal);  
  // Get current user from Redux store
  const user = useSelector(state => state.auth.user);

  // Fetch verifier data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      apiService.setToken(token);
      
      // Fetch verifier applications and stats in parallel
      const applicationsResponse = await apiService.getVerifierApplications();

      if (applicationsResponse.success) {
        setTabledata(applicationsResponse.data);
      } else {
        console.error('Failed to fetch applications:', applicationsResponse.message);
        toast.error('Failed to fetch applications');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    setCurrentUser(user);
  }, [user]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle Review button click
  const handleReviewClick = async (applicationId) => {
    try {
      // First, check if the application is already assigned to this verifier
      const application = tabledata.find(app => app.id === applicationId);
      const isAssigned = application?.is_assigned === 'yes';
      const isAssignedToCurrentUser = application?.assigned_verifier_id === currentUser?.id;

      // If not assigned, auto-assign it to the current verifier
      if (!isAssigned) {
        const assignResponse = await apiService.assignApplicationToVerifier(applicationId);
        
        if (!assignResponse.success) {
          toast.error(assignResponse.message || 'Failed to assign application');
          return;
        }

        toast.success('Application assigned to you successfully');
        // Refresh the data to update the assignment status
        await fetchData();
      }

      // Store the application ID and open modal
      setSelectedApplicationId(applicationId);
      toggle();
      
    } catch (error) {
      console.error('Error handling review click:', error);
      toast.error('Error processing review request');
    }
  };

  // Handle Start Review button click
  const handleStartReview = () => {
    if (selectedApplicationId) {
      navigate(`/review-application/${selectedApplicationId}`);
    }
  };

  const columns = [
    { 
      field: 'applicationId', 
      headerName: 'Application ID', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.id}
        </div>
      ) 
    },
    { 
      field: 'applicantName', 
      headerName: 'Applicant Name', 
      flex: 1, 
      minWidth: 150,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.applicantName}
        </div>
      ) 
    },
    { 
      field: 'submittedDate', 
      headerName: 'Submitted Date', 
      flex: 1, 
      minWidth: 160,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.submittedDate}
        </div>
      ) 
    },
    { 
      field: 'priority', 
      headerName: 'Priority', 
      flex: 1, 
      minWidth: 100,
      headerAlign: 'left',
      renderCell: (data) => {
        const getPriorityColor = (priority) => {
          switch (priority.toLowerCase()) {
            case 'high':
              return 'red';
            case 'medium':
              return 'orange';
            case 'low':
              return 'green';
            default:
              return 'gray';
          }
        };
        
        const priorityColor = getPriorityColor(data.row.priority);
        
        return (
          <div className={`datatable-priority datatable-priority-${priorityColor}`}>
            {data.row.priority}
          </div>
        );
      } 
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.status}
        </div>
      ) 
    },
    { 
      field: 'verifier', 
      headerName: 'Assigned Verifier', 
      flex: 1, 
      minWidth: 140,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.assigned_verifier_name || 'Not Assigned'}
        </div>
      ) 
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      sortable: false,
      renderCell: (data) => {
        const application = data.row;
        const isAssigned = application.is_assigned === 'yes';
        const isAssignedToCurrentUser = application.assigned_verifier_id === currentUser?.id;
        
        // Button should be disabled if:
        // 1. Application is assigned to a different verifier
        const shouldDisable = isAssigned && !isAssignedToCurrentUser;
        
        return (
          <div className="datatable-actions">
            <Button 
              variant="outlined" 
              size="small"
              className="action-button"
              disabled={shouldDisable}
              onClick={() => handleReviewClick(application.id)}
            >
              {shouldDisable ? 'Assigned' : 'Review'}
            </Button>
          </div>
        );
      } 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="dashboard-title">
          Verifier Applications
        </h1>
        <p className="text-gray-600">Manage and review submitted applications</p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <Row className="g-3 align-items-center">
          <Col className="col-12 col-md-6">
            <div className="search-container">
              <Search className="search-icon" />
              <TextField
                fullWidth
                placeholder="Search applications..."
                value={searchTerm}
                onChange={handleSearch}
                variant="outlined"
                size="small"
                className="search-input"
              />
            </div>
          </Col>
          <Col className="col-12 col-md-6">
            <div className="filter-container">
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                className="filter-button"
              >
                Filter
              </Button>
            </div>
          </Col>
        </Row>
      </div>
      
      {/* Applications Table */}
      <div>
        <Datatable
          tabledata={tabledata}
          columns={columns}
          pageSize={10}
        />
      </div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Application Review</ModalHeader>
        <ModalBody>
          This application is assigned to you. Please start the review process.
        </ModalBody>
        <ModalFooter>
          <ButtonStrap color="primary" onClick={handleStartReview}>
           Start Review
          </ButtonStrap>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default VerifierApplications;
