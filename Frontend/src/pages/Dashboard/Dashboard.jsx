import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, People, Apps, ShowChart } from "@mui/icons-material";
import { PersonalInformation } from "@/components/PersonalInformation";
import './index.css';
import Datatable from "@/components/Datatable";
import { FaUsers, FaFingerprint, FaHourglassHalf, FaCalendarWeek } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useAppSelector } from '@/store/hooks';
import apiService from '@/services/api';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";

const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    clients: 0,
    total_verifications: 0,
    pending: 0,
    this_week: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkCopiedStates, setLinkCopiedStates] = useState({});
  const { token } = useSelector((state) => state.auth);
  // Fetch clients and dashboard stats from API
  const fetchData = async () => {
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

      // Fetch companies and dashboard stats in parallel
      const [companiesResult, statsResult] = await Promise.all([
        apiService.request('/companies', { method: 'GET' }),
        apiService.getDashboardStats()
      ]);

      setClients(companiesResult.data || []);
      setDashboardStats(statsResult.data || {
        clients: 0,
        total_verifications: 0,
        pending: 0,
        this_week: 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (row) => {
    console.log('Edit clicked for row:', row);
    // Add your edit logic here
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
    { label: 'Clients', value: dashboardStats.clients, icon: <FaUsers /> },
    { label: 'Total Verifications', value: dashboardStats.total_verifications, icon: <FaFingerprint /> },
    { label: 'Pending', value: dashboardStats.pending, icon: <FaHourglassHalf /> },
    { label: 'This week', value: dashboardStats.this_week, icon: <FaCalendarWeek /> },
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
        
        return isCopied ? (
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
        );
      },
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="dashboard-title-admin">
          Dashboard
        </h1>
      </div>
      <div className="card-container-dashboard-admin">
        {cards.map((card, index) => (
          <div className="card-dashboard-admin h-[102px] w-[237px]" key={index}>
            <div className="flex gap-2">
              <div className="card-icon-dashboard-admin">{card.icon}</div>
              <div className="card-label-dashboard-admin">{card.label}</div>
            </div>
            <div className="card-value-dashboard-admin">{card.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <h1 className="basic-title-admin mb-4">
          Clients
        </h1>
      </div>
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading clients...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
            <button onClick={fetchData} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded">
              Retry
            </button>
          </div>
        ) : (
          <Datatable
            tabledata={tableData}
            columns={columns}
            pageSize={8}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;