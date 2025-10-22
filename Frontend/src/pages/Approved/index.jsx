import React, { useState, useEffect } from 'react'
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
import { Search, FilterList, CheckCircle } from '@mui/icons-material'
import './index.css'
import Datatable from "@/components/Datatable"
import apiService from "../../services/api"
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Approved = () => {
  // State for approved applications
  const [tabledata, setTabledata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggle = () => setModal(!modal);
  
  // Get current user from Redux store
  const user = useSelector(state => state.auth.user);

  // Fetch approved applications data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      apiService.setToken(token);
      
      // Fetch approved applications
      const approvedResponse = await apiService.getVerifierApprovedApplications();

      if (approvedResponse.success) {
        setTabledata(approvedResponse.data);
      } else {
        console.error('Failed to fetch approved applications:', approvedResponse.message);
        toast.error('Failed to fetch approved applications');
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle View Details button click
  const handleViewClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
    toggle();
  };

  // Handle View Details button click in modal
  const handleViewDetails = () => {
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
      field: 'documentType', 
      headerName: 'Document Type', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.documentType}
        </div>
      ) 
    },
    { 
      field: 'approvedDate', 
      headerName: 'Approved Date', 
      flex: 1, 
      minWidth: 160,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.reviewedDate || '-'}
        </div>
      ) 
    },
    { 
      field: 'approvedBy', 
      headerName: 'Approved By', 
      flex: 1, 
      minWidth: 140,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.assigned_verifier_name || '-'}
        </div>
      ) 
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
      field: 'actions', 
      headerName: 'Actions', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      sortable: false,
      renderCell: (data) => (
        <div className="datatable-actions">
          <Button 
            variant="outlined" 
            size="small"
            className="action-button"
            startIcon={<CheckCircle />}
            onClick={() => handleViewClick(data.row.id)}
          >
            View Details
          </Button>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="dashboard-title">
          Approved Applications
        </h1>
        <p className="text-gray-600">View successfully verified applications</p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <Row className="g-3 align-items-center">
          <Col className="col-12 col-md-6">
            <div className="search-container">
              <Search className="search-icon" />
              <TextField
                fullWidth
                placeholder="Search approved applications..."
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
      
      {/* Approved Applications Table */}
      <div>
        <Datatable
          tabledata={tabledata}
          columns={columns}
          pageSize={10}
        />
      </div>
      
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Application Details</ModalHeader>
        <ModalBody>
          View the completed application review details.
        </ModalBody>
        <ModalFooter>
          <ButtonStrap color="primary" onClick={handleViewDetails}>
            View Details
          </ButtonStrap>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Approved;
