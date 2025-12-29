import './index.css';
import Datatable from "@/components/Datatable";
import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import apiService from '@/services/api';
import { useSelector } from 'react-redux';
import { Popover, PopoverBody } from 'reactstrap';
import { toast } from 'react-toastify';

const ClientApplication = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [popoverOpen, setPopoverOpen] = useState({});

  // Reports states
  const [reports, setReports] = useState({}); // Store reports by application ID

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const pageSize = 10;

  // Popover handlers
  const togglePopover = (applicationId) => {
    setPopoverOpen(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }));
  };

  // Fetch reports for all applications
  const fetchReportsForApplications = async (applicationIds) => {
    try {
      const reportsMap = {};
      await Promise.all(
        applicationIds.map(async (appId) => {
          try {
            const response = await apiService.getApplicationReports(appId);
            if (response.success && response.data && response.data.length > 0) {
              reportsMap[appId] = response.data;
            }
          } catch (err) {
            console.error(`Error fetching reports for application ${appId}:`, err);
          }
        })
      );
      setReports(reportsMap);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Set the token for API requests
        apiService.setToken(token);

        // Build filters object with pagination
        const filters = {
          page: currentPage,
          limit: pageSize
        };

        // Use getCompanyApplications which automatically filters by company and sub-companies
        const response = await apiService.getCompanyApplications(filters);

        if (response.success) {
          const apps = response.data || [];
          setApplications(apps);
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 1);
            setTotalApplications(response.pagination.total || 0);
          }
          // Fetch reports for all applications
          const applicationIds = apps.map(app => app.id);
          if (applicationIds.length > 0) {
            fetchReportsForApplications(applicationIds);
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
  }, [token, currentPage]);


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
      minWidth: 150,
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
      renderCell: (params) => {
        const applicationId = params.row.id;
        const applicationReports = reports[applicationId] || [];
        const hasReports = applicationReports.length > 0;

        return (
          <div className="datatable-cell-content" style={{ display: 'flex', gap: '8px' }}>
            {hasReports && (
              <IconButton
                size="small"
                onClick={() => handleReportView(applicationId)}
                title="View Report"
                style={{ color: '#1976d2' }}
              >
                <DescriptionIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        );
      }
    }
  ];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Handle report view - opens most recent report in new tab
  const handleReportView = async (applicationId) => {
    try {
      const applicationReports = reports[applicationId] || [];
      if (applicationReports.length === 0) {
        toast.error('No reports available for this application');
        return;
      }

      // Get the most recent report (first one in the array, as they're usually sorted by date)
      const latestReport = applicationReports[0];
      
      apiService.setToken(token);
      const response = await apiService.getReportDownloadUrl(latestReport.id);
      if (response.success && response.url) {
        // Open report in new tab
        window.open(response.url, '_blank');
      } else {
        toast.error(response.message || 'Failed to load report');
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report');
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <h1 className="dashboard-title" style={{ color: "var(--primary)" }}>
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
    </div>
  );
};

export default ClientApplication;