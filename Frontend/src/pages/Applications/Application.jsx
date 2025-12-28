import './index.css';
import Datatable from "@/components/Datatable";
import { FaUsers, FaFingerprint, FaHourglassHalf, FaCalendarWeek } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiService from '@/services/api';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Popover, PopoverBody } from 'reactstrap';
import Import from './Import/Import';
import EditApplication from './EditApplication';

const Application = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [applicationToEdit, setApplicationToEdit] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Filter states
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState({});
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const pageSize = 10;
  
  const toggleImportModal = () => setImportModal(!importModal);
  const toggleEditModal = () => setEditModal(!editModal);

  // Popover handlers
  const togglePopover = (applicationId) => {
    setPopoverOpen(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }));
  };
  // Fetch companies and employees for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoadingFilters(true);
        apiService.setToken(token);
        
        // Fetch companies and employees in parallel
        // Use includeAll=true to get all companies for filtering (not just those without parents)
        const [companiesResult, employeesResult] = await Promise.all([
          apiService.getCompaniesDropdown(null, false, true),
          apiService.getAllEmployees()
        ]);
        
        if (companiesResult.success) {
          setCompanies(companiesResult.data || []);
        }
        
        if (employeesResult.success) {
          setEmployees(employeesResult.data || []);
        }
      } catch (err) {
        console.error('Error fetching filters:', err);
      } finally {
        setLoadingFilters(false);
      }
    };

    if (token) {
      fetchFilters();
    }
  }, [token]);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Set the token for API requests
        apiService.setToken(token);

        // Build filters object
        const filters = {
          page: currentPage,
          limit: pageSize
        };
        if (selectedCompany) {
          filters.company_id = selectedCompany;
        }
        if (selectedEmployee) {
          filters.verifier_id = selectedEmployee;
        }
        // Date range filter
        if (selectedStartDate || selectedEndDate) {
          if (selectedStartDate) {
            // Convert start date to UTC start of day
            const startOfDay = new Date(selectedStartDate);
            startOfDay.setHours(0, 0, 0, 0);
            filters.date_start = startOfDay.toISOString();
          }
          if (selectedEndDate) {
            // Convert end date to UTC end of day
            const endOfDay = new Date(selectedEndDate);
            endOfDay.setHours(23, 59, 59, 999);
            filters.date_end = endOfDay.toISOString();
          }
        }

        const response = await apiService.getAllApplications(filters);

        if (response.success) {
          setApplications(response.data || []);
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 1);
            setTotalApplications(response.pagination.total || 0);
          }
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
  }, [token, selectedCompany, selectedEmployee, selectedStartDate, selectedEndDate, currentPage]);

  const handleEditClick = (row) => {
    setApplicationToEdit(row);
    setEditModal(true);
  };

  const handleEditComplete = () => {
    // Refresh applications list after edit
    const fetchApplications = async () => {
      try {
        setLoading(true);
        apiService.setToken(token);
        
        // Build filters object with current pagination
        const filters = {
          page: currentPage,
          limit: pageSize
        };
        if (selectedCompany) {
          filters.company_id = selectedCompany;
        }
        if (selectedEmployee) {
          filters.verifier_id = selectedEmployee;
        }
        // Date range filter
        if (selectedStartDate || selectedEndDate) {
          if (selectedStartDate) {
            // Convert start date to UTC start of day
            const startOfDay = new Date(selectedStartDate);
            startOfDay.setHours(0, 0, 0, 0);
            filters.date_start = startOfDay.toISOString();
          }
          if (selectedEndDate) {
            // Convert end date to UTC end of day
            const endOfDay = new Date(selectedEndDate);
            endOfDay.setHours(23, 59, 59, 999);
            filters.date_end = endOfDay.toISOString();
          }
        }
        
        const response = await apiService.getAllApplications(filters);
        if (response.success) {
          setApplications(response.data || []);
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 1);
            setTotalApplications(response.pagination.total || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
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

  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      apiService.setToken(token);
      const result = await apiService.exportApplicationsToExcel();
      
      if (result.success) {
        toast.success('Applications exported to Excel successfully');
      } else {
        toast.error(result.message || 'Failed to export applications');
      }
    } catch (error) {
      console.error('Error exporting applications:', error);
      toast.error('Failed to export applications');
    } finally {
      setExporting(false);
    }
  };

  const cards = [
    { label: 'Clients', value: 28, icon: <FaUsers /> },
    { label: 'Total Verified', value: 120, icon: <FaFingerprint /> },
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
      minWidth: 130,
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
      field: 'rejection_reason',
      headerName: 'Remark',
      flex: 1,
      minWidth: 200,
      headerAlign: 'left',
      renderCell: (params) => {
        const applicationId = params.row.id;
        const rejectionReason = params.row.rejection_reason;
        const isPopoverOpen = popoverOpen[applicationId] || false;
        const targetId = `rejection-reason-${applicationId}`;

        return (
          <div className="datatable-cell-content">
            {rejectionReason ? (
              <>
                <span
                  id={targetId}
                  style={{
                    color: '#d32f2f',
                    fontStyle: 'italic',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onMouseEnter={() => setPopoverOpen(prev => ({ ...prev, [applicationId]: true }))}
                  onMouseLeave={() => setPopoverOpen(prev => ({ ...prev, [applicationId]: false }))}
                >
                  {rejectionReason.length > 50 ? `${rejectionReason.substring(0, 50)}...` : rejectionReason}
                </span>
                <Popover
                  placement="bottom"
                  isOpen={isPopoverOpen}
                  target={targetId}
                  toggle={() => togglePopover(applicationId)}
                >
                  <PopoverBody style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                    {rejectionReason}
                  </PopoverBody>
                </Popover>
              </>
            ) : (
              <span style={{ color: '#9EA5AD' }}>N/A</span>
            )}
          </div>
        );
      }
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
          {user?.user_type === 'admin' && (
            <>
              <IconButton
                size="small"
                onClick={() => handleEditClick(params.row)}
                title="Edit Application"
                style={{ color: '#1976d2' }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(params.row)}
                title="Delete Application"
                style={{ color: '#d32f2f' }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </div>
      )
    }
  ];

  const handleCompanyFilterChange = (e) => {
    setSelectedCompany(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleEmployeeFilterChange = (e) => {
    setSelectedEmployee(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setSelectedCompany('');
    setSelectedEmployee('');
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <h1 className="dashboard-title" style={{ color: "var(--primary)" }}>
          Applications
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            color="success"
            className="custom-primary-button"
            onClick={handleExportToExcel}
            disabled={exporting || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <GetAppIcon fontSize="small" />
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
          <Button
            color="primary"
            className="custom-primary-button"
            onClick={toggleImportModal}
          >
            Import
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', marginTop: '22px' }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="company-filter-label">Filter by Company</InputLabel>
          <Select
            labelId="company-filter-label"
            id="company-filter"
            value={selectedCompany}
            onChange={handleCompanyFilterChange}
            label="Filter by Company"
            disabled={loadingFilters}
          >
            <MenuItem value="">
              <em>All Companies</em>
            </MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="employee-filter-label">Filter by Employee</InputLabel>
          <Select
            labelId="employee-filter-label"
            id="employee-filter"
            value={selectedEmployee}
            onChange={handleEmployeeFilterChange}
            label="Filter by Employee"
            disabled={loadingFilters}
          >
            <MenuItem value="">
              <em>All Employees</em>
            </MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={selectedStartDate}
            onChange={handleStartDateChange}
            maxDate={selectedEndDate || undefined}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 200 }
              }
            }}
            format="dd/MM/yyyy"
          />
          <DatePicker
            label="End Date"
            value={selectedEndDate}
            onChange={handleEndDateChange}
            minDate={selectedStartDate || undefined}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 200 }
              }
            }}
            format="dd/MM/yyyy"
          />
        </LocalizationProvider>

        {(selectedCompany || selectedEmployee || selectedStartDate || selectedEndDate) && (
          <Button
            color="secondary"
            size="small"
            onClick={handleClearFilters}
            style={{ height: '40px' }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

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
          <>
            <Datatable
              tabledata={applications}
              columns={columns}
              pageSize={pageSize}
              paginationMode="server"
              rowCount={totalApplications}
              page={currentPage - 1}
              onPageChange={handlePageChange}
            />
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2, mb: 2 }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalApplications)} of {totalApplications} applications
                </span>
              </Box>
            )}
          </>
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
      <Import 
        modal={importModal} 
        toggle={toggleImportModal} 
        onImportComplete={() => {
          // Refresh applications list after import
          const fetchApplications = async () => {
            try {
              setLoading(true);
              apiService.setToken(token);
              
              // Build filters object
              const filters = {
                page: currentPage,
                limit: pageSize
              };
              if (selectedCompany) {
                filters.company_id = selectedCompany;
              }
              if (selectedEmployee) {
                filters.verifier_id = selectedEmployee;
              }
              // Date range filter
              if (selectedStartDate || selectedEndDate) {
                if (selectedStartDate) {
                  // Convert start date to UTC start of day
                  const startOfDay = new Date(selectedStartDate);
                  startOfDay.setHours(0, 0, 0, 0);
                  filters.date_start = startOfDay.toISOString();
                }
                if (selectedEndDate) {
                  // Convert end date to UTC end of day
                  const endOfDay = new Date(selectedEndDate);
                  endOfDay.setHours(23, 59, 59, 999);
                  filters.date_end = endOfDay.toISOString();
                }
              }
              
              const response = await apiService.getAllApplications(filters);
              if (response.success) {
                setApplications(response.data || []);
              }
            } catch (err) {
              console.error('Error fetching applications:', err);
            } finally {
              setLoading(false);
            }
          };
          fetchApplications();
        }}
      />
      {applicationToEdit && (
        <EditApplication
          isOpen={editModal}
          toggle={toggleEditModal}
          applicationId={applicationToEdit.id}
          onUpdateComplete={handleEditComplete}
        />
      )}
    </div>
  );
};

export default Application;