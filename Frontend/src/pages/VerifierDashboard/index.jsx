import React, { useState, useEffect } from 'react'
import {
  Typography,
  TextField,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material'
import { Row, Col, Input, Label } from 'reactstrap'
import { FaClipboardCheck, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import './index.css'
import Datatable from "@/components/Datatable"
import apiService from "../../services/api"
import { toast } from 'react-toastify'

const VerifierDashboard = () => {
  const [cards, setCards] = useState([
    { label: 'Total Applications', value: 0, icon: <FaClipboardCheck /> },
    { label: 'Pending Review', value: 0, icon: <FaHourglassHalf /> },
    { label: 'Approved Today', value: 0, icon: <FaCheckCircle /> },
    { label: 'Rejected Today', value: 0, icon: <FaTimesCircle /> },
  ]);

  const [tabledata, setTabledata] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch verifier data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      apiService.setToken(token);
      
      // Fetch verifier applications and stats in parallel
      const [applicationsResponse, statsResponse] = await Promise.all([
        apiService.getVerifierApplications(),
        apiService.getVerifierStats()
      ]);

      if (applicationsResponse.success) {
        setTabledata(applicationsResponse.data);
      } else {
        console.error('Failed to fetch applications:', applicationsResponse.message);
        toast.error('Failed to fetch applications');
      }

      if (statsResponse.success) {
        const stats = statsResponse.data;
        setCards([
          { label: 'Total Applications', value: stats.total_applications, icon: <FaClipboardCheck /> },
          { label: 'Pending Review', value: stats.pending_review, icon: <FaHourglassHalf /> },
          { label: 'Approved Today', value: stats.approved_today, icon: <FaCheckCircle /> },
          { label: 'Rejected Today', value: stats.rejected_today, icon: <FaTimesCircle /> },
        ]);
      } else {
        console.error('Failed to fetch stats:', statsResponse.message);
        toast.error('Failed to fetch dashboard stats');
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
  }, []);

  const columns = [
    { 
      field: 'applicantName', 
      headerName: 'Name', 
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
      field: 'applicantPhone', 
      headerName: 'Contact No', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.applicantPhone || 'N/A'}
        </div>
      ) 
    },
    { 
      field: 'companyName', 
      headerName: 'Client', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.companyName}
        </div>
      ) 
    },
    { 
      field: 'id', 
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
      field: 'submittedDate', 
      headerName: 'Applied Date', 
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
      field: 'status', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          <span style={{
            padding: '4px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: data.row.status === 'pending' ? '#fff3cd' : '#d4edda',
            color: data.row.status === 'pending' ? '#856404' : '#155724',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            display: 'inline-block'
          }}>
            {data.row.status === 'pending' ? 'Pending' : data.row.status}
          </span>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="dashboard-title">
          Verifier Dashboard
        </h1>
        <p className="text-gray-600">Review and verify submitted documents</p>
      </div>
      
      {/* Stats Cards */}
      <div className="card-container-dashboard">
        {cards.map((card, index) => (
          <div className="card-dashboard h-[102px] w-[237px]" key={index}>
            <div className="flex gap-2">
              <div className="card-icon-dashboard">{card.icon}</div>
              <div className="card-label-dashboard">{card.label}</div>
            </div>
            <div className="card-value-dashboard">{card.value}</div>
          </div>
        ))}
      </div>
      
      {/* Pending Applications */}
      <div className="flex flex-col gap-2 mt-4">
        <h1 className="basic-title mb-4">
          Pending Applications
        </h1>
      </div>
      
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>Loading applications...</div>
          </div>
        ) : (
          <Datatable
            tabledata={tabledata}
            columns={columns}
            pageSize={5}
          />
        )}
      </div>
    </div>
  );
};

export default VerifierDashboard;
