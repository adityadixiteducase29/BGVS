import Datatable from "@/components/Datatable";
import React, { useState, useEffect } from 'react';
import { Button } from "reactstrap";
import { PlusCircle } from "lucide-react";
import AddEmployee from "./AddEmployee/AddEmployee";
import EditEmployee from "./AddEmployee/EditEmployee";
import apiService from "../../services/api";
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const Employees = () => {
  const { user } = useSelector((state) => state.auth);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const [editModal, setEditModal] = useState(false);
  const toggleEdit = () => setEditModal(!editModal);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [tabledata, setTabledata] = useState([]);

  // Fetch employees and dashboard stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      apiService.setToken(token);
      
      // Fetch employees and dashboard stats in parallel
      const [employeesResponse] = await Promise.all([
        apiService.getAllEmployees(),
      ]);

      if (employeesResponse.success) {
        setEmployees(employeesResponse.data);
        setTabledata(employeesResponse.data);
      } else {
        console.error('Failed to fetch employees:', employeesResponse.message);
        toast.error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when refreshFlag changes
  useEffect(() => {
    fetchData();
  }, [refreshFlag]);

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    toggleEdit();
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteEmployee(employeeToDelete.id);

      if (response.success) {
        // Remove the deleted employee from the list
        setEmployees(prev => 
          prev.filter(emp => emp.id !== employeeToDelete.id)
        );
        setTabledata(prev => 
          prev.filter(emp => emp.id !== employeeToDelete.id)
        );
        
        toast.success(`Employee ${employeeToDelete.name} deleted successfully`);
        setDeleteModal(false);
        setEmployeeToDelete(null);
      } else {
        toast.error(response.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(false);
    setEmployeeToDelete(null);
  };


  const columns = [
    { 
      field: 'name', 
      headerName: 'Employee Name', 
      flex: 1, 
      minWidth: 150,
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
      minWidth: 200,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.email}
        </div>
      ) 
    },
    { 
      field: 'assigned_company_ids', 
      headerName: 'Assigned Companies', 
      flex: 1, 
      minWidth: 200,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          {params.row.assigned_company_ids ? params.row.assigned_company_ids.length : 0} companies
        </div>
      ) 
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="datatable-cell-content">
          <span style={{
            padding: '4px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: params.row.status === 'active' ? '#e8f5e8' : '#ffe8e8',
            color: params.row.status === 'active' ? '#2e7d32' : '#d32f2f',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            display: 'inline-block'
          }}>
            {params.row.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      ) 
    },
    { 
      field: 'created_at', 
      headerName: 'Created Date', 
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
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <div className="datatable-cell-content" style={{ justifyContent: 'center', gap: '8px' }}>
          <Button
            size="sm"
            color="primary"
            outline
            onClick={() => handleEditClick(params.row)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px'
            }}
          >
            Edit
          </Button>
          {user?.user_type === 'admin' && (
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              title="Delete Employee"
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
      {/* Welcome Header */}
      <div className="flex gap-2 justify-between align-center">
        <h1 className="dashboard-title mb-0">
          Employees
        </h1>
        <Button
          className="custom-primary-button"
          onClick={toggle}
        >
          <PlusCircle size={17}/>
          Add Employee
        </Button>
      </div>

      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>Loading employees...</div>
          </div>
        ) : (
          <Datatable
            tabledata={tabledata}
            columns={columns}
            pageSize={8}
          />
        )}
      </div>
      <AddEmployee modal={modal} toggle={toggle} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} />
      <EditEmployee 
        modal={editModal} 
        toggle={toggleEdit} 
        refreshFlag={refreshFlag} 
        setRefreshFlag={setRefreshFlag}
        employeeData={selectedEmployee}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={handleDeleteCancel} centered>
        <ModalHeader toggle={handleDeleteCancel}>
          Confirm Delete Employee
        </ModalHeader>
        <ModalBody>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', color: '#d32f2f', marginBottom: '16px' }}>
              ⚠️
            </div>
            <h5 style={{ marginBottom: '16px', color: '#333' }}>
              Are you sure you want to delete this employee?
            </h5>
            {employeeToDelete && (
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  Employee: {employeeToDelete.name}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Email: {employeeToDelete.email}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Employee ID: {employeeToDelete.id}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Assigned Companies: {employeeToDelete.assigned_companies_count || 0}
                </p>
                <p style={{ margin: '0', color: '#666' }}>
                  Status: {employeeToDelete.status}
                </p>
              </div>
            )}
            <p style={{ color: '#666', fontSize: '14px' }}>
              This action cannot be undone. All associated data including reviews, assignments, and any assigned applications will be unassigned.
            </p>
            <p style={{ color: '#d32f2f', fontSize: '14px', fontWeight: 'bold', marginTop: '12px' }}>
              Note: If this employee has verification history, deletion will be prevented for data integrity.
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

export default Employees;