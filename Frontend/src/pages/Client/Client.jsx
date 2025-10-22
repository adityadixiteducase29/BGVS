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
import { PlusCircle } from 'lucide-react';
import { Button } from "reactstrap";
import AddClient from "./AddClient/AddClient";
import { useAppSelector } from '@/store/hooks';
import apiService from '@/services/api';
import { toast } from 'react-toastify';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const Client = () => {
  const auth = useAppSelector(state => state.auth);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [linkCopiedStates, setLinkCopiedStates] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toggle = () => setModal(!modal);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');

      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Set token in API service
      apiService.setToken(token);

      // Fetch companies
      const result = await apiService.request('/companies', {
        method: 'GET'
      });

      setClients(result.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(error.message);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Refresh clients after adding a new one
  const handleClientAdded = () => {
    fetchClients();
    toggle();
  };

  const handleEditClick = (row) => {
    console.log('Edit clicked for row:', row);
    // Add your edit logic here
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteClient(clientToDelete.id);

      if (response.success) {
        // Remove the deleted client from the list
        setClients(prev => 
          prev.filter(client => client.id !== clientToDelete.id)
        );
        
        toast.success(`Client ${clientToDelete.name} deleted successfully`);
        setDeleteModal(false);
        setClientToDelete(null);
      } else {
        toast.error(response.message || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(false);
    setClientToDelete(null);
  };

  const handleCopyLink = async (clientId, companyLink) => {
    try {
      // Copy link to clipboard
      await navigator.clipboard.writeText(companyLink);
      
      // Update copied state
      setLinkCopiedStates(prev => ({
        ...prev,
        [clientId]: true
      }));

      // Show success message
      toast.success('Company link copied to clipboard!');

      // Reset copied state after 3 seconds
      setTimeout(() => {
        setLinkCopiedStates(prev => ({
          ...prev,
          [clientId]: false
        }));
      }, 3000);

    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const cards = [
    { label: 'Clients', value: clients.length, icon: <FaUsers /> },
    { label: 'Total Verifications', value: clients.reduce((sum, client) => sum + (client.pending_count || 0), 0), icon: <FaFingerprint /> },
    { label: 'Pending', value: clients.reduce((sum, client) => sum + (client.pending_count || 0), 0), icon: <FaHourglassHalf /> },
    { label: 'This week', value: clients.filter(client => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(client.created_at) >= weekAgo;
    }).length, icon: <FaCalendarWeek /> },
  ];

  // Use API data directly without transformation
  const tableData = clients;

  const columns = [
    { 
      field: 'name', 
      headerName: 'Client Name', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.name}
        </div>
      ) 
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1, 
      minWidth: 150,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.email}
        </div>
      ) 
    },
    { 
      field: 'pending_count', 
      headerName: 'Pending Cases', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.pending_count}
        </div>
      ) 
    },
    { 
      field: 'id', 
      headerName: 'Client ID', 
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
      field: 'enabled_services', 
      headerName: 'Services', 
      flex: 1, 
      minWidth: 80,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.enabled_services ? params.row.enabled_services.length : 0}
        </div>
      ) 
    },
    {
      field: 'link',
      headerName: 'Company Link',
      flex: 1,
      minWidth: 120,
      headerAlign: 'left',
      sortable: false,
      renderCell: (params) => {
        const { id, company_link } = params.row;
        const isCopied = linkCopiedStates[id];
        
        return (
          <div className="datatable-cell-content">
            {isCopied ? (
              <Link className="datatable-link-copied">
                Link copied
              </Link>
            ) : (
              <Link
                className="datatable-link"
                onClick={() => handleCopyLink(id, company_link)}
              >
                Copy link
              </Link>
            )}
          </div>
        );
      },
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
            title="Edit Client"
            style={{ color: '#1976d2' }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          {auth?.user?.user_type === 'admin' && (
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              title="Delete Client"
              style={{ color: '#d32f2f' }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex gap-2 justify-between align-center">
          <h1 className="dashboard-title mb-0">Clients</h1>
        </div>
        <div className="text-center py-8">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex gap-2 justify-between align-center">
          <h1 className="dashboard-title mb-0">Clients</h1>
          <Button
            className="custom-primary-button"
            onClick={toggle}
          >
            <PlusCircle size={17}/>
            Add Client
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="alert alert-danger">
            Error: {error}
          </div>
          <Button onClick={fetchClients} className="mt-3">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex gap-2 justify-between align-center">
        <h1 className="dashboard-title mb-0">
          Clients
        </h1>
        <Button
          className="custom-primary-button"
          onClick={toggle}
        >
          <PlusCircle size={17}/>
          Add Client
        </Button>
      </div>

      <div>
        <Datatable
          tabledata={tableData}
          columns={columns}
          pageSize={8}
        />
      </div>
      <AddClient modal={modal} toggle={toggle} onClientAdded={handleClientAdded} />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={handleDeleteCancel} centered>
        <ModalHeader toggle={handleDeleteCancel}>
          Confirm Delete Client
        </ModalHeader>
        <ModalBody>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', color: '#d32f2f', marginBottom: '16px' }}>
              ⚠️
            </div>
            <h5 style={{ marginBottom: '16px', color: '#333' }}>
              Are you sure you want to delete this client?
            </h5>
            {clientToDelete && (
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  Client: {clientToDelete.name}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Email: {clientToDelete.email}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Client ID: {clientToDelete.id}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Pending Cases: {clientToDelete.pending_count || 0}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Services: {clientToDelete.enabled_services ? clientToDelete.enabled_services.length : 0}
                </p>
              </div>
            )}
            <p style={{ color: '#666', fontSize: '14px' }}>
              This action cannot be undone. All associated data including applications, verifier assignments, services, and uploaded files will be permanently deleted.
            </p>
            <p style={{ color: '#d32f2f', fontSize: '14px', fontWeight: 'bold', marginTop: '12px' }}>
              ⚠️ This will also delete all applications and files submitted by this client!
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

export default Client;